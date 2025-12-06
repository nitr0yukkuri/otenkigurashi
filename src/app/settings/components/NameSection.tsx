'use client';

import { useState, useEffect } from 'react';
import { STORAGE_KEYS, EVENTS } from '../constants';

// isNightを受け取るように変更
export default function NameSection({ isNight }: { isNight: boolean }) {
    const [petName, setPetName] = useState("てんちゃん");
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        const storedName = localStorage.getItem(STORAGE_KEYS.PET_NAME);
        if (storedName) setPetName(storedName);
    }, []);

    const handleStartEdit = () => {
        setEditingName(petName);
        setIsEditing(true);
    };

    const handleSave = () => {
        const newName = editingName.trim();
        if (newName) {
            setPetName(newName);
            localStorage.setItem(STORAGE_KEYS.PET_NAME, newName);
            window.dispatchEvent(new CustomEvent(EVENTS.PET_SETTINGS_CHANGED));
            setIsEditing(false);
        } else {
            alert("名前を入力してください。");
        }
    };

    const sectionClass = isNight ? 'bg-white/10' : 'bg-white/60 backdrop-blur-sm';
    const titleClass = isNight ? 'text-gray-200' : 'text-slate-600';
    const inputClass = isNight ? 'bg-black/20 text-white border-white/20 focus:ring-sky-400' : 'bg-white text-slate-700 border-gray-300 focus:ring-sky-300';
    const buttonClass = isNight ? 'bg-white/10 text-gray-200 hover:bg-white/20' : 'bg-white text-slate-700 hover:bg-gray-50';
    const subTextClass = isNight ? 'text-gray-400' : 'text-slate-500';

    return (
        <section className={`mb-8 ${sectionClass} rounded-2xl p-4 transition-colors`}>
            <h2 className={`text-lg font-semibold ${titleClass} mb-3`}>ペットの名前</h2>
            {isEditing ? (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className={`w-full rounded-lg shadow p-3 font-medium border focus:outline-none focus:ring-2 ${inputClass}`}
                        maxLength={10}
                    />
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-slate-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-300 transition-colors">
                            キャンセル
                        </button>
                        <button onClick={handleSave} className="bg-sky-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-sky-600 transition-colors">
                            保存する
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <button onClick={handleStartEdit} className={`w-full rounded-xl shadow p-4 text-center font-medium active:scale-[0.98] transition-all ${buttonClass}`}>
                        {petName}
                    </button>
                    <p className={`text-xs text-center mt-1 ${subTextClass}`}>タップして名前を変更</p>
                </div>
            )}
        </section>
    );
}