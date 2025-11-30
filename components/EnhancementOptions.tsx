
import React from 'react';

interface EnhancementOptionsProps {
  style: string;
  onStyleChange: (style: string) => void;
  quality: string;
  onQualityChange: (quality: string) => void;
  disabled: boolean;
}

const styles = [
    { id: 'auto', name: 'تحسين تلقائي' },
    { id: 'upscale', name: 'رفع الدقة فقط (Super Upscale)' },
    { id: 'lighting', name: 'إصلاح الإضاءة والألوان' },
    { id: 'sharpen', name: 'زيادة حدة التفاصيل' },
    { id: 'artistic', name: 'نمط فني (درامي)' },
    { id: 'restore', name: 'ترميم الصور القديمة' },
    { id: 'colorize', name: 'تلوين الصور' },
];

const qualities = [
    { id: 'hd', name: 'HD - جودة عالية' },
    { id: '4k', name: '4K - جودة فائقة' },
    { id: '8k', name: '8K - جودة سينمائية' },
];

export const EnhancementOptions: React.FC<EnhancementOptionsProps> = ({ style, onStyleChange, quality, onQualityChange, disabled }) => {
  return (
    <div className="w-full max-w-2xl mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="style-select" className="block mb-2 text-lg font-medium text-gray-300 text-right">
              اختر نمط التحسين:
            </label>
            <div className="relative">
              <select
                id="style-select"
                value={style}
                onChange={(e) => onStyleChange(e.target.value)}
                disabled={disabled}
                className="block w-full px-4 py-3 text-base text-white bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right"
              >
                {styles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="quality-select" className="block mb-2 text-lg font-medium text-gray-300 text-right">
              اختر جودة الصورة:
            </label>
            <div className="relative">
              <select
                id="quality-select"
                value={quality}
                onChange={(e) => onQualityChange(e.target.value)}
                disabled={disabled}
                className="block w-full px-4 py-3 text-base text-white bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right"
              >
                {qualities.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
