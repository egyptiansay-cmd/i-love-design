
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="w-full text-center mb-8 sm:mb-12">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-2">
                I love design <span role="img" aria-label="winking face">😉</span>
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-transparent bg-clip-text">
                محرر الصور بالذكاء الاصطناعي
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                ارفع صورتك وقم بتحسينها، إزالة خلفيتها، تصميم إعلانات، أو دمجها مع تصاميم جاهزة.
            </p>
        </header>
    );
};
