// src/app/api/progress/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const progress = await prisma.userProgress.upsert({
            where: { id: 1 }, // userId -> id: 1 に変更
            update: {},
            create: {
                id: 1, // 固定ID
                walkCount: 0
            },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Failed to fetch user progress:", error);
        return NextResponse.json({ message: '進捗情報の取得に失敗しました。' }, { status: 500 });
    }
}