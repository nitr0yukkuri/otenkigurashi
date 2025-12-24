// src/app/components/CharacterDisplay.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
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

    // ★追加: なでなで検知用のRef
    const isDragging = useRef(false);
    const totalDragDistance = useRef(0);
    const lastPointerPos = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        isDragging.current = true;
        totalDragDistance.current = 0;
        lastPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMoveInternal = (e: React.PointerEvent<HTMLDivElement>) => {
        // 既存の視線追従処理があれば実行
        if (onPointerMove) onPointerMove(e);

        // なでなで判定
        if (isDragging.current) {
            const dx = e.clientX - lastPointerPos.current.x;
            const dy = e.clientY - lastPointerPos.current.y;
            const distance = Math.hypot(dx, dy);

            totalDragDistance.current += distance;
            lastPointerPos.current = { x: e.clientX, y: e.clientY };

            // 一定距離（例: 150px）以上撫でたらクリック扱いにする
            if (totalDragDistance.current > 150) {
                onCharacterClick();
                totalDragDistance.current = 0; // 連続で反応しないようにリセット（または連続反応させるなら調整）
            }
        }
    };

    const handlePointerUpOrLeave = () => {
        isDragging.current = false;
        if (onPointerLeave) onPointerLeave();
    };

    const renderSlot = (slot: keyof EquipmentState) => {
        if (!equipment) return null;
        const itemName = equipment[slot];
        if (!itemName) return null;

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

    // 天気ごとの判定
    const isSunnyOrClear = (weather === 'sunny' || weather === 'clear') && !isNight;
    const isCloudy = weather === 'cloudy';
    const isWindy = weather === 'windy';
    // 「夜」天気、または夜間の「晴れ・快晴」のときに星を出す
    const isStarryNight = weather === 'night' || (isNight && (weather === 'sunny' || weather === 'clear'));

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
                // ★修正: なでなでイベントをバインド
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMoveInternal}
                onPointerUp={handlePointerUpOrLeave}
                onPointerLeave={handlePointerUpOrLeave}
            >
                <AnimatePresence>
                    {/* 1. 晴れ・快晴 (木漏れ日) */}
                    {isSunnyOrClear && (
                        <>
                            <motion.div
                                key="sun-rays"
                                initial={{ opacity: 0, rotate: 45 }}
                                animate={{ opacity: [0.4, 0.6, 0.4], rotate: [45, 48, 45], scale: [1, 1.05, 1] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-[50%] -right-[50%] w-[200%] h-[200%] z-20 pointer-events-none mix-blend-soft-light"
                                style={{ background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(255, 255, 255, 0.1) 15deg, rgba(255, 250, 200, 0.5) 30deg, rgba(255, 255, 255, 0.1) 45deg, transparent 60deg)' }}
                            />
                            <motion.div
                                key="sun-glow"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.3, 0.5, 0.3] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-0 right-0 w-full h-full rounded-full z-20 pointer-events-none mix-blend-screen"
                                style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255, 255, 240, 0.7) 0%, rgba(255, 220, 150, 0.2) 60%, transparent 90%)' }}
                            />
                        </>
                    )}

                    {/* 2. くもり (流れる霧) */}
                    {isCloudy && (
                        <motion.div
                            key="cloudy-fog"
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: "-100%", opacity: [0, 0.4, 0.4, 0] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 left-0 w-[200%] h-full z-20 pointer-events-none"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4) 30%, rgba(255, 255, 255, 0.2) 70%, transparent)',
                                filter: 'blur(20px)'
                            }}
                        />
                    )}

                    {/* 3. 強風 (強化: 画面全体に激しく吹き抜ける風) */}
                    {isWindy && (
                        <>
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={`wind-${i}`}
                                    initial={{ x: "180%", opacity: 0 }}
                                    animate={{ x: "-180%", opacity: [0, 0.8, 0] }}
                                    transition={{
                                        duration: 0.8 + (i % 3) * 0.4,
                                        repeat: Infinity,
                                        delay: (i * 0.7) % 2,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute h-[3px] bg-white/50 rounded-full z-20 pointer-events-none blur-[1px]"
                                    style={{
                                        top: `${10 + i * 15}%`,
                                        width: `${50 + (i % 3) * 20}%`,
                                        left: '10%'
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* 4. 夜 (派手な月光 + 超派手な流れ星 + 上に星) */}
                    {isStarryNight && (
                        <>
                            {/* 上の方に瞬く星 */}
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={`star-${i}`}
                                    initial={{ opacity: 0.3, scale: 0.8 }}
                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                    transition={{
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute bg-white rounded-full z-20 blur-[0.5px]"
                                    style={{
                                        width: i % 2 === 0 ? 3 : 2,
                                        height: i % 2 === 0 ? 3 : 2,
                                        top: `${5 + (i * 40 / 8)}%`,
                                        left: `${(i * 90 / 8) + 5}%`,
                                        boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
                                    }}
                                />
                            ))}

                            {/* 月光の筋 (Night Rays) */}
                            <motion.div
                                key="moon-rays"
                                initial={{ opacity: 0, rotate: -15 }}
                                animate={{
                                    opacity: [0.3, 0.5, 0.3],
                                    rotate: [-15, -12, -15],
                                    scale: [1, 1.05, 1]
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] z-20 pointer-events-none mix-blend-screen"
                                style={{
                                    background: 'conic-gradient(from 110deg at 50% 50%, transparent 0deg, rgba(200, 230, 255, 0.1) 15deg, rgba(180, 210, 255, 0.4) 30deg, rgba(200, 230, 255, 0.1) 45deg, transparent 60deg)',
                                }}
                            />
                            {/* 月の輝き (Moon Glow) */}
                            <motion.div
                                key="moon-glow"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-0 left-0 w-full h-full rounded-full z-20 pointer-events-none mix-blend-screen"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, rgba(220, 240, 255, 0.7) 0%, rgba(100, 150, 255, 0.2) 60%, transparent 90%)',
                                }}
                            />

                            {/* 特大の流れ星 */}
                            <motion.div
                                key="shooting-star-main"
                                initial={{ top: "0%", left: "95%", width: 0, opacity: 0 }}
                                animate={{
                                    top: ["0%", "75%"],
                                    left: ["95%", "5%"],
                                    width: [0, 250, 0],
                                    opacity: [0, 1, 0.8, 0]
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    repeatDelay: 2.2,
                                    ease: "easeOut",
                                    times: [0, 0.1, 0.8, 1]
                                }}
                                className="absolute h-[4px] z-20 rotate-[35deg] rounded-full"
                                style={{
                                    background: 'linear-gradient(90deg, #FFFFFF, transparent)',
                                    boxShadow: '0 0 25px rgba(255, 255, 255, 1), 0 0 50px rgba(120, 220, 255, 0.9)'
                                }}
                            />

                            {/* 小さめの流れ星 */}
                            <motion.div
                                key="shooting-star-sub"
                                initial={{ top: "20%", left: "100%", width: 0, opacity: 0 }}
                                animate={{
                                    top: ["20%", "50%"],
                                    left: ["100%", "40%"],
                                    width: [0, 100, 0],
                                    opacity: [0, 0.8, 0]
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    repeatDelay: 1.5,
                                    delay: 1.0,
                                    ease: "easeOut"
                                }}
                                className="absolute h-[2px] bg-white z-20 rotate-[35deg]"
                                style={{
                                    boxShadow: '0 0 15px rgba(255, 255, 255, 1)'
                                }}
                            />
                        </>
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