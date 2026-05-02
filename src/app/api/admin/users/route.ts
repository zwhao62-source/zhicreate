import { NextRequest, NextResponse } from "next/server";
import { userManager, adminManager } from "@/storage/database";

// 验证管理员权限
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  
  const [adminId] = Buffer.from(token, "base64").toString().split(":");
  return adminManager.getAdminById(adminId);
}

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const plan = searchParams.get("plan") || undefined;
    const status = searchParams.get("status") || undefined;

    const [users, total] = await Promise.all([
      userManager.getUsers({ skip, limit, search, plan, status }),
      userManager.getUserCount({ search, plan, status }),
    ]);

    // 脱敏处理
    const safeUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      phone: u.phone ? u.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : null,
      name: u.name,
      plan: u.plan,
      status: u.status,
      expiresAt: u.expiresAt,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: safeUsers,
        total,
        skip,
        limit,
      },
    });
  } catch (error: any) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取用户列表失败" },
      { status: 500 }
    );
  }
}

// 创建用户（管理员手动添加）
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    if (!adminManager.hasPermission(admin, 'user_create')) {
      return NextResponse.json({ success: false, error: "没有权限" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, phone, plan, expiresAt } = body;

    // 检查邮箱是否已存在
    const existing = await userManager.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: "邮箱已存在" }, { status: 400 });
    }

    const user = await userManager.createUser({
      email,
      password: password || '123456',
      name,
      phone,
      plan: plan || 'trial',
    });

    if (expiresAt) {
      await userManager.updateUserPlan(user.id, plan || 'trial', new Date(expiresAt));
    }

    // 记录操作日志
    await adminManager.logAction(admin.id, 'create', 'user', user.id, { email, plan });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });
  } catch (error: any) {
    console.error("创建用户失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "创建用户失败" },
      { status: 500 }
    );
  }
}
