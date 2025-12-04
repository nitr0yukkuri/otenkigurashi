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
        // ★修正: 雪の量を 30 -> 60 に倍増
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
        const orbs = Array.from({ length: 6 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            scale: 0.8 + Math.random() * 0.5,
            duration: 5 + Math.random() * 4
        }));

        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* ★追加: 太陽の光（右上からの光差し） */}
                <motion.div
                    className="absolute -top-20 -right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                {orbs.map((orb) => (
                    <motion.div
                        key={orb.id}
                        className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl"
                        style={{ left: orb.left, top: orb.top }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, 20, 0],
                            opacity: [0.1, 0.4, 0.1],
                            scale: [orb.scale, orb.scale * 1.1, orb.scale]
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