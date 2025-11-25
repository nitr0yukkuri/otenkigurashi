'use client';

import { useState, useEffect } from 'react';
import { STORAGE_KEYS, EVENTS } from '../constants';

export default function NameSection() {
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

    return (
        <section className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-slate-600 mb-3">ペットの名前</h2>
            {isEditing ? (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full bg-white rounded-lg shadow p-3 text-slate-700 font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
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
                    <button onClick={handleStartEdit} className="w-full bg-white rounded-xl shadow p-4 text-center text-slate-700 font-medium hover:bg-gray-50 active:scale-[0.98] transition-all">
                        {petName}
                    </button>
                    <p className="text-xs text-slate-500 text-center mt-1">タップして名前を変更</p>
                </div>
            )}
        </section>
    );
}