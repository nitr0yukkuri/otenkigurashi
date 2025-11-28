// src/app/achievements/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { getUserId } from '../lib/userId';

import {
    FaSeedling, FaTrophy, FaStar, FaMapMarkerAlt, FaRegSnowflake, FaCloudShowersHeavy, FaWind, FaMoon, FaBookOpen
} from 'react-icons/fa';
import { IoSunny, IoRainy, IoThunderstorm, IoCalendarClearOutline } from 'react-icons/io5';
import { BsSunFill, BsCloudFill, BsFillCloudLightningRainFill } from 'react-icons/bs';
import { GiSnail, GiAcorn, GiStoneBlock } from 'react-icons/gi';

type WeatherType = "sunny" | "clear" | "rainy" | "cloudy" | "snowy" | "thunderstorm" | "windy" | "night";
const CURRENT_WEATHER_KEY = 'currentWeather';

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

interface UserProgress {
    walkCount: number;
    sunnyWalkCount: number;
    clearWalkCount: number;
    rainyWalkCount: number;
    cloudyWalkCount: number;
    snowyWalkCount: number;
    thunderstormWalkCount: number;
    windyWalkCount: number;
    nightWalkCount: number;
    collectedItemTypesCount: number;
    collectedNormalItemTypesCount: number;
    collectedUncommonItemTypesCount: number;
    collectedRareItemTypesCount: number;
    collectedEpicItemTypesCount: number;
    collectedLegendaryItemTypesCount: number;
    consecutiveWalkDays: number;
    lastWalkDate?: string | Date;
}

interface Achievement {
    id: number;
    title: string;
    description: string;
    icon: JSX.Element;
    isUnlocked: boolean;
    progressKey: keyof UserProgress;
    goal: number;
    unit: string;
}

const masterAchievements: Achievement[] = [
    { id: 1, title: 'はじめてのおさんぽ', description: 'はじめておさんぽに出かけた', icon: <FaMapMarkerAlt size={24} />, isUnlocked: false, progressKey: 'walkCount', goal: 1, unit: 'かい' },
    { id: 2, title: 'おさんぽチャレンジャー', description: 'おさんぽに10回行った', icon: <FaMapMarkerAlt size={24} />, isUnlocked: false, progressKey: 'walkCount', goal: 10, unit: 'かい' },
    { id: 3, title: 'おさんぽエキスパート', description: 'おさんぽに50回行った', icon: <FaMapMarkerAlt size={24} />, isUnlocked: false, progressKey: 'walkCount', goal: 50, unit: 'かい' },
    { id: 10, title: 'おさんぽマスター', description: 'おさんぽに100回行った', icon: <FaTrophy size={24} />, isUnlocked: false, progressKey: 'walkCount', goal: 100, unit: 'かい' },

    // 天気関連
    { id: 20, title: '太陽とともだち', description: '晴れの日にはじめておさんぽした', icon: <IoSunny size={24} />, isUnlocked: false, progressKey: 'sunnyWalkCount', goal: 1, unit: 'かい' },
    { id: 21, title: '青空大好き', description: '快晴の日にはじめておさんぽした', icon: <BsSunFill size={24} />, isUnlocked: false, progressKey: 'clearWalkCount', goal: 1, unit: 'かい' },
    { id: 22, title: '雨の日も楽しい', description: '雨の日にはじめておさんぽした', icon: <IoRainy size={24} />, isUnlocked: false, progressKey: 'rainyWalkCount', goal: 1, unit: 'かい' },
    { id: 23, title: '雲を追いかけて', description: 'くもりの日にはじめておさんぽした', icon: <BsCloudFill size={24} />, isUnlocked: false, progressKey: 'cloudyWalkCount', goal: 1, unit: 'かい' },
    { id: 24, title: '雪あそび', description: '雪の日にはじめておさんぽした', icon: <FaRegSnowflake size={24} />, isUnlocked: false, progressKey: 'snowyWalkCount', goal: 1, unit: 'かい' },
    { id: 25, title: 'カミナリ注意', description: '雷雨の日にはじめておさんぽした', icon: <IoThunderstorm size={24} />, isUnlocked: false, progressKey: 'thunderstormWalkCount', goal: 1, unit: 'かい' },
    { id: 26, title: '風に吹かれて', description: '強風の日にはじめておさんぽした', icon: <FaWind size={24} />, isUnlocked: false, progressKey: 'windyWalkCount', goal: 1, unit: 'かい' },
    { id: 27, title: '夜更かしさん', description: '夜にはじめておさんぽした', icon: <FaMoon size={24} />, isUnlocked: false, progressKey: 'nightWalkCount', goal: 1, unit: 'かい' },

    // アイテム収集関連
    { id: 30, title: 'はじめての拾い物', description: 'はじめてアイテムを拾った', icon: <FaBookOpen size={24} />, isUnlocked: false, progressKey: 'collectedItemTypesCount', goal: 1, unit: 'しゅるい' },
    { id: 31, title: 'アイテムコレクター', description: 'アイテムを10種類集めた', icon: <FaBookOpen size={24} />, isUnlocked: false, progressKey: 'collectedItemTypesCount', goal: 10, unit: 'しゅるい' },
    { id: 32, title: 'きらきらコレクション', description: 'アイテムを30種類集めた', icon: <FaBookOpen size={24} />, isUnlocked: false, progressKey: 'collectedItemTypesCount', goal: 30, unit: 'しゅるい' },

    // 連続日数関連
    { id: 40, title: '明日もあえるかな', description: '3日連続でおさんぽした', icon: <IoCalendarClearOutline size={24} />, isUnlocked: false, progressKey: 'consecutiveWalkDays', goal: 3, unit: 'にち' },
    { id: 41, title: 'おさんぽ習慣', description: '7日連続でおさんぽした', icon: <IoCalendarClearOutline size={24} />, isUnlocked: false, progressKey: 'consecutiveWalkDays', goal: 7, unit: 'にち' },
];

const calculateAchievements = (progress: UserProgress | null, achievements: Achievement[]) => {
    if (!progress) {
        return achievements.map(ach => ({ ...ach, isUnlocked: false, progress: 0 }));
    }
    const calculated = achievements.map(ach => {
        const currentProgress = (ach.progressKey in progress) ? (progress[ach.progressKey] || 0) : 0;
        const numericProgress = typeof currentProgress === 'number' ? currentProgress : 0;
        const isUnlocked = numericProgress >= ach.goal;
        const actualProgress = isUnlocked ? ach.goal : numericProgress;
        return { ...ach, isUnlocked: isUnlocked, progress: actualProgress };
    });
    return calculated.sort((a, b) => {
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        return a.id - b.id;
    });
};

type AchievementDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    achievement: (Achievement & { progress: number }) | null;
};

function AchievementDetailModal({ isOpen, onClose, achievement }: AchievementDetailModalProps) {
    if (!achievement) return null;
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
                        <div className="relative mb-2 text-green-600 text-6xl">
                            {React.cloneElement(achievement.icon, { size: 60 })}
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{achievement.title}</p>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p className="text-center">{achievement.description}</p>
                        </div>
                        <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3 rounded-full text-lg hover:bg-gray-700 transition-colors active:scale-95 mt-4">OK！</button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function AchievementsPage() {
    const [dynamicBackgroundClass, setDynamicBackgroundClass] = useState('bg-sunny');
    const [isNight, setIsNight] = useState(false);
    const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
    const [achievements, setAchievements] = useState<(Achievement & { progress: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAchievement, setSelectedAchievement] = useState<(Achievement & { progress: number }) | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        const storedWeather = localStorage.getItem(CURRENT_WEATHER_KEY) as WeatherType | null;
        setDynamicBackgroundClass(getBackgroundGradientClass(storedWeather));
        setIsNight(storedWeather === 'night');
    }, []);

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = getUserId();
                const progressResponse = await fetch(`/api/progress?userId=${userId}`);
                if (!progressResponse.ok) {
                    const errorData = await progressResponse.json();
                    throw new Error(errorData.message || '進捗情報の取得に失敗しました');
                }
                const progressData: UserProgress = await progressResponse.json();
                setUserProgress(progressData);
                const calculatedAchievements = calculateAchievements(progressData, masterAchievements);
                setAchievements(calculatedAchievements);
            } catch (err: any) {
                console.error("進捗情報の取得失敗", err);
                setError(err.message || '情報の取得に失敗しました。');
                setAchievements(calculateAchievements(null, masterAchievements));
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const AchievementItem = ({ achievement }: { achievement: Achievement & { progress: number } }) => {
        const progressPercentage = achievement.goal > 0 ? Math.min((achievement.progress / achievement.goal) * 100, 100) : (achievement.isUnlocked ? 100 : 0);
        const progressBarColor = achievement.isUnlocked ? 'bg-green-600' : 'bg-yellow-500';
        const handleAchievementClick = () => {
            if (achievement.isUnlocked) {
                setSelectedAchievement(achievement);
                setIsDetailModalOpen(true);
            }
        };
        return (
            <div className={`p-4 rounded-2xl shadow-lg transition-all ${achievement.isUnlocked ? 'bg-white' : 'bg-white/80 opacity-90'}`}>
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center p-1 border border-gray-300 ${achievement.isUnlocked ? 'text-green-600' : 'text-gray-400 opacity-70'}`}>
                        <div className="text-4xl">{achievement.icon}</div>
                    </div>
                    <div className="flex-grow">
                        <p className={`font-bold text-lg ${achievement.isUnlocked ? 'text-slate-800' : 'text-slate-600'}`}>{achievement.title}</p>
                        <p className={`text-xs mt-1 ${achievement.isUnlocked ? 'text-slate-500' : 'text-slate-400'}`}>{achievement.description}</p>
                        <div className="mt-3">
                            {achievement.isUnlocked ? (
                                <button onClick={handleAchievementClick} className="w-full bg-black text-white font-bold py-2 rounded-lg text-sm shadow-md transition-colors hover:bg-gray-700 active:scale-95 cursor-pointer">完了！</button>
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs text-slate-500 font-bold">{achievement.unit}</p>
                                        <span className="text-sm font-bold text-slate-700">{achievement.goal > 0 ? `${achievement.progress}/${achievement.goal}` : `${achievement.progress}`}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`${progressBarColor} h-full rounded-full transition-all duration-500`} style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const linkColor = isNight ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-700';
    const subTitleColor = isNight ? 'text-gray-300' : 'text-slate-500';
    const titleColor = isNight ? 'text-white' : 'text-slate-800';
    const titleIconColor = isNight ? 'text-gray-300' : 'text-slate-500';

    return (
        <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <AchievementDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} achievement={selectedAchievement} />
            <main className={`w-full max-w-sm h-[640px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : 'text-slate-700'} ${dynamicBackgroundClass}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>
                <div className="flex-grow overflow-y-auto p-6">
                    <header className="mb-8">
                        <Link href="/" className={`mb-6 inline-block text-sm ${linkColor} transition-colors`}>← もどる</Link>
                        <h1 className={`text-4xl font-extrabold ${titleColor} tracking-wider flex items-center gap-2 backdrop-blur-sm bg-white/30 rounded-lg px-4 py-1`}>
                            実績
                            <FaTrophy size={28} className={titleIconColor} />
                        </h1>
                        <p className={`${subTitleColor} mt-1`}>てんちゃんとの思い出を見てみよう</p>
                    </header>
                    {loading ? (
                        <p className={`text-center animate-pulse ${subTitleColor}`}>実績を読み込み中...</p>
                    ) : error ? (
                        <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg shadow-sm">{error}</p>
                    ) : achievements.length > 0 ? (
                        <div className="space-y-4">
                            {achievements.map(ach => (
                                <AchievementItem key={ach.id} achievement={ach} />
                            ))}
                        </div>
                    ) : (
                        <p className={`text-center ${subTitleColor}`}>まだ実績がありません。</p>
                    )}
                </div>
                <Footer />
            </main>
        </div>
    );
}