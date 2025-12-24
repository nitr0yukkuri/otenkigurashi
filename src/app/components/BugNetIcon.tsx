// src/app/components/BugNetIcon.tsx
import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

const BugNetIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <filter id="soft-glow-net" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="2" result="offsetblur" />
                    <feFlood floodColor="#000000" floodOpacity="0.1" />
                    <feComposite in2="offsetblur" operator="in" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <g transform="rotate(-15 50 50)" filter="url(#soft-glow-net)">
                {/* 持ち手: 少し色を明るくし、カーブを調整して手作り感を出す */}
                <path d="M44 93 Q 46 75 51 53" stroke="#A1887F" strokeWidth="5" strokeLinecap="round" />

                {/* 網の袋部分（中身）: 半透明でふんわりとした形を追加 */}
                <path d="M 30 36 C 30 49, 70 49, 70 36 C 68 68, 32 68, 30 36 Z" fill="rgba(179, 229, 252, 0.3)" />

                {/* 網の枠: 単純な楕円から少し有機的な形のパスに変更 */}
                <path d="M 30 36 C 30 23, 70 23, 70 36 C 70 49, 30 49, 30 36 Z" stroke="#A1887F" strokeWidth="3.5" fill="rgba(255,255,255,0.2)" />

                {/* 網目: 直線から、袋の形に沿った柔らかな曲線に変更 */}
                <g stroke="#B3E5FC" strokeWidth="1.2" strokeLinecap="round" fill="none">
                    {/* 縦方向の網目 */}
                    <path d="M 50 24 Q 50 50 50 67" />
                    <path d="M 40 26 Q 38 50 42 63" />
                    <path d="M 60 26 Q 62 50 58 63" />
                    {/* 横方向の網目 */}
                    <path d="M 32 30 Q 50 32 68 30" />
                    <path d="M 31 42 Q 50 48 69 42" />
                    <path d="M 35 55 Q 50 62 65 55" />
                </g>
            </g>
        </svg>
    );
};
export default BugNetIcon;