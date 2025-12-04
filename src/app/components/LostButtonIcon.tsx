// src/app/components/LostButtonIcon.tsx
import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

const LostButtonIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="なくしたボタン"
        >
            <defs>
                {/* ボタンの質感用グラデーション */}
                <linearGradient id="button-gradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#D7CCC8" /> {/* 明るいベージュ */}
                    <stop offset="100%" stopColor="#A1887F" /> {/* 暗いブラウン */}
                </linearGradient>
                {/* 立体感のドロップシャドウ */}
                <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="2" result="offsetblur" />
                    <feFlood floodColor="#000000" floodOpacity="0.2" />
                    <feComposite in2="offsetblur" operator="in" />
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                {/* 内側のくぼみ用シャドウ */}
                <filter id="inner-shadow">
                    <feOffset dx="0" dy="1" />
                    <feGaussianBlur stdDeviation="1" result="offset-blur" />
                    <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                    <feFlood floodColor="black" floodOpacity="0.3" result="color" />
                    <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                    <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                </filter>
            </defs>

            <g filter="url(#drop-shadow)">
                {/* ボタン本体 */}
                <circle cx="50" cy="50" r="40" fill="url(#button-gradient)" stroke="#8D6E63" strokeWidth="2" />

                {/* 内側の溝 */}
                <circle cx="50" cy="50" r="28" fill="none" stroke="#8D6E63" strokeWidth="1" opacity="0.5" />

                {/* ボタンの穴（4つ） */}
                <g fill="#5D4037" filter="url(#inner-shadow)">
                    <circle cx="42" cy="42" r="5" />
                    <circle cx="58" cy="42" r="5" />
                    <circle cx="42" cy="58" r="5" />
                    <circle cx="58" cy="58" r="5" />
                </g>

                {/* 糸（クロス） - なくしたボタンなので、少しほつれているイメージで糸は描かないか、あえて切れた糸を描く */}
                {/* ここでは「ボタンそのもの」を強調するため、糸はなしで穴を強調 */}

                {/* ハイライト */}
                <path d="M 30 20 Q 50 15, 70 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            </g>
        </svg>
    );
};

export default LostButtonIcon;