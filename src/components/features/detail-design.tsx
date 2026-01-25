'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles, Upload, Download, Layout, Image as ImageIcon } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = [
    { id: '750x500', name: '750x500', desc: '移动端标准' },
    { id: '750x800', name: '750x800', desc: '移动端中长' },
    { id: '750x1000', name: '750x1000', desc: '移动端长图' },
    { id: '1200x800', name: '1200x800', desc: 'PC端标准' },
    { id: '1200x1200', name: '1200x1200', desc: 'PC端方图' }
  ];

  const templates = [
    { 
      id: 'showcase', 
      name: '产品展示', 
      icon: '📦',
      desc: '突出产品本身，清晰展示商品全貌和细节' 
    },
    { 
      id: 'highlight', 
      name: '卖点突出', 
      icon: '✨',
      desc: '用视觉元素突出核心卖点和优势' 
    },
    { 
      id: 'scene', 
      name: '使用场景', 
      icon: '🎬',
      desc: '展示产品在真实场景中的应用效果' 
    },
    { 
      id: 'feature', 
      name: '参数说明', 
      icon: '📋',
      desc: '专业展示产品参数和规格信息' 
    },
    { 
      id: 'quality', 
      name: '质量保证', 
      icon: '🏆',
      desc: '突出品质认证和质量保证元素' 
    },
    { 
      id: 'promotion', 
      name: '促销活动', 
      icon: '🎉',
      desc: '融入促销元素，吸引购买欲望' 
    }
  ];

  const styles = [
    { id: 'minimalist', name: '简约风格', desc: '干净简洁，突出产品' },
    { id: 'premium', name: '高端奢华', desc: '质感出众，定位高端' },
    { id: 'vibrant', name: '活力时尚', desc: '色彩鲜明，年轻化' },
    { id: 'professional', name: '专业商务', desc: '稳重可靠，信任感强' }
  ];

  const [selectedStyle, setSelectedStyle] = useState('minimalist');

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
      formData.append('size', selectedSize);
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
        // 生成成功后立即关闭广告
        setShowAd(false);
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      console.error('生成详情图失败:', error);
      alert('生成详情图失败，请稍后重试');
      // 生成失败时也要关闭广告
      setShowAd(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdComplete = () => {
    setShowAd(false);
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `detail-design-${index + 1}-${selectedSize}.png`;
    link.click();
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

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
          <Layout className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI电商详情图设计</h2>
          <p className="text-sm text-muted-foreground">生成符合电商内页尺寸的专业详情图</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>商品信息</CardTitle>
            <CardDescription>上传商品图并输入卖点，AI将生成专业详情图</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 图片上传区 */}
            <div className="space-y-2">
              <Label>商品图片</Label>
              <div
                className="flex min-h-[180px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {productImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(productImage)}
                      alt="商品图"
                      className="max-h-[180px] object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductImage(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      点击或拖拽上传商品图
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

            {/* 卖点输入 */}
            <div className="space-y-2">
              <Label>商品卖点（核心卖点，每行一个）</Label>
              <div className="space-y-2">
                <Textarea
                  placeholder="例如：&#10;1. 优质面料，透气舒适&#10;2. 多口袋设计，实用便捷&#10;3. 经典百搭，时尚潮流&#10;4. 精工细作，品质保证&#10;5. 限时优惠，性价比高"
                  value={sellingPoints}
                  onChange={(e) => setSellingPoints(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  💡 AI会智能将卖点分组，每张详情图最多显示3个卖点。如果卖点超过3个，将自动生成多张详情图。
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="商品名称（用于AI生成卖点）"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleGenerateSellingPoints}
                    disabled={isGeneratingPoints || !productName}
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
                  >
                    {isGeneratingPoints ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI写卖点
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* 尺寸选择 */}
            <div className="space-y-2">
              <Label>详情图尺寸（电商标准尺寸）</Label>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size.id}
                    variant={selectedSize === size.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSize(size.id)}
                    className="flex flex-col gap-1 h-auto py-2"
                  >
                    <span className="text-xs font-bold">{size.name}</span>
                    <span className="text-[10px] opacity-70">{size.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 模板选择 */}
            <div className="space-y-2">
              <Label>设计模板</Label>
              <div className="grid grid-cols-3 gap-2">
                {templates.map((template) => (
                  <Badge
                    key={template.id}
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    className={`cursor-pointer hover:opacity-80 p-3 flex flex-col items-center gap-1 ${
                      selectedTemplate === template.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : ''
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <span className="text-2xl">{template.icon}</span>
                    <span className="font-medium text-xs">{template.name}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* 风格选择 */}
            <div className="space-y-2">
              <Label>设计风格</Label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((style) => (
                  <Button
                    key={style.id}
                    variant={selectedStyle === style.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStyle(style.id)}
                    className="flex flex-col gap-1 h-auto py-2"
                  >
                    <span className="font-medium text-sm">{style.name}</span>
                    <span className="text-[10px] opacity-70">{style.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 质量调节 */}
            <div className="space-y-2">
              <Label>生成质量: {quality[0]}%</Label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={60}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Layout className="mr-2 h-4 w-4" />
                  生成详情图
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>生成结果</CardTitle>
                <CardDescription>AI生成的电商详情图</CardDescription>
              </div>
              {generatedImages.length > 0 && generationInfo && (
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-2">
                    <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-600">
                      {generationInfo.totalImages} 张详情图
                    </Badge>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Badge variant="outline">
                      {generationInfo.pointGroups} 个卖点分组
                    </Badge>
                    <Badge variant="outline">
                      每组 {generationInfo.pointsPerGroup} 个卖点
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px]">
              {isGenerating ? (
                <div className="flex h-[600px] items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">AI正在设计详情图中...</p>
                    <p className="text-xs text-muted-foreground">预计需要30-60秒</p>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {generatedImages.map((imageUrl, index) => {
                      // 计算当前图对应的卖点范围
                      const startPoint = index * 3 + 1;
                      const endPoint = Math.min(startPoint + 2, (generationInfo?.pointGroups || 1) * 3);
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="font-medium">
                              详情图 {index + 1} / {generatedImages.length}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              卖点 {startPoint}-{endPoint}
                            </span>
                          </div>
                          <div className="relative group">
                            <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border">
                              <img
                                src={imageUrl}
                                alt={`详情图 ${index + 1}`}
                                className="w-full object-contain"
                                style={{
                                  maxWidth: '100%',
                                  height: 'auto'
                                }}
                              />
                            </div>
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                onClick={() => handleDownload(imageUrl, index)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    className="w-full"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    重新生成
                  </Button>
                </div>
              ) : (
                <div className="flex h-[600px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Layout className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">上传商品图并输入卖点</p>
                    <p className="text-xs">AI将生成符合电商标准的详情图</p>
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
