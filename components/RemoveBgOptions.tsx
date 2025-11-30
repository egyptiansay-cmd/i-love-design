
import React from 'react';

interface RemoveBgOptionsProps {
  mode: string;
  onModeChange: (mode: string) => void;
  customPrompt: string;
  onCustomPromptChange: (text: string) => void;
  enhanceSubject: boolean;
  onEnhanceSubjectChange: (enabled: boolean) => void;
  disabled: boolean;
}

const removalModes = [
    { id: 'strict', name: 'عزل المنتج/الشخص فقط (حذف النصوص والشعارات)' },
    { id: 'standard', name: 'إزالة الخلفية القياسية (مع الحفاظ على النصوص واللوجو)' },
    { id: 'custom', name: 'تخصيص (اكتب ماذا تريد أن تعزل)' },
];

export const RemoveBgOptions: React.FC<RemoveBgOptionsProps> = ({ 
    mode, 
    onModeChange, 
    customPrompt, 
    onCustomPromptChange, 
    enhanceSubject,
    onEnhanceSubjectChange,
    disabled 
}) => {
  return (
    <div className="w-full flex flex-col gap-4 mb-6">
      <div>
        <label htmlFor="bg-mode-select" className="block mb-2 text-lg font-medium text-gray-300 text-right">
           طريقة العزل:
        </label>
        <div className="relative">
            <select
                id="bg-mode-select"
                value={mode}
                onChange={(e) => onModeChange(e.target.value)}
                disabled={disabled}
                className="block w-full px-4 py-3 text-base text-white bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right"
            >
                {removalModes.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
        <p className="text-gray-400 text-sm mt-2 text-right">
            {mode === 'strict' && 'سيتم استخراج العنصر الأساسي فقط وحذف أي نصوص أو شعارات أو خلفية.'}
            {mode === 'standard' && 'سيتم حذف الخلفية (الجدران/المناظر) فقط، مع الإبقاء على المنتج والنصوص والشعارات كما هي.'}
            {mode === 'custom' && 'تحكم كامل فيما تريد إزالته أو إبقاءه.'}
        </p>
      </div>

      <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex items-center justify-between direction-rtl">
         <input 
            id="enhance-subject-toggle" 
            type="checkbox" 
            checked={enhanceSubject} 
            onChange={(e) => onEnhanceSubjectChange(e.target.checked)}
            disabled={disabled}
            className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500 border-gray-500 bg-gray-700 cursor-pointer"
        />
        <label htmlFor="enhance-subject-toggle" className="text-gray-300 cursor-pointer select-none flex-grow text-right mr-3">
            <span className="block font-bold text-sm text-white">تحسين وإعادة رسم العناصر</span>
            <span className="block text-xs text-gray-400 mt-1">
                {mode === 'standard' 
                    ? 'تنبيه: سيتم تحسين جودة الصورة، لكن قد تتأثر دقة النصوص قليلاً عند إعادة الرسم.' 
                    : 'سيقوم الذكاء الاصطناعي بإعادة رسم تفاصيل المنتج لرفع جودته بشكل كبير.'}
                <br/>
                (اتركه مغلقاً للحصول على قص دقيق بكسل-بكسل دون أي تغيير في التفاصيل)
            </span>
        </label>
      </div>

      {mode === 'custom' && (
        <div className="animate-fade-in">
            <label htmlFor="custom-bg-prompt" className="block mb-2 text-sm font-bold text-gray-300 text-right">
                وصف العزل المخصص:
            </label>
            <textarea
                id="custom-bg-prompt"
                rows={2}
                value={customPrompt}
                onChange={(e) => onCustomPromptChange(e.target.value)}
                disabled={disabled}
                placeholder="مثال: احذف الخلفية واترك الكرسي والطاولة فقط، وامسح أي نصوص."
                className="block w-full px-4 py-3 text-base text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-right placeholder-gray-500 resize-none"
            />
        </div>
      )}
    </div>
  );
};
