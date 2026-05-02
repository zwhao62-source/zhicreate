import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { generationHistory } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

// 获取单个历史记录详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
      }, { status: 500 });
    }

    const { id } = await params;
    
    const history = await db
      .select()
      .from(generationHistory)
      .where(eq(generationHistory.id, id))
      .limit(1);

    if (!history || history.length === 0) {
      return NextResponse.json(
        { success: false, error: '历史记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: history[0],
    });
  } catch (error) {
    console.error('获取历史记录详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取历史记录详情失败' },
      { status: 500 }
    );
  }
}

// 删除历史记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Mock mode: deleted',
      });
    }

    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    const history = await db
      .select()
      .from(generationHistory)
      .where(eq(generationHistory.id, id))
      .limit(1);

    if (!history || history.length === 0) {
      return NextResponse.json(
        { success: false, error: '历史记录不存在' },
        { status: 404 }
      );
    }

    if (history[0].userId !== userId && userId !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权删除此记录' },
        { status: 403 }
      );
    }

    await db.delete(generationHistory).where(eq(generationHistory.id, id));

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除历史记录失败:', error);
    return NextResponse.json(
      { success: false, error: '删除历史记录失败' },
      { status: 500 }
    );
  }
}
