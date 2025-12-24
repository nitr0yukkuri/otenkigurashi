'use client';

import { motion, AnimatePresence } from 'framer-motion';
import CharacterFace from './CharacterFace';
import ItemIcon from './ItemIcon';
import TeruTeruIcon from './TeruTeruIcon';

export type EquipmentState = {
    head: string | null;
    hand: string | null;
    floating: string | null;
    room?: string | null;
};

type CharacterDisplayProps = {
    petName: string;
    petColor: string;
    cheekColor?: string;
    equipment: EquipmentState | null;
    mood: "happy" | "neutral" | "sad" | "scared" | "sleepy" | "looking";
    message: string | null;
    onCharacterClick: () => void;
    isNight?: boolean;
    isStatic?: boolean;
    weather?: string | null;
    onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave?: () => void;
    isWalking?: boolean;
};

const SLOT_STYLES = {
    head: { className: "absolute -top-8 left-1/2 -translate-x-1/2 z-20 w-2/3" },
    hand: { className: "absolute bottom-0 -right-4 z-30 w-1/3" },
    floating: { className: "absolute -top-4 -right-8 z-10 w-1/3" },
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
    weather = null,
    onPointerMove,
    onPointerLeave,
    isWalking = false
}: CharacterDisplayProps) {

    const renderSlot = (slot: keyof EquipmentState) => {
        if (!equipment) return null;
        const itemName = equipment[slot];
        if (!itemName) return null;

        // if (itemName === 'GiGhost') {
        //     if (weather !== 'rainy' && weather !== null) {
        //         return null;
        //     }
        // }

        const style = SLOT_STYLES[slot];

        return (
            <div key={slot} className={style.className}>
                <div className="w-full h-full flex items-center justify-center drop-shadow-md">
                    {itemName === 'GiGhost' ? (
                        <TeruTeruIcon size={32} />
                    ) : (
                        <ItemIcon name={itemName} size={undefined} />
                    )}
                </div>
            </div>
        );
    };

    const messageBg = isNight ? 'bg-gray-700/80' : 'bg-white/80';
    const messageText = isNight ? 'text-white' : 'text-slate-700';
    const messageArrow = isNight ? 'border-t-gray-700/80' : 'border-t-white/80';
    const nameBg = isNight ? 'bg-black/30' : 'bg-white/30';

    // ★追加: 晴れまたは快晴で、かつ夜でないかを判定
    const isSunnyOrClear = (weather === 'sunny' || weather === 'clear') && !isNight;

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
                        <p className={`${messageText} text-[15px] font-medium whitespace-nowrap`}>{message}</p>
                        <div className={`absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 ${messageArrow}`}></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className={`w-40 h-40 rounded-full relative touch-none ${isWalking ? 'animate-fluffy-walk' : ''}`}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
            >
                {/* ★追加: 太陽光エフェクト */}
                <AnimatePresence>
                    {isSunnyOrClear && (
                        <motion.div
                            key="sunlight-effect"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0.3, 0.5, 0.3],
                                rotate: [0, 5, 0, -5, 0], // ゆっくりと光が揺らぐ
                                scale: [1, 1.05, 1]
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                                rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="absolute top-0 left-0 w-full h-full rounded-full z-20 pointer-events-none mix-blend-soft-light"
                            style={{
                                // 左上からの温かい光のグラデーション
                                background: 'radial-gradient(circle at 30% 30%, rgba(255, 250, 210, 0.7) 0%, rgba(255, 255, 255, 0) 65%)',
                                // 全体に柔らかな光彩を追加
                                boxShadow: 'inset 0 0 20px rgba(255, 235, 190, 0.3)'
                            }}
                        />
                    )}
                </AnimatePresence>

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