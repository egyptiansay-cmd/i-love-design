import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  disabled: boolean;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const borderStyle = isDragging ? 'border-cyan-400' : 'border-gray-600';

  return (
    <div className="w-full max-w-2xl">
      <label
        htmlFor="image-upload"
        className={`relative flex flex-col items-center justify-center w-full h-80 border-2 ${borderStyle} border-dashed rounded-xl cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors duration-300`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon />
          <p className="mb-2 text-lg text-gray-400">
            <span className="font-semibold">اسحب وأفلت صورتك هنا</span>
          </p>
          <p className="text-gray-500">أو</p>
          <p className="mt-2 text-lg font-semibold text-cyan-400">انقر لاختيار ملف</p>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP (حجم أقصى 5 ميجابايت)</p>
        </div>
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};