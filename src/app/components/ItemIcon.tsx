// src/app/components/ItemIcon.tsx

import * as Io5 from "react-icons/io5";
import * as Bs from "react-icons/bs";
import * as Fa from "react-icons/fa";
import * as Gi from "react-icons/gi";

// ★ カスタムアイコンをインポート
import TeruTeruIcon from './TeruTeruIcon';
import BugNetIcon from './BugNetIcon';
import RainbowNecklaceIcon from './RainbowNecklacelcon';


const AllIcons = { ...Io5, ...Bs, ...Fa, ...Gi };

// 日本語名をReactアイコン名に変換するマップ
const jpToIconName: { [key: string]: string } = {
    '小枝': 'GiTreeBranch',
    'GiStickSplinter': 'GiTreeBranch',
};

// 各アイコンのデフォルト色定義
const iconColorMap: { [key: string]: string } = {
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
    'GiTreeBranch': '#8B4513',
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
    'FaKey': '#60a5fa',
    'IoBodyOutline': '#60a5fa',
    'GiClover': '#60a5fa',
    'IoPaperPlaneOutline': '#60a5fa',
    'GiIceCube': '#60a5fa',
    'GiPaperLantern': '#60a5fa',
    'GiNightSky': '#60a5fa',
    'GiRainbowStar': '#a855f7',
    'GiElectric': '#a855f7',
    'BsMoonStarsFill': '#a855f7',
    'GiSandsOfTime': '#f59e0b',
};

const rarityColorMap: { [key: string]: string } = {
    'normal': '#808080',
    'uncommon': '#34d399',
    'rare': '#60a5fa',
    'epic': '#a855f7',
    'legendary': '#f59e0b',
};

export default function ItemIcon({ name, rarity = 'normal', size = 24 }: { name: string | null; rarity?: string; size?: number }) {
    const iconName = (name && jpToIconName[name]) ? jpToIconName[name] : name;

    // ★ カスタムアイコンへの分岐処理を一括管理
    if (iconName === 'GiGhost') {
        return <TeruTeruIcon size={size} />;
    }
    if (iconName === 'GiFishingNet') {
        return <BugNetIcon size={size} />;
    }
    if (iconName === 'GiNecklace') {
        return <RainbowNecklaceIcon size={size} />;
    }


    let iconColor = (iconName && iconColorMap[iconName])
        ? iconColorMap[iconName]
        : rarityColorMap[rarity] ?? rarityColorMap.normal;

    if (!iconName || !AllIcons[iconName as keyof typeof AllIcons] || iconName === 'IoHelpCircle') {
        iconColor = iconColorMap['IoHelpCircle'];
        return <Io5.IoHelpCircle size={size * 2} color={iconColor} className="hand-drawn-style" />;
    }

    const IconComponent = AllIcons[iconName as keyof typeof AllIcons];

    return <IconComponent size={size} color={iconColor} className="hand-drawn-style" />;
}