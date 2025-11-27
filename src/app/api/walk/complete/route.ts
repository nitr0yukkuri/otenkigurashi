// src/app/api/walk/complete/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import type { UserProgress } from '@prisma/client';

export const dynamic = 'force-dynamic';

const isConsecutiveDay = (lastWalk: Date, now: Date) => {
    const last = new Date(lastWalk.getFullYear(), lastWalk.getMonth(), lastWalk.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = today.getTime() - last.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
};

const isSameDay = (lastWalk: Date, now: Date) => {
    return lastWalk.getFullYear() === now.getFullYear() &&
        lastWalk.getMonth() === now.getMonth() &&
        lastWalk.getDate() === now.getDate();
};

export async function POST(request: Request) {
    const FIXED_USER_ID = "default_user"; // 固定ID

    let weather: string;
    try {
        const body = await request.json();
        weather = body.weather || 'sunny';
    } catch (error) {
        weather = 'sunny';
    }

    try {
        const currentProgress: UserProgress | null = await prisma.userProgress.findUnique({
            where: { userId: FIXED_USER_ID },
        });

        const progressData: UserProgress = currentProgress || {
            id: 0, // ダミー
            userId: FIXED_USER_ID,
            walkCount: 0,
            sunnyWalkCount: 0,
            clearWalkCount: 0,
            rainyWalkCount: 0,
            cloudyWalkCount: 0,
            snowyWalkCount: 0,
            thunderstormWalkCount: 0,
            windyWalkCount: 0,
            nightWalkCount: 0,
            collectedItemTypesCount: 0,
            collectedNormalItemTypesCount: 0,
            collectedUncommonItemTypesCount: 0,
            collectedRareItemTypesCount: 0,
            collectedEpicItemTypesCount: 0,
            collectedLegendaryItemTypesCount: 0,
            consecutiveWalkDays: 0,
            lastWalkDate: null,
        };

        const now = new Date();
        let consecutiveDays = progressData.consecutiveWalkDays;

        if (progressData.lastWalkDate) {
            const lastWalk = new Date(progressData.lastWalkDate);
            if (isSameDay(lastWalk, now)) {
                const progress = await prisma.userProgress.update({
                    where: { userId: FIXED_USER_ID },
                    data: { walkCount: { increment: 1 } },
                });
                return NextResponse.json({ message: 'おさんぽ回数を更新しました（同日）。', progress });
            } else if (isConsecutiveDay(lastWalk, now)) {
                consecutiveDays += 1;
            } else {
                consecutiveDays = 1;
            }
        } else {
            consecutiveDays = 1;
        }

        const weatherKey = `${weather}WalkCount` as keyof UserProgress;
        const updateData: any = {
            walkCount: { increment: 1 },
            lastWalkDate: now,
            consecutiveWalkDays: consecutiveDays,
        };

        if (weatherKey in progressData) {
            updateData[weatherKey] = { increment: 1 };
        }

        const progress = await prisma.userProgress.upsert({
            where: { userId: FIXED_USER_ID },
            update: updateData,
            create: {
                userId: FIXED_USER_ID,
                walkCount: 1,
                lastWalkDate: now,
                consecutiveWalkDays: 1,
                ...((weatherKey in progressData) ? { [weatherKey]: 1 } : { sunnyWalkCount: 1 })
            },
        });

        return NextResponse.json({ message: 'おさんぽ回数を更新しました。', progress });
    } catch (error) {
        console.error("Failed to update walk count:", error);
        return NextResponse.json({ message: 'おさんぽ回数の更新に失敗しました。' }, { status: 500 });
    }
}