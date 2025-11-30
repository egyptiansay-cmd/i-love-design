import React from 'react';

interface MockupOptionsProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  customPrompt: string;
  onCustomPromptChange: (text: string) => void;
  disabled: boolean;
}

const themes = [
    { id: 'modern_studio', name: 'استوديو عصري (خلفية سادة ناعمة)' },
    { id: 'podium', name: 'منصة عرض هندسية (3D Podium)' },
    { id: 'luxury', name: 'فخامة (رخام وذهب وإضاءة خافتة)' },
    { id: 'nature', name: 'طبيعة (ضوء شمس، نباتات، سماء)' },
    { id: 'lifestyle_home', name: 'لايف ستايل (منزل/مكتب دافئ)' },
    { id: 'cyberpunk', name: 'نيون وجرأة (Cyberpunk/Tech)' },
    { id: 'water', name: 'انتعاش (ماء وقطرات وثلج)' },
];

export const MockupOptions: React.FC<MockupOptionsProps> = ({ 
    theme, 
    onThemeChange, 
    customPrompt, 
    onCustomPromptChange, 
    disabled 
}) => {
  return (
    <div className="w-full flex flex-col gap-4 mb-6">
      <div>
        <label htmlFor="theme-select" className="block mb-2 text-lg font-medium text-gray-300 text-right">
           اختر نمط التصميم (Theme):
        </label>
        <div className="relative">
            <select
                id="theme-select"
                value={theme}
                onChange={(e) => onThemeChange(e.target.value)}
                disabled={disabled}
                className="block w-full px-4 py-3 text-base text-white bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right"
            >
                {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
      </div>

      <div className="animate-fade-in">
          <label htmlFor="custom-mockup-prompt" className="block mb-2 text-sm font-bold text-gray-300 text-right">
              وصف مخصص للمشهد (اختياري):
          </label>
          <textarea
              id="custom-mockup-prompt"
              rows={3}
              value={customPrompt}
              onChange={(e) => onCustomPromptChange(e.target.value)}
              disabled={disabled}
              placeholder="أضف تفاصيل إضافية... (مثال: ضع المنتج على طاولة خشبية بجوار فنجان قهوة مع إضاءة صباحية)"
              className="block w-full px-4 py-3 text-base text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right placeholder-gray-500 resize-none"
          />
      </div>
      
      <div className="bg-blue-900/30 p-3 rounded border border-blue-800 text-right">
          <p className="text-xs text-blue-200">
              <span className="font-bold">ملاحظة:</span> سيقوم الذكاء الاصطناعي بدمج الصورة في الخلفية الجديدة وتعديل الإضاءة والظلال لتكون واقعية. لن يتم إضافة أي نصوص مكتوبة.
          </p>
      </div>
    </div>
  );
};