// src/app/api/progress/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const FIXED_USER_ID = "default_user";

    try {
        const progress = await prisma.userProgress.upsert({
            where: { userId: FIXED_USER_ID },
            update: {},
            create: {
                userId: FIXED_USER_ID,
                walkCount: 0
            },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Failed to fetch user progress:", error);
        return NextResponse.json({ message: '進捗情報の取得に失敗しました。' }, { status: 500 });
    }
}