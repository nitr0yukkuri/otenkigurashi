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
                <linearGradient id="rainbow-grad" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#FF9A9E" />
                    <stop offset="50%" stopColor="#FECFEF" />
                    <stop offset="100%" stopColor="#A18CD1" />
                </linearGradient>
                <filter id="soft-glow-neck" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="2" />
                    <feFlood floodColor="#000000" floodOpacity="0.1" />
                    <feComposite operator="in" in2="SourceGraphic" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <g filter="url(#soft-glow-neck)">
                {/* チェーン */}
                <path d="M30 20 Q 50 80 70 20" stroke="#BDC3C7" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* ペンダントトップ */}
                <g transform="translate(50, 65)">
                    <path d="M0 -15 L 10 0 L 0 15 L -10 0 Z" fill="url(#rainbow-grad)" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="0" cy="0" r="3" fill="white" opacity="0.8" />
                </g>
            </g>
        </svg>
    );
};
export default RainbowNecklaceIcon;