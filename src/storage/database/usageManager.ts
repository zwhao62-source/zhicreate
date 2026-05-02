import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { usageStats, insertUsageStatsSchema } from "./shared/schema";
import type { UsageStats } from "./shared/schema";
import * as schema from "./shared/schema";

// 功能列表
export const FEATURES = {
  COPYWRITE: 'copywrite',           // 文案生成
  IMAGE_GENERATION: 'image',         // 图片生成
  VIDEO_GENERATION: 'video',         // 视频生成
  IMAGE_PROCESSING: 'image_process', // 图片处理
  MODEL_SWAP: 'model_swap',          // 模特换脸
  MODEL_TRAIN: 'model_train',        // 模特训练
  DETAIL_DESIGN: 'detail_design',    // 详情图设计
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];

// 会员等级限制
export const PLAN_LIMITS = {
  trial: { dailyLimit: 5, totalLimit: 50 },
  free: { dailyLimit: 10, totalLimit: 100 },
  personal: { dailyLimit: 50, totalLimit: 1000 },
  professional: { dailyLimit: 200, totalLimit: 5000 },
  enterprise: { dailyLimit: Infinity, totalLimit: Infinity },
} as const;

export class UsageManager {
  // 记录使用
  async recordUsage(userId: string, feature: string, count = 1): Promise<UsageStats> {
    const db = await getDb(schema);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查找今日记录
    const existing = await db.query.usageStats.findFirst({
      where: and(
        eq(usageStats.userId, userId),
        eq(usageStats.feature, feature),
        eq(usageStats.date, today)
      ),
    });

    if (existing) {
      // 更新计数
      const [updated] = await db
        .update(usageStats)
        .set({
          count: existing.count + count,
          updatedAt: new Date(),
        })
        .where(eq(usageStats.id, existing.id))
        .returning();
      return updated;
    } else {
      // 新建记录
      const [created] = await db.insert(usageStats).values({
        userId,
        feature,
        count,
        date: today,
      }).returning();
      return created;
    }
  }

  // 检查是否超过限制
  async checkLimit(userId: string, feature: string, plan: string): Promise<{
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
  }> {
    const db = await getDb(schema);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const planLimit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

    // 获取今日使用量
    const todayUsage = await db.query.usageStats.findFirst({
      where: and(
        eq(usageStats.userId, userId),
        eq(usageStats.feature, feature),
        eq(usageStats.date, today)
      ),
    });

    const used = todayUsage?.count || 0;
    const limit = planLimit.dailyLimit === Infinity ? -1 : planLimit.dailyLimit;
    const remaining = limit === -1 ? -1 : Math.max(0, limit - used);

    return {
      allowed: limit === -1 || used < limit,
      used,
      limit,
      remaining,
    };
  }

  // 获取用户使用统计
  async getUserUsage(userId: string, options: {
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<Record<string, number>> {
    const { startDate, endDate } = options;
    const db = await getDb(schema);
    const conditions = [eq(usageStats.userId, userId)];

    if (startDate) {
      conditions.push(gte(usageStats.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(usageStats.date, endDate));
    }

    const stats = await db.query.usageStats.findMany({
      where: and(...conditions),
    });

    // 按功能汇总
    const result: Record<string, number> = {};
    stats.forEach(stat => {
      result[stat.feature] = (result[stat.feature] || 0) + stat.count;
    });

    return result;
  }

  // 获取总使用量
  async getTotalUsage(userId: string): Promise<number> {
    const db = await getDb(schema);
    const result = await db.select({
      total: sql<number>`sum(${usageStats.count})`,
    }).from(usageStats).where(eq(usageStats.userId, userId));
    
    return Number(result[0]?.total) || 0;
  }

  // 获取使用趋势
  async getUsageTrend(userId: string, days = 7): Promise<{ date: string; counts: Record<string, number> }[]> {
    const db = await getDb(schema);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const stats = await db.query.usageStats.findMany({
      where: and(
        eq(usageStats.userId, userId),
        gte(usageStats.date, startDate)
      ),
      orderBy: [usageStats.date],
    });

    // 按日期分组
    const result: Record<string, Record<string, number>> = {};
    stats.forEach(stat => {
      const date = new Date(stat.date).toISOString().split('T')[0];
      if (!result[date]) {
        result[date] = {};
      }
      result[date][stat.feature] = (result[date][stat.feature] || 0) + stat.count;
    });

    return Object.entries(result).map(([date, counts]) => ({
      date,
      counts,
    }));
  }

  // 获取功能使用排行
  async getFeatureRanking(limit = 10): Promise<{ feature: string; totalCount: number }[]> {
    const db = await getDb(schema);
    const result = await db.select({
      feature: usageStats.feature,
      totalCount: sql<number>`sum(${usageStats.count})`,
    }).from(usageStats).groupBy(usageStats.feature).orderBy(desc(sql`sum(${usageStats.count})`)).limit(limit);

    return result.map(r => ({
      feature: r.feature,
      totalCount: Number(r.totalCount),
    }));
  }

  // 获取用户使用排行
  async getUserRanking(limit = 10): Promise<{ userId: string; totalCount: number }[]> {
    const db = await getDb(schema);
    const result = await db.select({
      userId: usageStats.userId,
      totalCount: sql<number>`sum(${usageStats.count})`,
    }).from(usageStats).groupBy(usageStats.userId).orderBy(desc(sql`sum(${usageStats.count})`)).limit(limit);

    return result.map(r => ({
      userId: r.userId,
      totalCount: Number(r.totalCount),
    }));
  }

  // 获取总统计数据
  async getStats(): Promise<{
    totalUsage: number;
    todayUsage: number;
    byFeature: Record<string, number>;
  }> {
    const db = await getDb(schema);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalResult] = await db.select({
      total: sql<number>`sum(${usageStats.count})`,
    }).from(usageStats);

    const [todayResult] = await db.select({
      total: sql<number>`sum(${usageStats.count})`,
    }).from(usageStats).where(gte(usageStats.date, today));

    const featureStats = await db.select({
      feature: usageStats.feature,
      total: sql<number>`sum(${usageStats.count})`,
    }).from(usageStats).groupBy(usageStats.feature);

    const byFeature: Record<string, number> = {};
    featureStats.forEach(s => {
      byFeature[s.feature] = Number(s.total);
    });

    return {
      totalUsage: Number(totalResult?.total) || 0,
      todayUsage: Number(todayResult?.total) || 0,
      byFeature,
    };
  }
}

export const usageManager = new UsageManager();
