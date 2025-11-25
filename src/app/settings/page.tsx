// src/app/settings/page.tsx

'use client';

import Link from 'next/link';
import Footer from '../components/Footer';
import { IoSettingsSharp, IoCheckmark, IoBan } from 'react-icons/io5';
import React, { useState, useEffect } from 'react';
import ItemIcon from '../components/ItemIcon'; // ★ ItemIconを使用

type WeatherType = "sunny" | "clear" | "rainy" | "cloudy" | "snowy" | "thunderstorm" | "windy" | "night";
const CURRENT_WEATHER_KEY = 'currentWeather';
const PET_NAME_STORAGE_KEY = 'otenki-gurashi-petName';
const PET_COLOR_STORAGE_KEY = 'otenki-gurashi-petColor';
const PET_EQUIPMENT_KEY = 'otenki-gurashi-petEquipment';
const PET_SETTINGS_CHANGED_EVENT = 'petSettingsChanged';

const colorOptions = [
    { name: 'しろ', value: 'white' },
    { name: 'さくら', value: '#FCE4EC' },
    { name: 'ひよこ', value: '#FFF9C4' },
    { name: 'みず', value: '#E0F7FA' },
];

// ★ CollectionItemの型定義に category を追加
interface CollectionItem {
    id: number;
    name: string;
    description: string;
    iconName: string | null;
    quantity: number;
    rarity: string;
    weather: string | null;
    category: string | null; // ★ 追加
}

const getBackgroundGradientClass = (weather: WeatherType | null): string => {
    switch (weather) {
        case 'clear': return 'bg-clear';
        case 'cloudy': return 'bg-cloudy';
        case 'rainy': return 'bg-rainy';
        case 'thunderstorm': return 'bg-thunderstorm';
        case 'snowy': return 'bg-snowy';
        case 'windy': return 'bg-windy';
        case 'night': return 'bg-night';
        case 'sunny':
        default: return 'bg-sunny';
    }
};

export default function SettingsPage() {
    const [dynamicBackgroundClass, setDynamicBackgroundClass] = useState('bg-sunny');
    const [isNight, setIsNight] = useState(false);
    const [volume, setVolume] = useState(70);
    const [soundEffectVolume, setSoundEffectVolume] = useState(50);
    const [petName, setPetName] = useState("てんちゃん");
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState("");
    const [petColor, setPetColor] = useState('white');

    const [equipment, setEquipment] = useState<string | null>(null);
    // ★ 装備可能な所持アイテムリスト
    const [equippableItems, setEquippableItems] = useState<CollectionItem[]>([]);
    const [loadingCollection, setLoadingCollection] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem(PET_NAME_STORAGE_KEY);
        if (storedName) {
            setPetName(storedName);
        }
        const storedColor = localStorage.getItem(PET_COLOR_STORAGE_KEY);
        if (storedColor) {
            setPetColor(storedColor);
        }
        const storedEquipment = localStorage.getItem(PET_EQUIPMENT_KEY);
        if (storedEquipment) {
            setEquipment(storedEquipment);
        }

        const storedWeather = localStorage.getItem(CURRENT_WEATHER_KEY) as WeatherType | null;
        setDynamicBackgroundClass(getBackgroundGradientClass(storedWeather));
        setIsNight(storedWeather === 'night');

        // ★ 装備可能なアイテムのみをフェッチして抽出
        const fetchCollection = async () => {
            try {
                setLoadingCollection(true);
                const response = await fetch('/api/collection');
                const data: CollectionItem[] = await response.json();
                // 所持していて (quantity > 0)、かつ category が設定されているアイテム
                const equippable = data.filter(item => item.quantity > 0 && item.category);
                setEquippableItems(equippable);
            } catch (error) {
                console.error("コレクションの取得に失敗しました", error);
            } finally {
                setLoadingCollection(false);
            }
        };
        fetchCollection();
    }, []);

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(event.target.value));
    };
    const handleSoundEffectVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSoundEffectVolume(Number(event.target.value));
    };
    const handleNameChangeClick = () => {
        setEditingName(petName);
        setIsEditingName(true);
    };
    const handleEditingNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditingName(event.target.value);
    };
    const notifySettingsChanged = () => {
        window.dispatchEvent(new CustomEvent(PET_SETTINGS_CHANGED_EVENT));
    };
    const handleSaveName = () => {
        const newName = editingName.trim();
        if (newName) {
            setPetName(newName);
            localStorage.setItem(PET_NAME_STORAGE_KEY, newName);
            setIsEditingName(false);
            notifySettingsChanged();
        } else {
            alert("名前を入力してください。");
        }
    };
    const handleCancelEditName = () => {
        setIsEditingName(false);
    };
    const handleColorSelect = (colorValue: string) => {
        setPetColor(colorValue);
        localStorage.setItem(PET_COLOR_STORAGE_KEY, colorValue);
        notifySettingsChanged();
    };

    // ★ 装備選択ハンドラ
    const handleEquipmentSelect = (iconName: string | null) => {
        const newEquipment = iconName;
        setEquipment(newEquipment);
        if (newEquipment) {
            localStorage.setItem(PET_EQUIPMENT_KEY, newEquipment);
        } else {
            localStorage.removeItem(PET_EQUIPMENT_KEY); //「なし」の場合はキーを削除
        }
        notifySettingsChanged();
    };

    const linkColor = isNight ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-700';
    const titleColor = isNight ? 'text-white' : 'text-slate-800';
    const titleIconColor = isNight ? 'text-gray-300' : 'text-slate-500';

    return (
        <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <main className={`w-full max-w-sm h-[640px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : ''} ${dynamicBackgroundClass}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>
                <div className="flex-grow overflow-y-auto p-6">
                    <Link href="/" className={`mb-6 inline-block text-sm font-semibold ${linkColor} transition-colors`}>← もどる</Link>
                    <header className="mb-8">
                        <h1 className={`text-4xl font-extrabold ${titleColor} tracking-wider flex items-center gap-2 backdrop-blur-sm bg-white/30 rounded-lg px-4 py-1`}>
                            設定
                            <IoSettingsSharp size={28} className={titleIconColor} />
                        </h1>
                    </header>

                    <section className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                        <h2 className="text-lg font-semibold text-slate-600 mb-3">ペットの名前</h2>
                        {isEditingName ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={handleEditingNameChange}
                                    className="w-full bg-white rounded-lg shadow p-3 text-slate-700 font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
                                    maxLength={10}
                                />
                                <div className="flex gap-2 justify-end">
                                    <button onClick={handleCancelEditName} className="bg-gray-200 text-slate-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-300 transition-colors">
                                        キャンセル
                                    </button>
                                    <button onClick={handleSaveName} className="bg-sky-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-sky-600 transition-colors">
                                        保存する
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <button onClick={handleNameChangeClick} className="w-full bg-white rounded-xl shadow p-4 text-center text-slate-700 font-medium hover:bg-gray-50 active:scale-[0.98] transition-all">
                                    {petName}
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-1">タップして名前を変更</p>
                            </div>
                        )}
                    </section>

                    <section className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                        <h2 className="text-lg font-semibold text-slate-600 mb-3">ペットのいろ</h2>
                        <div className="flex justify-around items-center gap-2">
                            {colorOptions.map(color => (
                                <button
                                    key={color.value}
                                    onClick={() => handleColorSelect(color.value)}
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
                        </div>
                    </section>

                    {/* ★★★ きせかえセクション ★★★ */}
                    <section className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                        <h2 className="text-lg font-semibold text-slate-600 mb-3">きせかえ</h2>
                        {loadingCollection ? (
                            <p className="text-xs text-slate-500 text-center animate-pulse">所持アイテムを確認中...</p>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {/* 「なし」ボタン */}
                                <button
                                    key="none"
                                    onClick={() => handleEquipmentSelect(null)}
                                    className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
                                >
                                    <div
                                        className="w-12 h-12 rounded-full border-2 shadow-inner flex items-center justify-center text-slate-500 bg-white"
                                        style={{
                                            borderColor: equipment === null ? '#0ea5e9' : '#ffffff'
                                        }}
                                    >
                                        <IoBan size={24} />
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">なし</span>
                                </button>

                                {/* 装備可能なアイテムのリスト */}
                                {equippableItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleEquipmentSelect(item.iconName)}
                                        className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-full border-2 shadow-inner flex items-center justify-center bg-white"
                                            style={{
                                                borderColor: equipment === item.iconName ? '#0ea5e9' : '#ffffff'
                                            }}
                                        >
                                            <ItemIcon name={item.iconName} rarity={item.rarity} size={24} />
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-600 truncate w-full text-center">{item.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {equippableItems.length === 0 && !loadingCollection && (
                            <p className="text-xs text-slate-500 text-center mt-2">装備できるアイテムを持っていません</p>
                        )}
                    </section>

                    <section className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                        <h2 className="text-lg font-semibold text-slate-600 mb-4">音量設定</h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 relative">
                                <label htmlFor="volume-slider" className="w-16 text-sm font-medium text-slate-600">音量</label>
                                <div className="flex-1 h-2 bg-white rounded-full relative mr-4">
                                    <div className="absolute top-0 left-0 h-full bg-blue-300 rounded-full pointer-events-none" style={{ width: `${volume}%` }}></div>
                                </div>
                                <input id="volume-slider" type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="absolute left-20 right-4 top-0 bottom-0 m-auto w-[calc(100%-6rem)] h-6 opacity-0 cursor-pointer z-10" />
                            </div>
                            <div className="flex items-center gap-4 relative">
                                <label htmlFor="sfx-slider" className="w-16 text-sm font-medium text-slate-600">効果音</label>
                                <div className="flex-1 h-2 bg-white rounded-full relative mr-4">
                                    <div className="absolute top-0 left-0 h-full bg-blue-300 rounded-full pointer-events-none" style={{ width: `${soundEffectVolume}%` }}></div>
                                </div>
                                <input id="sfx-slider" type="range" min="0" max="100" value={soundEffectVolume} onChange={handleSoundEffectVolumeChange} className="absolute left-20 right-4 top-0 bottom-0 m-auto w-[calc(100%-6rem)] h-6 opacity-0 cursor-pointer z-10" />
                            </div>
                        </div>
                    </section>
                </div>

                <Footer />
            </main>
        </div>
    );
}