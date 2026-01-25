'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles, Upload, Download, Wand2 } from 'lucide-react';
import AdBanner from '@/components/ui/ad-banner';

export default function ImageProcessor() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState('beautify');
  const [intensity, setIntensity] = useState([50]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const functions = [
    { 
      id: 'beautify', 
      name: '一键美图', 
      icon: '✨',
      desc: '智能美化皮肤，优化照片质感' 
    },
    { 
      id: 'watermark', 
      name: '一键去水印', 
      icon: '🚫',
      desc: '智能去除图片中的水印' 
    },
    { 
      id: 'enhance', 
      name: '高清修复', 
      icon: '🔍',
      desc: '提升图片清晰度和质量' 
    },
    { 
      id: 'handfeet', 
      name: '手脚修复', 
      icon: '✋',
      desc: '修复AI生成图的手部和脚部' 
    },
    { 
      id: 'remove', 
      name: '智能消除', 
      icon: '🎯',
      desc: '一键消除图片中多余元素' 
    },
    { 
      id: 'outfit', 
      name: '一键换装', 
      icon: '👔',
      desc: '智能更换模特服装' 
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSourceImage(file);
      setProcessedImage('');
    }
  };

  const handleProcess = async () => {
    if (!sourceImage) {
      alert('请上传图片');
      return;
    }

    setIsProcessing(true);
    setShowAd(true);

    try {
      const formData = new FormData();
      formData.append('image', sourceImage);
      formData.append('function', selectedFunction);
      formData.append('intensity', intensity[0].toString());

      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProcessedImage(data.imageUrl || '');
        // 处理成功后立即关闭广告
        setShowAd(false);
      } else {
        throw new Error('处理失败');
      }
    } catch (error) {
      console.error('图片处理失败:', error);
      alert('图片处理失败，请稍后重试');
      // 处理失败时也要关闭广告
      setShowAd(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdComplete = () => {
    setShowAd(false);
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `processed-image.png`;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* 广告横幅 */}
      {showAd && (
        <AdBanner
          duration={30}
          onComplete={handleAdComplete}
          adContent={{
            title: 'AI图片处理',
            description: '正在为您处理图片，30秒左右即可完成',
            ctaText: '探索更多功能'
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
          <Wand2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI图片处理</h2>
          <p className="text-sm text-muted-foreground">智能美化、修复、优化图片效果</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>源图片</CardTitle>
            <CardDescription>上传需要处理的图片</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 图片上传区 */}
            <div className="space-y-2">
              <Label>上传图片</Label>
              <div
                className="flex min-h-[200px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {sourceImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(sourceImage)}
                      alt="源图"
                      className="max-h-[200px] object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSourceImage(null);
                        setProcessedImage('');
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      点击或拖拽上传图片
                    </p>
                    <p className="text-xs text-muted-foreground">
                      支持 JPG、PNG 格式
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 功能选择 */}
            <div className="space-y-2">
              <Label>选择功能</Label>
              <div className="grid grid-cols-2 gap-2">
                {functions.map((func) => (
                  <Badge
                    key={func.id}
                    variant={selectedFunction === func.id ? 'default' : 'outline'}
                    className={`cursor-pointer hover:opacity-80 p-3 flex flex-col items-center gap-1 ${
                      selectedFunction === func.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                        : ''
                    }`}
                    onClick={() => setSelectedFunction(func.id)}
                  >
                    <span className="text-xl">{func.icon}</span>
                    <span className="font-medium">{func.name}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* 强度调节 */}
            <div className="space-y-2">
              <Label>处理强度: {intensity[0]}%</Label>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  开始处理
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>处理结果</CardTitle>
                <CardDescription>AI处理后的图片</CardDescription>
              </div>
              {processedImage && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  下载
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px]">
              {isProcessing ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">AI正在处理中...</p>
                    <p className="text-xs text-muted-foreground">预计需要10-30秒</p>
                  </div>
                </div>
              ) : processedImage ? (
                <div className="space-y-4">
                  <img
                    src={processedImage}
                    alt="处理结果"
                    className="w-full rounded-lg object-contain"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleProcess}
                      className="flex-1"
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      重新处理
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Wand2 className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">上传图片后选择功能</p>
                    <p className="text-xs">AI将智能处理您的图片</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
