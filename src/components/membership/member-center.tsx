'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, Zap, Calendar, Clock, CreditCard, Gift, 
  Download, History, Settings, Bell, ChevronRight,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

// 模拟用户数据
const mockUser = {
  name: '张三',
  email: 'zhangsan@example.com',
  avatar: null,
  plan: 'professional',
  planName: '专业版',
  expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25天后到期
  dailyQuota: 200,
  usedToday: 45,
  totalUsed: 1250,
  orders: [
    { id: 'ORD20240101001', date: '2024-01-01', amount: 99, status: 'completed', plan: '专业版月付' },
    { id: 'ORD20231201001', date: '2023-12-01', amount: 99, status: 'completed', plan: '专业版月付' },
  ],
  coupons: [
    { code: 'NEWUSER', discount: 20, expireAt: '2024-03-01', used: false },
  ],
};

interface MemberCenterProps {
  user?: typeof mockUser;
}

export function MemberCenter({ user = mockUser }: MemberCenterProps) {
  const dailyUsagePercent = Math.round((user.usedToday / user.dailyQuota) * 100);
  const daysUntilExpiry = Math.ceil((user.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 7;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">会员中心</h1>
          <p className="text-muted-foreground">管理您的会员和套餐</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-1" />
            通知
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            设置
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：会员信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 当前会员卡片 */}
          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    <span className="text-lg font-semibold">{user.planName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{daysUntilExpiry}天后到期</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      <span>剩余{dailyUsagePercent}%</span>
                    </div>
                  </div>
                </div>
                <Link href="/pricing">
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                    升级套餐
                  </Button>
                </Link>
              </div>
              
              <Separator className="my-4 bg-white/20" />
              
              {/* 每日额度使用 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>今日已使用</span>
                  <span>{user.usedToday} / {user.dailyQuota} 次</span>
                </div>
                <Progress value={dailyUsagePercent} className="h-2 bg-white/20 [&>div]:bg-white" />
              </div>
              
              {isExpiringSoon && (
                <div className="mt-4 p-3 bg-white/10 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">您的会员即将到期，续费可享受优惠</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/pricing" className="block">
              <Card className="hover:border-orange-500 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Crown className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium">升级套餐</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/pricing?tab=yearly" className="block">
              <Card className="hover:border-orange-500 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Gift className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium">年付优惠</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/coupons" className="block">
              <Card className="hover:border-orange-500 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium">我的优惠券</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/billing" className="block">
              <Card className="hover:border-orange-500 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <History className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium">消费记录</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* 会员权益 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">会员权益</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: Zap, title: 'AI额度', desc: '每日200次' },
                  { icon: Crown, title: '高清图片', desc: '无水印导出' },
                  { icon: Clock, title: '优先队列', desc: '更快生成' },
                  { icon: Download, title: '批量下载', desc: '支持打包' },
                  { icon: Settings, title: 'API接口', desc: '即将上线' },
                  { icon: Bell, title: '专属客服', desc: '7x24支持' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <item.icon className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：账户信息 */}
        <div className="space-y-6">
          {/* 用户信息 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">账户信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">累计使用</span>
                  <span>{user.totalUsed} 次</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">到期时间</span>
                  <span>{user.expiresAt.toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 我的优惠券 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">我的优惠券</CardTitle>
                <Link href="/coupons" className="text-xs text-primary hover:underline">查看全部</Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.coupons.map((coupon, index) => (
                <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <Badge className="bg-red-500">{coupon.discount}% OFF</Badge>
                    <p className="text-xs text-muted-foreground mt-1">满任意金额可用</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{coupon.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {coupon.used ? '已使用' : `有效期至 ${coupon.expireAt}`}
                    </p>
                  </div>
                </div>
              ))}
              {user.coupons.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无优惠券</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 消费记录 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">最近消费</CardTitle>
                <Link href="/billing" className="text-xs text-primary hover:underline">查看全部</Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.orders.map((order, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{order.plan}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">¥{order.amount}</p>
                    <Badge variant="outline" className="text-xs">
                      {order.status === 'completed' ? '已完成' : order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
