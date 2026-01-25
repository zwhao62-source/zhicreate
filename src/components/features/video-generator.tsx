'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles, Upload, Download, Play, Pause } from 'lucide-react';
import AdBanner from '@/components/ui/ad-banner';

export default function VideoGenerator() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [duration, setDuration] = useState([3]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const poses = [
    { id: 'walk', name: '行走', icon: '🚶' },
    { id: 'rotate', name: '旋转', icon: '🔄' },
    { id: 'wave', name: '挥手', icon: '👋' },
    { id: 'dance', name: '舞蹈', icon: '💃' }
  ];

  const [selectedPose, setSelectedPose] = useState('rotate');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSourceImage(file);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) {
      alert('请上传源图片');
      return;
    }

    setIsGenerating(true);
    setShowAd(true);
    setGeneratedVideo('');

    try {
      const formData = new FormData();
      formData.append('image', sourceImage);
      formData.append('prompt', prompt || '模特自然展示商品');
      formData.append('pose', selectedPose);
      formData.append('duration', duration[0].toString());

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedVideo(data.videoUrl || '');
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      console.error('生成视频失败:', error);
      alert('生成视频失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdComplete = () => {
    setShowAd(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (generatedVideo) {
      const link = document.createElement('a');
      link.href = generatedVideo;
      link.download = 'generated-video.mp4';
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* 广告横幅 */}
      {showAd && isGenerating && (
        <AdBanner
          duration={45}
          onComplete={handleAdComplete}
          adContent={{
            title: 'AI图生视频',
            description: '正在为您生成动态商品展示视频，30-60秒即可完成',
            ctaText: '探索更多功能'
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">图生视频</h2>
          <p className="text-sm text-muted-foreground">将静态图片转换为动态展示视频</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>源图片</CardTitle>
            <CardDescription>上传商品模特图片，生成动态展示视频</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 图片上传区 */}
            <div className="space-y-2">
              <Label>模特图片</Label>
              <div
                className="flex min-h-[200px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {sourceImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(sourceImage)}
                      alt="模特图"
                      className="max-h-[200px] object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSourceImage(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      点击或拖拽上传模特图
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

            {/* 文本描述 */}
            <div className="space-y-2">
              <Label>动作描述（可选）</Label>
              <Textarea
                placeholder="例如：模特缓慢转身展示服装细节..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* 动作选择 */}
            <div className="space-y-2">
              <Label>预设动作</Label>
              <div className="grid grid-cols-2 gap-2">
                {poses.map((pose) => (
                  <Button
                    key={pose.id}
                    variant={selectedPose === pose.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPose(pose.id)}
                  >
                    <span className="mr-1">{pose.icon}</span>
                    {pose.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 视频时长 */}
            <div className="space-y-2">
              <Label>视频时长: {duration[0]}秒</Label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                min={2}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成视频
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
                <CardTitle>生成结果</CardTitle>
                <CardDescription>AI生成的动态展示视频</CardDescription>
              </div>
              {generatedVideo && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  下载
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px]">
              {isGenerating ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">AI正在生成视频...</p>
                    <p className="text-xs text-muted-foreground">预计需要60-120秒</p>
                  </div>
                </div>
              ) : generatedVideo ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      src={generatedVideo}
                      className="w-full"
                      controls
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePlayPause}
                      className="flex-1"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          暂停
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          播放
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">上传模特图片后点击生成</p>
                    <p className="text-xs">AI将生成动态展示视频</p>
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
