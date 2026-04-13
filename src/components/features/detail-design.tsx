'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Upload, Download, Layout, Image as ImageIcon, Copy, Eye, Settings2, Grid3X3, Palette, Ruler } from 'lucide-react';
import AdBanner from '@/components/ui/ad-banner';

export default function DetailDesign() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [sellingPoints, setSellingPoints] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generationInfo, setGenerationInfo] = useState<{
    totalImages: number;
    pointGroups: number;
    pointsPerGroup: number;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPoints, setIsGeneratingPoints] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [selectedSize, setSelectedSize] = useState('750x800');
  const [selectedTemplate, setSelectedTemplate] = useState('showcase');
  const [quality, setQuality] = useState([80]);
  const [productName, setProductName] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<Record<number, 'idle' | 'success'>>({});
  const [sizeMode, setSizeMode] = useState<'preset' | 'custom'>('preset');
  const [customWidth, setCustomWidth] = useState('750');
  const [customHeight, setCustomHeight] = useState('800');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = [
    { id: '750x500', name: '750×500', desc: '移动端标准', platform: 'mobile' },
    { id: '750x800', name: '750×800', desc: '移动端中长', platform: 'mobile' },
    { id: '750x1000', name: '750×1000', desc: '移动端长图', platform: 'mobile' },
    { id: '1200x800', name: '1200×800', desc: 'PC端标准', platform: 'desktop' },
    { id: '1200x1200', name: '1200×1200', desc: 'PC端方图', platform: 'desktop' },
    { id: '800x1200', name: '800×1200', desc: '移动端竖版', platform: 'mobile' }
  ];

  const templates = [
    { 
      id: 'showcase', 
      name: '产品展示', 
      icon: '📦',
      desc: '突出产品本身' 
    },
    { 
      id: 'highlight', 
      name: '卖点突出', 
      icon: '✨',
      desc: '强调核心优势' 
    },
    { 
      id: 'scene', 
      name: '使用场景', 
      icon: '🎬',
      desc: '真实场景展示' 
    },
    { 
      id: 'feature', 
      name: '参数说明', 
      icon: '📋',
      desc: '专业参数' 
    },
    { 
      id: 'quality', 
      name: '质量保证', 
      icon: '🏆',
      desc: '品质认证' 
    },
    { 
      id: 'promotion', 
      name: '促销活动', 
      icon: '🎉',
      desc: '促销氛围' 
    }
  ];

  const styles = [
    { id: 'minimalist', name: '简约', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    { id: 'premium', name: '高端', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
    { id: 'vibrant', name: '活力', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
    { id: 'professional', name: '商务', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' }
  ];

  const [selectedStyle, setSelectedStyle] = useState('minimalist');

  const getFinalSize = () => {
    if (sizeMode === 'custom') {
      return `${customWidth}x${customHeight}`;
    }
    return selectedSize;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProductImage(file);
    }
  };

  const handleGenerateSellingPoints = async () => {
    if (!productName) {
      alert('请输入商品名称');
      return;
    }

    setIsGeneratingPoints(true);
    setSellingPoints('');

    try {
      const response = await fetch('/api/generate-selling-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          category: selectedTemplate,
          description: sellingPoints
        })
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    setSellingPoints(prev => prev + parsed.content);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      console.error('生成卖点失败:', error);
      alert('生成卖点失败，请稍后重试');
    } finally {
      setIsGeneratingPoints(false);
    }
  };

  const handleGenerate = async () => {
    if (!productImage && !sellingPoints) {
      alert('请上传商品图片或输入商品卖点');
      return;
    }

    setIsGenerating(true);
    setShowAd(true);
    setGeneratedImages([]);

    try {
      const formData = new FormData();
      if (productImage) {
        formData.append('image', productImage);
      }
      formData.append('sellingPoints', sellingPoints);
      formData.append('size', getFinalSize());
      formData.append('template', selectedTemplate);
      formData.append('style', selectedStyle);
      formData.append('quality', quality[0].toString());

      const response = await fetch('/api/generate-detail-design', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImages(data.images || []);
        setGenerationInfo({
          totalImages: data.totalImages || data.images?.length || 0,
          pointGroups: data.pointGroups || 1,
          pointsPerGroup: data.pointsPerGroup || 3
        });
        setShowAd(false);
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      console.error('生成详情图失败:', error);
      alert('生成详情图失败，请稍后重试');
      setShowAd(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdComplete = () => {
    setShowAd(false);
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `detail-design-${index + 1}-${getFinalSize()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败', error);
    }
  };

  const handleDownloadAll = async () => {
    if (generatedImages.length === 0) return;
    
    for (let i = 0; i < generatedImages.length; i++) {
      try {
        const response = await fetch(generatedImages[i]);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `detail-design-${i + 1}-${getFinalSize()}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('下载失败:', error);
      }
    }
  };

  const handleCopyLink = async (imageUrl: string, index: number) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopyStatus(prev => ({ ...prev, [index]: 'success' }));
      setTimeout(() => setCopyStatus(prev => ({ ...prev, [index]: 'idle' })), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  return (
    <div className="space-y-6">
      {/* 广告横幅 */}
      {showAd && (
        <AdBanner
          duration={45}
          onComplete={handleAdComplete}
          adContent={{
            title: 'AI电商详情图设计',
            description: '正在为您生成专业的电商详情图，30-60秒即可完成',
            ctaText: '探索更多功能'
          }}
        />
      )}

      {/* 头部标题 */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 shadow-lg shadow-green-500/20">
          <Layout className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            AI电商详情图设计
          </h2>
          <p className="text-sm text-muted-foreground">智能生成专业电商详情页图片</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* 左侧输入区域 */}
        <Card className="xl:col-span-5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="h-5 w-5 text-emerald-600" />
              配置详情图
            </CardTitle>
            <CardDescription>上传商品图并设置参数，AI将生成专业详情图</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 图片上传 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">商品图片</Label>
              <div
                className="relative flex min-h-[160px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-emerald-500/50 transition-all duration-200 bg-gradient-to-br from-muted/30 to-muted/10 hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950/30 dark:hover:to-teal-950/30"
                onClick={() => fileInputRef.current?.click()}
              >
                {productImage ? (
                  <div className="relative p-2">
                    <img
                      src={URL.createObjectURL(productImage)}
                      alt="商品图"
                      className="max-h-[140px] object-contain rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductImage(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-3">
                      <Upload className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium">点击上传商品图</p>
                    <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG 格式</p>
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

            {/* AI卖点生成 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">商品卖点</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="输入商品名称"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleGenerateSellingPoints}
                  disabled={isGeneratingPoints || !productName}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {isGeneratingPoints ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI生成
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                placeholder="输入商品卖点，每行一个，如：&#10;1. 优质面料，透气舒适&#10;2. 多口袋设计，实用便捷"
                value={sellingPoints}
                onChange={(e) => setSellingPoints(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">
                💡 AI会智能将卖点分组，每张图最多3个，超过自动生成多张
              </p>
            </div>

            {/* 尺寸设置 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4 text-emerald-600" />
                图片尺寸
              </Label>
              
              <Tabs value={sizeMode} onValueChange={(v) => setSizeMode(v as 'preset' | 'custom')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="preset" className="text-xs gap-1">
                    <Grid3X3 className="h-3 w-3" />
                    预设尺寸
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="text-xs gap-1">
                    <Settings2 className="h-3 w-3" />
                    自定义
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preset" className="mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <Button
                        key={size.id}
                        variant={selectedSize === size.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSize(size.id)}
                        className={`flex flex-col h-auto py-2 ${
                          selectedSize === size.id 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-500' 
                            : ''
                        }`}
                      >
                        <span className="text-xs font-semibold">{size.name}</span>
                        <span className="text-[10px] opacity-70">{size.desc}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">宽度 (px)</Label>
                      <Input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        min={100}
                        max={2000}
                        className="h-9"
                      />
                    </div>
                    <div className="text-muted-foreground mt-5">×</div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">高度 (px)</Label>
                      <Input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        min={100}
                        max={2000}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    建议尺寸：宽度 750-1200px，高度 500-1500px
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* 设计模板 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4 text-emerald-600" />
                设计模板
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`flex flex-col h-auto py-2 ${
                      selectedTemplate === template.id 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-500' 
                        : ''
                    }`}
                  >
                    <span className="text-lg">{template.icon}</span>
                    <span className="text-xs font-medium">{template.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 设计风格 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">设计风格</Label>
              <div className="flex gap-2">
                {styles.map((style) => (
                  <Button
                    key={style.id}
                    variant={selectedStyle === style.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex-1 ${
                      selectedStyle === style.id 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-500' 
                        : ''
                    }`}
                  >
                    <span className={`text-xs px-2 py-1 rounded ${style.color}`}>
                      {style.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 生成质量 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">生成质量</Label>
                <Badge variant="secondary" className="text-xs">{quality[0]}%</Badge>
              </div>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={60}
                max={100}
                step={5}
                className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-emerald-500 [&_[role=slider]]:to-teal-600"
              />
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (!productImage && !sellingPoints)}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 shadow-lg shadow-green-500/25"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI设计中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成详情图
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 右侧输出区域 */}
        <Card className="xl:col-span-7">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-5 w-5 text-emerald-600" />
                  生成结果
                </CardTitle>
                <CardDescription>AI生成的电商详情图</CardDescription>
              </div>
              {generatedImages.length > 0 && generationInfo && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    {generatedImages.length} 张
                  </Badge>
                  <Button 
                    size="sm" 
                    onClick={handleDownloadAll}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    批量下载
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[500px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[500px]">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 animate-pulse" />
                  </div>
                  <p className="mt-6 text-sm font-medium text-muted-foreground">AI正在设计中...</p>
                  <p className="text-xs text-muted-foreground mt-1">预计需要 30-60 秒</p>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-medium">
                        {getFinalSize()} px
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {generationInfo?.pointGroups || 1} 个卖点分组，每组 {generationInfo?.pointsPerGroup || 3} 个卖点
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {generatedImages.map((imageUrl, index) => (
                      <div 
                        key={index} 
                        className="relative group bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-3 border border-muted/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                            详情图 {index + 1} / {generatedImages.length}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            卖点 {index * 3 + 1}-{Math.min((index + 1) * 3, (generationInfo?.pointGroups || 1) * 3)}
                          </span>
                        </div>
                        
                        <div className="relative rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                          <img
                            src={imageUrl}
                            alt={`详情图 ${index + 1}`}
                            className="w-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => handlePreview(imageUrl)}
                          />
                          
                          {/* 操作按钮 */}
                          <div className="absolute bottom-3 right-3 flex gap-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md hover:bg-white"
                              onClick={() => handlePreview(imageUrl)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md hover:bg-white"
                              onClick={() => handleCopyLink(imageUrl, index)}
                            >
                              {copyStatus[index] === 'success' ? (
                                <span className="text-xs text-green-600">✓</span>
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              className="h-8 w-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md"
                              onClick={() => handleDownload(imageUrl, index)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    className="w-full"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    重新生成
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
                    <Layout className="h-12 w-12 text-emerald-400 dark:text-emerald-600" />
                  </div>
                  <p className="text-base font-medium">开始设计您的详情图</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    上传商品图片，输入卖点描述，选择尺寸和模板，AI将自动生成专业电商详情图
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 大图预览模态框 */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="预览大图"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => setPreviewImage(null)}
                variant="secondary"
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
              >
                关闭
              </Button>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const index = generatedImages.findIndex(img => img === previewImage);
                  if (index !== -1) handleDownload(previewImage, index);
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                <Download className="mr-1 h-4 w-4" />
                下载此图
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
