import { NextRequest, NextResponse } from "next/server";
import { adminManager } from "@/storage/database";

export async function POST(request: NextRequest) {
  try {
    // 初始化超级管理员
    const admin = await adminManager.initSuperAdmin();
    
    if (admin) {
      return NextResponse.json({
        success: true,
        message: "超级管理员创建成功",
        data: {
          username: admin.username,
          password: "admin123",
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "超级管理员已存在，无需创建",
      });
    }
  } catch (error: any) {
    console.error("初始化管理员失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "初始化失败" },
      { status: 500 }
    );
  }
}
