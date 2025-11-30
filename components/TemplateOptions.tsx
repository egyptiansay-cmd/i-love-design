
import React from 'react';

interface TemplateOptionsProps {
  mergeMode: string;
  onMergeModeChange: (mode: string) => void;
  customPrompt: string;
  onCustomPromptChange: (text: string) => void;
  disabled: boolean;
}

const mergeModes = [
    { id: 'replace', name: 'استبدال (ضع المنتج مكان العنصر الموجود)' },
    { id: 'place', name: 'وضع (ضع المنتج في مساحة فارغة)' },
];

export const TemplateOptions: React.FC<TemplateOptionsProps> = ({ 
    mergeMode, 
    onMergeModeChange, 
    customPrompt, 
    onCustomPromptChange, 
    disabled 
}) => {
  return (
    <div className="w-full flex flex-col gap-4 mb-6 animate-fade-in">
      <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50 mb-2">
          <p className="text-sm text-blue-200 text-right leading-relaxed">
              <span className="font-bold block mb-1 text-lg text-blue-100">كيف يعمل هذا الوضع؟</span>
              1. الصورة التي رفعتها أولاً هي <strong>"العنصر"</strong> (منتج أو شخص).<br/>
              2. الصورة التي رفعتها ثانياً هي <strong>"التصميم/الخلفية"</strong>.<br/>
              سيقوم الذكاء الاصطناعي بدمج العنصر داخل التصميم بذكاء.
          </p>
      </div>

      <div>
        <label htmlFor="merge-mode-select" className="block mb-2 text-lg font-medium text-gray-300 text-right">
           طريقة الدمج:
        </label>
        <div className="relative">
            <select
                id="merge-mode-select"
                value={mergeMode}
                onChange={(e) => onMergeModeChange(e.target.value)}
                disabled={disabled}
                className="block w-full px-4 py-3 text-base text-white bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right"
            >
                {mergeModes.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
      </div>

      <div>
          <label htmlFor="custom-template-prompt" className="block mb-2 text-sm font-bold text-gray-300 text-right">
              توجيهات إضافية للدمج (اختياري):
          </label>
          <textarea
              id="custom-template-prompt"
              rows={2}
              value={customPrompt}
              onChange={(e) => onCustomPromptChange(e.target.value)}
              disabled={disabled}
              placeholder="مثال: اجعل المنتج أكبر قليلاً، أو اضبط الإضاءة لتكون دافئة."
              className="block w-full px-4 py-3 text-base text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right placeholder-gray-500 resize-none"
          />
      </div>
    </div>
  );
};
