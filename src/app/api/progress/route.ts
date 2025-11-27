import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // ★ ヘッダーからユーザーIDを取得
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        // 初回などでIDがない場合は空の初期データを返す（保存はしない）
        return NextResponse.json({
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
        });
    }

    try {
        // ★ ユーザーIDを使って upsert（なければ作成、あれば取得）
        const progress = await prisma.userProgress.upsert({
            where: { userId: userId },
            update: {},
            create: { userId: userId, walkCount: 0 },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Failed to fetch user progress:", error);
        return NextResponse.json({ message: '進捗情報の取得に失敗しました。' }, { status: 500 });
    }
}