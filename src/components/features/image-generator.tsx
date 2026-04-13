'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Upload, Download, RefreshCw, Image as ImageIcon, Palette, Ruler, MapPin, Wand2, Check, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdBanner from '@/components/ui/ad-banner';

export default function ImageGenerator() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [rewrittenPrompt, setRewrittenPrompt] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedSize, setSelectedSize] = useState('800x800');
  const [selectedScene, setSelectedScene] = useState('studio');
  const [sizeMode, setSizeMode] = useState<'preset' | 'custom'>('preset');
  const [customWidth, setCustomWidth] = useState('800');
  const [customHeight, setCustomHeight] = useState('800');
  const [rewriteStatus, setRewriteStatus] = useState<'idle' | 'success' | 'applied'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFinalSize = () => {
    if (sizeMode === 'custom') {
      return `${customWidth}x${customHeight}`;
    }
    return selectedSize;
  };

  const sizes = [
    { id: '800x800', name: '800×800', desc: '商品主图' },
    { id: '1000x1000', name: '1000×1000', desc: '高清主图' },
    { id: '1200x1200', name: '1200×1200', desc: '超高清主图' }
  ];

  const styles = [
    { id: 'realistic', name: '真实感', desc: '专业摄影风格' },
    { id: 'fashion', name: '时尚', desc: '潮流杂志风格' },
    { id: 'minimalist', name: '极简', desc: '简洁干净风格' },
    { id: 'lifestyle', name: '生活', desc: '日常场景风格' }
  ];

  // 丰富的场景列表
  const scenes = [
    // 室内场景
    { id: 'studio', name: '专业摄影棚', category: '室内' },
    { id: 'home', name: '家居客厅', category: '室内' },
    { id: 'bedroom', name: '卧室', category: '室内' },
    { id: 'kitchen', name: '厨房', category: '室内' },
    { id: 'bathroom', name: '浴室', category: '室内' },
    { id: 'office', name: '办公室', category: '室内' },
    { id: 'closet', name: '衣帽间', category: '室内' },
    { id: 'gym', name: '健身房', category: '室内' },
    { id: 'spa', name: 'SPA馆', category: '室内' },
    { id: 'salon', name: '美发沙龙', category: '室内' },
    { id: 'hotel', name: '酒店房间', category: '室内' },
    { id: 'bookstore', name: '书店', category: '室内' },
    { id: 'library', name: '图书馆', category: '室内' },
    { id: 'gallery', name: '艺术画廊', category: '室内' },
    { id: 'museum', name: '博物馆', category: '室内' },
    
    // 商业场所
    { id: 'mall', name: '商场', category: '商业' },
    { id: 'boutique', name: '精品店', category: '商业' },
    { id: 'supermarket', name: '超市', category: '商业' },
    { id: 'cafe', name: '咖啡馆', category: '商业' },
    { id: 'restaurant', name: '餐厅', category: '商业' },
    { id: 'bar', name: '酒吧', category: '商业' },
    { id: 'hotel_lobby', name: '酒店大堂', category: '商业' },
    { id: 'bank', name: '银行', category: '商业' },
    { id: 'pharmacy', name: '药店', category: '商业' },
    { id: 'clinic', name: '诊所', category: '商业' },
    { id: 'gym_commercial', name: '健身中心', category: '商业' },
    { id: 'yoga_studio', name: '瑜伽馆', category: '商业' },
    
    // 户外场景
    { id: 'park', name: '公园', category: '户外' },
    { id: 'beach', name: '海滩', category: '户外' },
    { id: 'mountain', name: '山脉', category: '户外' },
    { id: 'forest', name: '森林', category: '户外' },
    { id: 'garden', name: '花园', category: '户外' },
    { id: 'lake', name: '湖泊', category: '户外' },
    { id: 'river', name: '河流', category: '户外' },
    { id: 'waterfall', name: '瀑布', category: '户外' },
    { id: 'desert', name: '沙漠', category: '户外' },
    { id: 'meadow', name: '草地', category: '户外' },
    { id: 'sunset_beach', name: '海边日落', category: '户外' },
    { id: 'rooftop', name: '天台', category: '户外' },
    { id: 'balcony', name: '阳台', category: '户外' },
    { id: 'terrace', name: '露台', category: '户外' },
    { id: 'courtyard', name: '庭院', category: '户外' },
    
    // 城市街景
    { id: 'street', name: '街道', category: '城市' },
    { id: 'alley', name: '小巷', category: '城市' },
    { id: 'bridge', name: '桥梁', category: '城市' },
    { id: 'station', name: '车站', category: '城市' },
    { id: 'airport', name: '机场', category: '城市' },
    { id: 'subway', name: '地铁站', category: '城市' },
    { id: 'plaza', name: '广场', category: '城市' },
    { id: 'skyscraper', name: '摩天大楼', category: '城市' },
    { id: 'downtown', name: '市中心', category: '城市' },
    { id: 'neighborhood', name: '社区', category: '城市' },
    { id: 'pedestrian_street', name: '步行街', category: '城市' },
    { id: 'night_street', name: '夜景街道', category: '城市' },
    { id: 'neon_city', name: '霓虹城市', category: '城市' },
    
    // 特殊场景
    { id: 'stage', name: '舞台', category: '特殊' },
    { id: 'runway', name: '时装秀场', category: '特殊' },
    { id: 'studio_portrait', name: '肖像棚', category: '特殊' },
    { id: 'white_bg', name: '纯白背景', category: '特殊' },
    { id: 'gradient_bg', name: '渐变背景', category: '特殊' },
    { id: 'vintage', name: '复古风格', category: '特殊' },
    { id: 'futuristic', name: '未来风格', category: '特殊' },
    { id: 'abstract', name: '抽象背景', category: '特殊' },
    
    // 自然风景
    { id: 'sea', name: '大海', category: '自然' },
    { id: 'island', name: '海岛', category: '自然' },
    { id: 'coral', name: '珊瑚礁', category: '自然' },
    { id: 'underwater', name: '水下', category: '自然' },
    { id: 'sky', name: '天空', category: '自然' },
    { id: 'clouds', name: '云端', category: '自然' },
    { id: 'snow', name: '雪景', category: '自然' },
    { id: 'ice', name: '冰原', category: '自然' },
    { id: 'aurora', name: '极光', category: '自然' },
    { id: 'rain', name: '雨景', category: '自然' },
    { id: 'rainbow', name: '彩虹', category: '自然' },
    { id: 'autumn', name: '秋景', category: '自然' },
    { id: 'spring', name: '春日', category: '自然' },
    { id: 'cherry_blossom', name: '樱花', category: '自然' },
    { id: 'lavender', name: '薰衣草田', category: '自然' },
    
    // 旅行场景
    { id: 'eiffel_tower', name: '埃菲尔铁塔', category: '旅行' },
    { id: 'big_ben', name: '大本钟', category: '旅行' },
    { id: 'statue_liberty', name: '自由女神', category: '旅行' },
    { id: 'great_wall', name: '长城', category: '旅行' },
    { id: 'temple', name: '寺庙', category: '旅行' },
    { id: 'pagoda', name: '宝塔', category: '旅行' },
    { id: 'castle', name: '城堡', category: '旅行' },
    { id: 'palace', name: '宫殿', category: '旅行' },
    { id: 'ancient_ruins', name: '古迹', category: '旅行' },
    { id: 'tropical', name: '热带雨林', category: '旅行' },
    { id: 'safari', name: '草原 safari', category: '旅行' },
    { id: 'boat', name: '游艇', category: '旅行' },
    { id: 'cruise', name: '邮轮', category: '旅行' },
    { id: 'airplane', name: '飞机舱内', category: '旅行' },
    { id: 'train', name: '火车车厢', category: '旅行' },
  ];

  // 按分类分组场景
  const scenesByCategory = scenes.reduce((acc, scene) => {
    if (!acc[scene.category]) {
      acc[scene.category] = [];
    }
    acc[scene.category].push(scene);
    return acc;
  }, {} as Record<string, typeof scenes>);

  // 获取场景名称
  const getSceneName = (id: string) => {
    const scene = scenes.find(s => s.id === id);
    return scene ? scene.name : id;
  };

  // AI改写提示词
  const handleRewritePrompt = async () => {
    if (!prompt.trim()) {
      alert('请先输入描述提示');
      return;
    }

    setIsRewriting(true);
    setRewriteStatus('idle');
    setOriginalPrompt(prompt);

    try {
      const response = await fetch('/api/rewrite-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          style: selectedStyle,
          scene: getSceneName(selectedScene),
          size: getFinalSize()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRewrittenPrompt(data.rewrittenPrompt || prompt);
        setRewriteStatus('success');
      } else {
        throw new Error('改写失败');
      }
    } catch (error) {
      console.error('AI改写失败:', error);
      setRewrittenPrompt(prompt);
      setRewriteStatus('success');
    } finally {
      setIsRewriting(false);
    }
  };

  // 应用改写结果
  const handleApplyRewritten = () => {
    if (rewrittenPrompt) {
      setPrompt(rewrittenPrompt);
      setRewriteStatus('applied');
    }
  };

  // 恢复原始提示词
  const handleRestoreOriginal = () => {
    setPrompt(originalPrompt);
    setRewrittenPrompt('');
    setRewriteStatus('idle');
  };

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
      formData.append('size', getFinalSize());

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImages(data.images || []);
        setShowAd(false);
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      console.error('生成图片失败:', error);
      alert('生成图片失败，请稍后重试');
      setShowAd(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleAdComplete = () => {
    setShowAd(false);
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `product-image-${getFinalSize()}-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* 广告横幅 */}
      {showAd && (
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

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold">AI商品图生成</h2>
          <p className="text-xs text-muted-foreground">上传商品图，自动生成专业模特展示</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 输入区域 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-pink-600" />
              商品图片
            </CardTitle>
            <CardDescription className="text-xs">上传商品上身图，AI生成展示图</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 图片上传区 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">商品图片</Label>
              <div
                className="relative flex min-h-[100px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 hover:border-pink-500/50 transition-colors bg-muted/20"
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

            {/* 描述提示 - AI改写功能 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">描述提示</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRewritePrompt}
                  disabled={isRewriting || !prompt.trim()}
                  className="h-6 text-[10px] px-1.5 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                >
                  {isRewriting ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-0.5" />
                  ) : (
                    <Wand2 className="h-3 w-3 mr-0.5" />
                  )}
                  AI优化
                </Button>
              </div>
              
              <Textarea
                placeholder="描述商品特点、模特风格、场景氛围..."
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setRewriteStatus('idle');
                }}
                rows={3}
                className="resize-none text-xs"
              />

              {/* AI改写结果 */}
              {rewriteStatus === 'success' && rewrittenPrompt && (
                <div className="space-y-1.5 p-2 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100">
                  <div className="flex items-center gap-1">
                    <Wand2 className="h-3 w-3 text-pink-600" />
                    <span className="text-[10px] font-medium text-pink-600">AI优化结果</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground bg-white/50 rounded p-1.5 max-h-[80px] overflow-y-auto">
                    {rewrittenPrompt}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={handleApplyRewritten}
                      className="h-6 text-[10px] px-2 bg-pink-500 hover:bg-pink-600"
                    >
                      <Check className="h-2.5 w-2.5 mr-0.5" />
                      应用
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRestoreOriginal}
                      className="h-6 text-[10px] px-2"
                    >
                      <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
                      恢复
                    </Button>
                  </div>
                </div>
              )}

              {rewriteStatus === 'applied' && (
                <div className="flex items-center gap-1 text-[10px] text-green-600">
                  <Check className="h-3 w-3" />
                  已应用优化后的提示词
                </div>
              )}

              <p className="text-[10px] text-muted-foreground/70">
                输入描述后点击"AI优化"，AI将完善提示词，让生图更准确
              </p>
            </div>

            {/* 风格选择 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Palette className="h-3 w-3" />
                风格选择
              </Label>
              <div className="flex flex-wrap gap-1">
                {styles.map((style) => (
                  <Badge
                    key={style.id}
                    variant={selectedStyle === style.id ? 'default' : 'outline'}
                    className={`cursor-pointer text-[11px] h-6 ${selectedStyle === style.id ? 'bg-pink-500 hover:bg-pink-600 border-pink-500' : ''}`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    {style.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 主图尺寸选择 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                主图尺寸
              </Label>
              <Tabs value={sizeMode} onValueChange={(v) => setSizeMode(v as 'preset' | 'custom')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-7">
                  <TabsTrigger value="preset" className="text-[11px] gap-1">
                    <ImageIcon className="h-2.5 w-2.5" />
                    预设
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="text-[11px] gap-1">
                    <Ruler className="h-2.5 w-2.5" />
                    自定义
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preset" className="mt-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    {sizes.map((size) => (
                      <Button
                        key={size.id}
                        variant={selectedSize === size.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSize(size.id)}
                        className={`flex flex-col gap-0.5 h-8 py-1 ${selectedSize === size.id ? 'bg-pink-500 hover:bg-pink-600 border-pink-500' : ''}`}
                      >
                        <span className="text-[11px] font-medium">{size.name}</span>
                        <span className="text-[9px] opacity-70">{size.desc}</span>
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

            {/* 场景选择 - 下拉式 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                场景选择
              </Label>
              <Select value={selectedScene} onValueChange={setSelectedScene}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="选择场景" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(scenesByCategory).map(([category, categoryScenes]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="text-[10px]">{category}</SelectLabel>
                      {categoryScenes.map((scene) => (
                        <SelectItem 
                          key={scene.id} 
                          value={scene.id}
                          className="text-xs py-1"
                        >
                          {scene.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-8 text-xs bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  生成图片
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-pink-600" />
                <CardTitle className="text-sm">生成结果</CardTitle>
              </div>
              {generatedImages.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleGenerate} className="h-7 text-[11px]">
                  <RefreshCw className="mr-1 h-3 w-3" />
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
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-pink-500" />
                    <p className="mt-2 text-xs text-muted-foreground">AI正在创作中...</p>
                    <p className="text-[10px] text-muted-foreground">预计需要30-60秒</p>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="relative group">
                        <img
                          src={imageUrl}
                          alt={`生成图片 ${index + 1}`}
                          className="w-full rounded-lg object-cover bg-muted/30"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            onClick={() => handleDownload(imageUrl, index)}
                            className="h-7 text-[11px] bg-pink-500 hover:bg-pink-600"
                          >
                            <Download className="mr-1 h-3 w-3" />
                            下载
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">
                        图片 {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-xs">上传商品图片后点击生成</p>
                    <p className="text-[11px] text-muted-foreground/70">AI将生成专业模特展示图</p>
                    <p className="text-[11px] text-pink-500/70 mt-2">输入描述后点击"AI优化"效果更佳</p>
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
