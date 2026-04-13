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
    { id: '750x500', name: '750×500', desc: '移动端标准' },
    { id: '750x800', name: '750×800', desc: '移动端中长' },
    { id: '750x1000', name: '750×1000', desc: '移动端长图' },
    { id: '1200x800', name: '1200×800', desc: 'PC端标准' },
    { id: '1200x1200', name: '1200×1200', desc: 'PC端方图' },
    { id: '800x1200', name: '800×1200', desc: '移动端竖版' }
  ];

  const templates = [
    { id: 'showcase', name: '产品展示', icon: '📦' },
    { id: 'highlight', name: '卖点突出', icon: '✨' },
    { id: 'scene', name: '使用场景', icon: '🎬' },
    { id: 'feature', name: '参数说明', icon: '📋' },
    { id: 'quality', name: '质量保证', icon: '🏆' },
    { id: 'promotion', name: '促销活动', icon: '🎉' }
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
    <div className="space-y-4">
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
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
          <Layout className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI电商详情图设计</h2>
          <p className="text-xs text-muted-foreground">智能生成专业电商详情页图片</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 左侧输入区域 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-emerald-600" />
              配置详情图
            </CardTitle>
            <CardDescription className="text-xs">设置参数，AI生成专业详情图</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 图片上传 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">商品图片</Label>
              <div
                className="relative flex min-h-[100px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 hover:border-emerald-500/50 transition-colors bg-muted/20"
                onClick={() => fileInputRef.current?.click()}
              >
                {productImage ? (
                  <div className="relative p-1.5">
                    <img
                      src={URL.createObjectURL(productImage)}
                      alt="商品图"
                      className="max-h-[90px] object-contain rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full text-[10px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductImage(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <Upload className="h-5 w-5 mx-auto text-muted-foreground/50 mb-1.5" />
                    <p className="text-[11px] text-muted-foreground">点击上传商品图</p>
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
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">商品卖点</Label>
              <div className="flex gap-1.5">
                <Input
                  placeholder="商品名称"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  onClick={handleGenerateSellingPoints}
                  disabled={isGeneratingPoints || !productName}
                  className="h-7 px-2 text-xs bg-emerald-500 hover:bg-emerald-600"
                >
                  {isGeneratingPoints ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <Textarea
                placeholder="卖点，每行一个"
                value={sellingPoints}
                onChange={(e) => setSellingPoints(e.target.value)}
                rows={2}
                className="resize-none text-xs"
              />
            </div>

            {/* 尺寸设置 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                图片尺寸
              </Label>
              
              <Tabs value={sizeMode} onValueChange={(v) => setSizeMode(v as 'preset' | 'custom')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-7">
                  <TabsTrigger value="preset" className="text-[11px] gap-1">
                    <Grid3X3 className="h-2.5 w-2.5" />
                    预设
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="text-[11px] gap-1">
                    <Settings2 className="h-2.5 w-2.5" />
                    自定义
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preset" className="mt-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    {sizes.map((size) => (
                      <Button
                        key={size.id}
                        variant={selectedSize === size.id ? 'default' : 'outline'}
                        className={`h-8 text-[11px] ${selectedSize === size.id ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : ''}`}
                        onClick={() => setSelectedSize(size.id)}
                      >
                        {size.name}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="mt-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      min={100}
                      max={2000}
                      className="h-7 text-xs w-16"
                      placeholder="宽"
                    />
                    <span className="text-muted-foreground text-xs">×</span>
                    <Input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      min={100}
                      max={2000}
                      className="h-7 text-xs w-16"
                      placeholder="高"
                    />
                    <span className="text-muted-foreground text-[10px]">px</span>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* 设计模板 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Palette className="h-3 w-3" />
                设计模板
              </Label>
              <div className="grid grid-cols-6 gap-1">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    className={`h-8 flex flex-col gap-0.5 py-1 ${selectedTemplate === template.id ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : ''}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <span className="text-sm">{template.icon}</span>
                    <span className="text-[9px] leading-none">{template.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 设计风格 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">设计风格</Label>
              <div className="flex gap-1">
                {styles.map((style) => (
                  <Button
                    key={style.id}
                    variant={selectedStyle === style.id ? 'default' : 'outline'}
                    className={`flex-1 h-7 text-[11px] ${selectedStyle === style.id ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : ''}`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${style.color}`}>
                      {style.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 生成质量 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">生成质量</Label>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{quality[0]}%</Badge>
              </div>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={60}
                max={100}
                step={5}
                className="w-full [&_[role=slider]]:bg-emerald-500"
              />
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (!productImage && !sellingPoints)}
              className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  AI设计中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  生成详情图
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 右侧输出区域 */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                <CardTitle className="text-sm">生成结果</CardTitle>
              </div>
              {generatedImages.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50 text-emerald-700 border-emerald-200">
                    {generatedImages.length} 张
                  </Badge>
                  <Button 
                    size="sm" 
                    onClick={handleDownloadAll}
                    className="h-6 text-[11px] px-2 bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    批量下载
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
                  <p className="mt-3 text-xs text-muted-foreground">AI正在设计中...</p>
                  <p className="text-[10px] text-muted-foreground">预计需要 30-60 秒</p>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-md px-2.5 py-1.5 flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] h-5 bg-white">
                      {getFinalSize()} px
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {generationInfo?.pointGroups || 1} 分组，每组 {generationInfo?.pointsPerGroup || 3} 个卖点
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {generatedImages.map((imageUrl, index) => (
                      <div 
                        key={index} 
                        className="bg-muted/30 rounded-lg p-2 border border-muted/50"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-100 text-emerald-700">
                            详情图 {index + 1} / {generatedImages.length}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            卖点 {index * 3 + 1}-{Math.min((index + 1) * 3, (generationInfo?.pointGroups || 1) * 3)}
                          </span>
                        </div>
                        
                        <div className="relative rounded overflow-hidden bg-white">
                          <img
                            src={imageUrl}
                            alt={`详情图 ${index + 1}`}
                            className="w-full object-contain cursor-pointer hover:opacity-95"
                            onClick={() => handlePreview(imageUrl)}
                          />
                          
                          {/* 操作按钮 */}
                          <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-6 w-6 bg-white/90 hover:bg-white shadow-sm"
                              onClick={() => handlePreview(imageUrl)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-6 w-6 bg-white/90 hover:bg-white shadow-sm"
                              onClick={() => handleCopyLink(imageUrl, index)}
                            >
                              {copyStatus[index] === 'success' ? (
                                <span className="text-[10px] text-green-600 font-medium">✓</span>
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              className="h-6 w-6 bg-emerald-500 hover:bg-emerald-600 shadow-sm"
                              onClick={() => handleDownload(imageUrl, index)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    className="w-full h-7 text-[11px]"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    重新生成
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Layout className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">开始设计详情图</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1 max-w-[200px]">
                    上传商品图，输入卖点，AI自动生成专业详情图
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
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="预览大图"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="absolute top-3 right-3 flex gap-1.5">
              <Button
                size="sm"
                onClick={() => {
                  const index = generatedImages.findIndex(img => img === previewImage);
                  if (index !== -1) handleDownload(previewImage, index);
                }}
                className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600"
              >
                <Download className="h-3 w-3 mr-1" />
                下载
              </Button>
              <Button
                size="sm"
                onClick={() => setPreviewImage(null)}
                variant="secondary"
                className="h-7 text-xs bg-white/90 hover:bg-white"
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
