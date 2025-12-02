// src/app/components/NavItem.tsx

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion'; // ★追加
import { useSound } from '../hooks/useSound';

// LinkコンポーネントをFramer Motion化
// ★変更: motion(Link) は非推奨のため motion.create(Link) に変更
const MotionLink = motion.create(Link);

// isNight prop を受け取るように変更
export default function NavItem({ icon, label, onClick, hasNotification = false, href, isNight }: {
    icon: React.ReactNode,
    label: string,
    onClick?: () => void,
    hasNotification?: boolean,
    href?: string,
    isNight?: boolean
}) {
    const { playSfx } = useSound();

    const handleClick = () => {
        playSfx('decision.mp3');
        if (onClick) {
            onClick();
        }
    };

    // isNight に応じて色を動的に決定
    const iconColor = isNight ? 'text-white' : 'text-slate-800';
    const labelColor = isNight ? 'text-white' : 'text-slate-700';

    const content = (
        <>
            {/* アイコンの色を動的に適用 */}
            <div className={`relative ${iconColor} transition-colors duration-300`}>
                {icon}
                {hasNotification && (
                    <div className="absolute -top-1 -right-1 flex">
                        <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                        <span className="h-2 w-2 rounded-full bg-slate-400 -ml-1"></span>
                    </div>
                )}
            </div>
            {/* ラベルの色を動的に適用 */}
            <span className={`text-xs font-medium ${labelColor} transition-colors duration-300`}>{label}</span>
        </>
    );

    // ★変更: transition-transform と active:scale-95 を削除 (Framer Motionで制御するため)
    const className = `flex-1 flex flex-col items-center justify-center gap-1 h-full border-none outline-none bg-transparent`;

    // ★追加: 控えめな「ポコッ」アニメーション設定
    const animationProps = {
        whileTap: { scale: 0.9 }, // 0.75 -> 0.9 に変更（変化を小さく）
        transition: { type: "spring", stiffness: 400, damping: 17 } // dampingを増やして揺れを控えめに
    };

    return href ? (
        <MotionLink href={href} className={className} onClick={handleClick} {...animationProps}>
            {content}
        </MotionLink>
    ) : (
        <motion.button onClick={handleClick} className={className} {...animationProps}>
            {content}
        </motion.button>
    );
};