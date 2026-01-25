'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CopyWriteGenerator from '@/components/features/copy-write-generator';
import ImageGenerator from '@/components/features/image-generator';
import VideoGenerator from '@/components/features/video-generator';
import ImageProcessor from '@/components/features/image-processor';
import ModelSwap from '@/components/features/model-swap';

const features = [
  {
    id: 'copywrite',
    label: 'AI文案生成',
    icon: '✍️',
    description: '输入商品信息，自动生成种草文案、爆文改写'
  },
  {
    id: 'image',
    label: 'AI商品图生成',
    icon: '🎨',
    description: '提供商品上身图，生成专业模特展示图'
  },
  {
    id: 'video',
    label: '图生视频',
    icon: '🎬',
    description: '生成多角度、多场景的服装动态展示视频'
  },
  {
    id: 'process',
    label: 'AI图片处理',
    icon: '✨',
    description: '一键美图、去水印、高清修复等功能'
  },
  {
    id: 'swap',
    label: '模特换脸与背景',
    icon: '🔄',
    description: '轻松替换模特面部或背景'
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI电商营销平台
                </h1>
                <p className="text-xs text-muted-foreground">智能创作 · 高效营销</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                使用文档
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                立即开始
              </Button>
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
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 shadow-sm'
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
            {activeFeature === 'image' && <ImageGenerator />}
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
            <p>AI电商营销平台 - 助力商家轻松创作</p>
            <p className="text-xs">支持多种电商平台：小红书、淘宝、天猫、京东、速卖通等</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
