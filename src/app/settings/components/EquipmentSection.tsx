// src/app/settings/components/EquipmentSection.tsx

'use client';

import { useState, useEffect } from 'react';
import { IoBan, IoShirt, IoHandRight, IoCloud } from 'react-icons/io5';
import ItemIcon from '../../components/ItemIcon';
import TeruTeruIcon from '../../components/TeruTeruIcon';
import CharacterDisplay, { EquipmentState } from '../../components/CharacterDisplay';
import { STORAGE_KEYS, EVENTS } from '../constants';
import { getUserId } from '@/app/lib/userId';

interface CollectionItem {
    id: number;
    name: string;
    iconName: string | null;
    quantity: number;
    rarity: string;
    category: 'head' | 'hand' | 'floating' | null;
}

const TABS = [
    { id: 'head', label: 'あたま', icon: <IoShirt /> },
    { id: 'hand', label: 'てもち', icon: <IoHandRight /> },
    { id: 'floating', label: 'まわり', icon: <IoCloud /> },
];

// isNightを受け取るように変更
export default function EquipmentSection({ isNight }: { isNight: boolean }) {
    const [equipment, setEquipment] = useState<EquipmentState>({ head: null, hand: null, floating: null, room: null });
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [activeTab, setActiveTab] = useState<'head' | 'hand' | 'floating'>('head');
    const [petColor, setPetColor] = useState('#ffffff');
    const [cheekColor, setCheekColor] = useState("#F8BBD0");

    useEffect(() => {
        const loadSettings = () => {
            const storedEquipParams = localStorage.getItem(STORAGE_KEYS.PET_EQUIPMENT);
            if (storedEquipParams) {
                try {
                    const parsed = JSON.parse(storedEquipParams);
                    if (typeof parsed === 'object' && parsed !== null) {
                        setEquipment({ head: null, hand: null, floating: null, room: null, ...parsed });
                    } else {
                        setEquipment({ head: storedEquipParams, hand: null, floating: null, room: null });
                    }
                } catch (e) {
                    setEquipment({ head: storedEquipParams, hand: null, floating: null, room: null });
                }
            }
            const storedColor = localStorage.getItem(STORAGE_KEYS.PET_COLOR);
            if (storedColor) setPetColor(storedColor);
            const storedCheek = localStorage.getItem(STORAGE_KEYS.PET_CHEEK_COLOR);
            if (storedCheek) setCheekColor(storedCheek);
        };

        loadSettings();
        window.addEventListener(EVENTS.PET_SETTINGS_CHANGED, loadSettings);

        const fetchCollection = async () => {
            const userId = getUserId();
            const res = await fetch(`/api/collection?userId=${userId}`);
            if (!res.ok) return;

            const data: CollectionItem[] = await res.json();
            const isDev = process.env.NODE_ENV === 'development';
            setItems(data.filter(item => (item.quantity > 0 || isDev) && item.category));
        };
        fetchCollection();

        return () => {
            window.removeEventListener(EVENTS.PET_SETTINGS_CHANGED, loadSettings);
        };
    }, []);

    const handleEquip = (iconName: string | null) => {
        const newEquipment = { ...equipment, [activeTab]: iconName };
        setEquipment(newEquipment);
        localStorage.setItem(STORAGE_KEYS.PET_EQUIPMENT, JSON.stringify(newEquipment));
        window.dispatchEvent(new CustomEvent(EVENTS.PET_SETTINGS_CHANGED));
    };

    const displayItems = items.filter(item => item.category === activeTab as any);

    const sectionClass = isNight ? 'bg-white/10' : 'bg-white/60 backdrop-blur-sm';
    const titleClass = isNight ? 'text-gray-200' : 'text-slate-600';
    const previewBgClass = isNight ? 'bg-sky-900/50' : 'bg-sky-100/50';
    const borderColor = isNight ? 'border-white/10' : 'border-slate-200';
    const tabClass = (isActive: boolean) => {
        if (isActive) return 'bg-sky-500 text-white';
        return isNight ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white text-slate-500 hover:bg-slate-100';
    };
    const itemButtonBg = (isSelected: boolean) => {
        if (isSelected) return 'border-sky-500 ring-2 ring-sky-200 bg-white';
        return isNight ? 'bg-white/10 border-white/10' : 'bg-white border-white';
    };
    const itemNameColor = isNight ? 'text-gray-300' : 'text-slate-600';

    return (
        <section className={`mb-8 ${sectionClass} rounded-2xl p-4 transition-colors`}>
            <h2 className={`text-lg font-semibold ${titleClass} mb-3`}>きせかえ & 模様替え</h2>
            <div className={`flex justify-center mb-6 ${previewBgClass} rounded-xl h-[180px] overflow-hidden relative items-center`}>
                <div className="scale-[0.6] transform origin-center mt-12">
                    <CharacterDisplay
                        petName=""
                        petColor={petColor}
                        cheekColor={cheekColor}
                        equipment={equipment}
                        mood="happy"
                        message={null}
                        onCharacterClick={() => { }}
                        // プレビュー内は常に昼または現在のモードに合わせるか？
                        // ここではisNightを渡してプレビュー内も夜にする
                        isNight={isNight}
                    />
                </div>
            </div>

            <div className={`flex gap-2 mb-4 ${borderColor} border-b pb-2`}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${tabClass(activeTab === tab.id)}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-4 gap-2 min-h-[100px]">
                <button onClick={() => handleEquip(null)} className="flex flex-col items-center gap-1">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${itemButtonBg(equipment[activeTab] === null)}`}>
                        <IoBan className={isNight ? "text-gray-400" : "text-slate-400"} size={24} />
                    </div>
                    <span className={`text-[10px] font-medium ${itemNameColor}`}>はずす</span>
                </button>
                {displayItems.map(item => (
                    <button key={item.id} onClick={() => handleEquip(item.iconName)} disabled={item.quantity === 0} className="flex flex-col items-center gap-1 disabled:cursor-not-allowed">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${itemButtonBg(equipment[activeTab] === item.iconName)} ${item.quantity === 0 ? 'opacity-50' : ''}`}>
                            {item.iconName === 'GiGhost' ? (
                                <TeruTeruIcon size={24} />
                            ) : (
                                <ItemIcon name={item.iconName} rarity={item.rarity} size={24} />
                            )}
                        </div>
                        <span className={`text-[10px] font-medium ${itemNameColor} truncate w-full text-center`}>{item.name}</span>
                    </button>
                ))}
            </div>
            {displayItems.length === 0 && <p className={`text-center text-xs ${isNight ? 'text-gray-500' : 'text-slate-400'} py-4`}>このカテゴリのアイテムを持っていません</p>}
        </section>
    );
}