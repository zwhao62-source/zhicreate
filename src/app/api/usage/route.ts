import { NextRequest, NextResponse } from "next/server";
import { usageManager, userManager, FEATURES } from "@/storage/database";

// 获取当前用户 token
async function getUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  
  try {
    const [userId] = Buffer.from(token, "base64").toString().split(":");
    return await userManager.getUserById(userId);
  } catch {
    return null;
  }
}

// 获取使用量统计
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    const [totalUsage, trend, limits] = await Promise.all([
      usageManager.getTotalUsage(user.id),
      usageManager.getUsageTrend(user.id, 7),
      Promise.all(
        Object.values(FEATURES).map(async (feature) => ({
          feature,
          ...(await usageManager.checkLimit(user.id, feature, user.plan)),
        }))
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsage,
        trend,
        limits,
        plan: user.plan,
      },
    });
  } catch (error: any) {
    console.error("获取使用量失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取使用量失败" },
      { status: 500 }
    );
  }
}

// 记录使用（各功能调用时触发）
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const { feature, count = 1 } = body;

    if (!Object.values(FEATURES).includes(feature)) {
      return NextResponse.json({ success: false, error: "无效的功能" }, { status: 400 });
    }

    // 检查限制
    const limitCheck = await usageManager.checkLimit(user.id, feature, user.plan);
    
    if (!limitCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: "今日使用量已用完，请升级会员",
        data: limitCheck,
      }, { status: 403 });
    }

    // 记录使用
    const usage = await usageManager.recordUsage(user.id, feature, count);

    return NextResponse.json({
      success: true,
      data: {
        used: usage.count,
        remaining: limitCheck.remaining,
      },
    });
  } catch (error: any) {
    console.error("记录使用量失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "记录使用量失败" },
      { status: 500 }
    );
  }
}
