'use client';

import { useCallback } from 'react';
import { STORAGE_KEYS } from '../settings/constants';

export const useSound = () => {
    const playSfx = useCallback((fileName: string) => {
        // ローカルストレージから音量設定を取得 (デフォルトは50%)
        const storedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME_SFX);
        const volume = storedVolume ? parseInt(storedVolume, 10) / 100 : 0.5;

        // 音量が0の場合は再生しない
        if (volume === 0) return;

        // 音声ファイルを再生
        const audio = new Audio(`/sounds/${fileName}`);
        audio.volume = volume;
        audio.play().catch((e) => {
            console.error("再生エラー:", e);
            // ユーザーインタラクションがない状態での自動再生などでエラーになる場合があります
        });
    }, []);

    return { playSfx };
};