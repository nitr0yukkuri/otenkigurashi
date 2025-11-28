// src/app/components/CharacterDisplay.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import CharacterFace from './CharacterFace';
import ItemIcon from './ItemIcon';

export type EquipmentState = {
    head: string | null;
    hand: string | null;
    floating: string | null;
};

type CharacterDisplayProps = {
    petName: string;
    petColor: string;
    cheekColor?: string;
    equipment: EquipmentState | null;
    mood: "happy" | "neutral" | "sad";
    message: string | null;
    onCharacterClick: () => void;
    isNight?: boolean;
    isStatic?: boolean;
};

const SLOT_STYLES = {
    head: {
        className: "absolute -top-8 left-1/2 -translate-x-1/2 z-20 w-2/3",
    },
    hand: {
        className: "absolute bottom-0 -right-4 z-30 w-1/3",
    },
    floating: {
        className: "absolute -top-4 -right-8 z-10 w-1/3",
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
    isNight = false,
    isStatic = false
}: CharacterDisplayProps) {

    const renderSlot = (slot: keyof EquipmentState) => {
        if (!equipment) return null;

        const itemName = equipment[slot];
        if (!itemName) return null;

        const style = SLOT_STYLES[slot];

        return (
            <div
                key={slot}
                className={style.className}
            >
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
                        className={`absolute top-8 ${messageBg} backdrop-blur-sm rounded-xl px-3 py-1 shadow-md z-10`}
                    >
                        <p className={`${messageText} text-[15px] font-medium`}>{message}</p>
                        <div className={`absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 ${messageArrow}`}></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className="w-40 h-40 rounded-full relative"
                style={{ backgroundColor: isRainbow ? '#ff0000' : petColor }}
            >
                {renderSlot('floating')}
                {renderSlot('head')}
                {renderSlot('hand')}

                <div className="w-full h-full rounded-full flex items-center justify-center relative z-10">
                    <CharacterFace mood={mood} onClick={onCharacterClick} petColor={petColor} cheekColor={cheekColor} isStatic={isStatic} />
                </div>
            </div>

            <div>
                <h1 className={`text-4xl font-bold backdrop-blur-sm ${nameBg} rounded-lg px-4 py-1`}>{petName}</h1>
            </div>
        </div>
    );
}