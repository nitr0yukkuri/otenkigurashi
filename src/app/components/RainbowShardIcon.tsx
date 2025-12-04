// src/app/components/RainbowShardIcon.tsx
import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

const RainbowShardIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="虹のかけら"
        >
            <defs>
                {/* 鮮やかな虹色グラデーション（斜めに走らせて反射っぽく） */}
                <linearGradient id="shard-rainbow" x1="20" y1="0" x2="80" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF9AA2" />   {/* ピンク */}
                    <stop offset="20%" stopColor="#FFB7B2" />  {/* サーモン */}
                    <stop offset="40%" stopColor="#FFDAC1" />  {/* オレンジ */}
                    <stop offset="60%" stopColor="#E2F0CB" />  {/* グリーン */}
                    <stop offset="80%" stopColor="#B5EAD7" />  {/* ブルー */}
                    <stop offset="100%" stopColor="#C7CEEA" /> {/* パープル */}
                </linearGradient>

                {/* 硬質な輝きのためのシャープな光沢 */}
                <filter id="sharp-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
                    <feOffset dx="0" dy="0" result="offsetBlur" />
                    <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
                </filter>
            </defs>

            <g filter="url(#sharp-glow)">
                {/* 本体：不規則で鋭利な多角形（かけら形状） */}
                <path
                    d="M50 5 L85 25 L95 65 L65 95 L15 85 L5 40 Z"
                    fill="url(#shard-rainbow)"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />

                {/* 内部の稜線（ファセット）：中心点から角へ線を伸ばして立体感を出す */}
                <path
                    d="M50 5 L 60 50 M 85 25 L 60 50 M 95 65 L 60 50 M 65 95 L 60 50 M 15 85 L 60 50 M 5 40 L 60 50"
                    stroke="white"
                    strokeWidth="1"
                    opacity="0.6"
                />

                {/* 鋭いハイライト（エッジの反射） */}
                <path d="M50 5 L85 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                <path d="M5 40 L15 85" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

                {/* 表面の光沢 */}
                <path d="M 25 45 L 45 55 L 35 75 Z" fill="white" opacity="0.4" />
            </g>
        </svg>
    );
};

export default RainbowShardIcon;