// src/app/components/ShareModal.tsx

'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoDownload } from 'react-icons/io5';
import { FaTwitter } from 'react-icons/fa';
import CharacterDisplay, { EquipmentState } from './CharacterDisplay';

type ShareModalProps = {
    isOpen: boolean;
    onClose: () => void;
    petName: string;
    petColor: string;
    cheekColor: string;
    equipment: EquipmentState;
    weather: string | null;
    isNight: boolean;
    backgroundClass: string;
};

// ★追加: 天気をひらがなに変換するヘルパー関数
const getWeatherText = (weather: string | null) => {
    switch (weather) {
        case 'clear': return 'かいせい';
        case 'cloudy': return 'くもり';
        case 'rainy': return 'あめ';
        case 'thunderstorm': return 'かみなり';
        case 'snowy': return 'ゆき';
        case 'windy': return 'かぜ';
        case 'night': return 'よる';
        case 'sunny':
        default: return 'はれ';
    }
};

export default function ShareModal({
    isOpen,
    onClose,
    petName,
    petColor,
    cheekColor,
    equipment,
    weather,
    isNight,
    backgroundClass
}: ShareModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // 画像生成ロジック
    const generateImageBlob = async (): Promise<Blob | null> => {
        if (!cardRef.current) return null;

        if (!(window as any).html2canvas) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }
        const html2canvas = (window as any).html2canvas;

        const canvas = await html2canvas(cardRef.current, {
            useCORS: true,
            backgroundColor: null,
            scale: 2, // 高画質設定
            logging: false,
        });

        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const blob = await generateImageBlob();
            if (!blob) return;
            const link = document.createElement('a');
            link.download = `otenki_gurashi_${new Date().getTime()}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
        } catch (e) {
            console.error('画像生成に失敗しました', e);
            alert('ごめんね、うまく写真が撮れなかったみたい…');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        setIsGenerating(true);
        // ★変更: 天気を日本語（ひらがな）に変換してテキストを作成
        const weatherText = getWeatherText(weather);
        const text = `今の ${petName} はこんな感じ！\n天気: ${weatherText} 🌤️\n\n#おてんきぐらし #癒やし`;

        try {
            // 1. 画像を生成
            const blob = await generateImageBlob();
            if (!blob) throw new Error('画像の生成に失敗しました');

            // 2. Web Share API (モバイル等のネイティブ共有機能) を試みる
            if (navigator.share) {
                const file = new File([blob], "image.png", { type: "image/png" });
                const shareData = {
                    files: [file],
                    text: text,
                };

                // ファイル共有がサポートされているか確認してから実行
                if (navigator.canShare && navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    return; // シェア成功（またはシート起動）なら終了
                }
            }

            // 3. Web Share API非対応環境（PC等）の場合のフォールバック
            // 画像は添付できないため、テキストのみでツイート画面を開く
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');

        } catch (e: any) {
            // シェアキャンセルの場合は何もしない
            if (e.name !== 'AbortError') {
                console.error('シェアエラー:', e);
                // エラー時はテキストのみでフォールバック
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const textColor = isNight ? 'text-white' : 'text-slate-800';
    const subTextColor = isNight ? 'text-gray-300' : 'text-slate-500';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative flex flex-col gap-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                        >
                            <IoClose size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-center text-slate-800">
                            記念撮影
                        </h2>

                        <div
                            ref={cardRef}
                            className={`relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner ${backgroundClass} flex flex-col items-center justify-center border-4 border-white`}
                        >
                            <div className="absolute top-4 left-0 right-0 text-center z-10">
                                <p className={`text-sm font-bold ${subTextColor} opacity-80`}>Today's</p>
                                <h3 className={`text-2xl font-extrabold ${textColor} tracking-widest`}>{petName}</h3>
                            </div>

                            <div className="scale-90">
                                <CharacterDisplay
                                    petName=""
                                    petColor={petColor}
                                    cheekColor={cheekColor}
                                    equipment={equipment}
                                    mood="happy"
                                    message={null}
                                    onCharacterClick={() => { }}
                                    isNight={isNight}
                                    isStatic={true}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-center text-slate-500">
                                画像を保存して、SNSでシェアしてね！
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={isGenerating}
                                    className="flex-1 bg-sky-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-sky-600 transition-colors active:scale-95 disabled:opacity-50"
                                >
                                    {isGenerating ? '作成中...' : <><IoDownload size={20} /> 画像保存</>}
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={isGenerating}
                                    className="flex-1 bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors active:scale-95 disabled:opacity-50"
                                >
                                    <FaTwitter size={20} /> ポスト
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}