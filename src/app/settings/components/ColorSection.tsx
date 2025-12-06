'use client';

import { useState, useEffect } from 'react';
import { IoCheckmark, IoColorPalette } from 'react-icons/io5';
import { STORAGE_KEYS, EVENTS } from '../constants';

const bodyColorOptions = [
    { name: 'しろ', value: 'white' },
    { name: 'さくら', value: '#FCE4EC' },
    { name: 'ひよこ', value: '#FFF9C4' },
];

const cheekColorOptions = [
    { name: 'ピンク', value: '#F8BBD0' },
    { name: 'オレンジ', value: '#FFCC80' },
    { name: 'あか', value: '#EF9A9A' },
];

// isNightを受け取るように変更
export default function ColorSection({ isNight }: { isNight: boolean }) {
    const [petColor, setPetColor] = useState('white');
    const [cheekColor, setCheekColor] = useState('#F8BBD0');

    useEffect(() => {
        const storedColor = localStorage.getItem(STORAGE_KEYS.PET_COLOR);
        if (storedColor) setPetColor(storedColor);

        const storedCheekColor = localStorage.getItem(STORAGE_KEYS.PET_CHEEK_COLOR);
        if (storedCheekColor) setCheekColor(storedCheekColor);
    }, []);

    const saveColor = (color: string) => {
        setPetColor(color);
        localStorage.setItem(STORAGE_KEYS.PET_COLOR, color);
        window.dispatchEvent(new CustomEvent(EVENTS.PET_SETTINGS_CHANGED));
    };

    const saveCheekColor = (color: string) => {
        setCheekColor(color);
        localStorage.setItem(STORAGE_KEYS.PET_CHEEK_COLOR, color);
        window.dispatchEvent(new CustomEvent(EVENTS.PET_SETTINGS_CHANGED));
    };

    const isCustomBodyColor = !bodyColorOptions.some(c => c.value === petColor);
    const isCustomCheekColor = !cheekColorOptions.some(c => c.value === cheekColor);

    const sectionClass = isNight ? 'bg-white/10' : 'bg-white/60 backdrop-blur-sm';
    const titleClass = isNight ? 'text-gray-200' : 'text-slate-600';
    const labelClass = isNight ? 'text-gray-300' : 'text-slate-600';

    return (
        <section className={`mb-8 ${sectionClass} rounded-2xl p-4 transition-colors`}>
            {/* --- 体の色 --- */}
            <h2 className={`text-lg font-semibold ${titleClass} mb-3`}>はだのいろ</h2>
            <div className="flex justify-around items-center gap-2 flex-wrap mb-6">
                {bodyColorOptions.map(color => (
                    <button
                        key={color.value}
                        onClick={() => saveColor(color.value)}
                        className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
                    >
                        <div
                            className="w-12 h-12 rounded-full border-2 shadow-inner"
                            style={{
                                backgroundColor: color.value,
                                borderColor: petColor === color.value ? '#0ea5e9' : (isNight ? 'rgba(255,255,255,0.2)' : '#ffffff')
                            }}
                        >
                            {petColor === color.value && (
                                <div className="w-full h-full flex items-center justify-center text-sky-600">
                                    <IoCheckmark size={28} />
                                </div>
                            )}
                        </div>
                        <span className={`text-xs font-medium ${labelClass}`}>{color.name}</span>
                    </button>
                ))}

                <div className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95 relative">
                    <div
                        className="w-12 h-12 rounded-full border-2 shadow-inner overflow-hidden flex items-center justify-center"
                        style={{
                            backgroundColor: isCustomBodyColor ? petColor : (isNight ? 'rgba(255,255,255,0.1)' : '#ffffff'),
                            borderColor: isCustomBodyColor ? '#0ea5e9' : (isNight ? 'rgba(255,255,255,0.2)' : '#ffffff')
                        }}
                    >
                        {isCustomBodyColor ? (
                            <IoCheckmark size={28} className="text-white drop-shadow-md pointer-events-none" />
                        ) : (
                            <IoColorPalette size={24} className={isNight ? "text-gray-400 pointer-events-none" : "text-slate-400 pointer-events-none"} />
                        )}

                        <input
                            type="color"
                            value={isCustomBodyColor ? petColor : '#ffffff'}
                            onChange={(e) => saveColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <span className={`text-xs font-medium ${labelClass}`}>じゆう</span>
                </div>
            </div>

            {/* --- ほっぺの色 --- */}
            <h2 className={`text-lg font-semibold ${titleClass} mb-3`}>ほっぺのいろ</h2>
            <div className="flex justify-around items-center gap-2 flex-wrap">
                {cheekColorOptions.map(color => (
                    <button
                        key={color.value}
                        onClick={() => saveCheekColor(color.value)}
                        className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
                    >
                        <div
                            className="w-12 h-12 rounded-full border-2 shadow-inner"
                            style={{
                                backgroundColor: color.value,
                                borderColor: cheekColor === color.value ? '#0ea5e9' : (isNight ? 'rgba(255,255,255,0.2)' : '#ffffff')
                            }}
                        >
                            {cheekColor === color.value && (
                                <div className="w-full h-full flex items-center justify-center text-sky-600">
                                    <IoCheckmark size={28} />
                                </div>
                            )}
                        </div>
                        <span className={`text-xs font-medium ${labelClass}`}>{color.name}</span>
                    </button>
                ))}

                <div className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95 relative">
                    <div
                        className="w-12 h-12 rounded-full border-2 shadow-inner overflow-hidden flex items-center justify-center"
                        style={{
                            backgroundColor: isCustomCheekColor ? cheekColor : (isNight ? 'rgba(255,255,255,0.1)' : '#ffffff'),
                            borderColor: isCustomCheekColor ? '#0ea5e9' : (isNight ? 'rgba(255,255,255,0.2)' : '#ffffff')
                        }}
                    >
                        {isCustomCheekColor ? (
                            <IoCheckmark size={28} className="text-white drop-shadow-md pointer-events-none" />
                        ) : (
                            <IoColorPalette size={24} className={isNight ? "text-gray-400 pointer-events-none" : "text-slate-400 pointer-events-none"} />
                        )}

                        <input
                            type="color"
                            value={isCustomCheekColor ? cheekColor : '#ffffff'}
                            onChange={(e) => saveCheekColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <span className={`text-xs font-medium ${labelClass}`}>じゆう</span>
                </div>
            </div>
        </section>
    );
}