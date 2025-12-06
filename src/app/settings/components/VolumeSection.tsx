// src/app/settings/components/VolumeSection.tsx

'use client';

import { useState, useEffect } from 'react';
// 波括弧 { } を外してインポート
import SliderControl from './SliderControl';
import { STORAGE_KEYS } from '../constants';

// isNightを受け取るように変更
export default function VolumeSection({ isNight }: { isNight: boolean }) {
    const [volume, setVolume] = useState(50);
    const [sfxVolume, setSfxVolume] = useState(50);

    useEffect(() => {
        const storedBgm = localStorage.getItem(STORAGE_KEYS.VOLUME_BGM);
        const storedSfx = localStorage.getItem(STORAGE_KEYS.VOLUME_SFX);

        if (storedBgm) setVolume(Number(storedBgm));
        if (storedSfx) setSfxVolume(Number(storedSfx));
    }, []);

    const handleBgmChange = (newVolume: number) => {
        setVolume(newVolume);
        localStorage.setItem(STORAGE_KEYS.VOLUME_BGM, newVolume.toString());
    };

    const handleSfxChange = (newVolume: number) => {
        setSfxVolume(newVolume);
        localStorage.setItem(STORAGE_KEYS.VOLUME_SFX, newVolume.toString());
    };

    const sectionClass = isNight ? 'bg-white/10' : 'bg-white/60 backdrop-blur-sm';
    const titleClass = isNight ? 'text-gray-200' : 'text-slate-600';

    // ★修正: ここにあった 'bg-white/60 backdrop-blur-sm' を削除し、sectionClass だけを使うように変更
    return (
        <section className={`${sectionClass} rounded-2xl p-4 transition-colors`}>
            <h2 className={`text-lg font-semibold ${titleClass} mb-4`}>音量設定</h2>
            <div className="space-y-6">
                <SliderControl
                    label="BGM"
                    value={volume}
                    onChange={(e) => handleBgmChange(Number(e.target.value))}
                    isNight={isNight} // ★ isNightを渡す
                />
                <SliderControl
                    label="効果音"
                    value={sfxVolume}
                    onChange={(e) => handleSfxChange(Number(e.target.value))}
                    isNight={isNight} // ★ isNightを渡す
                />
            </div>
        </section>
    );
}