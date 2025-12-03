// src/app/components/RainbowNecklaceIcon.tsx
import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

const RainbowNecklaceIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                {/* 7色のパステルレインボーグラデーション */}
                <linearGradient id="rainbow-grad-vivid" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF9AA2" /> {/* ピンク */}
                    <stop offset="20%" stopColor="#FFB7B2" /> {/* サーモン */}
                    <stop offset="40%" stopColor="#FFDAC1" /> {/* オレンジ */}
                    <stop offset="60%" stopColor="#E2F0CB" /> {/* グリーン */}
                    <stop offset="80%" stopColor="#B5EAD7" /> {/* ブルー */}
                    <stop offset="100%" stopColor="#C7CEEA" /> {/* パープル */}
                </linearGradient>
                <filter id="soft-glow-neck" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="2" />
                    <feFlood floodColor="#000000" floodOpacity="0.15" />
                    <feComposite operator="in" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <g filter="url(#soft-glow-neck)">
                {/* チェーン: カラフルなビーズっぽく。線ではなく点で表現して「ゆるさ」を出す */}
                <path
                    d="M 35 25 Q 20 60, 50 75 Q 80 60, 65 25"
                    stroke="url(#rainbow-grad-vivid)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="0 11"
                    fill="none"
                />

                {/* ペンダントトップ: 角を丸くした、おもちゃっぽい星 */}
                <g transform="translate(50, 75) rotate(10)">
                    <path
                        d="M 0 -13 L 4 -5 L 13 -5 L 6 2 L 9 11 L 0 6 L -9 11 L -6 2 L -13 -5 L -4 -5 Z"
                        fill="url(#rainbow-grad-vivid)"
                        stroke="#FFF"
                        strokeWidth="4"
                        strokeLinejoin="round"
                    />
                    {/* シンプルなハイライト */}
                    <path d="M -4 -4 Q -2 -7, 2 -4" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                </g>
            </g>
        </svg>
    );
};
export default RainbowNecklaceIcon;