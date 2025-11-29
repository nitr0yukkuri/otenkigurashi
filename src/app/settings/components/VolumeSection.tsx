// src/app/settings/components/VolumeSection.tsx

'use client';

import { useState, useEffect } from 'react';
// 波括弧 { } を外してインポート
import SliderControl from './SliderControl';
import { STORAGE_KEYS } from '../constants'; // ★ 追加

export default function VolumeSection() {
    const [volume, setVolume] = useState(50);
    const [sfxVolume, setSfxVolume] = useState(50);

    // ★ 追加: 初期読み込み
    useEffect(() => {
        const storedBgm = localStorage.getItem(STORAGE_KEYS.VOLUME_BGM);
        const storedSfx = localStorage.getItem(STORAGE_KEYS.VOLUME_SFX);

        if (storedBgm) setVolume(Number(storedBgm));
        if (storedSfx) setSfxVolume(Number(storedSfx));
    }, []);

    // ★ 追加: 保存処理
    const handleBgmChange = (newVolume: number) => {
        setVolume(newVolume);
        localStorage.setItem(STORAGE_KEYS.VOLUME_BGM, newVolume.toString());
    };

    const handleSfxChange = (newVolume: number) => {
        setSfxVolume(newVolume);
        localStorage.setItem(STORAGE_KEYS.VOLUME_SFX, newVolume.toString());
    };

    return (
        <section className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-slate-600 mb-4">音量設定</h2>
            <div className="space-y-6">
                <SliderControl
                    label="BGM" // ラベルを少し分かりやすく変更
                    value={volume}
                    onChange={(e) => handleBgmChange(Number(e.target.value))}
                />
                <SliderControl
                    label="こうかおん" // ★修正: 「効果音」を「こうかおん」に変更
                    value={sfxVolume}
                    onChange={(e) => handleSfxChange(Number(e.target.value))}
                />
            </div>
        </section>
    );
}