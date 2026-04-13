'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CopyWriteGenerator from '@/components/features/copy-write-generator';
import ImageGenerator from '@/components/features/image-generator';
import VideoGenerator from '@/components/features/video-generator';
import ImageProcessor from '@/components/features/image-processor';
import ModelSwap from '@/components/features/model-swap';
import DetailDesign from '@/components/features/detail-design';
import ModelTraining from '@/components/features/model-training';

const features = [
  {
    id: 'copywrite',
    label: 'AI文案生成',
    icon: '✍️',
    description: '输入商品信息，自动生成种草文案'
  },
  {
    id: 'training',
    label: 'AI模特训练',
    icon: '👤',
    description: '训练专属AI虚拟模特'
  },
  {
    id: 'image',
    label: 'AI商品图生成',
    icon: '🎨',
    description: '生成专业模特展示图'
  },
  {
    id: 'detail',
    label: 'AI详情图设计',
    icon: '📐',
    description: '生成电商内页详情图'
  },
  {
    id: 'video',
    label: '图生视频',
    icon: '🎬',
    description: '生成服装动态展示视频'
  },
  {
    id: 'process',
    label: 'AI图片处理',
    icon: '✨',
    description: '美图/去水印/压缩/格式转换'
  },
  {
    id: 'swap',
    label: '模特换装与背景',
    icon: '🔄',
    description: '换脸/换装/换背景'
  }
];

export default function Home() {
  const [activeFeature, setActiveFeature] = useState('copywrite');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <span className="text-xl font-bold text-white">智</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  智创云电商设计
                </h1>
                <p className="text-xs text-muted-foreground">AI驱动 · 电商内容创作平台</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/pricing">
                <Button variant="ghost" size="sm">
                  会员定价
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600">
                  立即开始
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* 左侧功能导航 */}
          <aside className="space-y-4">
            <div className="sticky top-24 space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground px-3">
                功能导航
              </h2>
              <nav className="space-y-1">
                {features.map((feature) => (
                  <Button
                    key={feature.id}
                    variant={activeFeature === feature.id ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-3 text-left transition-all ${
                      activeFeature === feature.id
                        ? feature.id === 'detail'
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-sm'
                          : 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 shadow-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => setActiveFeature(feature.id)}
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{feature.label}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {feature.description}
                      </span>
                    </div>
                  </Button>
                ))}
              </nav>
            </div>
          </aside>

          {/* 右侧内容区 */}
          <div className="min-h-[600px]">
            {activeFeature === 'copywrite' && <CopyWriteGenerator />}
            {activeFeature === 'training' && <ModelTraining />}
            {activeFeature === 'image' && <ImageGenerator />}
            {activeFeature === 'detail' && <DetailDesign />}
            {activeFeature === 'video' && <VideoGenerator />}
            {activeFeature === 'process' && <ImageProcessor />}
            {activeFeature === 'swap' && <ModelSwap />}
          </div>
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <p>智创云电商设计 - 让电商内容创作更简单</p>
            <p className="text-xs">
              <Link href="/pricing" className="text-primary hover:underline">会员定价</Link>
              {' · '}
              <Link href="/login" className="text-primary hover:underline">登录</Link>
              {' · '}
              <Link href="/register" className="text-primary hover:underline">注册</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
