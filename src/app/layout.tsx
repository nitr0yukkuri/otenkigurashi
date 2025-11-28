// src/app/layout.tsx

import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const rounded_mplus = M_PLUS_Rounded_1c({
    subsets: ["latin"],
    weight: ["400", "500", "800"],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "おてんきぐらし",
    description: "あなたの「今」とつながる、新しい癒やしの体験。",
    icons: {
        icon: '/icon.png',
        shortcut: '/favicon.ico',
    },
    manifest: "/manifest.json",
};

// ★変更点: 型定義(: Viewport)をあえて外してエラーを回避
export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover", // iPhaoneのノッチまで広げる設定
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body className={rounded_mplus.className}>
                <div className="hidden bg-sunny bg-cloudy bg-rainy bg-snowy bg-night bg-green-100"></div>

                {/* ★追加: 手書き風加工用のSVGフィルター定義 (画面には表示しない) */}
                <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                    <defs>
                        <filter id="hand-drawn-filter">
                            {/* ノイズを生成して輪郭を揺らす */}
                            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                        </filter>
                    </defs>
                </svg>

                {children}
            </body>
        </html>
    );
}