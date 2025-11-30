
import React from 'react';

interface ModeSelectorProps {
  mode: 'enhance' | 'expand' | 'remove-background' | 'mockup' | 'template';
  onModeChange: (mode: 'enhance' | 'expand' | 'remove-background' | 'mockup' | 'template') => void;
  disabled: boolean;
}

export const SparklesIconSelector: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M19 3v4M17 5h4M12 2v4M10 4h4M8 21v-4M6 19h4M16 21v-4M14 19h4M12 17v4M10 19h4M12 8a2 2 0 100-4 2 2 0 000 4zm0 14a2 2 0 100-4 2 2 0 000 4zm6-10a2 2 0 100-4 2 2 0 000 4zM6 12a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);

export const ArrowsExpandIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5 5" />
    </svg>
);

export const RemoveBgIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.485 0-4.5 2.015-4.5 4.5V19h9v-1.5c0-2.485-2.015-4.5-4.5-4.5zm5-10v2m-1 1h2m-1-3l1.414-1.414M17 13l1.414 1.414m-9.828-9.828L7 3m-2 2H3m3 0L4.586 3.586M3 9v2m1-1h2" />
    </svg>
);

export const MockupIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const TemplateIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export const UndoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
);

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange, disabled }) => {
    const getButtonClasses = (buttonMode: string) => {
        const baseClasses = "flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm sm:text-base font-bold rounded-lg transition-all transform focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
        if (mode === buttonMode) {
            return `${baseClasses} bg-cyan-600 text-white shadow-lg scale-105 ring-cyan-500`;
        }
        return `${baseClasses} bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white`;
    };

    return (
        <div className="w-full max-w-6xl mb-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center p-2 bg-gray-800 rounded-xl shadow-md gap-2">
            <button onClick={() => onModeChange('remove-background')} disabled={disabled} className={getButtonClasses('remove-background')} >
                <RemoveBgIcon className="w-5 h-5" />
                <span>إزالة الخلفية</span>
            </button>
            <button onClick={() => onModeChange('enhance')} disabled={disabled} className={getButtonClasses('enhance')} >
                <SparklesIconSelector className="w-5 h-5" />
                <span>محسن الصور</span>
            </button>
            <button onClick={() => onModeChange('expand')} disabled={disabled} className={getButtonClasses('expand')} >
                <ArrowsExpandIcon className="w-5 h-5" />
                <span>توسيع الصورة</span>
            </button>
             <button onClick={() => onModeChange('mockup')} disabled={disabled} className={getButtonClasses('mockup')} >
                <MockupIcon className="w-5 h-5" />
                <span>تصميم إعلاني</span>
            </button>
            <button onClick={() => onModeChange('template')} disabled={disabled} className={getButtonClasses('template')} >
                <TemplateIcon className="w-5 h-5" />
                <span>دمج التصاميم</span>
            </button>
        </div>
    );
};
