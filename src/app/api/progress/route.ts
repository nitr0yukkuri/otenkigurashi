// src/app/api/progress/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: 'ユーザーIDが必要です。' }, { status: 400 });
        }

        const progress = await prisma.userProgress.upsert({
            where: { userId: userId },
            update: {},
            create: {
                userId: userId,
                walkCount: 0
            },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Failed to fetch user progress:", error);
        return NextResponse.json({ message: '進捗情報の取得に失敗しました。' }, { status: 500 });
    }
}