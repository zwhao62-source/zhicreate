'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CopyWriteGenerator from '@/components/features/copy-write-generator';
import ImageGenerator from '@/components/features/image-generator';
import VideoGenerator from '@/components/features/video-generator';
import ImageProcessor from '@/components/features/image-processor';
import ModelSwap from '@/components/features/model-swap';
import DetailDesign from '@/components/features/detail-design';
import ModelTraining from '@/components/features/model-training';

// 功能按类别分组
const featureCategories = [
  {
    category: '内容创作',
    icon: '✍️',
    features: [
      { id: 'copywrite', label: 'AI文案生成', icon: '✍️', description: '输入商品信息，自动生成种草文案' },
      { id: 'detail', label: 'AI详情图设计', icon: '📐', description: '生成电商内页详情图' },
      { id: 'video', label: '图生视频', icon: '🎬', description: '生成服装动态展示视频' },
    ]
  },
  {
    category: '图片处理',
    icon: '🎨',
    features: [
      { id: 'image', label: 'AI商品图生成', icon: '🎨', description: '生成专业模特展示图' },
      { id: 'process', label: 'AI图片处理', icon: '✨', description: '美图/去水印/压缩/格式转换' },
    ]
  },
  {
    category: '模特管理',
    icon: '👤',
    features: [
      { id: 'training', label: 'AI模特训练', icon: '👤', description: '训练专属AI虚拟模特' },
      { id: 'swap', label: '模特换装与背景', icon: '🔄', description: '换脸/换装/换背景' },
    ]
  }
];

// 扁平化功能列表（用于渲染）
const allFeatures = featureCategories.flatMap(cat => cat.features);

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
        {/* 功能导航 - 分类卡片式 */}
        <div className="mb-8 space-y-6">
          {featureCategories.map((cat) => (
            <div key={cat.category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <span>{cat.icon}</span>
                <span>{cat.category}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {cat.features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                      activeFeature === feature.id
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <span className={`text-2xl ${activeFeature === feature.id ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                      {feature.icon}
                    </span>
                    <div className="text-center">
                      <div className={`font-medium text-sm ${activeFeature === feature.id ? '' : 'text-slate-700 dark:text-slate-200'}`}>
                        {feature.label}
                      </div>
                    </div>
                    {activeFeature === feature.id && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 活跃功能区 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xl">{allFeatures.find(f => f.id === activeFeature)?.icon}</span>
            <h2 className="text-lg font-semibold">
              {allFeatures.find(f => f.id === activeFeature)?.label}
            </h2>
            <span className="ml-auto text-sm text-muted-foreground">
              {allFeatures.find(f => f.id === activeFeature)?.description}
            </span>
          </div>
          <div className="min-h-[500px]">
            {activeFeature === 'copywrite' && <CopyWriteGenerator />}
            {activeFeature === 'image' && <ImageGenerator />}
            {activeFeature === 'video' && <VideoGenerator />}
            {activeFeature === 'process' && <ImageProcessor />}
            {activeFeature === 'swap' && <ModelSwap />}
            {activeFeature === 'detail' && <DetailDesign />}
            {activeFeature === 'training' && <ModelTraining />}
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
