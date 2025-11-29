// src/app/components/NavItem.tsx

'use client';

import Link from 'next/link';
import { useSound } from '../hooks/useSound'; // ★ 追加

// ★ isNight prop を受け取るように変更
export default function NavItem({ icon, label, onClick, hasNotification = false, href, isNight }: {
    icon: React.ReactNode,
    label: string,
    onClick?: () => void,
    hasNotification?: boolean,
    href?: string,
    isNight?: boolean // ★ isNight prop を追加
}) {
    const { playSfx } = useSound(); // ★ 追加

    const handleClick = () => {
        playSfx('decision.mp3'); // ★ 追加: クリック音再生
        if (onClick) {
            onClick();
        }
    };

    // ★ isNight に応じて色を動的に決定 (text-slate-200/300 を text-white に変更)
    const iconColor = isNight ? 'text-white' : 'text-slate-800';
    const labelColor = isNight ? 'text-white' : 'text-slate-700';

    const content = (
        <>
            {/* ★ アイコンの色を動的に適用 */}
            <div className={`relative ${iconColor} transition-colors duration-300`}>
                {icon}
                {hasNotification && (
                    <div className="absolute -top-1 -right-1 flex">
                        <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                        <span className="h-2 w-2 rounded-full bg-slate-400 -ml-1"></span>
                    </div>
                )}
            </div>
            {/* ★ ラベルの色を動的に適用 */}
            <span className={`text-xs font-medium ${labelColor} transition-colors duration-300`}>{label}</span>
        </>
    );

    const className = `flex-1 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 h-full border-none outline-none`;

    return href ? (
        <Link href={href} className={className} onClick={handleClick}>
            {content}
        </Link>
    ) : (
        <button onClick={handleClick} className={className}>
            {content}
        </button>
    );
};