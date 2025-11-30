
import React from 'react';

interface ImageResultViewerProps {
  originalImage: string;
  processedImage: string;
  onReset: () => void;
  onContinueWithNew: () => void;
  onContinueWithOriginal: () => void;
  processedImageTitle: string;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const BackIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const ContinueNewIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ReuseOriginalIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);


export const ImageResultViewer: React.FC<ImageResultViewerProps> = ({ 
    originalImage, 
    processedImage, 
    onReset, 
    onContinueWithNew, 
    onContinueWithOriginal,
    processedImageTitle 
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `processed-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">الأصلية</h2>
          <img src={originalImage} alt="Original" className="rounded-xl shadow-lg w-full h-auto object-contain max-h-[60vh]" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">{processedImageTitle}</h2>
          <img src={processedImage} alt="Processed" className="rounded-xl shadow-2xl shadow-cyan-500/20 w-full h-auto object-contain max-h-[60vh]" />
        </div>
      </div>
      
      <div className="mt-8 flex flex-col lg:flex-row-reverse gap-4 w-full justify-center flex-wrap">
        <button
          onClick={handleDownload}
          className="flex-1 min-w-[200px] flex items-center justify-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-lg"
        >
          <DownloadIcon />
          تنزيل الصورة
        </button>
        
        <div className="w-full lg:w-px lg:h-12 bg-gray-700 mx-2 hidden lg:block"></div>

        <button
          onClick={onContinueWithNew}
          className="flex-1 min-w-[200px] flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
        >
          <ContinueNewIcon />
          استكمال التعديل على (الجديدة)
        </button>

        <button
          onClick={onContinueWithOriginal}
          className="flex-1 min-w-[200px] flex items-center justify-center px-6 py-3 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
        >
          <ReuseOriginalIcon />
          تعديل (الأصلية) مرة أخرى
        </button>

        <div className="w-full lg:w-px lg:h-12 bg-gray-700 mx-2 hidden lg:block"></div>

        <button
          onClick={onReset}
          className="flex-1 min-w-[150px] flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <BackIcon />
          خروج / رفع جديد
        </button>
      </div>
    </div>
  );
};
