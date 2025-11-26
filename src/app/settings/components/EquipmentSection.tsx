// src/app/settings/components/EquipmentSection.tsx

'use client';

import { useState, useEffect } from 'react';
import { IoBan, IoShirt, IoHandRight, IoCloud } from 'react-icons/io5';
import ItemIcon from '../../components/ItemIcon';
import CharacterDisplay, { EquipmentState } from '../../components/CharacterDisplay'; // ★ プレビュー用
import { STORAGE_KEYS, EVENTS } from '../constants';

// 型定義
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

export default function EquipmentSection() {
    // 現在の装備状態
    const [equipment, setEquipment] = useState<EquipmentState>({ head: null, hand: null, floating: null });
    // 所持アイテムリスト
    const [items, setItems] = useState<CollectionItem[]>([]);
    // 現在選択中のタブ
    const [activeTab, setActiveTab] = useState<'head' | 'hand' | 'floating'>('head');
    // プレビュー用のペット情報
    const [petColor, setPetColor] = useState('white');
    const [cheekColor, setCheekColor] = useState("#F8BBD0");

    useEffect(() => {
        // 1. 装備の読み込み
        const storedEquipParams = localStorage.getItem(STORAGE_KEYS.PET_EQUIPMENT);
        if (storedEquipParams) {
            try {
                const parsed = JSON.parse(storedEquipParams);
                // オブジェクトかチェック
                if (typeof parsed === 'object' && parsed !== null) {
                    setEquipment(parsed);
                } else {
                    // 旧データ形式(文字列)の場合は、とりあえず head に割り当てる
                    setEquipment({ head: storedEquipParams, hand: null, floating: null });
                }
            } catch (e) {
                // パースエラー（旧データ）
                setEquipment({ head: storedEquipParams, hand: null, floating: null });
            }
        }

        // ペットの色読み込み（プレビュー用）
        const storedColor = localStorage.getItem(STORAGE_KEYS.PET_COLOR);
        if (storedColor) setPetColor(storedColor);
        const storedCheek = localStorage.getItem(STORAGE_KEYS.PET_CHEEK_COLOR);
        if (storedCheek) setCheekColor(storedCheek);

        // 2. アイテムデータの取得
        const fetchCollection = async () => {
            const res = await fetch('/api/collection');
            const data: CollectionItem[] = await res.json();
            // 所持していて、かつ装備カテゴリがあるものだけ
            setItems(data.filter(item => item.quantity > 0 && item.category));
        };
        fetchCollection();
    }, []);

    // 装備変更ハンドラ
    const handleEquip = (iconName: string | null) => {
        const newEquipment = { ...equipment, [activeTab]: iconName };
        setEquipment(newEquipment);

        // 保存時はJSON文字列にする
        localStorage.setItem(STORAGE_KEYS.PET_EQUIPMENT, JSON.stringify(newEquipment));
        window.dispatchEvent(new CustomEvent(EVENTS.PET_SETTINGS_CHANGED));
    };

    // 現在のタブに表示すべきアイテム
    const displayItems = items.filter(item => item.category === activeTab);

    return (
        <section className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-slate-600 mb-3">きせかえ</h2>

            {/* ★ プレビューエリア (小さく表示) */}
            <div className="flex justify-center mb-6 bg-sky-100/50 rounded-xl py-4">
                <div className="scale-75 transform origin-center">
                    {/* CharacterDisplayのpropsをオブジェクト対応版に修正して使う */}
                    <CharacterDisplay
                        petName="" // プレビューなので名前不要
                        petColor={petColor}
                        cheekColor={cheekColor}
                        equipment={equipment} // オブジェクトを渡す
                        mood="happy"
                        message={null}
                        onCharacterClick={() => { }}
                    />
                </div>
            </div>

            {/* ★ タブ切り替え */}
            <div className="flex gap-2 mb-4 border-b border-slate-200 pb-2">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-bold transition-colors
                            ${activeTab === tab.id ? 'bg-sky-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}
                        `}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ★ アイテムグリッド */}
            <div className="grid grid-cols-4 gap-2 min-h-[100px]">
                {/* 外すボタン */}
                <button
                    onClick={() => handleEquip(null)}
                    className="flex flex-col items-center gap-1"
                >
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white transition-all
                        ${equipment[activeTab] === null ? 'border-sky-500 ring-2 ring-sky-200' : 'border-transparent'}
                    `}>
                        <IoBan className="text-slate-400" size={24} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600">はずす</span>
                </button>

                {displayItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleEquip(item.iconName)}
                        className="flex flex-col items-center gap-1"
                    >
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white transition-all
                            ${equipment[activeTab] === item.iconName ? 'border-sky-500 ring-2 ring-sky-200' : 'border-white'}
                        `}>
                            <ItemIcon name={item.iconName} rarity={item.rarity} size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 truncate w-full text-center">
                            {item.name}
                        </span>
                    </button>
                ))}
            </div>

            {displayItems.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4">この部位のアイテムを持っていません</p>
            )}
        </section>
    );
}