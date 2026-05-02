import { NextRequest, NextResponse } from "next/server";
import { userManager } from "@/storage/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    // 获取 IP 和 User-Agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 验证登录
    const user = await userManager.validateLogin(email, password, ip, userAgent);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 检查会员是否过期
    let status = user.status;
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      status = "expired";
    }

    // 生成简单的会话 token（生产环境用 JWT）
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          plan: user.plan,
          status,
          expiresAt: user.expiresAt,
        },
      },
    });
  } catch (error: any) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "登录失败" },
      { status: 500 }
    );
  }
}
