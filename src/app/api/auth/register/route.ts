import { NextRequest, NextResponse } from "next/server";
import { userManager } from "@/storage/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await userManager.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 创建用户（status 使用默认值 "active"）
    const user = await userManager.createUser({
      email,
      password,
      name: name || email.split("@")[0],
      phone,
      plan: "trial",
    });

    // 设置体验过期时间（7天后）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await userManager.updateUserPlan(user.id, "trial", expiresAt);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        expiresAt: user.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "注册失败" },
      { status: 500 }
    );
  }
}
