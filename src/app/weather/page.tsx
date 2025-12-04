// src/app/weather/page.tsx

'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterFace from '../components/CharacterFace';
import ItemIcon from '../components/ItemIcon';
import Link from 'next/link';
import Footer from '../components/Footer';
import { useWeatherForecast } from './useWeatherForecast';
import ForecastCard from '../components/ForecastCard';
import { EquipmentState } from '../components/CharacterDisplay';

// 設定読み込み用のキー
const STORAGE_KEYS = {
    PET_COLOR: 'otenki-gurashi-petColor',
    PET_CHEEK_COLOR: 'otenki-gurashi-petCheekColor',
    PET_EQUIPMENT: 'otenki-gurashi-petEquipment',
};

// 装備品の表示スタイル定義 (CharacterDisplayと同じもの)
const SLOT_STYLES = {
    head: {
        className: "absolute -top-8 left-1/2 -translate-x-1/2 z-20 w-2/3",
        animation: { y: [0, -3, 0], transition: { duration: 4, repeat: Infinity } }
    },
    hand: {
        className: "absolute bottom-0 -right-4 z-30 w-1/3",
        animation: { rotate: [0, 5, 0], transition: { duration: 2, repeat: Infinity } }
    },
    floating: {
        className: "absolute -top-4 -right-8 z-10 w-1/3",
        animation: { y: [0, -10, 0], opacity: 0.9, transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
    }
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

    const [petColor, setPetColor] = useState("white");
    const [cheekColor, setCheekColor] = useState("#F8BBD0");
    const [petEquipment, setPetEquipment] = useState<EquipmentState>({ head: null, hand: null, floating: null });

    useEffect(() => {
        const storedColor = localStorage.getItem(STORAGE_KEYS.PET_COLOR);
        if (storedColor) setPetColor(storedColor);

        const storedCheek = localStorage.getItem(STORAGE_KEYS.PET_CHEEK_COLOR);
        if (storedCheek) setCheekColor(storedCheek);

        const storedEquip = localStorage.getItem(STORAGE_KEYS.PET_EQUIPMENT);
        if (storedEquip) {
            try {
                const parsed = JSON.parse(storedEquip);
                if (typeof parsed === 'string') {
                    setPetEquipment({ head: parsed, hand: null, floating: null });
                } else if (typeof parsed === 'object' && parsed !== null) {
                    setPetEquipment(parsed);
                }
            } catch (e) {
                setPetEquipment({ head: storedEquip, hand: null, floating: null });
            }
        }
    }, []);

    const renderEquipment = () => {
        return (
            <>
                {(['floating', 'head', 'hand'] as const).map((slot) => {
                    const itemName = petEquipment[slot];
                    if (!itemName) return null;

                    const style = SLOT_STYLES[slot];

                    return (
                        <motion.div
                            key={slot}
                            className={style.className}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, ...style.animation }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="w-full h-full flex items-center justify-center drop-shadow-md">
                                <ItemIcon name={itemName} size={undefined} />
                            </div>
                        </motion.div>
                    );
                })}
            </>
        );
    };

    const mainTextColor = isNight ? 'text-white' : 'text-slate-700';
    const backButtonClass = isNight
        ? 'bg-black/20 text-gray-200 hover:bg-black/40'
        : 'bg-white/40 text-slate-700 hover:bg-white/60';

    const titleColor = isNight ? 'text-white' : 'text-slate-800';
    const subTitleColor = isNight ? 'text-gray-300' : 'text-slate-500';

    return (
        <div className="w-full min-h-screen md:bg-gray-200 md:flex md:items-center md:justify-center md:p-4">
            <main className={`w-full md:max-w-sm h-[100dvh] md:h-[640px] md:rounded-3xl md:shadow-2xl overflow-hidden relative flex flex-col ${mainTextColor} transition-colors duration-500 ${dynamicBackgroundClass}`}>
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>

                <div className="flex-grow overflow-y-auto p-6">
                    <div className="max-w-md mx-auto">
                        <Link href="/" className={`mb-6 inline-block px-4 py-2 rounded-full backdrop-blur-md shadow-sm text-sm font-extrabold transition-all ${backButtonClass}`}>
                            ← もどる
                        </Link>

                        <header className="mb-8">
                            <h1 className={`text-4xl font-extrabold ${titleColor} tracking-wider`}>天気予報</h1>
                            <p className={`${subTitleColor} mt-1`}>{location}</p>
                        </header>

                        <div className="flex items-center gap-4 p-4 mb-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-md">
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
                                    return (
                                        <ForecastCard
                                            key={index}
                                            {...data}
                                            onClick={handleCardClick}
                                            // ★追加: 夜かどうかをカードに伝える
                                            isNight={isNight}
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