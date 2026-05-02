'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, LogOut, ChevronLeft, ChevronRight, 
  Search, Eye, Edit, Trash2, UserPlus, TrendingUp
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  plan: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
}

const planLabels: Record<string, string> = {
  trial: '体验版',
  free: '免费版',
  personal: '个人版',
  professional: '专业版',
  enterprise: '企业版',
};

const planColors: Record<string, string> = {
  trial: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  free: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  personal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  professional: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  enterprise: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  banned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  expired: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchUsers(token);
  }, [router, skip, search, filterPlan, filterStatus]);

  const fetchUsers = async (token: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);
      if (filterPlan) params.append('plan', filterPlan);
      if (filterStatus) params.append('status', filterStatus);

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.data.total);
      }
    } catch (err) {
      console.error('获取用户列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    const token = localStorage.getItem('admin_token');
    if (token) fetchUsers(token);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('确定要删除该用户吗？')) return;
    
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        fetchUsers(token);
      } else {
        alert(data.error || '删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleUpdatePlan = async (userId: string, plan: string) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      
      if (data.success) {
        fetchUsers(token);
        setSelectedUser(null);
      } else {
        alert(data.error || '更新失败');
      }
    } catch (err) {
      alert('更新失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="p-2 rounded-lg hover:bg-muted">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <span className="text-xl font-bold text-white">管</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">用户管理</h1>
                <p className="text-xs text-muted-foreground">共 {total} 位用户</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 侧边栏 */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">仪表盘</span>
                  </Link>
                  <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/30">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">用户管理</span>
                  </Link>
                  <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">订单管理</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 用户列表 */}
          <div className="md:col-span-3 space-y-4">
            {/* 搜索和筛选 */}
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索邮箱/姓名/手机号..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">全部会员</option>
                    <option value="trial">体验版</option>
                    <option value="free">免费版</option>
                    <option value="personal">个人版</option>
                    <option value="professional">专业版</option>
                    <option value="enterprise">企业版</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">全部状态</option>
                    <option value="active">正常</option>
                    <option value="banned">禁用</option>
                    <option value="expired">过期</option>
                  </select>
                  <Button type="submit">搜索</Button>
                </form>
              </CardContent>
            </Card>

            {/* 用户表格 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">用户列表</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-left text-sm text-muted-foreground">
                            <th className="pb-3 font-medium">用户</th>
                            <th className="pb-3 font-medium">会员</th>
                            <th className="pb-3 font-medium">状态</th>
                            <th className="pb-3 font-medium">注册时间</th>
                            <th className="pb-3 font-medium text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b last:border-0">
                              <td className="py-3">
                                <div>
                                  <p className="font-medium">{user.name || '未设置昵称'}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                  {user.phone && (
                                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3">
                                <Badge className={planColors[user.plan] || ''}>
                                  {planLabels[user.plan] || user.plan}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <Badge className={statusColors[user.status] || ''}>
                                  {user.status === 'active' ? '正常' : 
                                   user.status === 'banned' ? '禁用' : '过期'}
                                </Badge>
                              </td>
                              <td className="py-3 text-sm text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(user.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 分页 */}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        显示 {skip + 1}-{Math.min(skip + 20, total)}，共 {total}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSkip(Math.max(0, skip - 20))}
                          disabled={skip === 0}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          上一页
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSkip(skip + 20)}
                          disabled={skip + 20 >= total}
                        >
                          下一页
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>编辑用户</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">邮箱</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">昵称</p>
                <p className="font-medium">{selectedUser.name || '未设置'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">会员等级</p>
                <select
                  value={selectedUser.plan}
                  onChange={(e) => handleUpdatePlan(selectedUser.id, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="trial">体验版</option>
                  <option value="free">免费版</option>
                  <option value="personal">个人版</option>
                  <option value="professional">专业版</option>
                  <option value="enterprise">企业版</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedUser(null)}>
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
