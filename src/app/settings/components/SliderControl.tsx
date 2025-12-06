import React from 'react';

type Props = {
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isNight?: boolean; // ★ isNightを受け取る
};

// default エクスポートに変更
export default function SliderControl({ label, value, onChange, isNight = false }: Props) {
    const labelColor = isNight ? 'text-gray-300' : 'text-slate-600';
    const trackBg = isNight ? 'bg-white/20' : 'bg-white';
    const barColor = isNight ? 'bg-sky-400' : 'bg-blue-300';

    return (
        <div className="flex items-center gap-4 relative">
            <label className={`w-16 text-sm font-medium ${labelColor}`}>{label}</label>
            <div className={`flex-1 h-2 ${trackBg} rounded-full relative mr-4`}>
                <div className={`absolute top-0 left-0 h-full ${barColor} rounded-full pointer-events-none`} style={{ width: `${value}%` }}></div>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={onChange}
                className="absolute left-20 right-4 top-0 bottom-0 m-auto w-[calc(100%-6rem)] h-6 opacity-0 cursor-pointer z-10"
            />
        </div>
    );
}