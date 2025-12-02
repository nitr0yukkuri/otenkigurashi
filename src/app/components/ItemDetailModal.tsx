'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ItemIcon from './ItemIcon';

// アイテムの型定義
type Item = {
    name: string;
    description: string;
    iconName: string | null;
    rarity: string;
    weather: string | null;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    item: Item | null;
};

// 天候タイプを日本語にマッピング
const weatherMap: { [key: string]: string } = {
    sunny: '晴れ',
    clear: '快晴',
    rainy: '雨',
    cloudy: 'くもり',
    snowy: '雪',
    thunderstorm: '雷雨',
    windy: '強風',
    night: '夜',
};

export default function ItemDetailModal({ isOpen, onClose, item }: Props) {
    if (!item) return null;

    // 天候情報の日本語化
    const weatherText = item.weather ? weatherMap[item.weather as keyof typeof weatherMap] : '特定の天候';
    // レア度の日本語化
    const rarityText = item.rarity === 'rare' ? 'レア' : 'ノーマル';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl p-8 w-full max-w-xs text-center shadow-xl flex flex-col items-center gap-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* アイコン */}
                        <div className="relative mb-2">
                            {/* ★★★ ここを修正: rarity={item.rarity} を追加 ★★★ */}
                            <ItemIcon name={item.iconName} rarity={item.rarity} size={80} />
                        </div>

                        <p className="text-2xl font-bold text-slate-800">{item.name}</p>

                        {/* 説明と詳細情報 */}
                        <div className="text-sm text-slate-600 space-y-1">
                            <p className="text-center font-semibold">
                                {/* 取得条件 */}
                                {weatherText}の日に見つかりやすい
                            </p>
                            <p className="text-center">{item.description}</p>
                            <p className="text-center text-xs font-bold text-yellow-500">
                                (レア度: {rarityText})
                            </p>
                        </div>

                        {/* OKボタン */}
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-full text-lg hover:bg-gray-700 transition-colors active:scale-95 mt-4"
                        >
                            OK！
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}