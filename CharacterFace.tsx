// src/app/components/CharacterFace.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';

type CharacterFaceProps = {
    // ★修正: 型定義に "scared" を追加して CharacterDisplay 側との整合性を取る
    mood?: "happy" | "neutral" | "sad" | "scared";
    onClick?: () => void;
    petColor?: string;
    cheekColor?: string;
    isStatic?: boolean;
};

export default function CharacterFace({
    mood = "happy",
    onClick,
    petColor = "white",
    cheekColor = "#F8BBD0",
    isStatic = false
}: CharacterFaceProps) {

    const getMouthPath = () => {
        switch (mood) {
            case "happy":
                return "M 45 75 Q 60 90 75 75";
            case "neutral":
                return "M 45 80 L 75 80";
            case "sad":
                return "M 45 85 Q 60 75 75 85";
            // ★追加: 怖がり口（波線）
            case "scared":
                return "M 42 82 Q 47 77 52 82 Q 57 87 62 82 Q 67 77 72 82 Q 77 87 82 82";
            default:
                return "M 45 75 Q 60 90 75 75";
        }
    };

    const isRainbow = petColor === 'rainbow';
    const safePetColor = petColor === 'white' ? '#ffffff' : petColor;

    const rainbowAnimation = {
        fill: [
            "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"
        ],
        transition: { duration: 4, repeat: Infinity, ease: "linear" }
    };

    return (
        <motion.div
            style={{ width: '100%', height: '100%', cursor: 'pointer' }}
            whileTap={isStatic ? undefined : { scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={onClick}
        >
            <motion.svg
                viewBox="0 0 120 120"
                width="100%"
                height="100%"
                animate={isStatic ? undefined : {
                    y: ["-3%", "3%"],
                    rotate: [-2, 2, -2]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                }}
            >
                {/* 顔のベース */}
                <motion.circle
                    cx="60" cy="60" r="60"
                    fill={isRainbow ? '#ff0000' : safePetColor}
                    animate={isStatic ? undefined : (isRainbow ? rainbowAnimation : { fill: safePetColor })}
                />

                {/* ほっぺ */}
                <circle cx="20" cy="70" r="12" fill={cheekColor} />
                <circle cx="100" cy="70" r="12" fill={cheekColor} />

                {/* 目 */}
                {/* ★追加: moodがscaredのときは ＞＜ の目にする (isStatic判定も考慮) */}
                {mood === 'scared' ? (
                    <motion.g
                        animate={isStatic ? undefined : { x: [-1, 1, -1], y: [0, 1, 0] }} // ガタガタ震える
                        transition={{ duration: 0.2, repeat: Infinity }}
                    >
                        {/* 左目 ＞ */}
                        <path d="M 35 50 L 45 55 L 35 60" fill="none" stroke="#5D4037" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                        {/* 右目 ＜ */}
                        <path d="M 85 50 L 75 55 L 85 60" fill="none" stroke="#5D4037" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.g>
                ) : (
                    <motion.g
                        animate={isStatic ? undefined : { scaleY: [1, 0.1, 1, 1, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                    >
                        <circle cx="40" cy="55" r="5" fill="#5D4037" />
                        <circle cx="80" cy="55" r="5" fill="#5D4037" />
                    </motion.g>
                )}

                {/* 口 */}
                <AnimatePresence mode="wait">
                    <motion.path
                        key={mood}
                        d={getMouthPath()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        stroke="#5D4037"
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </AnimatePresence>
            </motion.svg>
        </motion.div>
    );
}