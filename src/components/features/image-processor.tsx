'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles, Upload, Download, Wand2, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import AdBanner from '@/components/ui/ad-banner';

export default function ImageProcessor() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState('beautify');
  const [intensity, setIntensity] = useState([50]);
  const [compressionQuality, setCompressionQuality] = useState([80]); // 压缩质量
  const [targetWidth, setTargetWidth] = useState<number>(0); // 目标宽度
  const [targetHeight, setTargetHeight] = useState<number>(0); // 目标高度
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('jpeg');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const functions = [
    { 
      id: 'beautify', 
      name: '一键美图', 
      icon: '✨',
      desc: '智能美化皮肤，优化照片质感' 
    },
    { 
      id: 'removebg', 
      name: '一键去背景', 
      icon: '🎨',
      desc: '智能移除图片背景，保留主体' 
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
    },
    { 
      id: 'compress', 
      name: '图片压缩', 
      icon: '📦',
      desc: '减小图片文件大小，支持批量' 
    },
    { 
      id: 'convert', 
      name: '格式转换', 
      icon: '🔄',
      desc: 'PNG/JPG/WebP互转' 
    },
    { 
      id: 'resize', 
      name: '调整尺寸', 
      icon: '📐',
      desc: '修改图片宽高尺寸' 
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSourceImage(file);
      setProcessedImage('');
      setOriginalSize(file.size);
      setProcessedSize(0);
      
      // 获取图片原始尺寸
      const img = new Image();
      img.onload = () => {
        setTargetWidth(img.width);
        setTargetHeight(img.height);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  // 本地图片处理：压缩/格式转换/尺寸调整
  const handleLocalProcess = async (): Promise<string | null> => {
    if (!sourceImage) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // 根据功能设置画布尺寸
        if (selectedFunction === 'resize' && targetWidth > 0 && targetHeight > 0) {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
        } else if (selectedFunction === 'resize' && targetWidth > 0) {
          const ratio = img.height / img.width;
          canvas.width = targetWidth;
          canvas.height = Math.round(targetWidth * ratio);
        } else if (selectedFunction === 'resize' && targetHeight > 0) {
          const ratio = img.width / img.height;
          canvas.width = Math.round(targetHeight * ratio);
          canvas.height = targetHeight;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // 绘制图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 设置输出格式和质量
        let mimeType = 'image/png';
        let quality = compressionQuality[0] / 100;

        if (selectedFunction === 'compress' || selectedFunction === 'convert' || selectedFunction === 'resize') {
          switch (outputFormat) {
            case 'jpeg':
              mimeType = 'image/jpeg';
              break;
            case 'webp':
              mimeType = 'image/webp';
              break;
            case 'png':
            default:
              mimeType = 'image/png';
              quality = 1; // PNG不支持质量参数
              break;
          }
        }

        // 转换为blob
        canvas.toBlob((blob) => {
          if (blob) {
            setProcessedSize(blob.size);
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve(null);
          }
        }, mimeType, quality);
      };
      img.src = URL.createObjectURL(sourceImage);
    });
  };

  const handleProcess = async () => {
    if (!sourceImage) {
      alert('请上传图片');
      return;
    }

    // 本地处理功能（压缩、格式转换、尺寸调整）
    if (['compress', 'convert', 'resize'].includes(selectedFunction)) {
      setIsProcessing(true);
      setProcessedImage('');
      
      try {
        const result = await handleLocalProcess();
        if (result) {
          setProcessedImage(result);
        } else {
          throw new Error('处理失败');
        }
      } catch (error) {
        console.error('图片处理失败:', error);
        alert('图片处理失败，请稍后重试');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // AI处理功能
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
      const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
      link.download = `processed-image.${ext}`;
      link.click();
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 计算压缩比例
  const compressionRatio = originalSize > 0 && processedSize > 0
    ? Math.round((1 - processedSize / originalSize) * 100)
    : 0;

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

            {/* 强度调节 - AI功能 */}
            {['beautify', 'enhance'].includes(selectedFunction) && (
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
            )}

            {/* 压缩质量设置 */}
            {selectedFunction === 'compress' && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label>压缩质量: {compressionQuality[0]}%</Label>
                  <Slider
                    value={compressionQuality}
                    onValueChange={setCompressionQuality}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    数值越低文件越小，但可能影响清晰度
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>输出格式</Label>
                  <div className="flex gap-2">
                    {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                      <Badge
                        key={fmt}
                        variant={outputFormat === fmt ? 'default' : 'outline'}
                        className={`cursor-pointer ${
                          outputFormat === fmt ? 'bg-cyan-500' : ''
                        }`}
                        onClick={() => setOutputFormat(fmt)}
                      >
                        {fmt.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
                {originalSize > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    原始大小: {formatFileSize(originalSize)}
                    {processedSize > 0 && (
                      <> → 处理后: {formatFileSize(processedSize)} ({compressionRatio > 0 ? `减少${compressionRatio}%` : '增加'})</>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* 格式转换设置 */}
            {selectedFunction === 'convert' && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label>转换为</Label>
                  <div className="flex gap-2">
                    {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                      <Badge
                        key={fmt}
                        variant={outputFormat === fmt ? 'default' : 'outline'}
                        className={`cursor-pointer ${
                          outputFormat === fmt ? 'bg-cyan-500' : ''
                        }`}
                        onClick={() => setOutputFormat(fmt)}
                      >
                        {fmt.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {outputFormat === 'png' && 'PNG: 无损压缩，支持透明背景'}
                    {outputFormat === 'jpeg' && 'JPEG: 有损压缩，文件更小'}
                    {outputFormat === 'webp' && 'WebP: 体积最小，现代浏览器支持'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>压缩质量: {compressionQuality[0]}%</Label>
                  <Slider
                    value={compressionQuality}
                    onValueChange={setCompressionQuality}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* 尺寸调整设置 */}
            {selectedFunction === 'resize' && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>输出尺寸</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMaintainRatio(!maintainRatio)}
                    className="h-6 text-[10px]"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${maintainRatio ? 'text-cyan-500' : ''}`} />
                    {maintainRatio ? '锁定比例' : '解锁比例'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">宽度</Label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={targetWidth || ''}
                        onChange={(e) => {
                          const w = parseInt(e.target.value) || 0;
                          setTargetWidth(w);
                          if (maintainRatio && w > 0 && sourceImage) {
                            const ratio = targetHeight / targetWidth;
                            setTargetHeight(Math.round(w * ratio));
                          }
                        }}
                        placeholder="宽"
                        className="w-full h-8 px-2 text-xs border rounded"
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">高度</Label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={targetHeight || ''}
                        onChange={(e) => {
                          const h = parseInt(e.target.value) || 0;
                          setTargetHeight(h);
                          if (maintainRatio && h > 0 && sourceImage) {
                            const ratio = targetWidth / targetHeight;
                            setTargetWidth(Math.round(h * ratio));
                          }
                        }}
                        placeholder="高"
                        className="w-full h-8 px-2 text-xs border rounded"
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[25, 50, 75, 100].map((scale) => (
                    <Button
                      key={scale}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const img = new Image();
                        img.onload = () => {
                          const w = Math.round(img.width * scale / 100);
                          const h = Math.round(img.height * scale / 100);
                          setTargetWidth(w);
                          setTargetHeight(h);
                        };
                        if (sourceImage) {
                          img.src = URL.createObjectURL(sourceImage);
                        }
                      }}
                      className="flex-1 h-7 text-[10px]"
                    >
                      {scale}%
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>输出格式</Label>
                  <div className="flex gap-2">
                    {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                      <Badge
                        key={fmt}
                        variant={outputFormat === fmt ? 'default' : 'outline'}
                        className={`cursor-pointer ${
                          outputFormat === fmt ? 'bg-cyan-500' : ''
                        }`}
                        onClick={() => setOutputFormat(fmt)}
                      >
                        {fmt.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                  {selectedFunction === 'compress' && '压缩图片'}
                  {selectedFunction === 'convert' && '转换格式'}
                  {selectedFunction === 'resize' && '调整尺寸'}
                  {!['compress', 'convert', 'resize'].includes(selectedFunction) && '开始处理'}
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
                  {/* 文件大小对比 */}
                  {processedSize > 0 && (
                    <div className="flex items-center justify-center gap-4 p-2 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">原始大小</p>
                        <p className="text-sm font-medium">{formatFileSize(originalSize)}</p>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">处理后</p>
                        <p className="text-sm font-medium">{formatFileSize(processedSize)}</p>
                      </div>
                      {compressionRatio !== 0 && (
                        <Badge variant={compressionRatio > 0 ? 'default' : 'destructive'} className="text-xs">
                          {compressionRatio > 0 ? `减少${compressionRatio}%` : `增加${-compressionRatio}%`}
                        </Badge>
                      )}
                    </div>
                  )}
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
