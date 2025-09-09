
import { GoogleGenAI, Modality } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. App will not function correctly.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

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
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error in generateText:", error);
        return `Error generating text: ${error instanceof Error ? error.message : String(error)}`;
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

        const response: GenerateContentResponse = await ai.models.generateContent({
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
        console.error("Error in editImage:", error);
        return { newBase64Image: null, text: `Error editing image: ${error instanceof Error ? error.message : String(error)}` };
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
            operation = await ai.models.generateVideos({
              model: 'veo-2.0-generate-001',
              prompt,
              image: {
                imageBytes: base64Image,
                mimeType: mimeType,
              },
              config: { numberOfVideos: 1 }
            });
        } else {
             operation = await ai.models.generateVideos({
                model: 'veo-2.0-generate-001',
                prompt,
                config: { numberOfVideos: 1 }
            });
        }
        
        onProgress("Video processing has started. This may take a few minutes...");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress("Checking video status...");
            operation = await ai.operations.getVideosOperation({ operation: operation });
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
        console.error("Error in generateVideo:", error);
        onProgress(`Error generating video: ${error instanceof Error ? error.message : String(error)}`);
        return `Error generating video: ${error instanceof Error ? error.message : String(error)}`;
    }
};

export const utils = {
    fileToGenerativePart,
    base64ToGenerativePart,
};
