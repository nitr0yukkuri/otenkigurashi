// src/app/components/HelpModal.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { FaMapMarkerAlt, FaTshirt, FaBook } from 'react-icons/fa';
import { WiDaySunny } from 'react-icons/wi';

type HelpModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white/90 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <IoMdClose size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
                            あそびかた
                        </h2>

                        <div className="space-y-6">
                            {/* 天気連動 */}
                            <section className="flex gap-4 items-start">
                                <div className="bg-orange-100 p-3 rounded-full text-orange-500 shrink-0">
                                    <WiDaySunny size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-1">天気と連動</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        あなたのいる場所の天気や時間に合わせて、背景や「てんちゃん」の様子が変わります。
                                    </p>
                                </div>
                            </section>

                            {/* おさんぽ */}
                            <section className="flex gap-4 items-start">
                                <div className="bg-green-100 p-3 rounded-full text-green-600 shrink-0">
                                    <FaMapMarkerAlt size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-1">おさんぽ</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        1日3回までおさんぽに行けます。<br />
                                        その時の天気によって、拾えるアイテムが変わるかも…？
                                    </p>
                                </div>
                            </section>

                            {/* きせかえ */}
                            <section className="flex gap-4 items-start">
                                <div className="bg-pink-100 p-3 rounded-full text-pink-500 shrink-0">
                                    <FaTshirt size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-1">きせかえ</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        集めたアイテムを「設定」画面で装備できます。自分だけのてんちゃんにしよう！
                                    </p>
                                </div>
                            </section>

                            {/* 図鑑・実績 */}
                            <section className="flex gap-4 items-start">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-500 shrink-0">
                                    <FaBook size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-1">図鑑・実績</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        たくさんのアイテムや、特定の条件で解除される「実績」を集めてみてね。
                                    </p>
                                </div>
                            </section>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl mt-8 hover:bg-slate-700 transition-colors active:scale-95"
                        >
                            わかった！
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}