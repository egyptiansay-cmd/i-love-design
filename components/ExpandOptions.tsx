import React from 'react';

interface ExpandOptionsProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  quality: string;
  onQualityChange: (quality: string) => void;
  disabled: boolean;
}

const aspectRatios = [
    { id: 'original', name: 'نفس الأبعاد الأصلية' },
    { id: '1:1', name: 'مربع (1:1) - انستجرام' },
    { id: '16:9', name: 'مستطيل عريض (16:9) - يوتيوب/شاشات' },
    { id: '9:16', name: 'طولي (9:16) - تيك توك/ستوري' },
    { id: '4:3', name: 'كلاسيكي (4:3) - صور فوتوغرافية' },
    { id: '3:4', name: 'بورتريه (3:4) - مثالي للطباعة' },
    { id: '21:9', name: 'سينمائي عريض (21:9)' },
];

const qualities = [
    { id: 'same', name: 'نفس الجودة الأصلية' },
    { id: 'hd', name: 'جودة عالية (HD)' },
    { id: '4k', name: 'جودة فائقة (4K)' },
    { id: '8k', name: 'جودة سينمائية (8K)' },
];

export const ExpandOptions: React.FC<ExpandOptionsProps> = ({ 
    prompt, 
    onPromptChange, 
    aspectRatio, 
    onAspectRatioChange, 
    quality, 
    onQualityChange, 
    disabled 
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
            <label htmlFor="aspect-ratio" className="block mb-2 text-sm font-bold text-gray-300 text-right">
                أبعاد الصورة الناتجة:
            </label>
            <div className="relative">
                <select
                    id="aspect-ratio"
                    value={aspectRatio}
                    onChange={(e) => onAspectRatioChange(e.target.value)}
                    disabled={disabled}
                    className="block w-full px-4 py-2 text-base text-white bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right"
                >
                    {aspectRatios.map((ratio) => (
                        <option key={ratio.id} value={ratio.id}>{ratio.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>

        <div>
            <label htmlFor="expand-quality" className="block mb-2 text-sm font-bold text-gray-300 text-right">
                دقة وجودة الصورة:
            </label>
            <div className="relative">
                <select
                    id="expand-quality"
                    value={quality}
                    onChange={(e) => onQualityChange(e.target.value)}
                    disabled={disabled}
                    className="block w-full px-4 py-2 text-base text-white bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right"
                >
                    {qualities.map((q) => (
                        <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
      </div>

      <div>
        <label htmlFor="expand-prompt" className="block mb-2 text-sm font-bold text-gray-300 text-right">
            وصف الإضافات (اختياري):
        </label>
        <textarea
            id="expand-prompt"
            rows={3}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={disabled}
            placeholder="مثال: أضف سماء جميلة وغيومًا فوق الجبال"
            className="block w-full px-4 py-3 pl-12 text-base text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right placeholder-gray-500 resize-none"
        />
      </div>
    </div>
  );
};