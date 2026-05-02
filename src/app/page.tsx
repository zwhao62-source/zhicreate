'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  ImageIcon,
  Video,
  Wand2,
  User,
  Layers,
  Sparkles,
  Palette,
  ScanFace,
  Download,
  Crown,
  Menu,
  X,
  ChevronRight,
  Clock
} from 'lucide-react';
import CopyWriteGenerator from '@/components/features/copy-write-generator';
import ImageGenerator from '@/components/features/image-generator';
import VideoGenerator from '@/components/features/video-generator';
import ImageProcessor from '@/components/features/image-processor';
import ModelSwap from '@/components/features/model-swap';
import DetailDesign from '@/components/features/detail-design';
import ModelTraining from '@/components/features/model-training';

// 功能列表
const features = [
  { id: 'copywrite', label: 'AI文案生成', icon: FileText, description: '智能生成种草文案', category: 'content' },
  { id: 'detail', label: '详情图设计', icon: Layers, description: '电商详情页设计', category: 'content' },
  { id: 'video', label: '图生视频', icon: Video, description: '服装动态展示', category: 'content' },
  { id: 'image', label: '商品图生成', icon: Wand2, description: 'AI模特展示图', category: 'image' },
  { id: 'process', label: '图片处理', icon: Palette, description: '美图/去背景/压缩', category: 'image' },
  { id: 'training', label: '模特训练', icon: ScanFace, description: '训练专属虚拟模特', category: 'model' },
  { id: 'swap', label: '模特换装', icon: User, description: '换脸/换装/换背景', category: 'model' },
];

const categoryLabels: Record<string, string> = {
  content: '内容创作',
  image: '图片处理',
  model: '模特管理',
};

export default function Home() {
  const [activeFeature, setActiveFeature] = useState('copywrite');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentFeature = features.find(f => f.id === activeFeature);
  const IconComponent = currentFeature?.icon || FileText;

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <span className="text-sm font-bold text-white">智</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold tracking-tight">智创云电商设计</h1>
            </div>
          </div>

          {/* 导航链接 */}
          <div className="flex items-center gap-1">
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                定价
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                登录
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                立即开始
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 主布局 */}
      <div className="flex pt-14 h-[calc(100vh-3.5rem)]">
        {/* 侧边功能栏 */}
        <aside className="hidden lg:flex flex-col w-56 border-r bg-background">
          <div className="flex-1 overflow-y-auto py-4 px-3">
            {/* 内容创作 */}
            <div className="mb-6">
              <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {categoryLabels.content}
              </p>
              <nav className="space-y-0.5">
                {features.filter(f => f.category === 'content').map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(feature.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        activeFeature === feature.id
                          ? 'bg-gradient-to-r from-orange-500/20 to-red-600/20 text-orange-600 font-medium border-l-[3px] border-orange-500'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{feature.label}</span>
                      {activeFeature === feature.id && (
                        <ChevronRight className="w-3 h-3 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 图片处理 */}
            <div className="mb-6">
              <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {categoryLabels.image}
              </p>
              <nav className="space-y-0.5">
                {features.filter(f => f.category === 'image').map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(feature.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        activeFeature === feature.id
                          ? 'bg-gradient-to-r from-orange-500/20 to-red-600/20 text-orange-600 font-medium border-l-[3px] border-orange-500'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{feature.label}</span>
                      {activeFeature === feature.id && (
                        <ChevronRight className="w-3 h-3 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 模特管理 */}
            <div className="mb-6">
              <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {categoryLabels.model}
              </p>
              <nav className="space-y-0.5">
                {features.filter(f => f.category === 'model').map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(feature.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        activeFeature === feature.id
                          ? 'bg-gradient-to-r from-orange-500/20 to-red-600/20 text-orange-600 font-medium border-l-[3px] border-orange-500'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{feature.label}</span>
                      {activeFeature === feature.id && (
                        <ChevronRight className="w-3 h-3 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 底部会员入口 */}
          <div className="p-3 border-t space-y-2">
            <Link href="/history">
              <Button variant="ghost" className="w-full justify-start gap-2" size="sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>生成历史</span>
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Crown className="w-4 h-4 text-orange-500" />
                <span>升级会员</span>
                <Badge variant="secondary" className="ml-auto text-xs">Pro</Badge>
              </Button>
            </Link>
          </div>
        </aside>

        {/* 移动端底部导航 */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
          <div className="flex overflow-x-auto py-2 px-2 gap-1 scrollbar-hide">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    activeFeature === feature.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs whitespace-nowrap">{feature.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {/* 功能标题栏 */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                <IconComponent className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">{currentFeature?.label}</h2>
                <p className="text-sm text-muted-foreground">{currentFeature?.description}</p>
              </div>
              <div className="ml-auto">
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[currentFeature?.category || 'content']}
                </Badge>
              </div>
            </div>
          </div>

          {/* 功能组件区 */}
          <div className="p-4 lg:p-6">
            {activeFeature === 'copywrite' && <CopyWriteGenerator />}
            {activeFeature === 'image' && <ImageGenerator />}
            {activeFeature === 'video' && <VideoGenerator />}
            {activeFeature === 'process' && <ImageProcessor />}
            {activeFeature === 'swap' && <ModelSwap />}
            {activeFeature === 'detail' && <DetailDesign />}
            {activeFeature === 'training' && <ModelTraining />}
          </div>
        </main>
      </div>
    </div>
  );
}
