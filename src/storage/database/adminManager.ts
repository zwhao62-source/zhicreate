import { eq, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { admins, adminLogs, insertAdminSchema, updateAdminSchema, insertAdminLogSchema } from "./shared/schema";
import type { Admin, InsertAdmin, UpdateAdmin } from "./shared/schema";
import * as schema from "./shared/schema";

// 密码加密
function hashPassword(password: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password + 'zhicreate_admin_salt').digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export class AdminManager {
  // 创建管理员
  async createAdmin(data: InsertAdmin): Promise<Admin> {
    const db = await getDb(schema);
    const validated = insertAdminSchema.parse(data);
    const [admin] = await db.insert(admins).values({
      ...validated,
      password: hashPassword(data.password || 'admin123'),
    }).returning();
    return admin;
  }

  // 管理员登录验证
  async validateLogin(username: string, password: string, ip?: string): Promise<Admin | null> {
    const db = await getDb(schema);
    const admin = await db.query.admins.findFirst({
      where: eq(admins.username, username),
    });

    if (!admin || !verifyPassword(password, admin.password)) {
      return null;
    }

    // 更新最后登录时间
    await db.update(admins)
      .set({ lastLoginAt: new Date() })
      .where(eq(admins.id, admin.id));

    // 记录日志
    await this.logAction(admin.id, 'login', undefined, undefined, { username }, ip);

    return admin;
  }

  // 获取管理员列表
  async getAdmins(options: {
    skip?: number;
    limit?: number;
    role?: string;
  } = {}): Promise<Admin[]> {
    const { skip = 0, limit = 20, role } = options;
    const db = await getDb(schema);
    
    return db.query.admins.findMany({
      where: role ? eq(admins.role, role) : undefined,
      orderBy: [desc(admins.createdAt)],
      limit,
      offset: skip,
    });
  }

  // 根据ID获取管理员
  async getAdminById(id: string): Promise<Admin | null> {
    const db = await getDb(schema);
    const admin = await db.query.admins.findFirst({
      where: eq(admins.id, id),
    });
    return admin || null;
  }

  // 根据用户名获取管理员
  async getAdminByUsername(username: string): Promise<Admin | null> {
    const db = await getDb(schema);
    const admin = await db.query.admins.findFirst({
      where: eq(admins.username, username),
    });
    return admin || null;
  }

  // 更新管理员
  async updateAdmin(id: string, data: UpdateAdmin): Promise<Admin | null> {
    const db = await getDb(schema);
    const validated = updateAdminSchema.parse(data);
    const [admin] = await db
      .update(admins)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(admins.id, id))
      .returning();
    return admin || null;
  }

  // 修改密码
  async changePassword(id: string, newPassword: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db
      .update(admins)
      .set({ password: hashPassword(newPassword), updatedAt: new Date() })
      .where(eq(admins.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 删除管理员
  async deleteAdmin(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(admins).where(eq(admins.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 记录操作日志
  async logAction(
    adminId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: any,
    ip?: string
  ): Promise<void> {
    const db = await getDb(schema);
    await db.insert(adminLogs).values({
      adminId,
      action,
      targetType,
      targetId,
      details,
      ip,
    });
  }

  // 获取操作日志
  async getAdminLogs(options: {
    skip?: number;
    limit?: number;
    adminId?: string;
    action?: string;
  } = {}): Promise<any[]> {
    const { skip = 0, limit = 50, adminId, action } = options;
    const db = await getDb(schema);
    
    return db.query.adminLogs.findMany({
      where: adminId ? eq(adminLogs.adminId, adminId) : undefined,
      orderBy: [desc(adminLogs.createdAt)],
      limit,
      offset: skip,
    });
  }

  // 检查权限
  hasPermission(admin: Admin, permission: string): boolean {
    if (admin.role === 'super_admin') return true;
    if (!admin.permissions) return false;
    const perms = admin.permissions as string[];
    return perms.includes(permission) || perms.includes('all');
  }

  // 初始化超级管理员（如果不存在）
  async initSuperAdmin(): Promise<Admin | null> {
    const existing = await this.getAdminByUsername('admin');
    if (existing) return null;

    return this.createAdmin({
      username: 'admin',
      password: 'admin123', // 首次需要修改
      name: '超级管理员',
      role: 'super_admin',
      permissions: ['all'],
    });
  }
}

export const adminManager = new AdminManager();
