import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { generationHistory } from '@/storage/database/shared/schema';
import { eq, desc } from 'drizzle-orm';

// 获取用户的历史记录
export async function GET(request: NextRequest) {
  try {
    // 如果没有数据库连接，返回空列表
    if (!db) {
      return NextResponse.json({
        success: true,
        data: { list: [], page: 1, pageSize: 20 },
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const feature = searchParams.get('feature');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const userId = request.headers.get('x-user-id') || 'anonymous';

    const history = await db
      .select()
      .from(generationHistory)
      .where(feature ? eq(generationHistory.feature, feature) : eq(generationHistory.userId, userId))
      .orderBy(desc(generationHistory.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const formattedHistory = history.map((item: any) => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        list: formattedHistory,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json(
      { success: false, error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}

// 保存生成记录
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({
        success: true,
        data: { id: Date.now().toString() },
        message: 'Mock mode: record saved locally',
      });
    }

    const body = await request.json();
    const { userId, feature, title, input, output, thumbnail, status } = body;

    if (!userId || !feature) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const result = await db.insert(generationHistory).values({
      userId,
      feature,
      title: title || `${feature}_${Date.now()}`,
      input: input || {},
      output: output || {},
      thumbnail,
      status: status || 'completed',
    }).returning();

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('保存历史记录失败:', error);
    return NextResponse.json(
      { success: false, error: '保存历史记录失败' },
      { status: 500 }
    );
  }
}
