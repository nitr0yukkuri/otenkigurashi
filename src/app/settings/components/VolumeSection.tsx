'use client';

import { useState } from 'react';
// ★★★ 修正: 波括弧 { } を外してデフォルトインポートにする ★★★
import SliderControl from './SliderControl';

export default function VolumeSection() {
    const [volume, setVolume] = useState(70);
    const [sfxVolume, setSfxVolume] = useState(50);

    return (
        <section className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-slate-600 mb-4">音量設定</h2>
            <div className="space-y-6">
                <SliderControl
                    label="音量"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                />
                <SliderControl
                    label="効果音"
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(Number(e.target.value))}
                />
            </div>
        </section>
    );
}