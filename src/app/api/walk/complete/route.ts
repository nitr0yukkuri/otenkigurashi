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
    let weather: string;
    let userId: string;

    try {
        const body = await request.json();
        weather = body.weather || 'sunny';
        userId = body.userId;
    } catch (error) {
        return NextResponse.json({ message: 'リクエストが無効です。' }, { status: 400 });
    }

    if (!userId) {
        return NextResponse.json({ message: 'ユーザーIDが必要です。' }, { status: 400 });
    }

    // ★修正: 日付取得をトランザクションの外に移動
    const now = new Date();

    try {
        const progress = await prisma.$transaction(async (tx) => {
            const currentProgress: UserProgress | null = await tx.userProgress.findUnique({
                where: { userId: userId },
            });

            const progressData: UserProgress = currentProgress || {
                id: 0,
                userId: userId,
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

            let consecutiveDays = progressData.consecutiveWalkDays;

            if (progressData.lastWalkDate) {
                const lastWalk = new Date(progressData.lastWalkDate);
                if (isSameDay(lastWalk, now)) {
                    return await tx.userProgress.update({
                        where: { userId: userId },
                        data: { walkCount: { increment: 1 } },
                    });
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

            return await tx.userProgress.upsert({
                where: { userId: userId },
                update: updateData,
                create: {
                    userId: userId,
                    walkCount: 1,
                    lastWalkDate: now,
                    consecutiveWalkDays: 1,
                    ...((weatherKey in progressData) ? { [weatherKey]: 1 } : { sunnyWalkCount: 1 })
                },
            });
        });

        return NextResponse.json({ message: 'おさんぽ回数を更新しました。', progress });
    } catch (error) {
        console.error("Failed to update walk count:", error);
        return NextResponse.json({ message: 'おさんぽ回数の更新に失敗しました。' }, { status: 500 });
    }
}