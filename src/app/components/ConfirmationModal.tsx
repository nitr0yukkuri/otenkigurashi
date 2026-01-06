// src/app/components/ConfirmationModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaRegSun,
    FaCloudRain,
    FaCloud,
    FaBolt,
    FaSnowflake,
    FaWind,
    FaMoon,
    FaBell // ★ 追加: 通知用アイコン
} from 'react-icons/fa';
import { WiThunderstorm } from "react-icons/wi";
import { IoMdClose } from "react-icons/io";
import Image from 'next/image';

type ConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    children?: React.ReactNode;
    item?: {
        name: string;
        description: string;
        rarity: string;
        icon?: string;
    };
    weatherType?: 'thunderstorm';
    type?: 'walk' | 'item' | 'notification'; // ★ 追加: notificationタイプ
    title?: string; // ★ 追加: タイトル上書き用
    confirmText?: string; // ★ 追加: 実行ボタンのテキスト
    cancelText?: string; // ★ 追加: キャンセルボタンのテキスト
};

const iconComponents: { [key: string]: React.ElementType } = {
    FaRegSun: FaRegSun,
    FaCloudRain: FaCloudRain,
    FaCloud: FaCloud,
    FaBolt: FaBolt,
    FaSnowflake: FaSnowflake,
    FaWind: FaWind,
    FaMoon: FaMoon,
    FaBell: FaBell,
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    children,
    item,
    weatherType,
    type,
    title: customTitle,
    confirmText: customConfirmText,
    cancelText
}) => {
    const renderIcon = () => {
        if (item?.icon) {
            if (item.icon.startsWith('/')) {
                return (
                    <Image
                        src={item.icon}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="mx-auto"
                    />
                );
            }
            const IconComponent = iconComponents[item.icon];
            if (IconComponent) {
                return (
                    <IconComponent
                        className="text-6xl text-gray-700 mx-auto"
                        style={{ color: '#4A5568' }}
                    />
                );
            }
        } else if (weatherType === 'thunderstorm') {
            return (
                <WiThunderstorm
                    className="text-6xl text-gray-700 mx-auto"
                    style={{ color: '#4A5568' }}
                />
            );
        } else if (type === 'notification') {
            return (
                <FaBell
                    className="text-5xl text-yellow-400 mx-auto drop-shadow-sm"
                />
            );
        }
        return null;
    };

    const isWalkMode = type === 'walk' && !item;

    // タイトルとボタン文字の決定ロジック
    const displayTitle = customTitle || item?.name || '確認';
    const displayConfirmText = customConfirmText || (isWalkMode ? 'OK！' : item ? 'OK !' : '確認');

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // ★ 下揃えのレイアウト（ボトムシート用）
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-0 md:items-center"
                    onClick={onClose}
                >
                    <motion.div
                        // ★ 下からスライドイン
                        initial={{ y: "100%", opacity: 0.5 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        // ★ ボトムシートスタイル (上だけ丸く、スマホサイズ最適化)
                        className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full md:max-w-sm relative pb-safe md:pb-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ハンドルバー（スマホ用装飾） */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-6 md:hidden" />

                        {/* 閉じるボタン（右上） */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <IoMdClose size={20} />
                        </button>

                        <div className="px-6 pb-8 text-center space-y-5">
                            <div className="pt-2">
                                {renderIcon()}
                            </div>

                            {!isWalkMode && (
                                <h2 className="text-xl font-extrabold text-slate-700 tracking-wide">
                                    {displayTitle}
                                </h2>
                            )}

                            {item ? (
                                <div className="py-2">
                                    <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed mb-3">
                                        {item.description}
                                    </p>
                                    <div className="inline-block bg-orange-100 px-3 py-1 rounded-full">
                                        <p className="text-orange-600 font-bold text-xs tracking-wider">
                                            レア度: {item.rarity}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                                    {children}
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={isWalkMode ? onConfirm : (type === 'notification' ? onConfirm : onClose)}
                                    className={`w-full py-4 rounded-2xl text-lg font-bold transition-all shadow-lg active:scale-95 ${type === 'notification'
                                            ? 'bg-yellow-400 text-white hover:bg-yellow-500 shadow-yellow-200'
                                            : 'bg-slate-800 text-white hover:bg-slate-700 shadow-slate-200'
                                        }`}
                                >
                                    {displayConfirmText}
                                </button>

                                {/* ★ キャンセルボタン（だめボタン） */}
                                {cancelText && (
                                    <button
                                        onClick={onClose}
                                        className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;