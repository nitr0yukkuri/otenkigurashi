// src/app/walk/page.tsx

'use client';

// Suspense をインポート
// ★ 変更点: useState, useEffect を追加
import { Suspense, useState, useEffect } from 'react';
import CharacterFace from '../components/CharacterFace';
import WeatherIcon from '../components/WeatherIcon';
import Link from 'next/link';
import Footer from '../components/Footer';
import ItemGetModal from '../components/ItemGetModal';

// ★★★ エラー修正: importパスを './useWalkLogic' から './usWalkLogic' に変更 ★★★
import { useWalkLogic } from './usWalkLogic';
// ★★★ エラー修正: importパスを './utils' から './uitls' に変更 ★★★
import { getWalkMessage } from './uitls';

// ★リファクタリング: UI（ビュー）専用コンポーネント
function WalkPageComponent() {
    // ★★★ カスタムフックを呼び出して、ロジックと状態を受け取る ★★★
    const {
        weather,
        location,
        loading,
        error,
        obtainedItem,
        isItemModalOpen,
        dynamicBackgroundClass,
        handleModalClose,
        isNight, // ★★★ 変更点: isNight を受け取る ★★★
    } = useWalkLogic();

    // --- ▼▼▼ 追加: 名前をStateで管理し、ローカルストレージから取得 ▼▼▼ ---
    const [petName, setPetName] = useState("てんちゃん");

    useEffect(() => {
        const storedName = localStorage.getItem('otenki-gurashi-petName');
        if (storedName) {
            setPetName(storedName);
        }
    }, []);
    // --- ▲▲▲ 追加ここまで ▲▲▲ ---

    // ★★★ これより下は、受け取った状態を描画するだけのJSX ★★★

    // ★★★ 変更点: 夜間用のリンクとサブタイトル色 ★★★
    const linkColor = isNight ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-700';
    const subTitleColor = isNight ? 'text-gray-300' : 'text-slate-500';
    const titleColor = isNight ? 'text-white' : 'text-slate-800';
    const panelTextColor = isNight ? 'text-white' : 'text-slate-700'; // パネル内テキスト

    return (
        <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <ItemGetModal isOpen={isItemModalOpen} onClose={handleModalClose} itemName={obtainedItem.name} iconName={obtainedItem.iconName} rarity={obtainedItem.rarity} />
            {/* ★★★ 変更点: main の文字色を動的に ★★★ */}
            <main className={`w-full max-w-sm h-[640px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : 'text-slate-700'} transition-colors duration-500 ${dynamicBackgroundClass}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>
                <div className="flex-grow flex flex-col p-6 items-center justify-between">
                    <div className="w-full">
                        {(!error || loading) && (
                            // ★★★ 変更点: linkColor を適用 ★★★
                            <Link href="/" className={`mb-6 inline-block text-sm ${linkColor} transition-colors`}>← ホーム</Link>
                        )}
                        <header className="mb-8 text-center">
                            {/* ★★★ 変更点: titleColor を適用 ★★★ */}
                            <h1 className={`text-3xl font-extrabold ${titleColor} tracking-wider`}>
                                {loading ? 'おさんぽ準備中...' : error ? 'おさんぽ失敗...' : 'おさんぽ中...'}
                            </h1>
                            {/* ★★★ 変更点: subTitleColor を適用 ★★★ */}
                            <p className={`${subTitleColor} mt-1`}>{location}</p>
                        </header>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-grow p-4">
                        {loading ? (
                            <div className="animate-pulse text-center">
                                <div className="w-40 h-40 rounded-full bg-white/50 p-2 mb-4 mx-auto"></div>
                                {/* ★★★ 変更点: panelTextColor を適用し、名前を動的に表示 ★★★ */}
                                <p className={panelTextColor}>{petName} 準備中...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center">
                                <div className="w-40 h-40 rounded-full bg-white p-2 mb-4 mx-auto">
                                    <CharacterFace mood={'sad'} />
                                </div>
                                <p className="text-red-600 bg-red-100 p-3 rounded-lg shadow-sm">{error}</p>
                                <Link href="/" className="mt-4 inline-block bg-gray-900 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-gray-700 transition-colors">
                                    ホームへもどる
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4"><WeatherIcon type={weather || 'sunny'} size={60} /></div>
                                <div className="w-40 h-40 rounded-full bg-white p-2 mb-4">
                                    <CharacterFace mood={'happy'} />
                                </div>
                                <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl shadow-md max-w-xs text-center">
                                    {/* ★★★ 変更点: パネル内の文字色は変更しない (白背景のため) ★★★ */}
                                    <p className="text-slate-700 font-medium">{getWalkMessage(weather || undefined)}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {!error && <Footer />}
            </main>
        </div>
    );
}

// Suspense でラップする部分は変更なし
export default function WalkPage() {
    return (
        <Suspense fallback={<div className="w-full min-h-screen flex items-center justify-center">ローディング中...</div>}>
            <WalkPageComponent />
        </Suspense>
    );
}