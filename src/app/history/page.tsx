'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  ImageIcon, 
  Video, 
  Layers, 
  User,
  Trash2,
  Calendar,
  Clock,
  Filter,
  Grid,
  List,
  Search,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface HistoryItem {
  id: string;
  feature: string;
  title: string;
  thumbnail?: string;
  output?: any;
  createdAt: string;
  status: string;
}

const featureConfig: Record<string, { name: string; icon: any; color: string }> = {
  copywrite: { name: 'AI文案生成', icon: FileText, color: 'bg-blue-500' },
  image: { name: '商品图生成', icon: ImageIcon, color: 'bg-purple-500' },
  video: { name: '图生视频', icon: Video, color: 'bg-pink-500' },
  detail: { name: '详情图设计', icon: Layers, color: 'bg-orange-500' },
  swap: { name: '模特换装', icon: User, color: 'bg-green-500' },
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/history' 
        : `/api/history?feature=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setHistory(data.data.list || []);
      }
    } catch (error) {
      console.error('获取历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistory = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setHistory(history.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const filteredHistory = history.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFeatureConfig = (feature: string) => {
    return featureConfig[feature] || { name: feature, icon: FileText, color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">生成历史</h1>
          <p className="text-sm text-muted-foreground mt-1">
            查看和管理您的AI创作记录
          </p>
        </div>
        <Button variant="outline" onClick={fetchHistory}>
          刷新
        </Button>
      </div>

      {/* 筛选区 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索历史记录..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">全部功能</option>
            {Object.entries(featureConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 历史列表 */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">暂无历史记录</h3>
            <p className="text-sm text-muted-foreground">
              开始使用AI功能创建内容吧
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredHistory.map((item) => {
            const config = getFeatureConfig(item.feature);
            const Icon = config.icon;
            
            return (
              <Card key={item.id} className="group overflow-hidden">
                {/* 缩略图 */}
                <div className="relative aspect-video bg-muted">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* 功能标签 */}
                  <div className={`absolute top-2 left-2 ${config.color} text-white text-xs px-2 py-1 rounded-md`}>
                    {config.name}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary">
                      <Eye className="w-4 h-4 mr-1" /> 查看
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteHistory(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* 信息 */}
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm truncate mb-2">
                    {item.title || '未命名'}
                  </h4>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.createdAt}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((item) => {
            const config = getFeatureConfig(item.feature);
            const Icon = config.icon;
            
            return (
              <Card key={item.id} className="group hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* 缩略图 */}
                  <div className="relative w-24 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${config.color} text-white text-xs px-2 py-0.5 rounded`}>
                        {config.name}
                      </span>
                      <h4 className="font-medium truncate">{item.title || '未命名'}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.createdAt}
                    </p>
                  </div>
                  
                  {/* 操作 */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" /> 查看
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteHistory(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
