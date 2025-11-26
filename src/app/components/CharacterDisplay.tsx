// src/app/components/CharacterDisplay.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import CharacterFace from './CharacterFace';
import ItemIcon from './ItemIcon';

// 装備の型定義
export type EquipmentState = {
    head: string | null;
    hand: string | null;
    floating: string | null;
    // 将来的に 'background', 'neck' など増やせる
};

type CharacterDisplayProps = {
    petName: string;
    petColor: string;
    cheekColor?: string;
    // ★ 変更: 文字列ではなくオブジェクトで受け取る
    equipment: EquipmentState | null;
    mood: "happy" | "neutral" | "sad";
    message: string | null;
    onCharacterClick: () => void;
    isNight?: boolean;
};

// ★ カテゴリーごとの表示スタイル定義 (ここをいじるだけで全アイテムの位置調整が可能)
const SLOT_STYLES = {
    head: {
        className: "absolute -top-8 left-1/2 -translate-x-1/2 z-20 w-2/3", // 頭の上、中央揃え
        animation: { y: [0, -3, 0], transition: { duration: 4, repeat: Infinity } } // ふわふわ
    },
    hand: {
        className: "absolute bottom-0 -right-4 z-30 w-1/3", // 右手前
        animation: { rotate: [0, 5, 0], transition: { duration: 2, repeat: Infinity } } // ゆらゆら
    },
    floating: {
        className: "absolute -top-4 -right-8 z-10 w-1/3", // 右上、背後
        animation: { y: [0, -10, 0], opacity: 0.9, transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } } // 浮遊
    }
};

export default function CharacterDisplay({
    petName,
    petColor,
    cheekColor = "#F8BBD0",
    equipment,
    mood,
    message,
    onCharacterClick,
    isNight = false
}: CharacterDisplayProps) {

    // 装備レンダリング関数 (汎用化)
    const renderSlot = (slot: keyof EquipmentState) => {
        // equipmentがnullまたは未定義の場合は何もしない
        if (!equipment) return null;

        const itemName = equipment[slot];
        if (!itemName) return null;

        const style = SLOT_STYLES[slot];

        return (
            <motion.div
                key={slot}
                className={style.className}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, ...style.animation }}
                exit={{ opacity: 0, scale: 0.8 }}
            >
                <div className="w-full h-full flex items-center justify-center drop-shadow-md">
                    {/* サイズは親divに合わせるため undefined */}
                    <ItemIcon name={itemName} size={undefined} />
                </div>
            </motion.div>
        );
    };

    const messageBg = isNight ? 'bg-gray-700/80' : 'bg-white/80';
    const messageText = isNight ? 'text-white' : 'text-slate-700';
    const messageArrow = isNight ? 'border-t-gray-700/80' : 'border-t-white/80';
    const nameBg = isNight ? 'bg-black/30' : 'bg-white/30';

    const isRainbow = petColor === 'rainbow';
    const rainbowAnimation = {
        backgroundColor: [
            "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"
        ],
        transition: { duration: 4, repeat: Infinity, ease: "linear" }
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center gap-y-4 p-3 text-center pb-20 relative">
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`absolute top-8 ${messageBg} backdrop-blur-sm rounded-xl px-3 py-1 shadow-md z-10`}
                    >
                        <p className={`${messageText} text-[15px] font-medium`}>{message}</p>
                        <div className={`absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 ${messageArrow}`}></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="w-40 h-40 rounded-full relative"
                style={{ backgroundColor: isRainbow ? '#ff0000' : petColor }}
                animate={isRainbow ? rainbowAnimation : { backgroundColor: petColor }}
            >
                {/* ★ 複数装備をレンダリング */}
                <AnimatePresence>
                    {renderSlot('floating')} {/* 背面 */}
                    {renderSlot('head')}
                    {renderSlot('hand')}
                </AnimatePresence>

                <div className="w-full h-full rounded-full flex items-center justify-center relative z-10">
                    <CharacterFace mood={mood} onClick={onCharacterClick} petColor={petColor} cheekColor={cheekColor} />
                </div>
            </motion.div>

            <div>
                <h1 className={`text-4xl font-bold backdrop-blur-sm ${nameBg} rounded-lg px-4 py-1`}>{petName}</h1>
            </div>
        </div>
    );
}