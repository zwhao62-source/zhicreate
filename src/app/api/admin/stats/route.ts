import { NextRequest, NextResponse } from "next/server";
import { userManager, orderManager, usageManager } from "@/storage/database";

// 验证管理员权限
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  
  // 简单验证（生产环境用更安全的方式）
  if (!token) return null;
  return { id: 'admin' }; // 简化版
}

// 获取仪表盘统计数据
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const [userStats, orderStats, usageStats] = await Promise.all([
      userManager.getStats(),
      orderManager.getStats(),
      usageManager.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: userStats,
        orders: orderStats,
        usage: usageStats,
      },
    });
  } catch (error: any) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取统计数据失败" },
      { status: 500 }
    );
  }
}
