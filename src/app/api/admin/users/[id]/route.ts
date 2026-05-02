import { NextRequest, NextResponse } from "next/server";
import { userManager, adminManager, orderManager, usageManager } from "@/storage/database";

// 验证管理员权限
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  
  const [adminId] = Buffer.from(token, "base64").toString().split(":");
  return adminManager.getAdminById(adminId);
}

// 获取用户详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
    const user = await userManager.getUserById(id);
    
    if (!user) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 });
    }

    // 获取用户的订单
    const orders = await orderManager.getOrders({ userId: id, limit: 10 });
    
    // 获取使用统计
    const usage = await usageManager.getUserUsage(id);

    // 获取登录日志
    const loginLogs = await userManager.getLoginLogs(id, 5);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          avatar: user.avatar,
          plan: user.plan,
          status: user.status,
          expiresAt: user.expiresAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        orders,
        usage,
        loginLogs,
      },
    });
  } catch (error: any) {
    console.error("获取用户详情失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取用户详情失败" },
      { status: 500 }
    );
  }
}

// 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    if (!adminManager.hasPermission(admin, 'user_update')) {
      return NextResponse.json({ success: false, error: "没有权限" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { plan, status, expiresAt, name, ...otherFields } = body;

    // 单独处理会员等级和到期时间
    if (plan || expiresAt) {
      await userManager.updateUserPlan(id, plan, expiresAt ? new Date(expiresAt) : undefined);
    }

    // 更新其他字段
    if (Object.keys(otherFields).length > 0) {
      await userManager.updateUser(id, otherFields);
    }

    // 记录操作日志
    await adminManager.logAction(admin.id, 'update', 'user', id, { plan, status, name });

    const user = await userManager.getUserById(id);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("更新用户失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "更新用户失败" },
      { status: 500 }
    );
  }
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    if (!adminManager.hasPermission(admin, 'user_delete')) {
      return NextResponse.json({ success: false, error: "没有权限" }, { status: 403 });
    }

    const { id } = await params;
    const success = await userManager.deleteUser(id);

    if (!success) {
      return NextResponse.json({ success: false, error: "删除失败" }, { status: 400 });
    }

    // 记录操作日志
    await adminManager.logAction(admin.id, 'delete', 'user', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("删除用户失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "删除用户失败" },
      { status: 500 }
    );
  }
}
