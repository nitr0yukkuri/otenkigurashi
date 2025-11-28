// src/app/components/Footer.tsx

'use client';

import { useState, useEffect } from 'react';
import NavItem from './NavItem';
import { BsCloud, BsBook } from 'react-icons/bs';
import { MdDirectionsWalk } from 'react-icons/md';
import { IoSettingsSharp } from 'react-icons/io5';
import { FaSeedling } from 'react-icons/fa';

const CURRENT_WEATHER_KEY = 'currentWeather';

export default function Footer({ onWalkClick }: { onWalkClick?: () => void }) {
    const [isNight, setIsNight] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const updateNightMode = () => {
        const storedWeather = localStorage.getItem(CURRENT_WEATHER_KEY);
        setIsNight(storedWeather === 'night');
    };

    useEffect(() => {
        updateNightMode();
        setIsMounted(true);

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === CURRENT_WEATHER_KEY) {
                updateNightMode();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const handleWeatherChanged = () => {
            updateNightMode();
        };
        window.addEventListener('weatherChanged', handleWeatherChanged);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('weatherChanged', handleWeatherChanged);
        };
    }, []);

    const navItems = [
        { name: '天気予報', href: '/weather', icon: <BsCloud size={28} /> },
        { name: 'おさんぽ', href: onWalkClick ? undefined : '/', icon: <MdDirectionsWalk size={28} />, onClick: onWalkClick },
        { name: 'ずかん', href: '/collection', icon: <BsBook size={28} /> },
        { name: '実績', href: '/achievements', icon: <FaSeedling size={28} /> },
        { name: '設定', href: '/settings', icon: <IoSettingsSharp size={28} /> },
    ];

    const footerBgClass = isNight
        ? 'bg-gray-900/70'
        : 'bg-white/70';

    return (
        // ★変更: absolute bottom-0 z-50 を追加して画面最下部に強制固定
        <footer className={`w-full ${footerBgClass} backdrop-blur-sm flex-shrink-0 transition-all duration-500 absolute bottom-0 z-50 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            <nav className="flex items-center h-20">
                {navItems.map((item) => (
                    <NavItem
                        key={item.name}
                        href={item.href}
                        icon={item.icon}
                        label={item.name}
                        onClick={item.href ? undefined : item.onClick}
                        isNight={isNight}
                    />
                ))}
            </nav>
        </footer>
    );
}