import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 固定ID: 1 でupsert
        const progress = await prisma.userProgress.upsert({
            where: { id: 1 },
            update: {},
            // ★修正: id: 1 を削除
            create: { walkCount: 0 },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Failed to fetch user progress:", error);
        return NextResponse.json({ message: '進捗情報の取得に失敗しました。' }, { status: 500 });
    }
}