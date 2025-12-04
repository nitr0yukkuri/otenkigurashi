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
        const drops = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 1,
            duration: 0.6 + Math.random() * 0.4
        }));

        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {drops.map((drop) => (
                    <motion.div
                        key={drop.id}
                        className="absolute top-0 w-[1px] h-4 bg-white/60"
                        style={{ left: drop.left }}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: '110%', opacity: [0, 1, 1, 0] }}
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
        const flakes = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 3
        }));

        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {flakes.map((flake) => (
                    <motion.div
                        key={flake.id}
                        className="absolute -top-2 w-2 h-2 bg-white/80 rounded-full blur-[1px]"
                        style={{ left: flake.left }}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{
                            y: '110%',
                            x: [0, Math.random() * 20 - 10, 0], // 左右に揺れる
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

    // 晴れ・快晴: ふわふわ浮遊する光の玉 (木漏れ日)
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
                {orbs.map((orb) => (
                    <motion.div
                        key={orb.id}
                        className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl"
                        style={{ left: orb.left, top: orb.top }}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, 30, 0],
                            opacity: [0.2, 0.5, 0.2],
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