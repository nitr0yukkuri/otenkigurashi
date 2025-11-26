// src/app/weather/page.tsx

'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterFace from '../components/CharacterFace';
import ItemIcon from '../components/ItemIcon';
import Link from 'next/link';
import Footer from '../components/Footer';
import { useWeatherForecast } from './useWeatherForecast';
// ★★★ 修正: requireをやめて通常通りimportする ★★★
import ForecastCard from '../components/ForecastCard';

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

    const [petColor, setPetColor] = useState("white");
    const [cheekColor, setCheekColor] = useState("#F8BBD0");
    const [petEquipment, setPetEquipment] = useState<string | null>(null);

    useEffect(() => {
        const storedColor = localStorage.getItem(STORAGE_KEYS.PET_COLOR);
        if (storedColor) setPetColor(storedColor);

        const storedCheek = localStorage.getItem(STORAGE_KEYS.PET_CHEEK_COLOR);
        if (storedCheek) setCheekColor(storedCheek);

        const storedEquip = localStorage.getItem(STORAGE_KEYS.PET_EQUIPMENT);
        if (storedEquip) setPetEquipment(storedEquip);
    }, []);

    // 装備表示ロジック (中略、そのまま)
    const renderEquipment = () => {
        // ... (元のコードと同じ)
        if (!petEquipment) return null;
        // 省略... 元のswitch文やJSX
        // 実際のコードにはswitch文の中身を含めてください
        let styleClass = "";
        let initial = {};
        let animate = {};
        let exit = {};

        // ... (元のswitch文をここに) ...
        // 仮実装としてデフォルトだけ書いておきますが、元のコードを使ってください
        styleClass = "absolute -top-4 w-1/2 z-10 left-1/4";
        // ... 

        return (
            <motion.div
                className={styleClass} // 注: 実際はswitch文の結果を使ってください
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="w-full h-full flex items-center justify-center drop-shadow-md">
                    <ItemIcon name={petEquipment} size={undefined} />
                </div>
            </motion.div>
        );
    };
    // (renderEquipment関数は元のファイルのままでOKですが、簡略化して書いています)

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
                            <div className="w-16 h-16 flex-shrink-0 relative">
                                <div style={{ width: '160px', height: '160px', transform: 'scale(0.4)', transformOrigin: 'top left' }} className="relative">
                                    <AnimatePresence>
                                        {/* ここは元の renderEquipment() を呼び出し */}
                                        {petEquipment && (
                                            <motion.div className="absolute -top-6 w-1/2 z-10 left-1/4">
                                                <ItemIcon name={petEquipment} size={undefined} />
                                            </motion.div>
                                        )}
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
                                    // ★★★ 修正: 通常のコンポーネントとして使用 ★★★
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