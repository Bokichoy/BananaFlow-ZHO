
import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon } from './icons';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  initialContent?: File | string | null;
  isCompact?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, initialContent, isCompact = false }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
      if (typeof initialContent === 'string') {
          setPreview(initialContent);
      } else if (initialContent instanceof File) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPreview(reader.result as string);
          };
          reader.readAsDataURL(initialContent);
      } else {
          setPreview(null);
      }
  }, [initialContent]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (preview && !isCompact) {
      return <img src={preview} alt="Preview" className="object-contain w-full h-full" />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center p-4 transition rounded-lg appearance-none cursor-pointer hover:bg-white/5 w-full h-full"
        style={{ color: 'var(--uploader-text-color, #6b7280)' }}
      >
        <UploadIcon className="w-10 h-10 mb-2" />
        <span className="font-medium text-sm text-center">
          Drop file or click to browse
        </span>
        <input type="file" name="file_upload" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
      </label>
    </div>
  );
};