import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { orders, insertOrderSchema, updateOrderSchema } from "./shared/schema";
import type { Order, InsertOrder, UpdateOrder } from "./shared/schema";
import * as schema from "./shared/schema";

// 生成订单号
export function generateOrderNo(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ZHI${timestamp}${random}`.toUpperCase();
}

export class OrderManager {
  // 创建订单
  async createOrder(data: Omit<InsertOrder, 'orderNo'>): Promise<Order> {
    const db = await getDb(schema);
    const validated = insertOrderSchema.parse(data);
    const [order] = await db.insert(orders).values({
      ...validated,
      orderNo: generateOrderNo(),
    }).returning();
    return order;
  }

  // 创建支付订单（用于支付平台）
  async createPaymentOrder(
    userId: string,
    plan: string,
    amount: string,
    period: string,
    duration: number,
    paymentMethod: string
  ): Promise<Order> {
    return this.createOrder({
      userId,
      plan,
      amount,
      currency: 'CNY',
      period,
      duration,
      status: 'pending',
      paymentMethod,
    });
  }

  // 获取订单列表
  async getOrders(options: {
    skip?: number;
    limit?: number;
    userId?: string;
    status?: string;
    plan?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<Order[]> {
    const { skip = 0, limit = 20, userId, status, plan, startDate, endDate } = options;
    const db = await getDb(schema);
    const conditions = [];

    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }
    if (status) {
      conditions.push(eq(orders.status, status));
    }
    if (plan) {
      conditions.push(eq(orders.plan, plan));
    }
    if (startDate) {
      conditions.push(gte(orders.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(orders.createdAt, endDate));
    }

    return db.query.orders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(orders.createdAt)],
      limit,
      offset: skip,
    });
  }

  // 获取订单总数
  async getOrderCount(options: {
    userId?: string;
    status?: string;
    plan?: string;
  } = {}): Promise<number> {
    const { userId, status, plan } = options;
    const db = await getDb(schema);
    const conditions = [];

    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }
    if (status) {
      conditions.push(eq(orders.status, status));
    }
    if (plan) {
      conditions.push(eq(orders.plan, plan));
    }

    const result = await db.select({ count: sql<number>`count(*)` }).from(orders).where(
      conditions.length > 0 ? and(...conditions) : undefined
    );
    return Number(result[0]?.count) || 0;
  }

  // 根据ID获取订单
  async getOrderById(id: string): Promise<Order | null> {
    const db = await getDb(schema);
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    return order || null;
  }

  // 根据订单号获取订单
  async getOrderByNo(orderNo: string): Promise<Order | null> {
    const db = await getDb(schema);
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNo, orderNo),
    });
    return order || null;
  }

  // 根据支付ID获取订单
  async getOrderByPaymentId(paymentId: string): Promise<Order | null> {
    const db = await getDb(schema);
    const order = await db.query.orders.findFirst({
      where: eq(orders.paymentId, paymentId),
    });
    return order || null;
  }

  // 更新订单
  async updateOrder(id: string, data: UpdateOrder): Promise<Order | null> {
    const db = await getDb(schema);
    const validated = updateOrderSchema.parse(data);
    const [order] = await db
      .update(orders)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || null;
  }

  // 支付成功
  async markAsPaid(id: string, paymentId: string): Promise<Order | null> {
    const db = await getDb(schema);
    const [order] = await db
      .update(orders)
      .set({
        status: 'paid',
        paymentId,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return order || null;
  }

  // 取消订单
  async cancelOrder(id: string): Promise<Order | null> {
    return this.updateOrder(id, { status: 'cancelled' });
  }

  // 退款
  async refundOrder(id: string): Promise<Order | null> {
    return this.updateOrder(id, { status: 'refunded' });
  }

  // 获取统计数据
  async getStats(options: {
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{
    totalOrders: number;
    paidOrders: number;
    totalRevenue: number;
    revenueByPlan: Record<string, number>;
    revenueByDay: { date: string; amount: number }[];
  }> {
    const { startDate, endDate } = options;
    const db = await getDb(schema);
    const conditions = [eq(orders.status, 'paid')];

    if (startDate) {
      conditions.push(gte(orders.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(orders.createdAt, endDate));
    }

    const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const paidOrders = await db.query.orders.findMany({
      where: and(...conditions),
      orderBy: [desc(orders.createdAt)],
    });

    const totalRevenue = paidOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.amount) || 0);
    }, 0);

    // 按计划统计
    const revenueByPlan: Record<string, number> = {};
    paidOrders.forEach(order => {
      revenueByPlan[order.plan] = (revenueByPlan[order.plan] || 0) + (parseFloat(order.amount) || 0);
    });

    // 按日统计
    const revenueByDayMap = new Map<string, number>();
    paidOrders.forEach(order => {
      if (order.paidAt) {
        const date = new Date(order.paidAt).toISOString().split('T')[0];
        revenueByDayMap.set(date, (revenueByDayMap.get(date) || 0) + (parseFloat(order.amount) || 0));
      }
    });
    const revenueByDay = Array.from(revenueByDayMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // 最近30天

    return {
      totalOrders: Number(totalResult?.count) || 0,
      paidOrders: paidOrders.length,
      totalRevenue,
      revenueByPlan,
      revenueByDay,
    };
  }
}

export const orderManager = new OrderManager();
