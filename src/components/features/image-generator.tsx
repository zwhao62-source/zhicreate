'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Upload, Download, RefreshCw } from 'lucide-react';
import AdBanner from '@/components/ui/ad-banner';

export default function ImageGenerator() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedSize, setSelectedSize] = useState('800x800');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = [
    { id: '800x800', name: '800x800', desc: '商品主图' },
    { id: '1000x1000', name: '1000x1000', desc: '高清主图' },
    { id: '1200x1200', name: '1200x1200', desc: '超高清主图' }
  ];

  const styles = [
    { id: 'realistic', name: '真实感', desc: '专业摄影风格' },
    { id: 'fashion', name: '时尚', desc: '潮流杂志风格' },
    { id: 'minimalist', name: '极简', desc: '简洁干净风格' },
    { id: 'lifestyle', name: '生活', desc: '日常场景风格' }
  ];

  const scenes = [
    { id: 'studio', name: '摄影棚', icon: '📷' },
    { id: 'outdoor', name: '户外', icon: '🌳' },
    { id: 'indoor', name: '室内', icon: '🏠' },
    { id: 'cafe', name: '咖啡馆', icon: '☕' },
    { id: 'street', name: '街道', icon: '🛣️' },
    { id: 'beach', name: '海滩', icon: '🏖️' }
  ];

  const [selectedScene, setSelectedScene] = useState('studio');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProductImage(file);
    }
  };

  const handleGenerate = async () => {
    if (!productImage && !prompt) {
      alert('请上传商品图片或输入描述');
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
      formData.append('prompt', prompt || '专业模特展示商品');
      formData.append('style', selectedStyle);
      formData.append('scene', selectedScene);
      formData.append('size', selectedSize);

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImages(data.images || []);
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      console.error('生成图片失败:', error);
      alert('生成图片失败，请稍后重试');
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
    link.download = `product-image-${selectedSize}-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 广告横幅 */}
      {showAd && isGenerating && (
        <AdBanner
          duration={45}
          onComplete={handleAdComplete}
          adContent={{
            title: 'AI商品图生成',
            description: '正在为您生成专业的商品展示图，30-60秒即可完成',
            ctaText: '探索更多功能'
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI商品图生成</h2>
          <p className="text-sm text-muted-foreground">上传商品图，自动生成专业模特展示</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>商品图片</CardTitle>
            <CardDescription>上传商品上身图，AI将生成专业展示图</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 图片上传区 */}
            <div className="space-y-2">
              <Label>商品图片</Label>
              <div
                className="flex min-h-[200px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {productImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(productImage)}
                      alt="商品图"
                      className="max-h-[200px] object-contain"
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

            {/* 文本描述 */}
            <div className="space-y-2">
              <Label>描述提示（可选）</Label>
              <Textarea
                placeholder="例如：亚洲模特，专业摄影棚，柔和灯光..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* 风格选择 */}
            <div className="space-y-2">
              <Label>风格选择</Label>
              <div className="flex flex-wrap gap-2">
                {styles.map((style) => (
                  <Badge
                    key={style.id}
                    variant={selectedStyle === style.id ? 'default' : 'outline'}
                    className="cursor-pointer hover:opacity-80"
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    {style.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 主图尺寸选择 */}
            <div className="space-y-2">
              <Label>主图尺寸（商品主图标准尺寸）</Label>
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

            {/* 场景选择 */}
            <div className="space-y-2">
              <Label>场景选择</Label>
              <div className="grid grid-cols-3 gap-2">
                {scenes.map((scene) => (
                  <Button
                    key={scene.id}
                    variant={selectedScene === scene.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedScene(scene.id)}
                  >
                    <span className="mr-1">{scene.icon}</span>
                    {scene.name}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成图片
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
                <CardDescription>AI生成的商品展示图</CardDescription>
              </div>
              {generatedImages.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重新生成
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
                    <p className="mt-2 text-sm text-muted-foreground">AI正在创作中...</p>
                    <p className="text-xs text-muted-foreground">预计需要30-60秒</p>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative group">
                        <img
                          src={imageUrl}
                          alt={`生成图片 ${index + 1}`}
                          className="w-full rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            onClick={() => handleDownload(imageUrl, index)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">上传商品图片后点击生成</p>
                    <p className="text-xs">AI将生成专业模特展示图</p>
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
