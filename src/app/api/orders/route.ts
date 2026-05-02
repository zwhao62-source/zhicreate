import { NextRequest, NextResponse } from "next/server";
import { orderManager, userManager } from "@/storage/database";

// 获取当前用户 token
function getUserId(request: NextRequest): string | null {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  
  try {
    const [userId] = Buffer.from(token, "base64").toString().split(":");
    return userId;
  } catch {
    return null;
  }
}

// 获取用户订单列表
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    const orders = await orderManager.getOrders({ userId });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("获取订单失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取订单失败" },
      { status: 500 }
    );
  }
}

// 创建订单（模拟支付流程）
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, period } = body;

    // 会员价格配置（分）
    const prices: Record<string, { monthly: number; yearly: number }> = {
      personal: { monthly: 3900, yearly: 27300 },
      professional: { monthly: 9900, yearly: 69300 },
      enterprise: { monthly: 19900, yearly: 139300 },
    };

    if (!prices[plan]) {
      return NextResponse.json({ success: false, error: "无效的会员等级" }, { status: 400 });
    }

    const amount = period === 'yearly' ? prices[plan].yearly : prices[plan].monthly;
    const duration = period === 'yearly' ? 365 : 30;

    // 创建订单
    const order = await orderManager.createPaymentOrder(
      userId,
      plan,
      (amount / 100).toFixed(2), // 转为元
      period,
      duration,
      'mock' // 模拟支付
    );

    // 模拟支付成功（实际需要对接支付平台）
    const paidOrder = await orderManager.markAsPaid(order.id, `MOCK_${Date.now()}`);

    // 更新用户会员等级
    if (paidOrder) {
      const user = await userManager.getUserById(userId);
      let expiresAt = new Date();
      
      if (user?.expiresAt && new Date(user.expiresAt) > new Date()) {
        // 累加时间
        expiresAt = new Date(user.expiresAt);
      }
      expiresAt.setDate(expiresAt.getDate() + duration);
      
      await userManager.updateUserPlan(userId, plan, expiresAt);
    }

    return NextResponse.json({
      success: true,
      data: paidOrder,
    });
  } catch (error: any) {
    console.error("创建订单失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "创建订单失败" },
      { status: 500 }
    );
  }
}
