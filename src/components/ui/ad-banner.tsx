'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdBannerProps {
  duration: number; // 广告时长（秒）
  onComplete: () => void;
  onClose?: () => void;
  adContent?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    ctaText?: string;
  };
}

export default function AdBanner({ duration, onComplete, onClose, adContent }: AdBannerProps) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration * 10));
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });

      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  // 默认广告内容
  const defaultAd = {
    title: 'AI电商营销平台',
    description: '专业AI工具，助力商家轻松创作高质量营销内容',
    imageUrl: '/ad-placeholder.jpg',
    ctaText: '了解更多'
  };

  const ad = adContent || defaultAd;

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="relative w-full max-w-2xl overflow-hidden">
        {/* 关闭按钮 */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="relative p-6">
          {/* 广告标识 */}
          <Badge variant="outline" className="absolute top-4 left-4 bg-yellow-500 text-white border-none">
            广告
          </Badge>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* 广告图片/内容 */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {ad.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {ad.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Badge variant="secondary">✨ AI赋能</Badge>
                  <Badge variant="secondary">🎯 高效创作</Badge>
                  <Badge variant="secondary">💰 成本优化</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  广告收入将抵消AI调用费用，为您节省开支
                </p>
              </div>

              <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                {ad.ctaText}
              </button>
            </div>

            {/* 环形进度条 */}
            <div className="flex-shrink-0">
              <div className="relative">
                <svg
                  className="w-64 h-64 transform -rotate-90"
                  viewBox="0 0 260 260"
                >
                  {/* 背景圆 */}
                  <circle
                    cx="130"
                    cy="130"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  {/* 进度圆 */}
                  <circle
                    cx="130"
                    cy="130"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-blue-500 transition-all duration-100 ease-linear"
                  />
                </svg>

                {/* 中心内容 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-slate-900 dark:text-slate-100">
                    {timeLeft.toFixed(1)}s
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    正在生成中...
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-muted-foreground">
              AI正在为您生成内容，请稍候 · 广告收入已帮您节省费用
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
