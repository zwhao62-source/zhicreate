'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, CreditCard, TrendingUp, Activity, LogOut, 
  ChevronRight, UserPlus, FileText, Image, Video
} from 'lucide-react';

interface Stats {
  users: {
    total: number;
    active: number;
    trial: number;
    paid: number;
    newToday: number;
  };
  orders: {
    totalOrders: number;
    paidOrders: number;
    totalRevenue: number;
    revenueByPlan: Record<string, number>;
  };
  usage: {
    totalUsage: number;
    todayUsage: number;
    byFeature: Record<string, number>;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_info');
    
    if (!token || !adminData) {
      router.push('/admin/login');
      return;
    }

    setAdminInfo(JSON.parse(adminData));
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('获取统计数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <span className="text-xl font-bold text-white">管</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  智创云管理后台
                </h1>
                <p className="text-xs text-muted-foreground">
                  欢迎，{adminInfo?.name || adminInfo?.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={adminInfo?.role === 'super_admin' ? 'default' : 'secondary'}>
                {adminInfo?.role === 'super_admin' ? '超级管理员' : '管理员'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 侧边栏 + 主内容 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 侧边栏 */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/30">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">仪表盘</span>
                  </Link>
                  <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">用户管理</span>
                  </Link>
                  <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">订单管理</span>
                  </Link>
                  <Link href="/admin/usage" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">使用统计</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 主内容 */}
          <div className="md:col-span-3 space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">总用户</p>
                      <p className="text-2xl font-bold">{stats?.users.total || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <UserPlus className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">今日新增</p>
                      <p className="text-2xl font-bold">{stats?.users.newToday || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">付费用户</p>
                      <p className="text-2xl font-bold">{stats?.users.paid || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">总收入</p>
                      <p className="text-2xl font-bold">¥{(stats?.orders.totalRevenue || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 会员分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">会员分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {['trial', 'free', 'personal', 'professional', 'enterprise'].map((plan) => (
                    <div key={plan} className="flex-1 text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">
                        {plan === 'trial' ? stats?.users.trial || 0 :
                         plan === 'free' ? (stats?.users.total || 0) - (stats?.users.trial || 0) - (stats?.users.paid || 0) :
                         stats?.orders.revenueByPlan[plan] ? Math.round(stats.orders.revenueByPlan[plan] / 100) : 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {plan === 'trial' ? '体验版' :
                         plan === 'free' ? '免费版' :
                         plan === 'personal' ? '个人版' :
                         plan === 'professional' ? '专业版' : '企业版'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 功能使用统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">功能使用统计</CardTitle>
                <CardDescription>各功能总使用量</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats?.usage.byFeature || {}).map(([feature, count]) => (
                    <div key={feature} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        {feature === 'copywrite' && <FileText className="h-4 w-4" />}
                        {feature === 'image' && <Image className="h-4 w-4" />}
                        {feature === 'video' && <Video className="h-4 w-4" />}
                        <span className="text-sm font-medium">
                          {feature === 'copywrite' ? '文案生成' :
                           feature === 'image' ? '图片生成' :
                           feature === 'video' ? '视频生成' :
                           feature === 'image_process' ? '图片处理' :
                           feature === 'model_swap' ? '模特换脸' :
                           feature === 'model_train' ? '模特训练' :
                           feature === 'detail_design' ? '详情图设计' : feature}
                        </span>
                      </div>
                      <p className="text-2xl font-bold">{Number(count)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
