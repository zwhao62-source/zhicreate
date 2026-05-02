import { eq, and, desc, like, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { users, insertUserSchema, updateUserSchema, loginLogs, insertLoginLogSchema } from "./shared/schema";
import type { User, InsertUser, UpdateUser } from "./shared/schema";
import * as schema from "./shared/schema";

// 密码加密（简单版，生产环境用 bcrypt）
export function hashPassword(password: string): string {
  // 简单哈希，生产环境请用 bcrypt
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password + 'zhicreate_salt').digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export class UserManager {
  // 创建用户
  async createUser(data: InsertUser & { password?: string }): Promise<User> {
    const db = await getDb(schema);
    const validated = insertUserSchema.parse(data);
    const hashedPassword = data.password ? hashPassword(data.password) : null;
    const [user] = await db.insert(users).values({
      ...validated,
      password: hashedPassword,
    }).returning();
    return user;
  }

  // 获取用户列表
  async getUsers(options: {
    skip?: number;
    limit?: number;
    search?: string;
    plan?: string;
    status?: string;
  } = {}): Promise<User[]> {
    const { skip = 0, limit = 20, search, plan, status } = options;
    const db = await getDb(schema);
    const conditions = [];
    
    if (search) {
      conditions.push(
        sql`(${users.email} ILIKE ${'%' + search + '%'} OR ${users.name} ILIKE ${'%' + search + '%'} OR ${users.phone} ILIKE ${'%' + search + '%'})`
      );
    }
    if (plan) {
      conditions.push(eq(users.plan, plan));
    }
    if (status) {
      conditions.push(eq(users.status, status));
    }

    return db.query.users.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(users.createdAt)],
      limit,
      offset: skip,
    });
  }

  // 获取用户总数
  async getUserCount(options: {
    search?: string;
    plan?: string;
    status?: string;
  } = {}): Promise<number> {
    const { search, plan, status } = options;
    const db = await getDb(schema);
    const conditions = [];
    
    if (search) {
      conditions.push(
        sql`(${users.email} ILIKE ${'%' + search + '%'} OR ${users.name} ILIKE ${'%' + search + '%'})`
      );
    }
    if (plan) {
      conditions.push(eq(users.plan, plan));
    }
    if (status) {
      conditions.push(eq(users.status, status));
    }

    const result = await db.select({ count: sql<number>`count(*)` }).from(users).where(
      conditions.length > 0 ? and(...conditions) : undefined
    );
    return Number(result[0]?.count) || 0;
  }

  // 根据ID获取用户
  async getUserById(id: string): Promise<User | null> {
    const db = await getDb(schema);
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user || null;
  }

  // 根据邮箱获取用户
  async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDb(schema);
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user || null;
  }

  // 根据手机获取用户
  async getUserByPhone(phone: string): Promise<User | null> {
    const db = await getDb(schema);
    const user = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });
    return user || null;
  }

  // 更新用户
  async updateUser(id: string, data: UpdateUser): Promise<User | null> {
    const db = await getDb(schema);
    const validated = updateUserSchema.parse(data);
    const [user] = await db
      .update(users)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  // 更新会员等级
  async updateUserPlan(id: string, plan: string, expiresAt?: Date): Promise<User | null> {
    const db = await getDb(schema);
    const [user] = await db
      .update(users)
      .set({ plan, expiresAt: expiresAt || null, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  // 删除用户
  async deleteUser(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 用户登录验证
  async validateLogin(email: string, password: string, ip?: string, userAgent?: string): Promise<User | null> {
    const db = await getDb(schema);
    const user = await this.getUserByEmail(email);
    
    if (!user || !user.password) {
      await this.logLogin(user?.id || null, email, ip, userAgent, 'failed', 'user_not_found');
      return null;
    }

    if (!verifyPassword(password, user.password)) {
      await this.logLogin(user.id, email, ip, userAgent, 'failed', 'wrong_password');
      return null;
    }

    if (user.status === 'banned') {
      await this.logLogin(user.id, email, ip, userAgent, 'failed', 'user_banned');
      return null;
    }

    await this.logLogin(user.id, email, ip, userAgent, 'success');
    return user;
  }

  // 记录登录日志
  async logLogin(
    userId: string | null,
    email: string,
    ip?: string,
    userAgent?: string,
    status?: string,
    reason?: string
  ): Promise<void> {
    const db = await getDb(schema);
    await db.insert(loginLogs).values({
      userId,
      email,
      ip,
      userAgent,
      status: status || 'success',
      reason,
    });
  }

  // 获取用户登录日志
  async getLoginLogs(userId: string, limit = 10): Promise<any[]> {
    const db = await getDb(schema);
    return db.query.loginLogs.findMany({
      where: eq(loginLogs.userId, userId),
      orderBy: [desc(loginLogs.createdAt)],
      limit,
    });
  }

  // 获取统计数据
  async getStats(): Promise<{
    total: number;
    active: number;
    trial: number;
    paid: number;
    newToday: number;
  }> {
    const db = await getDb(schema);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [activeResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, 'active'));
    const [trialResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.plan, 'trial'));
    const [paidResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.plan} NOT IN ('trial', 'free')`);
    const [newTodayResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.createdAt} >= ${today}`);

    return {
      total: Number(totalResult?.count) || 0,
      active: Number(activeResult?.count) || 0,
      trial: Number(trialResult?.count) || 0,
      paid: Number(paidResult?.count) || 0,
      newToday: Number(newTodayResult?.count) || 0,
    };
  }
}

export const userManager = new UserManager();
