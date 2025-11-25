'use client';

import { useState, useEffect } from 'react';
import { IoCheckmark, IoColorPalette } from 'react-icons/io5';
import { STORAGE_KEYS, EVENTS } from '../constants';

const bodyColorOptions = [
    { name: 'しろ', value: 'white' },
    { name: 'さくら', value: '#FCE4EC' },
    { name: 'ひよこ', value: '#FFF9C4' },
];

// ★★★ 追加: ほっぺの色のプリセット ★★★
const cheekColorOptions = [
    { name: 'ピンク', value: '#F8BBD0' },
    { name: 'オレンジ', value: '#FFCC80' },
    { name: 'あか', value: '#EF9A9A' },
];

export default function ColorSection() {
    const [petColor, setPetColor] = useState('white');
    // ★★★ 追加: ほっぺの色State ★★★
    const [cheekColor, setCheekColor] = useState('#F8BBD0');

    useEffect(() => {
        const storedColor = localStorage.getItem(STORAGE_KEYS.PET_COLOR);
        if (storedColor) setPetColor(storedColor);

        // ★★★ 追加: 読み込み ★★★
        const storedCheekColor = localStorage.getItem(STORAGE_KEYS.PET_CHEEK_COLOR);
        if (storedCheekColor) setCheekColor(storedCheekColor);
    }, []);

    const saveColor = (color: string) => {
        setPetColor(color);
        localStorage.setItem(STORAGE_KEYS.PET_COLOR, color);
        window.dispatchEvent(new CustomEvent(EVENTS.PET_SETTINGS_CHANGED));
    };

    // ★★★ 追加: ほっぺの保存ロジック ★★★
    const saveCheekColor = (color: string) => {
        setCheekColor(color);
        localStorage.setItem(STORAGE_KEYS.PET_CHEEK_COLOR, color);
        window.dispatchEvent(new CustomEvent(EVENTS.PET_SETTINGS_CHANGED));
    };

    const isCustomBodyColor = !bodyColorOptions.some(c => c.value === petColor);
    // ★★★ 追加: カスタム判定 ★★★
    const isCustomCheekColor = !cheekColorOptions.some(c => c.value === cheekColor);

    return (
        <section className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            {/* --- 体の色 --- */}
            <h2 className="text-lg font-semibold text-slate-600 mb-3">ペットのいろ</h2>
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
                                borderColor: petColor === color.value ? '#0ea5e9' : '#ffffff'
                            }}
                        >
                            {petColor === color.value && (
                                <div className="w-full h-full flex items-center justify-center text-sky-600">
                                    <IoCheckmark size={28} />
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-medium text-slate-600">{color.name}</span>
                    </button>
                ))}

                <div className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95 relative">
                    <div
                        className="w-12 h-12 rounded-full border-2 shadow-inner overflow-hidden flex items-center justify-center"
                        style={{
                            backgroundColor: isCustomBodyColor ? petColor : '#ffffff',
                            borderColor: isCustomBodyColor ? '#0ea5e9' : '#ffffff'
                        }}
                    >
                        {isCustomBodyColor ? (
                            <IoCheckmark size={28} className="text-white drop-shadow-md pointer-events-none" />
                        ) : (
                            <IoColorPalette size={24} className="text-slate-400 pointer-events-none" />
                        )}

                        <input
                            type="color"
                            value={isCustomBodyColor ? petColor : '#ffffff'}
                            onChange={(e) => saveColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-600">じゆう</span>
                </div>
            </div>

            {/* --- ★★★ 追加: ほっぺの色 --- */}
            <h2 className="text-lg font-semibold text-slate-600 mb-3">ほっぺのいろ</h2>
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
                                borderColor: cheekColor === color.value ? '#0ea5e9' : '#ffffff'
                            }}
                        >
                            {cheekColor === color.value && (
                                <div className="w-full h-full flex items-center justify-center text-sky-600">
                                    <IoCheckmark size={28} />
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-medium text-slate-600">{color.name}</span>
                    </button>
                ))}

                <div className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95 relative">
                    <div
                        className="w-12 h-12 rounded-full border-2 shadow-inner overflow-hidden flex items-center justify-center"
                        style={{
                            backgroundColor: isCustomCheekColor ? cheekColor : '#ffffff',
                            borderColor: isCustomCheekColor ? '#0ea5e9' : '#ffffff'
                        }}
                    >
                        {isCustomCheekColor ? (
                            <IoCheckmark size={28} className="text-white drop-shadow-md pointer-events-none" />
                        ) : (
                            <IoColorPalette size={24} className="text-slate-400 pointer-events-none" />
                        )}

                        <input
                            type="color"
                            value={isCustomCheekColor ? cheekColor : '#ffffff'}
                            onChange={(e) => saveCheekColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-600">じゆう</span>
                </div>
            </div>
        </section>
    );
}