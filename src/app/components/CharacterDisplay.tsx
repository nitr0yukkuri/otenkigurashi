// src/app/components/CharacterDisplay.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import CharacterFace from './CharacterFace';
import ItemIcon from './ItemIcon';

export type EquipmentState = {
    head: string | null;
    hand: string | null;
    floating: string | null;
    // ★追加: お部屋スロット
    room?: string | null;
};

type CharacterDisplayProps = {
    petName: string;
    petColor: string;
    cheekColor?: string;
    equipment: EquipmentState | null;
    mood: "happy" | "neutral" | "sad" | "scared";
    message: string | null;
    onCharacterClick: () => void;
    isNight?: boolean;
    isStatic?: boolean;
    // ★追加: 天気情報（家具の出し分け用）
    weather?: string | null;
};

const SLOT_STYLES = {
    head: { className: "absolute -top-8 left-1/2 -translate-x-1/2 z-20 w-2/3" },
    hand: { className: "absolute bottom-0 -right-4 z-30 w-1/3" },
    floating: { className: "absolute -top-4 -right-8 z-10 w-1/3" },
    // ★追加: 家具（背景）
    room: { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-full h-full scale-150 opacity-80 pointer-events-none" }
};

export default function CharacterDisplay({
    petName,
    petColor,
    cheekColor = "#F8BBD0",
    equipment,
    mood,
    message,
    onCharacterClick,
    isNight = false,
    isStatic = false,
    weather
}: CharacterDisplayProps) {

    const renderSlot = (slot: keyof EquipmentState) => {
        if (!equipment) return null;
        const itemName = equipment[slot];
        if (!itemName) return null;

        // ★追加: 天気連動家具のロジック
        // 「てるてる坊主(GiGhost)」は雨の日の「お部屋」スロットでのみ表示
        if (slot === 'room' && itemName === 'GiGhost' && weather !== 'rainy' && weather !== null) {
            // weatherがnull(設定画面など)の場合は常に表示する
            return null;
        }

        const style = SLOT_STYLES[slot];

        return (
            <div key={slot} className={style.className}>
                <div className="w-full h-full flex items-center justify-center drop-shadow-md">
                    <ItemIcon name={itemName} size={undefined} />
                </div>
            </div>
        );
    };

    const messageBg = isNight ? 'bg-gray-700/80' : 'bg-white/80';
    const messageText = isNight ? 'text-white' : 'text-slate-700';
    const messageArrow = isNight ? 'border-t-gray-700/80' : 'border-t-white/80';
    const nameBg = isNight ? 'bg-black/30' : 'bg-white/30';
    const isRainbow = petColor === 'rainbow';

    return (
        <div className={`flex-grow flex flex-col items-center justify-center gap-y-4 p-3 text-center ${isStatic ? '' : 'pb-20'} relative`}>
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className={`absolute chat-bubble-pos ${messageBg} backdrop-blur-sm rounded-xl px-3 py-1 shadow-md z-10`}
                    >
                        <p className={`${messageText} text-[15px] font-medium`}>{message}</p>
                        <div className={`absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 ${messageArrow}`}></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-40 h-40 rounded-full relative">
                {/* ★追加: 家具は一番後ろ */}
                {renderSlot('room')}

                {renderSlot('floating')}
                {renderSlot('head')}
                {renderSlot('hand')}

                <div className="w-full h-full rounded-full flex items-center justify-center relative z-10">
                    <CharacterFace mood={mood} onClick={onCharacterClick} petColor={petColor} cheekColor={cheekColor} isStatic={isStatic} />
                </div>
            </div>

            {petName && (
                <div>
                    <h1 className={`text-4xl font-bold backdrop-blur-sm ${nameBg} rounded-lg px-4 py-1`}>{petName}</h1>
                </div>
            )}
        </div>
    );
}