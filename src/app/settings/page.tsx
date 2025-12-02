// src/app/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IoSettingsSharp } from 'react-icons/io5';
import Footer from '../components/Footer';
import { getBackgroundGradientClass, WeatherType } from '../lib/weatherUtils';
import { STORAGE_KEYS } from './constants';

// 分割したコンポーネントをインポート
import NameSection from './components/NameSection';
import ColorSection from './components/ColorSection';
import EquipmentSection from './components/EquipmentSection';
import VolumeSection from './components/VolumeSection';

export default function SettingsPage() {
    const [bgClass, setBgClass] = useState('bg-sunny');
    const [isNight, setIsNight] = useState(false);

    useEffect(() => {
        const storedWeather = localStorage.getItem(STORAGE_KEYS.CURRENT_WEATHER) as WeatherType | null;
        setBgClass(getBackgroundGradientClass(storedWeather));
        setIsNight(storedWeather === 'night');
    }, []);

    // ★修正: 戻るボタンの視認性向上のためのクラス定義
    // font-extrabold (800) を使用して文字を太くする
    const backButtonClass = isNight
        ? 'bg-black/20 text-gray-200 hover:bg-black/40'
        : 'bg-white/40 text-slate-700 hover:bg-white/60';

    const titleColor = isNight ? 'text-white' : 'text-slate-800';
    const titleIconColor = isNight ? 'text-gray-300' : 'text-slate-500';

    return (
        <div className="w-full min-h-screen md:bg-gray-200 md:flex md:items-center md:justify-center md:p-4">
            <main className={`w-full md:max-w-sm h-[100dvh] md:h-[640px] md:rounded-3xl md:shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : ''} ${bgClass} transition-all duration-500`}>
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>
                <div className="flex-grow overflow-y-auto p-6">
                    {/* ★修正: font-extrabold を適用し、カプセル型の背景を追加 */}
                    <Link href="/" className={`mb-6 inline-block px-4 py-2 rounded-full backdrop-blur-md shadow-sm text-sm font-extrabold transition-all ${backButtonClass}`}>
                        ← もどる
                    </Link>

                    <header className="mb-8">
                        <h1 className={`text-4xl font-extrabold ${titleColor} tracking-wider flex items-center gap-2 backdrop-blur-sm bg-white/30 rounded-lg px-4 py-1`}>
                            設定
                            <IoSettingsSharp size={28} className={titleIconColor} />
                        </h1>
                    </header>

                    <NameSection />
                    <ColorSection />
                    <EquipmentSection />
                    <VolumeSection />
                </div>

                <Footer />
            </main>
        </div>
    );
}