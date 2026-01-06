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
    FaBell
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
    type?: 'walk' | 'item' | 'notification';
    title?: string;
    confirmText?: string;
    cancelText?: string;
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
                    // ★ 修正: HelpModalと完全に同じ背景スタイル（bg-black/60）
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        // ★ 修正: HelpModalと同じアニメーション
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        // ★ 修正: HelpModalと同じスタイル（bg-white/90, rounded-3xl）
                        className="bg-white/90 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ★ 修正: HelpModalと同じシンプルな閉じるボタン（背景なし） */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Close"
                        >
                            <IoMdClose size={24} />
                        </button>

                        <div className="px-2 pb-2 text-center space-y-5">
                            <div className="pt-2">
                                {renderIcon()}
                            </div>

                            {!isWalkMode && (
                                // ★ 修正: HelpModalのタイトルスタイルに合わせる（text-slate-800）
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
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
                                // ★ 修正: HelpModalのテキストスタイルに合わせる
                                <div className="text-slate-600 font-medium whitespace-pre-line leading-relaxed text-sm">
                                    {children}
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={isWalkMode ? onConfirm : (type === 'notification' ? onConfirm : onClose)}
                                    // ★ 修正: HelpModalのボタンスタイル（rounded-xl, py-3）に統一
                                    className={`w-full py-3 rounded-xl text-lg font-bold transition-all shadow-lg active:scale-95 ${type === 'notification'
                                            ? 'bg-yellow-400 text-white hover:bg-yellow-500 shadow-yellow-200'
                                            : 'bg-slate-800 text-white hover:bg-slate-700 shadow-slate-200'
                                        }`}
                                >
                                    {displayConfirmText}
                                </button>

                                {/* キャンセルボタン（だめボタン） */}
                                {cancelText && (
                                    <button
                                        onClick={onClose}
                                        // ★ 修正: 薄い文字リンクから、グレーのしっかりしたボタンに変更
                                        className="w-full py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-95"
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