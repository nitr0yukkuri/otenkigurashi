'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterFace from '../components/CharacterFace';
import ItemIcon from '../components/ItemIcon';
import Link from 'next/link';
import Footer from '../components/Footer';
import { useWeatherForecast } from './useWeatherForecast';

// 設定読み込み用のキー
const STORAGE_KEYS = {
    PET_COLOR: 'otenki-gurashi-petColor',
    PET_CHEEK_COLOR: 'otenki-gurashi-petCheekColor',
    PET_EQUIPMENT: 'otenki-gurashi-petEquipment',
};

function WeatherPageContent() {
    const {
        location,
        forecast,
        loading,
        error,
        selectedDayMessage,
        handleCardClick,
        dynamicBackgroundClass,
        isNight
    } = useWeatherForecast();

    // ★ 追加: 着せ替えステート
    const [petColor, setPetColor] = useState("white");
    const [cheekColor, setCheekColor] = useState("#F8BBD0");
    const [petEquipment, setPetEquipment] = useState<string | null>(null);

    // ★ 追加: 設定読み込み
    useEffect(() => {
        const storedColor = localStorage.getItem(STORAGE_KEYS.PET_COLOR);
        if (storedColor) setPetColor(storedColor);

        const storedCheek = localStorage.getItem(STORAGE_KEYS.PET_CHEEK_COLOR);
        if (storedCheek) setCheekColor(storedCheek);

        const storedEquip = localStorage.getItem(STORAGE_KEYS.PET_EQUIPMENT);
        if (storedEquip) setPetEquipment(storedEquip);
    }, []);

    // ★ 追加: 装備表示ロジック
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
                animate = { opacity: 1, scale: 1, y: [0, -5, 0] };
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
                transition={{ duration: 0.5 }}
            >
                <div className="w-full h-full flex items-center justify-center drop-shadow-md">
                    <ItemIcon name={petEquipment} size={undefined} />
                </div>
            </motion.div>
        );
    };

    const mainTextColor = isNight ? 'text-white' : 'text-slate-700';
    const linkColor = isNight ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-700';
    const titleColor = isNight ? 'text-white' : 'text-slate-800';
    const subTitleColor = isNight ? 'text-gray-300' : 'text-slate-500';

    return (
        <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <main className={`w-full max-w-sm h-[640px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col ${mainTextColor} transition-colors duration-500 ${dynamicBackgroundClass}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>

                <div className="flex-grow overflow-y-auto p-6">
                    <div className="max-w-md mx-auto">
                        <Link href="/" className={`mb-6 inline-block text-sm ${linkColor} transition-colors`}>← もどる</Link>

                        <header className="mb-8">
                            <h1 className={`text-4xl font-extrabold ${titleColor} tracking-wider`}>天気予報</h1>
                            <p className={`${subTitleColor} mt-1`}>{location}</p>
                        </header>

                        <div className="flex items-center gap-4 p-4 mb-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-md">
                            {/* ★ 変更: キャラクター表示エリア (縮小表示 + 装備反映) */}
                            <div className="w-16 h-16 flex-shrink-0 relative">
                                <div style={{ width: '160px', height: '160px', transform: 'scale(0.4)', transformOrigin: 'top left' }} className="relative">
                                    <AnimatePresence>
                                        {renderEquipment()}
                                    </AnimatePresence>
                                    <CharacterFace
                                        mood={error ? 'sad' : 'happy'}
                                        petColor={petColor}
                                        cheekColor={cheekColor}
                                    />
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm">
                                {selectedDayMessage || "お天気を調べてるよ..."}
                            </p>
                        </div>

                        <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar min-h-[260px]">
                            {loading ? (
                                <p className={`w-full text-center ${subTitleColor} pt-20`}>お天気を調べてるよ...</p>
                            ) : error ? (
                                <p className="w-full text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>
                            ) : (
                                forecast.map((data: any, index: number) => {
                                    // ForecastCard を動的にインポートすると遅延するため、ここで直接利用するか
                                    // ファイル上部で import していますが、コード簡略化のため require で対応
                                    // (本来は import ForecastCard from '../components/ForecastCard' を推奨)
                                    const ForecastCard = require('../components/ForecastCard').default;
                                    return (
                                        <ForecastCard
                                            key={index}
                                            {...data}
                                            onClick={handleCardClick}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}

export default function WeatherPage() {
    return (
        <Suspense fallback={<div className="w-full min-h-screen flex items-center justify-center">ローディング中...</div>}>
            <WeatherPageContent />
        </Suspense>
    );
}