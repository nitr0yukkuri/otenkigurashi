// src/app/components/ItemIcon.tsx

import * as Io5 from "react-icons/io5";
import * as Bs from "react-icons/bs";
import * as Fa from "react-icons/fa";
import * as Gi from "react-icons/gi";

const AllIcons = { ...Io5, ...Bs, ...Fa, ...Gi };

// ★ 各アイコンのデフォルト色定義
// (レア度情報が渡されない場合でも、ここで定義されていればこの色が優先されます)
const iconColorMap: { [key: string]: string } = {
    // --- 天候・既存の設定 ---
    'IoSunny': '#FFC700',
    'BsSunFill': '#FFB300',
    'IoRainy': '#4682B4',
    'GiSnail': '#A0522D',
    'IoThunderstorm': 'gold',
    'IoCloudy': '#A0A0A0',
    'IoSnow': '#6495ED',
    'FaStar': '#FFD700',
    'GiWhirlwind': '#34d399',
    'IoHelpCircle': '#808080',

    // --- アンコモン (Uncommon: #34d399) ---
    'BsRecordCircleFill': '#34d399',
    'FaFeather': '#34d399',
    'GiSeaDragon': '#34d399',
    'GiButterfly': '#34d399',
    'BsGem': '#34d399',
    'IoWaterOutline': '#34d399',
    'GiGrass': '#34d399',
    'FaSnowflake': '#34d399',
    'GiSpiralShell': '#34d399',
    'GiSparkles': '#34d399',

    // --- レア (Rare: #60a5fa) ---
    // 'ちいさなカギ' など
    'FaKey': '#60a5fa',
    'IoBodyOutline': '#60a5fa',
    'GiClover': '#60a5fa',
    'IoPaperPlaneOutline': '#60a5fa',
    'GiIceCube': '#60a5fa',
    'GiPaperLantern': '#60a5fa',
    'GiNightSky': '#60a5fa',

    // --- エピック (Epic: #a855f7) ---
    'GiRainbowStar': '#a855f7',
    'GiElectric': '#a855f7',
    'BsMoonStarsFill': '#a855f7',

    // --- レジェンダリー (Legendary: #f59e0b) ---
    'GiSandsOfTime': '#f59e0b',
};

// ★ レア度に応じた色（主に汎用アイコン用）
const rarityColorMap: { [key: string]: string } = {
    'normal': '#808080',      // Gray
    'uncommon': '#34d399',    // Emerald / Green
    'rare': '#60a5fa',        // Blue
    'epic': '#a855f7',        // Purple
    'legendary': '#f59e0b',   // Amber / Gold
};


export default function ItemIcon({ name, rarity = 'normal', size = 24 }: { name: string | null; rarity?: string; size?: number }) {
    // 1. アイコン名に固有の色が設定されているか確認
    let iconColor = (name && iconColorMap[name])
        ? iconColorMap[name]
        // 2. 設定されていない場合はレア度に応じて色を決定
        : rarityColorMap[rarity] ?? rarityColorMap.normal;


    if (!name || !AllIcons[name as keyof typeof AllIcons]) {
        // 不明なアイテムは既存のデフォルト色を使用
        iconColor = iconColorMap['IoHelpCircle'];
        return <Io5.IoHelpCircle size={size} color={iconColor} />;
    }

    const IconComponent = AllIcons[name as keyof typeof AllIcons];

    return <IconComponent size={size} color={iconColor} />;
}