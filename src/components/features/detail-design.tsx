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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, Sparkles, Upload, Download, Layout, Image as ImageIcon, 
  Copy, Eye, Settings2, Grid3X3, Palette as PaletteIcon, Ruler, Type,
  Layers, ChevronLeft, ChevronRight, Sparkles as SparklesIcon, Check,
  AlignLeft, AlignCenter, AlignRight, Minus, Plus
} from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState('fashion');
  const [selectedColorScheme, setSelectedColorScheme] = useState('elegant');
  const [selectedLayout, setSelectedLayout] = useState('center');
  const [selectedFont, setSelectedFont] = useState('modern');
  const [colorPage, setColorPage] = useState(0);
  
  // 字体层级配置
  const [headlineSize, setHeadlineSize] = useState<'large' | 'medium' | 'small'>('large');
  const [headlineWeight, setHeadlineWeight] = useState<'bold' | 'medium' | 'light'>('bold');
  const [headlineAlign, setHeadlineAlign] = useState<'center' | 'left' | 'right'>('center');
  const [subheadlineSize, setSubheadlineSize] = useState<'large' | 'medium' | 'small'>('medium');
  const [subheadlineWeight, setSubheadlineWeight] = useState<'bold' | 'medium' | 'light'>('medium');
  const [subheadlineAlign, setSubheadlineAlign] = useState<'center' | 'left' | 'right'>('center');
  const [bodySize, setBodySize] = useState<'large' | 'medium' | 'small'>('small');
  const [bodyWeight, setBodyWeight] = useState<'bold' | 'medium' | 'light'>('light');
  const [bodyAlign, setBodyAlign] = useState<'center' | 'left' | 'right'>('left');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = [
    { id: '750x500', name: '750×500', desc: '移动端标准' },
    { id: '750x800', name: '750×800', desc: '移动端中长' },
    { id: '750x1000', name: '750×1000', desc: '移动端长图' },
    { id: '1200x800', name: '1200×800', desc: 'PC端标准' },
    { id: '1200x1200', name: '1200×1200', desc: 'PC端方图' },
    { id: '800x1200', name: '800×1200', desc: '移动端竖版' }
  ];

  const categories = [
    { id: 'fashion', name: '服装鞋包', icon: '👗' },
    { id: 'beauty', name: '美妆护肤', icon: '💄' },
    { id: 'digital', name: '数码科技', icon: '📱' },
    { id: 'food', name: '食品生鲜', icon: '🍽️' },
    { id: 'home', name: '家居百货', icon: '🏠' },
    { id: 'baby', name: '母婴儿童', icon: '🧸' },
    { id: 'sports', name: '运动户外', icon: '⚡' },
    { id: 'jewelry', name: '珠宝配饰', icon: '💎' }
  ];

  const colorSchemes = [
    { id: 'elegant', name: '优雅莫兰迪', colors: ['#8B7355', '#D4C4B0', '#E8DFD5'], desc: '高级百搭' },
    { id: 'luxury', name: '奢华香槟', colors: ['#C9A86C', '#F5E6D3', '#2C1810'], desc: '高端质感' },
    { id: 'minimal', name: '极简黑白', colors: ['#333333', '#FFFFFF', '#666666'], desc: '极简主义' },
    { id: 'vintage', name: '复古美式', colors: ['#8B4513', '#F5DEB3', '#CD853F'], desc: '复古文艺' },
    { id: 'fresh', name: '清新自然', colors: ['#7BA05B', '#F5F0E6', '#4A6741'], desc: '清新活力' },
    { id: 'forest', name: '森林深绿', colors: ['#2D5016', '#8FBC8F', '#556B2F'], desc: '原始森林' },
    { id: 'earth', name: '大地色系', colors: ['#8B7355', '#D2B48C', '#6B4423'], desc: '质朴自然' },
    { id: 'ocean', name: '海洋蓝色', colors: ['#1E4D6B', '#87CEEB', '#4682B4'], desc: '清凉舒爽' },
    { id: 'warm', name: '温暖焦糖', colors: ['#D4865C', '#FDF6F0', '#8B5A3C'], desc: '温馨食欲' },
    { id: 'sunset', name: '日落橙红', colors: ['#FF6B35', '#C9B1FF', '#FFD93D'], desc: '浪漫黄昏' },
    { id: 'romantic', name: '浪漫玫瑰', colors: ['#D4A5A5', '#FDF2F2', '#8B6B6B'], desc: '温柔精致' },
    { id: 'pastel', name: '马卡龙', colors: ['#FFB6C1', '#E6E6FA', '#98FB98'], desc: '少女甜蜜' },
    { id: 'tech', name: '科技深蓝', colors: ['#2C3E50', '#ECF0F1', '#3498DB'], desc: '专业信赖' },
    { id: 'neon', name: '霓虹潮流', colors: ['#FF00FF', '#00FFFF', '#1E90FF'], desc: '赛博朋克' },
    { id: 'nordic', name: '北欧冷淡', colors: ['#D3D3D3', '#F5F5DC', '#BC8F8F'], desc: '简约清冷' },
    { id: 'cyber', name: '赛博深紫', colors: ['#2E1A47', '#9B59B6', '#8E44AD'], desc: '未来科技' },
    { id: 'chinese', name: '中国红金', colors: ['#C41E3A', '#FFD700', '#1A1A1A'], desc: '喜庆大气' },
    { id: 'japanese', name: '日式和风', colors: ['#FFFAFA', '#2F4F4F', '#BC002D'], desc: '素雅禅意' },
    { id: 'korean', name: '韩式奶油', colors: ['#FFF5E1', '#FFE4C4', '#DEB887'], desc: '温柔清新' },
    { id: 'tropical', name: '热带风情', colors: ['#FF7F50', '#20B2AA', '#FFD700'], desc: '热情活力' },
  ];

  const COLORS_PER_PAGE = 8;
  const totalPages = Math.ceil(colorSchemes.length / COLORS_PER_PAGE);
  const currentColors = colorSchemes.slice(colorPage * COLORS_PER_PAGE, (colorPage + 1) * COLORS_PER_PAGE);

  const layouts = [
    { id: 'center', name: '居中对称', desc: '大气稳重' },
    { id: 'left', name: '左对齐', desc: '现代简约' },
    { id: 'magazine', name: '杂志风', desc: '创意时尚' },
    { id: 'split', name: '左右分栏', desc: '信息清晰' },
    { id: 'overlap', name: '图文叠加', desc: '层次丰富' }
  ];

  const fonts = [
    { id: 'modern', name: '现代无衬线', desc: '简洁有力，几何感强' },
    { id: 'elegant', name: '优雅衬线', desc: '曲线柔美，品质感强' },
    { id: 'playful', name: '活泼手写', desc: '亲切友好，轻松自然' },
    { id: 'bold', name: '粗壮黑体', desc: '冲击力强，视觉震撼' }
  ];

  const templates = [
    { id: 'showcase', name: '产品展示', icon: '📦' },
    { id: 'highlight', name: '卖点突出', icon: '✨' },
    { id: 'scene', name: '使用场景', icon: '🎬' },
    { id: 'feature', name: '参数说明', icon: '📋' },
    { id: 'quality', name: '质量保证', icon: '🏆' },
    { id: 'promotion', name: '促销活动', icon: '🎉' }
  ];

  const [selectedStyle, setSelectedStyle] = useState('minimalist');

  // 字体层级预设
  type SizeOption = 'large' | 'medium' | 'small';
  type WeightOption = 'bold' | 'medium' | 'light';
  type AlignOption = 'left' | 'center' | 'right';
  
  interface TypographyPreset {
    id: string;
    name: string;
    headline: { size: SizeOption; weight: WeightOption; align: AlignOption };
    subheadline: { size: SizeOption; weight: WeightOption; align: AlignOption };
    body: { size: SizeOption; weight: WeightOption; align: AlignOption };
  }
  
  const typographyPresets: TypographyPreset[] = [
    { 
      id: 'default', 
      name: '默认优雅', 
      headline: { size: 'large', weight: 'bold', align: 'center' },
      subheadline: { size: 'medium', weight: 'medium', align: 'center' },
      body: { size: 'small', weight: 'light', align: 'left' }
    },
    { 
      id: 'bold', 
      name: '力量冲击', 
      headline: { size: 'large', weight: 'bold', align: 'center' },
      subheadline: { size: 'medium', weight: 'bold', align: 'center' },
      body: { size: 'medium', weight: 'medium', align: 'left' }
    },
    { 
      id: 'minimal', 
      name: '极简留白', 
      headline: { size: 'medium', weight: 'medium', align: 'left' },
      subheadline: { size: 'small', weight: 'light', align: 'left' },
      body: { size: 'small', weight: 'light', align: 'left' }
    },
    { 
      id: 'magazine', 
      name: '杂志风格', 
      headline: { size: 'large', weight: 'bold', align: 'left' },
      subheadline: { size: 'medium', weight: 'medium', align: 'left' },
      body: { size: 'small', weight: 'light', align: 'left' }
    },
  ];

  const [typographyPreset, setTypographyPreset] = useState('default');
  const [typographyMode, setTypographyMode] = useState<'preset' | 'custom'>('preset');

  const applyTypographyPreset = (presetId: string) => {
    const preset = typographyPresets.find(p => p.id === presetId);
    if (preset) {
      setHeadlineSize(preset.headline.size);
      setHeadlineWeight(preset.headline.weight);
      setHeadlineAlign(preset.headline.align);
      setSubheadlineSize(preset.subheadline.size);
      setSubheadlineWeight(preset.subheadline.weight);
      setSubheadlineAlign(preset.subheadline.align);
      setBodySize(preset.body.size);
      setBodyWeight(preset.body.weight);
      setBodyAlign(preset.body.align);
    }
  };

  const getFinalSize = () => {
    if (sizeMode === 'custom') {
      return `${customWidth}x${customHeight}`;
    }
    return selectedSize;
  };

  const getCurrentColorScheme = () => {
    return colorSchemes.find(c => c.id === selectedColorScheme) || colorSchemes[0];
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
          category: selectedCategory,
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
      formData.append('category', selectedCategory);
      formData.append('colorScheme', selectedColorScheme);
      formData.append('layout', selectedLayout);
      formData.append('font', selectedFont);
      // 字体层级配置
      formData.append('headlineSize', headlineSize);
      formData.append('headlineWeight', headlineWeight);
      formData.append('headlineAlign', headlineAlign);
      formData.append('subheadlineSize', subheadlineSize);
      formData.append('subheadlineWeight', subheadlineWeight);
      formData.append('subheadlineAlign', subheadlineAlign);
      formData.append('bodySize', bodySize);
      formData.append('bodyWeight', bodyWeight);
      formData.append('bodyAlign', bodyAlign);

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

  // 字体层级组件
  type TypographyLevelProps = {
    label: string;
    size: SizeOption;
    setSize: (v: SizeOption) => void;
    weight: WeightOption;
    setWeight: (v: WeightOption) => void;
    align: AlignOption;
    setAlign: (v: AlignOption) => void;
    icon: string;
  };
  
  const TypographyLevel = ({ 
    label, 
    size, setSize, 
    weight, setWeight, 
    align, setAlign,
    icon
  }: TypographyLevelProps) => (
    <div className="space-y-1.5 p-2 rounded bg-muted/30">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {/* 字号 */}
        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground">字号</span>
          <div className="flex gap-0.5">
            {(['small', 'medium', 'large'] as SizeOption[]).map(s => (
              <Button
                key={s}
                variant={size === s ? 'default' : 'outline'}
                size="sm"
                className={`h-5 text-[9px] px-1 ${size === s ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                onClick={() => setSize(s)}
              >
                {s === 'small' ? 'S' : s === 'medium' ? 'M' : 'L'}
              </Button>
            ))}
          </div>
        </div>
        {/* 字重 */}
        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground">字重</span>
          <div className="flex gap-0.5">
            {([{ v: 'light' as WeightOption, l: '细' }, { v: 'medium' as WeightOption, l: '中' }, { v: 'bold' as WeightOption, l: '粗' }]).map(w => (
              <Button
                key={w.v}
                variant={weight === w.v ? 'default' : 'outline'}
                size="sm"
                className={`h-5 text-[9px] px-1 ${weight === w.v ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                onClick={() => setWeight(w.v)}
              >
                {w.l}
              </Button>
            ))}
          </div>
        </div>
        {/* 对齐 */}
        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground">对齐</span>
          <div className="flex gap-0.5">
            {([{ v: 'left' as AlignOption, i: AlignLeft }, { v: 'center' as AlignOption, i: AlignCenter }, { v: 'right' as AlignOption, i: AlignRight }]).map(a => (
              <Button
                key={a.v}
                variant={align === a.v ? 'default' : 'outline'}
                size="sm"
                className={`h-5 w-7 px-0 ${align === a.v ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                onClick={() => setAlign(a.v)}
              >
                <a.i className="h-3 w-3" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
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

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
          <Layout className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI电商详情图设计</h2>
          <p className="text-xs text-muted-foreground">智能生成专业电商详情页图片</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* 左侧配置区 */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-emerald-600" />
              专业设计配置
            </CardTitle>
            <CardDescription className="text-xs">多维度精细化设计，打造高级感详情图</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 商品图片 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">商品图片</Label>
              <div
                className="relative flex min-h-[80px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 hover:border-emerald-500/50 transition-colors bg-muted/20"
                onClick={() => fileInputRef.current?.click()}
              >
                {productImage ? (
                  <div className="relative p-1">
                    <img
                      src={URL.createObjectURL(productImage)}
                      alt="商品图"
                      className="max-h-[70px] object-contain rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[8px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductImage(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Upload className="h-4 w-4 mx-auto text-muted-foreground/50 mb-1" />
                    <p className="text-[10px] text-muted-foreground">点击上传</p>
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
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <SparklesIcon className="h-3 w-3 text-amber-500" />
                AI卖点
              </Label>
              <div className="flex gap-1">
                <Input
                  placeholder="商品名称"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="h-6 text-[11px] flex-1"
                />
                <Button
                  onClick={handleGenerateSellingPoints}
                  disabled={isGeneratingPoints || !productName}
                  className="h-6 px-2 text-[10px] bg-amber-500 hover:bg-amber-600"
                >
                  {isGeneratingPoints ? <Loader2 className="h-3 w-3 animate-spin" /> : <SparklesIcon className="h-3 w-3" />}
                </Button>
              </div>
              <Textarea
                placeholder="卖点，每行一个"
                value={sellingPoints}
                onChange={(e) => setSellingPoints(e.target.value)}
                rows={2}
                className="resize-none text-[11px]"
              />
            </div>

            {/* 行业分类 */}
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <Layers className="h-2.5 w-2.5" />
                商品行业
              </Label>
              <div className="grid grid-cols-4 gap-0.5">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    className={`h-7 text-[9px] ${selectedCategory === cat.id ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span className="mr-0.5">{cat.icon}</span>
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 配色方案 - 翻页式 */}
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <PaletteIcon className="h-2.5 w-2.5" />
                配色方案
                <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1">{colorPage + 1}/{totalPages}</Badge>
              </Label>
              <div className="border rounded p-1.5 bg-muted/20">
                <div className="grid grid-cols-2 gap-0.5">
                  {currentColors.map((scheme) => (
                    <Button
                      key={scheme.id}
                      variant={selectedColorScheme === scheme.id ? 'default' : 'outline'}
                      className={`h-auto py-1 px-1 ${selectedColorScheme === scheme.id ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : ''}`}
                      onClick={() => setSelectedColorScheme(scheme.id)}
                    >
                      <div className="flex items-center gap-1 w-full">
                        <div className="flex gap-px shrink-0">
                          {scheme.colors.slice(0, 3).map((color, i) => (
                            <div key={i} className="w-2.5 h-2.5 rounded-sm border border-muted/50" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <span className="text-[9px] truncate flex-1 text-left">{scheme.name}</span>
                        {selectedColorScheme === scheme.id && <Check className="h-2.5 w-2.5 shrink-0" />}
                      </div>
                    </Button>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-1 pt-1 border-t border-muted/50">
                    <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1" onClick={() => setColorPage(p => Math.max(0, p - 1))} disabled={colorPage === 0}>
                      <ChevronLeft className="h-2.5 w-2.5" />
                    </Button>
                    <span className="text-[9px] text-muted-foreground">{colorPage + 1}/{totalPages}</span>
                    <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1" onClick={() => setColorPage(p => Math.min(totalPages - 1, p + 1))} disabled={colorPage === totalPages - 1}>
                      <ChevronRight className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* 字体层级 - 核心设计 */}
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <Type className="h-2.5 w-2.5" />
                字体排版层级
              </Label>
              
              <Tabs value={typographyMode} onValueChange={(v) => {
                setTypographyMode(v as 'preset' | 'custom');
                if (v === 'preset') applyTypographyPreset(typographyPreset);
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-6">
                  <TabsTrigger value="preset" className="text-[10px] gap-0.5">
                    <Layers className="h-2 w-2" />
                    预设
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="text-[10px] gap-0.5">
                    <Settings2 className="h-2 w-2" />
                    自定义
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preset" className="mt-1.5 space-y-1">
                  <div className="grid grid-cols-2 gap-0.5">
                    {typographyPresets.map((preset) => (
                      <Button
                        key={preset.id}
                        variant={typographyPreset === preset.id ? 'default' : 'outline'}
                        className={`h-8 text-[10px] ${typographyPreset === preset.id ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : ''}`}
                        onClick={() => {
                          setTypographyPreset(preset.id);
                          applyTypographyPreset(preset.id);
                        }}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                  {/* 预览 */}
                  <div className="p-2 rounded bg-white border">
                    <div className="text-[10px] text-muted-foreground mb-1">预览效果</div>
                    <div className="space-y-0.5">
                      <div className={`${headlineWeight === 'bold' ? 'font-bold' : headlineWeight === 'medium' ? 'font-semibold' : 'font-light'} ${headlineAlign === 'left' ? 'text-left' : headlineAlign === 'right' ? 'text-right' : 'text-center'} text-[12px]`}>
                        主标题文本
                      </div>
                      <div className={`${subheadlineWeight === 'bold' ? 'font-semibold' : subheadlineWeight === 'medium' ? 'font-medium' : 'font-light'} ${subheadlineAlign === 'left' ? 'text-left' : subheadlineAlign === 'right' ? 'text-right' : 'text-center'} text-[10px] text-muted-foreground`}>
                        副标题说明
                      </div>
                      <div className={`${bodyWeight === 'bold' ? 'font-medium' : bodyWeight === 'medium' ? 'font-normal' : 'font-light'} ${bodyAlign === 'left' ? 'text-left' : bodyAlign === 'right' ? 'text-right' : 'text-center'} text-[9px] text-muted-foreground/70`}>
                        细节描述内容
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="mt-1.5 space-y-1">
                  <TypographyLevel 
                    label="主标题" icon="🔤" 
                    size={headlineSize} setSize={setHeadlineSize}
                    weight={headlineWeight} setWeight={setHeadlineWeight}
                    align={headlineAlign} setAlign={setHeadlineAlign}
                  />
                  <TypographyLevel 
                    label="副标题" icon="📝" 
                    size={subheadlineSize} setSize={setSubheadlineSize}
                    weight={subheadlineWeight} setWeight={setSubheadlineWeight}
                    align={subheadlineAlign} setAlign={setSubheadlineAlign}
                  />
                  <TypographyLevel 
                    label="详情说明" icon="📄" 
                    size={bodySize} setSize={setBodySize}
                    weight={bodyWeight} setWeight={setBodyWeight}
                    align={bodyAlign} setAlign={setBodyAlign}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* 版式布局 */}
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground">版式布局</Label>
              <div className="grid grid-cols-5 gap-0.5">
                {layouts.map((layout) => (
                  <Button
                    key={layout.id}
                    variant={selectedLayout === layout.id ? 'default' : 'outline'}
                    className={`h-7 text-[9px] ${selectedLayout === layout.id ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : ''}`}
                    onClick={() => setSelectedLayout(layout.id)}
                  >
                    {layout.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 字体风格 & 尺寸 */}
            <div className="grid grid-cols-2 gap-2">
              {/* 字体风格 */}
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">字体风格</Label>
                <Select value={selectedFont} onValueChange={setSelectedFont}>
                  <SelectTrigger className="h-7 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((font) => (
                      <SelectItem key={font.id} value={font.id} className="text-[10px]">
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 尺寸设置 */}
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">图片尺寸</Label>
                <Select value={sizeMode === 'preset' ? selectedSize : 'custom'} onValueChange={(v) => {
                  if (v === 'custom') {
                    setSizeMode('custom');
                  } else {
                    setSizeMode('preset');
                    setSelectedSize(v);
                  }
                }}>
                  <SelectTrigger className="h-7 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size.id} value={size.id} className="text-[10px]">
                        {size.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="text-[10px]">
                      自定义 {customWidth}×{customHeight}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 尺寸自定义 */}
            {sizeMode === 'custom' && (
              <div className="flex items-center gap-1 p-1.5 bg-muted/30 rounded">
                <Input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  min={100}
                  max={2000}
                  className="h-6 text-[10px] w-14"
                />
                <span className="text-muted-foreground text-[10px]">×</span>
                <Input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  min={100}
                  max={2000}
                  className="h-6 text-[10px] w-14"
                />
                <span className="text-muted-foreground text-[9px]">px</span>
              </div>
            )}

            {/* 设计模板 */}
            <div className="space-y-1">
              <Label className="text-[10px] font-medium text-muted-foreground">设计模板</Label>
              <div className="grid grid-cols-6 gap-0.5">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    className={`h-7 text-[9px] ${selectedTemplate === template.id ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : ''}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <span className="mr-0.5">{template.icon}</span>
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 生成质量 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-medium text-muted-foreground">生成质量</Label>
                <Badge variant="secondary" className="text-[9px] h-4 px-1">{quality[0]}%</Badge>
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
              className="w-full h-8 text-[11px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  AI设计中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1 h-3 w-3" />
                  生成专业详情图
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 右侧结果区 */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                <CardTitle className="text-sm">生成结果</CardTitle>
              </div>
              {generatedImages.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-px px-1.5 py-0.5 rounded bg-muted/50">
                    {getCurrentColorScheme().colors.slice(0, 3).map((color, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-sm border border-muted/50" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-[9px] h-5 bg-emerald-50 text-emerald-700 border-emerald-200">
                    {generatedImages.length} 张
                  </Badge>
                  <Button size="sm" onClick={handleDownloadAll} className="h-5 text-[10px] px-1.5 bg-emerald-500 hover:bg-emerald-600">
                    <Download className="h-2.5 w-2.5 mr-0.5" />
                    批量
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[500px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[500px]">
                  <div className="w-14 h-14 rounded-full border-[3px] border-emerald-200 border-t-emerald-500 animate-spin" />
                  <p className="mt-4 text-xs font-medium text-emerald-600">AI设计师创作中...</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {getCurrentColorScheme().name} · {layouts.find(l => l.id === selectedLayout)?.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground">预计 30-60 秒</p>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="space-y-3">
                  {/* 设计信息 */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded px-3 py-1.5 border border-emerald-100 text-[10px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] h-4 bg-white">{getFinalSize()} px</Badge>
                        <Badge variant="outline" className="text-[9px] h-4 bg-white">{categories.find(c => c.id === selectedCategory)?.name}</Badge>
                      </div>
                      <span className="text-muted-foreground">
                        {generationInfo?.pointGroups}组 · 每组{generationInfo?.pointsPerGroup}卖点
                      </span>
                    </div>
                  </div>
                  
                  {/* 图片列表 */}
                  <div className="space-y-2">
                    {generatedImages.map((imageUrl, index) => (
                      <div key={index} className="bg-muted/30 rounded p-1.5 border border-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="secondary" className="text-[9px] h-4 bg-emerald-100 text-emerald-700">
                            图 {index + 1}/{generatedImages.length}
                          </Badge>
                          <span className="text-[9px] text-muted-foreground">
                            卖点 {index * 3 + 1}-{Math.min((index + 1) * 3, (generationInfo?.pointGroups || 1) * 3)}
                          </span>
                        </div>
                        
                        <div className="relative rounded overflow-hidden bg-white shadow-sm">
                          <img
                            src={imageUrl}
                            alt={`详情图 ${index + 1}`}
                            className="w-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => handlePreview(imageUrl)}
                          />
                          
                          <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
                            <Button size="icon" variant="secondary" className="h-6 w-6 bg-white/90 hover:bg-white shadow-sm" onClick={() => handlePreview(imageUrl)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-6 w-6 bg-white/90 hover:bg-white shadow-sm" onClick={() => handleCopyLink(imageUrl, index)}>
                              {copyStatus[index] === 'success' ? <span className="text-[9px] text-green-600 font-medium">✓</span> : <Copy className="h-3 w-3" />}
                            </Button>
                            <Button size="icon" className="h-6 w-6 bg-emerald-500 hover:bg-emerald-600 shadow-sm" onClick={() => handleDownload(imageUrl, index)}>
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={handleGenerate} className="w-full h-7 text-[10px]">
                    <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                    重新生成
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-3 shadow-inner">
                    <Layout className="h-8 w-8 text-emerald-500/60" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">开始设计专业详情图</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 max-w-[200px]">
                    选择行业分类和配色方案，AI生成高级感详情图
                  </p>
                  
                  <div className="mt-4 p-2 bg-muted/50 rounded text-[9px] text-muted-foreground max-w-[240px]">
                    <p className="font-medium mb-1">设计师提示：</p>
                    <ul className="space-y-0.5 text-left">
                      <li>• 根据商品品类选择行业</li>
                      <li>• 字体排版预设适合常见场景</li>
                      <li>• 自定义可精细调整每层文字</li>
                      <li>• 生成的图片不含尺寸标注</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 预览模态框 */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="预览" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <div className="absolute top-3 right-3 flex gap-1.5">
              <Button size="sm" onClick={() => { const i = generatedImages.findIndex(img => img === previewImage); if (i !== -1) handleDownload(previewImage, i); }} className="h-6 text-[10px] bg-emerald-500 hover:bg-emerald-600">
                <Download className="h-2.5 w-2.5 mr-0.5" />
                下载
              </Button>
              <Button size="sm" onClick={() => setPreviewImage(null)} variant="secondary" className="h-6 text-[10px] bg-white/90 hover:bg-white">
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
