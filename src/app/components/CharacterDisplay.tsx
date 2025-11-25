// src/app/components/CharacterDisplay.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import CharacterFace from './CharacterFace';
import ItemIcon from './ItemIcon';

type CharacterDisplayProps = {
    petName: string;
    petColor: string;
    cheekColor?: string; // props定義に追加済み
    petEquipment: string | null;
    mood: "happy" | "neutral" | "sad";
    message: string | null;
    onCharacterClick: () => void;
    isNight?: boolean;
};

export default function CharacterDisplay({
    petName,
    petColor,
    cheekColor = "#F8BBD0",
    petEquipment,
    mood,
    message,
    onCharacterClick,
    isNight = false
}: CharacterDisplayProps) {

    const renderEquipment = () => {
        if (!petEquipment) return null;

        let styleClass = "";
        let initial = {};
        let animate = {};
        let exit = {};

        switch (petEquipment) {
            case 'FaHatCowboy':
            case 'GiAcorn':
            case 'BsRecordCircle':
            case 'FaLeaf':
            case 'IoSunny':
            case 'IoRainy':
            case 'GiSnail':
            case 'FaStar':
            case 'FaFeather':
            case 'GiClover':
            case 'IoWaterOutline':
            case 'GiNightSky':
                styleClass = "absolute -top-6 w-1/2 z-10 left-1/4";
                initial = { opacity: 0, y: -10, rotate: -10 };
                animate = { opacity: 1, y: 0, rotate: 0 };
                exit = { opacity: 0, y: -10, rotate: -10 };
                break;

            case 'GiWhirlwind':
            case 'GiStickSplinter':
            case 'FaKey':
            case 'GiGrass':
            case 'GiPaperLantern':
                styleClass = "absolute bottom-0 -right-2 w-1/3 z-10";
                initial = { opacity: 0, x: 10, rotate: 20 };
                animate = { opacity: 1, x: 0, rotate: 0 };
                exit = { opacity: 0, x: 10, rotate: 20 };
                break;

            case 'IoCloudy':
            case 'IoSnow':
            case 'FaFeatherAlt':
            case 'GiButterfly':
            case 'IoPaperPlaneOutline':
            case 'BsMoonStarsFill':
            case 'GiSparkles':
                styleClass = "absolute top-0 -right-6 w-1/3 z-10";
                initial = { opacity: 0, scale: 0 };
                animate = {
                    opacity: 1,
                    scale: 1,
                    y: [0, -5, 0]
                };
                exit = { opacity: 0, scale: 0 };
                break;

            default:
                styleClass = "absolute -top-4 w-1/2 z-10 left-1/4";
                initial = { opacity: 0, y: -5 };
                animate = { opacity: 1, y: 0 };
                exit = { opacity: 0, y: -5 };
                break;
        }

        return (
            <motion.div
                className={styleClass}
                initial={initial}
                animate={animate}
                exit={exit}
                transition={petEquipment.startsWith('IoCloudy') ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { type: "spring", stiffness: 300, damping: 20 }}
            >
                <div className="w-full h-full flex items-center justify-center drop-shadow-md">
                    <ItemIcon name={petEquipment} size={undefined} />
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
                <AnimatePresence>
                    {renderEquipment()}
                </AnimatePresence>

                <div className="w-full h-full rounded-full flex items-center justify-center">
                    <CharacterFace mood={mood} onClick={onCharacterClick} petColor={petColor} cheekColor={cheekColor} />
                </div>
            </motion.div>

            <div>
                <h1 className={`text-4xl font-bold backdrop-blur-sm ${nameBg} rounded-lg px-4 py-1`}>{petName}</h1>
            </div>
        </div>
    );
}