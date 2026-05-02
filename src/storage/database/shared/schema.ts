import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// ==================== 用户表 ====================
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }),
    password: text("password"), // 加密存储
    name: varchar("name", { length: 128 }),
    avatar: text("avatar"), // 头像URL
    plan: varchar("plan", { length: 20 }).default("trial").notNull(), // trial/free/personal/professional/enterprise
    status: varchar("status", { length: 20 }).default("active").notNull(), // active/banned/expired
    expiresAt: timestamp("expires_at", { withTimezone: true }), // 会员到期时间
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    phoneIdx: index("users_phone_idx").on(table.phone),
    planIdx: index("users_plan_idx").on(table.plan),
  })
);

// ==================== 管理员表 ====================
export const admins = pgTable(
  "admins",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: varchar("username", { length: 50 }).notNull().unique(),
    password: text("password").notNull(), // 加密存储
    name: varchar("name", { length: 128 }),
    role: varchar("role", { length: 20 }).default("admin").notNull(), // super_admin/admin/operator
    permissions: jsonb("permissions"), // 权限数组
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    usernameIdx: index("admins_username_idx").on(table.username),
  })
);

// ==================== 订单表 ====================
export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orderNo: varchar("order_no", { length: 64 }).notNull().unique(), // 订单号
    userId: varchar("user_id", { length: 36 }).notNull(),
    plan: varchar("plan", { length: 20 }).notNull(), // 会员等级
    amount: varchar("amount", { length: 20 }).notNull(), // 金额
    currency: varchar("currency", { length: 10 }).default("CNY").notNull(), // 货币
    period: varchar("period", { length: 20 }).notNull(), // monthly/yearly
    duration: integer("duration").notNull(), // 天数
    status: varchar("status", { length: 20 }).default("pending").notNull(), // pending/paid/cancelled/refunded
    paymentMethod: varchar("payment_method", { length: 50 }), // alipay/wechat/paddle/stripe
    paymentId: varchar("payment_id", { length: 255 }), // 支付平台订单号
    paidAt: timestamp("paid_at", { withTimezone: true }), // 支付时间
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("orders_user_id_idx").on(table.userId),
    orderNoIdx: index("orders_order_no_idx").on(table.orderNo),
    statusIdx: index("orders_status_idx").on(table.status),
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
  })
);

// ==================== 使用量统计表 ====================
export const usageStats = pgTable(
  "usage_stats",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    feature: varchar("feature", { length: 50 }).notNull(), // copywrite/image/video/detail_design/model_swap/model_train
    count: integer("count").default(0).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    userIdFeatureIdx: index("usage_stats_user_feature_idx").on(table.userId, table.feature),
    dateIdx: index("usage_stats_date_idx").on(table.date),
  })
);

// ==================== 会员等级配置表 ====================
export const planConfigs = pgTable(
  "plan_configs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    plan: varchar("plan", { length: 20 }).notNull().unique(),
    name: varchar("name", { length: 50 }).notNull(), // 中文名称
    nameEn: varchar("name_en", { length: 50 }), // 英文名称
    price: integer("price").notNull(), // 价格（分）
    priceYearly: integer("price_yearly").notNull(), // 年付价格（分）
    period: varchar("period", { length: 20 }).notNull(), // monthly/yearly
    features: jsonb("features"), // 功能配置
    limits: jsonb("limits"), // 限制配置
    sort: integer("sort").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
);

// ==================== 登录日志表 ====================
export const loginLogs = pgTable(
  "login_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }),
    email: varchar("email", { length: 255 }),
    ip: varchar("ip", { length: 50 }),
    userAgent: text("user_agent"),
    status: varchar("status", { length: 20 }).notNull(), // success/failed
    reason: varchar("reason", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("login_logs_user_id_idx").on(table.userId),
    createdAtIdx: index("login_logs_created_at_idx").on(table.createdAt),
  })
);

// ==================== 操作日志表 ====================
export const adminLogs = pgTable(
  "admin_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    adminId: varchar("admin_id", { length: 36 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(), // create/update/delete/login
    targetType: varchar("target_type", { length: 50 }), // user/order/plan
    targetId: varchar("target_id", { length: 36 }),
    details: jsonb("details"), // 操作详情
    ip: varchar("ip", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    adminIdIdx: index("admin_logs_admin_id_idx").on(table.adminId),
    createdAtIdx: index("admin_logs_created_at_idx").on(table.createdAt),
  })
);

// ==================== Zod Schema ====================
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// 用户 Schema
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  email: true,
  phone: true,
  password: true,
  name: true,
  plan: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
  .pick({
    email: true,
    phone: true,
    name: true,
    avatar: true,
    plan: true,
    status: true,
    expiresAt: true,
  })
  .partial();

// 管理员 Schema
export const insertAdminSchema = createCoercedInsertSchema(admins).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  permissions: true,
});

export const updateAdminSchema = createCoercedInsertSchema(admins)
  .pick({
    name: true,
    role: true,
    permissions: true,
  })
  .partial();

// 订单 Schema
export const insertOrderSchema = createCoercedInsertSchema(orders).pick({
  orderNo: true,
  userId: true,
  plan: true,
  amount: true,
  currency: true,
  period: true,
  duration: true,
  status: true,
  paymentMethod: true,
  paymentId: true,
  paidAt: true,
});

export const updateOrderSchema = createCoercedInsertSchema(orders)
  .pick({
    status: true,
    paymentId: true,
    paidAt: true,
  })
  .partial();

// 使用量 Schema
export const insertUsageStatsSchema = createCoercedInsertSchema(usageStats).pick({
  userId: true,
  feature: true,
  count: true,
  date: true,
});

export const updateUsageStatsSchema = createCoercedInsertSchema(usageStats)
  .pick({
    count: true,
  })
  .partial();

// 会员等级配置 Schema
export const insertPlanConfigSchema = createCoercedInsertSchema(planConfigs).pick({
  plan: true,
  name: true,
  nameEn: true,
  price: true,
  priceYearly: true,
  period: true,
  features: true,
  limits: true,
  sort: true,
  isActive: true,
});

// 登录日志 Schema
export const insertLoginLogSchema = createCoercedInsertSchema(loginLogs).pick({
  userId: true,
  email: true,
  ip: true,
  userAgent: true,
  status: true,
  reason: true,
});

// 操作日志 Schema
export const insertAdminLogSchema = createCoercedInsertSchema(adminLogs).pick({
  adminId: true,
  action: true,
  targetType: true,
  targetId: true,
  details: true,
  ip: true,
});

// TypeScript Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type UpdateAdmin = z.infer<typeof updateAdminSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;

export type UsageStats = typeof usageStats.$inferSelect;
export type InsertUsageStats = z.infer<typeof insertUsageStatsSchema>;
export type UpdateUsageStats = z.infer<typeof updateUsageStatsSchema>;

export type PlanConfig = typeof planConfigs.$inferSelect;
export type InsertPlanConfig = z.infer<typeof insertPlanConfigSchema>;

export type LoginLog = typeof loginLogs.$inferSelect;
export type InsertLoginLog = z.infer<typeof insertLoginLogSchema>;

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
