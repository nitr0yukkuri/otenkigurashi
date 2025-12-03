// src/app/components/TeruTeruIcon.tsx
import React from 'react';

interface TeruTeruIconProps {
    size?: number;
    className?: string;
}

const TeruTeruIcon: React.FC<TeruTeruIconProps> = ({ size = 32, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="てるてる坊主"
        >
            {/* 定義: グラデーションや影 */}
            <defs>
                <linearGradient id="body-gradient" x1="50" y1="10" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFBF0" /> {/* 非常に薄いクリーム色 */}
                    <stop offset="1" stopColor="#F0EFE8" /> {/* 少し影のあるオフホワイト */}
                </linearGradient>
                <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.2" /> {/* 影の濃さ調整 */}
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* 吊るす紐 */}
            <path d="M50 0 V15" stroke="#D1D1C7" strokeWidth="3" strokeLinecap="round" />

            {/* 本体（頭と体） */}
            <g filter="url(#soft-shadow)">
                {/* 頭 */}
                <circle cx="50" cy="32" r="18" fill="url(#body-gradient)" />
                {/* 体（ひらひら部分） */}
                <path
                    d="M34 45 C 34 45, 20 60, 22 85 C 23 92, 35 88, 40 92 C 45 96, 55 96, 60 92 C 65 88, 77 92, 78 85 C 80 60, 66 45, 66 45 L 34 45 Z"
                    fill="url(#body-gradient)"
                />
            </g>

            {/*首の紐（赤いリボン） */}
            <path
                d="M33 46 C 33 46, 50 50, 67 46"
                stroke="#E86C61"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="M48 48 L 45 55 M 52 48 L 55 55"
                stroke="#E86C61"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* 顔 */}
            <g fill="#7A7A75">
                {/* 目 */}
                <circle cx="43" cy="30" r="2.5" />
                <circle cx="57" cy="30" r="2.5" />
                {/* 口（にっこり） */}
                <path
                    d="M45 36 Q 50 41, 55 36"
                    stroke="#7A7A75"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                />
            </g>
        </svg>
    );
};

export default TeruTeruIcon;