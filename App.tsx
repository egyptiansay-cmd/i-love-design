
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageResultViewer } from './components/ImageResultViewer';
import { Loader } from './components/Loader';
import { EnhancementOptions } from './components/EnhancementOptions';
import { ExpandOptions } from './components/ExpandOptions';
import { RemoveBgOptions } from './components/RemoveBgOptions';
import { MockupOptions } from './components/MockupOptions';
import { TemplateOptions } from './components/TemplateOptions';
import { AdminPanel } from './components/AdminPanel';
import { ModeSelector, SparklesIconSelector, ArrowsExpandIcon, RemoveBgIcon, MockupIcon, TemplateIcon, UndoIcon } from './components/ModeSelector';
import { enhanceImage, expandImage, enhancePrompt, removeBackground, generateMockup, generateTemplateMerge } from './services/geminiService';

// --- Utility to convert Data URL to File ---
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

type Mode = 'enhance' | 'expand' | 'remove-background' | 'mockup' | 'template';

// Master Credentials
const MASTER_USER = {
    username: 'ayman ai',
    password: '585877'
};

const App: React.FC = () => {
  // --- Security State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inputUsername, setInputUsername] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  
  // Stored Users (Persisted in localStorage)
  const [users, setUsers] = useState<{username: string, password: string}[]>(() => {
      const saved = localStorage.getItem('app_users');
      return saved ? JSON.parse(saved) : [];
  });

  // Save users to localStorage whenever they change
  useEffect(() => {
      localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  // --- App State ---
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [history, setHistory] = useState<File[]>([]); 
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mode, setMode] = useState<Mode>('remove-background');

  // Enhance mode states
  const [enhancementStyle, setEnhancementStyle] = useState<string>('auto');
  const [quality, setQuality] = useState<string>('hd');
  
  // Expand mode states
  const [expandPrompt, setExpandPrompt] = useState<string>('');
  const [expandAspectRatio, setExpandAspectRatio] = useState<string>('original');
  const [expandQuality, setExpandQuality] = useState<string>('8k');
  const [isPromptEnhancing, setIsPromptEnhancing] = useState<boolean>(false);

  // Remove Background mode states
  const [removeBgMode, setRemoveBgMode] = useState<string>('strict');
  const [removeBgCustomPrompt, setRemoveBgCustomPrompt] = useState<string>('');
  const [removeBgEnhance, setRemoveBgEnhance] = useState<boolean>(false);

  // Mockup mode states
  const [mockupTheme, setMockupTheme] = useState<string>('modern_studio');
  const [mockupCustomPrompt, setMockupCustomPrompt] = useState<string>('');

  // Template/Merge mode states
  const [templateMergeMode, setTemplateMergeMode] = useState<string>('replace');
  const [templateCustomPrompt, setTemplateCustomPrompt] = useState<string>('');


  // --- Security Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Master User
    if (inputUsername.trim() === MASTER_USER.username && inputPassword.trim() === MASTER_USER.password) {
      setIsAuthenticated(true);
      setCurrentUser(MASTER_USER.username);
      setAuthError('');
      return;
    }

    // Check Sub Users
    const foundUser = users.find(u => u.username === inputUsername.trim() && u.password === inputPassword.trim());
    if (foundUser) {
        setIsAuthenticated(true);
        setCurrentUser(foundUser.username);
        setAuthError('');
        return;
    }

    setAuthError('بيانات الدخول غير صحيحة. ليس لديك صلاحية.');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser('');
      setInputUsername('');
      setInputPassword('');
      setShowAdminPanel(false);
      handleReset(); // Clear workspace
  };

  const handleAddUser = (user: {username: string, password: string}) => {
      setUsers(prev => [...prev, user]);
  };

  const handleDeleteUser = (username: string) => {
      setUsers(prev => prev.filter(u => u.username !== username));
  };

  // --- Image Processing Handlers ---
  const handleProcessImage = useCallback(async () => {
    if (!originalImage) return;
    setIsLoading(true);
    setError(null);

    try {
        let resultImageData: string;
        if (mode === 'enhance') {
             resultImageData = await enhanceImage(originalImage, enhancementStyle, quality);
        } else if (mode === 'expand') {
             resultImageData = await expandImage(originalImage, expandPrompt, expandAspectRatio, expandQuality);
        } else if (mode === 'mockup') {
             resultImageData = await generateMockup(originalImage, mockupTheme, mockupCustomPrompt);
        } else if (mode === 'template') {
             if (!referenceImage) {
                 throw new Error("يرجى رفع صورة التصميم/الخلفية لإتمام عملية الدمج.");
             }
             resultImageData = await generateTemplateMerge(originalImage, referenceImage, templateMergeMode, templateCustomPrompt);
        } else {
             resultImageData = await removeBackground(originalImage, removeBgMode, removeBgCustomPrompt, removeBgEnhance);
        }
        setProcessedImage(resultImageData);
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`فشل المعالجة: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [originalImage, referenceImage, mode, enhancementStyle, quality, expandPrompt, expandAspectRatio, expandQuality, removeBgMode, removeBgCustomPrompt, removeBgEnhance, mockupTheme, mockupCustomPrompt, templateMergeMode, templateCustomPrompt]);

  const handleImageUpload = useCallback((file: File) => {
    setOriginalImage(file);
    setHistory([]); 
    setProcessedImage(null);
    setError(null);
  }, []);

  const handleReferenceUpload = useCallback((file: File) => {
    setReferenceImage(file);
  }, []);
  
  const handleEnhancePrompt = useCallback(async () => {
    if (!expandPrompt || expandPrompt.trim() === '') return;
    
    setIsPromptEnhancing(true);
    setError(null);
    try {
        const enhanced = await enhancePrompt(expandPrompt);
        setExpandPrompt(enhanced);
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`فشل تحسين الوصف: ${errorMessage}`);
    } finally {
        setIsPromptEnhancing(false);
    }
  }, [expandPrompt]);


  const handleReset = () => {
    setOriginalImage(null);
    setHistory([]);
    setReferenceImage(null);
    setProcessedImage(null);
    setError(null);
    setIsLoading(false);
    setExpandPrompt('');
    setRemoveBgCustomPrompt('');
    setMockupCustomPrompt('');
    setTemplateCustomPrompt('');
  };
  
  const handleRetry = useCallback(() => {
    if (!originalImage) return;
    handleProcessImage();
  }, [originalImage, handleProcessImage]);

  const handleContinueWithNew = useCallback(() => {
    if (!processedImage || !originalImage) return;
    setHistory(prev => [...prev, originalImage]);
    const newFile = dataURLtoFile(processedImage, `edited-image-${Date.now()}.png`);
    setOriginalImage(newFile);
    setReferenceImage(null); 
    setProcessedImage(null);
    setExpandPrompt(''); 
    setRemoveBgCustomPrompt('');
    setMockupCustomPrompt('');
    setTemplateCustomPrompt('');
  }, [processedImage, originalImage]);

  const handleContinueWithOriginal = useCallback(() => {
    setProcessedImage(null);
  }, []);

  const handleUndo = useCallback(() => {
    setHistory(prev => {
        const newHistory = [...prev];
        const previousImage = newHistory.pop();
        if (previousImage) {
            setOriginalImage(previousImage);
            setProcessedImage(null); 
            setError(null);
        }
        return newHistory;
    });
  }, []);
  
  const renderInitialState = () => (
    <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in">
       <ModeSelector mode={mode} onModeChange={(newMode) => setMode(newMode as Mode)} disabled={isLoading} />
       <div className="mt-4 w-full">
            <ImageUploader onImageUpload={handleImageUpload} disabled={isLoading} />
       </div>
    </div>
  );

  const renderWorkspace = () => (
    <div className="w-full max-w-6xl flex flex-col items-center animate-fade-in">
        <ModeSelector mode={mode} onModeChange={(newMode) => setMode(newMode as Mode)} disabled={isLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start mt-2">
            {/* Image Preview Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-300">
                        {mode === 'template' ? '1. العنصر (المنتج/الشخص)' : 'الصورة الأصلية'}
                    </h3>
                    <div className="relative w-full flex justify-center bg-gray-900/50 rounded-lg p-2">
                        <img 
                            src={URL.createObjectURL(originalImage!)} 
                            alt="Original" 
                            className="rounded-lg shadow-md max-w-full h-auto object-contain max-h-[40vh]" 
                        />
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                        <button 
                            onClick={() => { setOriginalImage(null); setHistory([]); }} 
                            className="text-gray-400 hover:text-white underline transition-colors"
                        >
                            رفع صورة جديدة
                        </button>
                        {history.length > 0 && (
                            <button 
                                onClick={handleUndo} 
                                className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors font-bold"
                            >
                                <UndoIcon className="w-4 h-4" />
                                تراجع عن الخطوة السابقة
                            </button>
                        )}
                    </div>
                </div>

                {/* Secondary Uploader for Template Mode */}
                {mode === 'template' && (
                    <div className={`flex flex-col items-center bg-gray-800 p-6 rounded-xl shadow-lg border ${referenceImage ? 'border-cyan-500/50' : 'border-gray-700 border-dashed'} transition-colors`}>
                         <h3 className="text-xl font-bold mb-4 text-gray-300">2. التصميم المُراد الدمج فيه</h3>
                         {referenceImage ? (
                             <>
                                <div className="relative w-full flex justify-center bg-gray-900/50 rounded-lg p-2">
                                    <img 
                                        src={URL.createObjectURL(referenceImage)} 
                                        alt="Reference" 
                                        className="rounded-lg shadow-md max-w-full h-auto object-contain max-h-[30vh]" 
                                    />
                                </div>
                                <button 
                                    onClick={() => setReferenceImage(null)} 
                                    className="mt-4 text-gray-400 hover:text-white underline text-sm transition-colors"
                                >
                                    تغيير التصميم
                                </button>
                             </>
                         ) : (
                             <div className="w-full">
                                <ImageUploader onImageUpload={handleReferenceUpload} disabled={isLoading} />
                             </div>
                         )}
                    </div>
                )}
            </div>

            {/* Controls Section */}
            <div className="flex flex-col gap-6 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 h-full">
                <div className="border-b border-gray-700 pb-4 mb-2">
                    <h3 className="text-2xl font-bold text-cyan-400 text-right">
                        {mode === 'enhance' && 'إعدادات التحسين'}
                        {mode === 'expand' && 'إعدادات التوسيع'}
                        {mode === 'mockup' && 'تصميم إعلان للمنتج'}
                        {mode === 'remove-background' && 'إزالة الخلفية'}
                        {mode === 'template' && 'دمج التصاميم'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 text-right">
                        {mode === 'enhance' && 'قم بضبط الإضاءة، الألوان، والدقة للحصول على أفضل صورة.'}
                        {mode === 'expand' && 'قم بتغيير أبعاد الصورة وتوسيع المشهد باستخدام الذكاء الاصطناعي.'}
                        {mode === 'mockup' && 'وضع المنتج في خلفية احترافية وجذابة تناسب الإعلانات.'}
                        {mode === 'remove-background' && 'عزل العناصر وتفريغ الخلفية بدقة عالية.'}
                        {mode === 'template' && 'استبدال منتج أو شخص في صورة أخرى بتصميم جاهز.'}
                    </p>
                </div>

                <div className="flex-grow">
                    {mode === 'enhance' && (
                        <EnhancementOptions
                            style={enhancementStyle}
                            onStyleChange={setEnhancementStyle}
                            quality={quality}
                            onQualityChange={setQuality}
                            disabled={isLoading}
                        />
                    )}

                    {mode === 'expand' && (
                        <div className="relative">
                            <ExpandOptions
                                prompt={expandPrompt}
                                onPromptChange={setExpandPrompt}
                                aspectRatio={expandAspectRatio}
                                onAspectRatioChange={setExpandAspectRatio}
                                quality={expandQuality}
                                onQualityChange={setExpandQuality}
                                disabled={isLoading || isPromptEnhancing}
                            />
                             <button
                                onClick={handleEnhancePrompt}
                                disabled={isLoading || isPromptEnhancing || !expandPrompt.trim()}
                                className="absolute bottom-3 left-3 p-2 rounded-full bg-gray-600 text-cyan-400 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                title="تحسين الوصف بالذكاء الاصطناعي"
                                >
                                {isPromptEnhancing ? (
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <SparklesIconSelector className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    )}

                    {mode === 'remove-background' && (
                        <RemoveBgOptions 
                            mode={removeBgMode}
                            onModeChange={setRemoveBgMode}
                            customPrompt={removeBgCustomPrompt}
                            onCustomPromptChange={setRemoveBgCustomPrompt}
                            enhanceSubject={removeBgEnhance}
                            onEnhanceSubjectChange={setRemoveBgEnhance}
                            disabled={isLoading}
                        />
                    )}

                    {mode === 'mockup' && (
                        <MockupOptions
                            theme={mockupTheme}
                            onThemeChange={setMockupTheme}
                            customPrompt={mockupCustomPrompt}
                            onCustomPromptChange={setMockupCustomPrompt}
                            disabled={isLoading}
                        />
                    )}

                    {mode === 'template' && (
                        <TemplateOptions 
                            mergeMode={templateMergeMode}
                            onMergeModeChange={setTemplateMergeMode}
                            customPrompt={templateCustomPrompt}
                            onCustomPromptChange={setTemplateCustomPrompt}
                            disabled={isLoading}
                        />
                    )}
                </div>

                <div className="mt-auto pt-6 flex flex-col gap-3">
                    <button
                        onClick={handleProcessImage}
                        disabled={isLoading || (mode === 'template' && !referenceImage)}
                        className="w-full flex items-center justify-center px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-bold rounded-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {mode === 'enhance' && <SparklesIconSelector className="w-6 h-6 ml-2" />}
                        {mode === 'expand' && <ArrowsExpandIcon className="w-6 h-6 ml-2" />}
                        {mode === 'remove-background' && <RemoveBgIcon className="w-6 h-6 ml-2" />}
                        {mode === 'mockup' && <MockupIcon className="w-6 h-6 ml-2" />}
                        {mode === 'template' && <TemplateIcon className="w-6 h-6 ml-2" />}
                        
                        {mode === 'enhance' ? 'بدء التحسين' : 
                         mode === 'expand' ? 'بدء توسيع الصورة' : 
                         mode === 'mockup' ? 'توليد التصميم' :
                         mode === 'template' ? 'دمج الصور الآن' :
                         'إزالة الخلفية الآن'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  // --- Render Authentication Screen ---
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-['Tajawal']">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col items-center animate-fade-in">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">النظام محمي</h2>
                <p className="text-gray-400 text-sm mb-6 text-center">يرجى تسجيل الدخول للمتابعة</p>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                    <div>
                        <input 
                            type="text"
                            value={inputUsername}
                            onChange={(e) => setInputUsername(e.target.value)}
                            placeholder="اسم المستخدم"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right text-white placeholder-gray-500 transition-colors"
                            autoFocus
                        />
                    </div>
                    <div>
                        <input 
                            type="password"
                            value={inputPassword}
                            onChange={(e) => setInputPassword(e.target.value)}
                            placeholder="كلمة المرور"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right text-white placeholder-gray-500 transition-colors"
                        />
                    </div>
                    
                    {authError && (
                        <p className="text-red-400 text-sm text-center font-bold animate-pulse">{authError}</p>
                    )}

                    <button 
                        type="submit"
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-transform transform active:scale-95 shadow-lg"
                    >
                        تسجيل الدخول
                    </button>
                </form>
                
                <footer className="mt-8 text-center opacity-50 text-xs">
                    <p>Powered by Gemini AI Security</p>
                </footer>
            </div>
        </div>
    );
  }

  // --- Render Admin Panel ---
  if (showAdminPanel) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-['Tajawal']">
             <AdminPanel 
                users={users} 
                onAddUser={handleAddUser} 
                onDeleteUser={handleDeleteUser} 
                onClose={() => setShowAdminPanel(false)} 
             />
        </div>
      );
  }

  // --- Render Main App ---
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-['Tajawal']">
      {/* Top Bar with User Info */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">مرحباً, <strong className="text-cyan-400">{currentUser}</strong></span>
              <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 underline">تسجيل خروج</button>
          </div>
          {currentUser === MASTER_USER.username && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-sm text-cyan-400 transition-colors"
              >
                  لوحة تحكم المسؤول
              </button>
          )}
      </div>

      <Header />
      <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col items-center justify-center">
        
        {!originalImage && !isLoading && !error && renderInitialState()}
        
        {originalImage && !processedImage && !isLoading && !error && renderWorkspace()}

        {isLoading && (
          <div className="text-center py-12">
            <Loader />
            <p className="mt-6 text-xl font-medium text-cyan-400 animate-pulse">
              جاري المعالجة بالذكاء الاصطناعي...
            </p>
            <p className="text-gray-500 mt-2">قد يستغرق الأمر بضع ثوانٍ لإنتاج صورة عالية الدقة</p>
          </div>
        )}

        {error && !isLoading && (
           <div className="w-full max-w-2xl text-center animate-fade-in">
            <div className="bg-red-900/80 border border-red-600 text-red-100 px-6 py-4 rounded-xl relative my-4 shadow-lg" role="alert">
              <strong className="font-bold text-xl block mb-2">عذراً، حدث خطأ!</strong>
              <span className="block text-red-200">{error}</span>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-4 justify-center">
                <button
                    onClick={handleRetry}
                    className="flex items-center justify-center px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <input type="hidden" /> 
                    إعادة المحاولة
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    إلغاء
                </button>
            </div>
          </div>
        )}

        {originalImage && processedImage && !isLoading && (
          <ImageResultViewer
            originalImage={URL.createObjectURL(originalImage)}
            processedImage={processedImage}
            onReset={handleReset}
            onContinueWithNew={handleContinueWithNew}
            onContinueWithOriginal={handleContinueWithOriginal}
            processedImageTitle={
                mode === 'enhance' ? 'المحسّنة' : 
                mode === 'expand' ? 'الموسعة' : 
                mode === 'mockup' ? 'التصميم الجديد' :
                mode === 'template' ? 'الدمج النهائي' :
                'أُزيلت الخلفية'
            }
          />
        )}
      </main>
      <footer className="w-full text-center p-6 mt-12 border-t border-gray-800 text-gray-500">
        <p className="text-lg font-semibold text-gray-400">مدعوم من Gemini AI</p>
        <p className="text-3xl sm:text-4xl mt-4 font-['Dancing_Script'] bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-transparent bg-clip-text font-bold tracking-wide hover:scale-105 transition-transform duration-300 cursor-default" style={{ lineHeight: '1.5' }}>
            Ayman ElFakharany / DesignOnline
        </p>
      </footer>
    </div>
  );
};

export default App;
