'use client';

import { useState, useEffect } from 'react';
import { IoCheckmark, IoColorPalette } from 'react-icons/io5';
import { STORAGE_KEYS, EVENTS } from '../constants';

const colorOptions = [
    { name: 'しろ', value: 'white' },
    { name: 'さくら', value: '#FCE4EC' },
    { name: 'ひよこ', value: '#FFF9C4' },
];

export default function ColorSection() {
    const [petColor, setPetColor] = useState('white');

    useEffect(() => {
        const storedColor = localStorage.getItem(STORAGE_KEYS.PET_COLOR);
        if (storedColor) setPetColor(storedColor);
    }, []);

    const saveColor = (color: string) => {
        setPetColor(color);
        localStorage.setItem(STORAGE_KEYS.PET_COLOR, color);
        window.dispatchEvent(new CustomEvent(EVENTS.PET_SETTINGS_CHANGED));
    };

    const isCustomColor = !colorOptions.some(c => c.value === petColor);

    return (
        <section className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-slate-600 mb-3">ペットのいろ</h2>
            <div className="flex justify-around items-center gap-2 flex-wrap">
                {colorOptions.map(color => (
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
                            backgroundColor: isCustomColor ? petColor : '#ffffff',
                            borderColor: isCustomColor ? '#0ea5e9' : '#ffffff'
                        }}
                    >
                        {isCustomColor ? (
                            <IoCheckmark size={28} className="text-white drop-shadow-md pointer-events-none" />
                        ) : (
                            <IoColorPalette size={24} className="text-slate-400 pointer-events-none" />
                        )}

                        <input
                            type="color"
                            value={isCustomColor ? petColor : '#ffffff'}
                            onChange={(e) => saveColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-600">じゆう</span>
                </div>
            </div>
        </section>
    );
}