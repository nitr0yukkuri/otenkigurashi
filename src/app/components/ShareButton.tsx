// src/app/components/ShareButton.tsx

'use client';

import { FaCamera } from 'react-icons/fa';

type Props = {
    onClick: () => void;
};

export default function ShareButton({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="absolute top-5 left-5 z-20 bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 active:scale-95 group"
            aria-label="シェア"
        >
            {/* ★修正: group-hover:rotate-12 を削除 */}
            <FaCamera size={24} className="transition-transform" />
        </button>
    );
}