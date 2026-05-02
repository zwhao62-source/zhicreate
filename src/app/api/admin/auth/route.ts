import { NextRequest, NextResponse } from "next/server";
import { adminManager } from "@/storage/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // 验证登录
    const admin = await adminManager.validateLogin(username, password, ip);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 生成会话 token
    const token = Buffer.from(`${admin.id}:${Date.now()}`).toString("base64");

    return NextResponse.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
        },
      },
    });
  } catch (error: any) {
    console.error("管理员登录失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "登录失败" },
      { status: 500 }
    );
  }
}

// 获取管理员信息
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const [adminId] = Buffer.from(token, "base64").toString().split(":");
    
    const admin = await adminManager.getAdminById(adminId);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "管理员不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error: any) {
    console.error("获取管理员信息失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取管理员信息失败" },
      { status: 500 }
    );
  }
}
