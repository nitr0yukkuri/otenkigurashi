// src/app/walk/utils.ts
// ★★★ 重要: 共通の weatherUtils からインポートするように変更 ★★★

import { mapWeatherType, getBackgroundGradientClass } from '../lib/weatherUtils';

// mapWeatherType は共通のものを使用
export { mapWeatherType };

// getBackgroundColorClass という名前で getBackgroundGradientClass をエクスポート（互換性のため）
export const getBackgroundColorClass = (weatherType?: string): string => {
    return getBackgroundGradientClass(weatherType as any);
};

export const getWalkMessage = (weatherType?: string): string => {
    switch (weatherType) {
        case 'sunny': return '太陽が気持ちいいね！何が見つかるかな？';
        case 'clear': return '雲ひとつない快晴だ！遠くまで見えるよ！';
        case 'rainy': return '雨だけど、特別な出会いがあるかも！しずくの音がきれい。';
        case 'cloudy': return 'くもりの日は、のんびりおさんぽにぴったり。';
        case 'snowy': return '雪だ！足跡をつけて歩こう！ふわふわ！';
        case 'thunderstorm': return 'すごい音！ちょっと怖いけど、珍しいものが見つかるかも？急いで探そう！';
        case 'windy': return '風が強いね！飛ばされないように気をつけて！';
        case 'night': return '夜のおさんぽは静かでいいね。星がきれい。';
        default: return 'てくてく…何が見つかるかな？';
    }
}

// ★修正: ステージIDに応じて名前を返すように変更
export const getWalkStage = (stageId?: string): string => {
    switch (stageId) {
        case 'sea': return '海辺';
        case 'mountain': return '山道';
        case 'default':
        default: return 'いつもの散歩道';
    }
}