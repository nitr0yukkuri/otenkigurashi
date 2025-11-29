// src/app/hooks/useSound.ts

'use client';

import { useCallback } from 'react';
import { STORAGE_KEYS } from '../settings/constants';

export const useSound = () => {
    // ★修正: playSfx の実装を空の関数に変更し、効果音の再生を無効化
    const playSfx = useCallback((fileName: string) => {
        // 効果音を再生しない
    }, []);

    return { playSfx };
};