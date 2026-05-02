import { NextRequest, NextResponse } from "next/server";
import { userManager } from "@/storage/database";

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    // 简单解析 token（生产环境用 JWT 验证）
    const [userId] = Buffer.from(token, "base64").toString().split(":");
    
    const user = await userManager.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 }
      );
    }

    // 检查会员是否过期
    let status = user.status;
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      status = "expired";
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        status,
        expiresAt: user.expiresAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取用户信息失败" },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const [userId] = Buffer.from(token, "base64").toString().split(":");
    const body = await request.json();

    const user = await userManager.updateUser(userId, body);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        status: user.status,
        expiresAt: user.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("更新用户信息失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "更新用户信息失败" },
      { status: 500 }
    );
  }
}
