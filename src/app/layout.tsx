{
    type: uploaded file
    fileName: nitr0yukkuri / otenkigurashi / otenkigurashi - 176ea764383a7ee2771e998b46d773a95a5ecc57 / src / app / layout.tsx
    fullContent:
    // src/app/layout.tsx
    import type { Metadata, Viewport } from "next";
    import { M_PLUS_Rounded_1c } from "next/font/google";
    import "./globals.css";
    // import SessionProviderWrapper from './components/SessionProviderWrapper'; // ★ 削除

    const rounded_mplus = M_PLUS_Rounded_1c({
        subsets: ["latin"],
        weight: ["400", "500", "800"],
        display: 'swap',
    });

    // ★ Metadata を修正してアイコンを指定 (こちらが App Router の推奨方法)
    export const metadata: Metadata = {
        title: "おてんきぐらし", // タイトルも変更しておくと良いでしょう
        description: "あなたの「今」とつながる、新しい癒やしの体験。", // 説明も変更
        // --- ▼▼▼ ファビコン設定を追 ▼▼▼ ---
        icons: {
            icon: '/icon.png', // /public/icon.png を参照 (推奨)
            shortcut: '/favicon.ico', // /public/favicon.ico を参照
            // apple: '/apple-icon.png', // 必要であればApple用アイコンも
            // other: { // その他のアイコンタイプが必要な場合
            //   rel: '...',
            //   url: '...',
            // },
        },
        // --- ▲▲▲ ファビコン設定ここまで ▲▲▲ ---

        // --- ▼▼▼ 変更点 (PWA対応) ▼▼▼ ---
        manifest: "/manifest.json",
        // --- ▲▲▲ 変更点ここまで ▲▲▲ ---
    };

    // ★★★ 追加: PWA用のビューポート設定 (iPhone 15対応) ★★★
    export const viewport: Viewport = {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: "cover", // ノッチエリアまで背景を広げる
    };

    export default function RootLayout({
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
        return (
            <html lang="ja">
                {/*
              もし Metadata オブジェクトでの指定がうまく機能しない古いブラウザ向けに
              <head> タグに直接 <link> タグを追加することも可能です。
              通常は Metadata オブジェクトでの指定で十分です。
              <head>
                <link rel="icon" type="image/png" href="/icon.png" />
                <link rel="shortcut icon" href="/favicon.ico" />
              </head>
            */}
                <body className={rounded_mplus.className}>
                    {/* ★ SessionProviderWrapper のラップを解除 */}
                    <div className="hidden bg-sunny bg-cloudy bg-rainy bg-snowy bg-night bg-green-100"></div>
                    {children}
                </body>
            </html>
        );
    }
}