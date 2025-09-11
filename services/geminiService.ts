import { GoogleGenAI, Modality } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. App will not function correctly.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });


const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * A higher-order function that wraps an API call with retry logic for rate limiting errors.
 */
const withRetry = <T extends (...args: any[]) => Promise<any>>(apiCall: T): T => {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        let lastError: any;
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                return await apiCall(...args);
            } catch (error: any) {
                lastError = error;
                let isRateLimitError = false;

                if (error instanceof Error && error.message) {
                    try {
                        const errorDetails = JSON.parse(error.message);
                        if (errorDetails?.error?.code === 429 || errorDetails?.error?.status === 'RESOURCE_EXHAUSTED') {
                            isRateLimitError = true;
                        }
                    } catch (e) {
                        if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
                           isRateLimitError = true;
                        }
                    }
                }
                
                if (isRateLimitError) {
                    if (i < MAX_RETRIES - 1) {
                        const backoffTime = INITIAL_DELAY_MS * Math.pow(2, i);
                        const jitter = Math.random() * 1000;
                        const waitTime = backoffTime + jitter;
                        console.warn(`Rate limit exceeded. Retrying in ${Math.round(waitTime / 1000)}s... (Attempt ${i + 1}/${MAX_RETRIES})`);
                        await delay(waitTime);
                        continue;
                    } else {
                        console.error(`API call failed after ${MAX_RETRIES} attempts due to rate limiting.`);
                    }
                }
                
                throw lastError;
            }
        }
        throw lastError;
    }) as T;
};

/**
 * Parses potential JSON error messages from the Gemini API for better user feedback.
 */
const formatError = (error: any, context: string): string => {
    console.error(`Error in ${context}:`, error);
    let errorMessage = error instanceof Error ? error.message : String(error);
    try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError?.error?.message) {
            errorMessage = parsedError.error.message;
            if (parsedError.error.status) {
                errorMessage += ` (Status: ${parsedError.error.status})`;
            }
        }
    } catch (e) {
        // Not a JSON string, use the message as is.
    }
    return `Error: ${errorMessage}`;
};

const generateContentWithRetry = withRetry(ai.models.generateContent);
const generateImagesWithRetry = withRetry(ai.models.generateImages);
const generateVideosWithRetry = withRetry(ai.models.generateVideos);
const getVideosOperationWithRetry = withRetry(ai.operations.getVideosOperation);

// Helper to convert File object to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// Helper to convert base64 string to a generative part
const base64ToGenerativePart = (base64: string, mimeType: string) => {
    return {
        inlineData: { data: base64, mimeType },
    };
}


export const generateText = async (prompt: string): Promise<string> => {
    if (!prompt) return "Error: Prompt is empty.";
    try {
        const response: GenerateContentResponse = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        return formatError(error, "generateText");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    if (!prompt) return "Error: Prompt is empty.";
    try {
        const response = await generateImagesWithRetry({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const mimeType = response.generatedImages[0].image.mimeType || 'image/jpeg';
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
        return "Error: Image generation failed to produce an image.";

    } catch (error) {
        return formatError(error, "generateImage");
    }
};

export const editImage = async (
    base64Image: string,
    mimeType: string,
    prompt: string
): Promise<{ newBase64Image: string | null; text: string | null }> => {
    if (!base64Image || !prompt) return { newBase64Image: null, text: "Error: Image or prompt is missing." };
    try {
        const imagePart = base64ToGenerativePart(base64Image, mimeType);
        const textPart = { text: prompt };

        const response: GenerateContentResponse = await generateContentWithRetry({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let newBase64Image: string | null = null;
        let text: string | null = null;

        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                text = part.text;
            } else if (part.inlineData) {
                newBase64Image = part.inlineData.data;
            }
        }
        return { newBase64Image, text };

    } catch (error) {
        return { newBase64Image: null, text: formatError(error, "editImage") };
    }
};

export const executePreset = async (
    inputs: { data: string; mimeType: string }[],
    prompt: string
): Promise<{ newBase64Image: string | null; text: string | null }> => {
    if (inputs.length === 0 || !prompt) {
        return { newBase64Image: null, text: "Error: Image(s) or prompt is missing." };
    }
    try {
        const imageParts = inputs.map(input => base64ToGenerativePart(input.data, input.mimeType));
        const textPart = { text: prompt };
        const allParts = [...imageParts, textPart];

        const response: GenerateContentResponse = await generateContentWithRetry({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: allParts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let newBase64Image: string | null = null;
        let text: string | null = null;

        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                text = part.text;
            } else if (part.inlineData) {
                newBase64Image = part.inlineData.data;
            }
        }
        return { newBase64Image, text };

    } catch (error) {
        return { newBase64Image: null, text: formatError(error, "executePreset") };
    }
};


export const generateVideo = async (
    base64Image: string | null,
    mimeType: string | null,
    prompt: string,
    onProgress: (message: string) => void,
): Promise<string> => {
     if (!prompt) return "Error: Prompt is empty.";
    try {
        onProgress("Starting video generation...");
        let operation;
        
        if (base64Image && mimeType) {
            operation = await generateVideosWithRetry({
              model: 'veo-2.0-generate-001',
              prompt,
              image: {
                imageBytes: base64Image,
                mimeType: mimeType,
              },
              config: { numberOfVideos: 1 }
            });
        } else {
             operation = await generateVideosWithRetry({
                model: 'veo-2.0-generate-001',
                prompt,
                config: { numberOfVideos: 1 }
            });
        }
        
        onProgress("Video processing has started. This may take a few minutes...");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress("Checking video status...");
            operation = await getVideosOperationWithRetry({ operation: operation });
        }

        onProgress("Video processing complete. Fetching video...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video URI not found in response.");
        }

        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        const videoBlob = await response.blob();
        
        onProgress("Video fetched successfully.");
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        const errorMessage = formatError(error, "generateVideo");
        onProgress(errorMessage);
        return errorMessage;
    }
};

export const utils = {
    fileToGenerativePart,
    base64ToGenerativePart,
};