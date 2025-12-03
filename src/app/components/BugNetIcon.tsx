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
                {/* 持ち手 */}
                <path d="M40 90 C 40 90, 45 60, 50 50" stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" />
                {/* 網の枠 */}
                <ellipse cx="50" cy="35" rx="25" ry="20" stroke="#8D6E63" strokeWidth="4" fill="rgba(255,255,255,0.4)" />
                {/* 網目 */}
                <path d="M35 25 L 65 45 M 65 25 L 35 45 M 50 15 L 50 55 M 25 35 L 75 35" stroke="#B3E5FC" strokeWidth="1.5" strokeLinecap="round" />
            </g>
        </svg>
    );
};
export default BugNetIcon;