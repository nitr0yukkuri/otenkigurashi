// src/app/components/WeatherDisplay.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import WeatherIcon from './WeatherIcon';

type WeatherDisplayProps = {
    weather: string | null;
    timeOfDay: string;
    isClient: boolean;
    currentTime: Date;
    temperature: number | null;
    location: string | null;
    onCycleWeather: () => void;
};

export default function WeatherDisplay({
    weather,
    timeOfDay,
    isClient,
    currentTime,
    temperature,
    location,
    onCycleWeather,
}: WeatherDisplayProps) {

    // ★★★ ここを修正しました ★★★
    // 親コンポーネントから渡された天気をそのまま使うようにシンプル化
    const displayWeather = weather;

    // ★★★ 変更点: text-[#5D4037]/80 を text-current/80 に変更 ★★★
    const textColorClass = "text-current/80";

    return (
        <div className="pt-8 text-center h-[150px] flex flex-col justify-center">
            {/* 変更: onClickとcursor-pointerを削除 */}
            <div className="flex flex-col items-center gap-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={displayWeather || 'loading'}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center gap-2"
                    >
                        {displayWeather ? (
                            <>
                                {/* 修正: WeatherIconをbuttonでラップし、ここにonClickを移動 */}
                                <button
                                    onClick={onCycleWeather}
                                    className="p-2 rounded-full transition-transform active:scale-95 focus:outline-none"
                                    aria-label="天気切り替え"
                                >
                                    <WeatherIcon type={displayWeather} size={96} />
                                </button>
                                {/* ★★★ 変更点: textColorClass を適用 ★★★ */}
                                <div className={`flex items-center justify-center gap-2 text-sm ${textColorClass} bg-white/30 backdrop-blur-sm rounded-md px-2 py-1`}>
                                    {isClient && <span>{currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}</span>}
                                    {temperature !== null && <span>・{temperature}°C</span>}
                                    {location && <span>・{location}</span>}
                                </div>
                            </>
                        ) : (
                            <div className="h-[120px] flex items-center justify-center">
                                {/* ★★★ 変更点: textColorClass を適用 ★★★ */}
                                <p className={`text-sm ${textColorClass} animate-pulse bg-white/30 backdrop-blur-sm rounded-md px-2 py-1`}>おてんき しらべちゅう...</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}