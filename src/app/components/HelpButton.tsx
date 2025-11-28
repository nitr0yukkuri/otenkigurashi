// src/app/components/HelpButton.tsx

'use client';

import { FaQuestion } from 'react-icons/fa';

type Props = {
    onClick: () => void;
};

export default function HelpButton({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="absolute top-5 right-5 z-20 bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 active:scale-95 group"
            aria-label="ヘルプ"
        >
            <FaQuestion size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
    );
}