'use client';

import { useState, useEffect } from 'react';
import { IoBan } from 'react-icons/io5';
import ItemIcon from '../../components/ItemIcon';
import { STORAGE_KEYS, EVENTS } from '../constants';

interface CollectionItem {
    id: number;
    name: string;
    iconName: string | null;
    quantity: number;
    rarity: string;
    category: string | null;
}

export default function EquipmentSection() {
    const [equipment, setEquipment] = useState<string | null>(null);
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedEquipment = localStorage.getItem(STORAGE_KEYS.PET_EQUIPMENT);
        if (storedEquipment) setEquipment(storedEquipment);

        const fetchCollection = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/collection');
                const data: CollectionItem[] = await response.json();
                setItems(data.filter(item => item.quantity > 0 && item.category));
            } catch (error) {
                console.error("コレクション取得失敗", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollection();
    }, []);

    const handleSelect = (iconName: string | null) => {
        setEquipment(iconName);
        if (iconName) {
            localStorage.setItem(STORAGE_KEYS.PET_EQUIPMENT, iconName);
        } else {
            localStorage.removeItem(STORAGE_KEYS.PET_EQUIPMENT);
        }
        window.dispatchEvent(new CustomEvent(EVENTS.PET_SETTINGS_CHANGED));
    };

    return (
        <section className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-slate-600 mb-3">きせかえ</h2>
            {loading ? (
                <p className="text-xs text-slate-500 text-center animate-pulse">所持アイテムを確認中...</p>
            ) : (
                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={() => handleSelect(null)}
                        className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
                    >
                        <div
                            className="w-12 h-12 rounded-full border-2 shadow-inner flex items-center justify-center text-slate-500 bg-white"
                            style={{ borderColor: equipment === null ? '#0ea5e9' : '#ffffff' }}
                        >
                            <IoBan size={24} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">なし</span>
                    </button>

                    {items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item.iconName)}
                            className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
                        >
                            <div
                                className="w-12 h-12 rounded-full border-2 shadow-inner flex items-center justify-center bg-white"
                                style={{ borderColor: equipment === item.iconName ? '#0ea5e9' : '#ffffff' }}
                            >
                                <ItemIcon name={item.iconName} rarity={item.rarity} size={24} />
                            </div>
                            <span className="text-[10px] font-medium text-slate-600 truncate w-full text-center">{item.name}</span>
                        </button>
                    ))}
                </div>
            )}
            {items.length === 0 && !loading && (
                <p className="text-xs text-slate-500 text-center mt-2">装備できるアイテムを持っていません</p>
            )}
        </section>
    );
}