// src/app/components/WeatherEffects.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function WeatherEffects({ weather }: { weather: string | null }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !weather) return null;

    // 雨・雷雨: パラパラと落ちるしずく
    if (weather === 'rainy' || weather === 'thunderstorm') {
        const drops = Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 1.5,
            duration: 0.8 + Math.random() * 0.5
        }));

        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {drops.map((drop) => (
                    <motion.div
                        key={drop.id}
                        className="absolute -top-12 w-[1px] h-12 bg-white/40"
                        style={{ left: drop.left }}
                        initial={{ opacity: 0 }}
                        animate={{ y: '120vh', opacity: [0, 1, 0.8, 0] }}
                        transition={{
                            duration: drop.duration,
                            repeat: Infinity,
                            delay: drop.delay,
                            ease: 'linear'
                        }}
                    />
                ))}
            </div>
        );
    }

    // 雪: ふわふわ舞い落ちる雪
    if (weather === 'snowy') {
        const flakes = Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 4,
            size: Math.random() * 4 + 2
        }));

        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {flakes.map((flake) => (
                    <motion.div
                        key={flake.id}
                        className="absolute -top-4 bg-white/80 rounded-full blur-[1px]"
                        style={{ left: flake.left, width: flake.size, height: flake.size }}
                        initial={{ opacity: 0 }}
                        animate={{
                            y: '110vh',
                            x: [0, Math.random() * 30 - 15, 0],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: flake.duration,
                            repeat: Infinity,
                            delay: flake.delay,
                            ease: 'linear'
                        }}
                    />
                ))}
            </div>
        );
    }

    // 晴れ・快晴: ふわふわ浮遊する光の玉 + 太陽の光
    if (weather === 'sunny' || weather === 'clear') {
        // ★変更: orbsの数を増やし、よりランダムな動きに
        const orbs = Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            scale: 0.5 + Math.random() * 0.8, // サイズのバリエーションを増やす
            duration: 4 + Math.random() * 6 // 速度のバリエーションを増やす
        }));

        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* 太陽の光（右上からの光差し） */}
                <motion.div
                    className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/40 rounded-full blur-[80px]"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* 画面全体に広がる光のグラデーション（日差し感） */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-bl from-white/30 via-transparent to-transparent"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {orbs.map((orb) => (
                    <motion.div
                        key={orb.id}
                        // ★変更: blur-xl に変更してより柔らかく
                        className="absolute w-24 h-24 bg-white/20 rounded-full blur-xl"
                        style={{ left: orb.left, top: orb.top }}
                        animate={{
                            y: [0, -50, 0], // 上下の動きを大きく
                            x: [0, 30, 0], // 左右の動きも追加
                            opacity: [0.1, 0.5, 0.1], // 透明度の変化を大きく
                            scale: [orb.scale, orb.scale * 1.2, orb.scale]
                        }}
                        transition={{
                            duration: orb.duration,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        );
    }

    return null;
}