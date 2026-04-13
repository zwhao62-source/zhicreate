'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Upload, Download, RefreshCw, User2, Image as ImageIcon, Shirt, Footprints, Crown } from 'lucide-react';

export default function ModelSwap() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  // 模式: face-换脸, background-换背景, both-换脸+背景, outfit-换衣服, shoes-换鞋子, accessories-换帽子饰品
  const [mode, setMode] = useState<'face' | 'background' | 'both' | 'outfit' | 'shoes' | 'accessories'>('face');
  const [outfitPrompt, setOutfitPrompt] = useState(''); // 服装描述
  
  const sourceRef = useRef<HTMLInputElement>(null);
  const faceRef = useRef<HTMLInputElement>(null);
  const backgroundRef = useRef<HTMLInputElement>(null);
  const outfitRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'source' | 'face' | 'background' | 'outfit') => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      switch (type) {
        case 'source':
          setSourceImage(file);
          break;
        case 'face':
          setFaceImage(file);
          break;
        case 'background':
          setBackgroundImage(file);
          break;
        case 'outfit':
          setOutfitImage(file);
          break;
      }
      setResultImage('');
    }
  };

  const [outfitImage, setOutfitImage] = useState<File | null>(null);

  const handleSwap = async () => {
    if (!sourceImage) {
      alert('请上传模特图片');
      return;
    }

    if (mode === 'face' && !faceImage) {
      alert('请上传人脸图片');
      return;
    }

    if (mode === 'background' && !backgroundImage) {
      alert('请上传背景图片');
      return;
    }

    if (mode === 'both' && (!faceImage || !backgroundImage)) {
      alert('请上传人脸和背景图片');
      return;
    }

    if ((mode === 'outfit' || mode === 'shoes' || mode === 'accessories') && !outfitImage) {
      alert('请上传参考图片');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('source', sourceImage);
      
      if (mode === 'face' || mode === 'both') {
        formData.append('face', faceImage!);
      }
      
      if (mode === 'background' || mode === 'both') {
        formData.append('background', backgroundImage!);
      }
      
      if (mode === 'outfit' || mode === 'shoes' || mode === 'accessories') {
        formData.append('outfit', outfitImage!);
        formData.append('outfitPrompt', outfitPrompt);
      }
      
      formData.append('mode', mode);

      const response = await fetch('/api/model-swap', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setResultImage(data.imageUrl || '');
      } else {
        throw new Error('处理失败');
      }
    } catch (error) {
      console.error('换脸/换背景/换装失败:', error);
      alert('处理失败，请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `swapped-result-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
          <RefreshCw className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">模特换装与背景</h2>
          <p className="text-sm text-muted-foreground">换脸/换背景/换衣服/换鞋子/换饰品，打造多样造型</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>素材上传</CardTitle>
            <CardDescription>上传模特图片及需要更换的素材</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 模式选择 */}
            <div className="space-y-2">
              <Label>选择模式</Label>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant={mode === 'face' ? 'default' : 'outline'}
                  className={`cursor-pointer hover:opacity-80 px-2 py-1 ${
                    mode === 'face' ? 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-500' : ''
                  }`}
                  onClick={() => setMode('face')}
                >
                  <User2 className="mr-1 h-3 w-3" />
                  <span className="text-xs">换脸</span>
                </Badge>
                <Badge
                  variant={mode === 'background' ? 'default' : 'outline'}
                  className={`cursor-pointer hover:opacity-80 px-2 py-1 ${
                    mode === 'background' ? 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-500' : ''
                  }`}
                  onClick={() => setMode('background')}
                >
                  <ImageIcon className="mr-1 h-3 w-3" />
                  <span className="text-xs">换背景</span>
                </Badge>
                <Badge
                  variant={mode === 'both' ? 'default' : 'outline'}
                  className={`cursor-pointer hover:opacity-80 px-2 py-1 ${
                    mode === 'both' ? 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-500' : ''
                  }`}
                  onClick={() => setMode('both')}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  <span className="text-xs">换脸+背景</span>
                </Badge>
                <Badge
                  variant={mode === 'outfit' ? 'default' : 'outline'}
                  className={`cursor-pointer hover:opacity-80 px-2 py-1 ${
                    mode === 'outfit' ? 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-500' : ''
                  }`}
                  onClick={() => setMode('outfit')}
                >
                  <Shirt className="mr-1 h-3 w-3" />
                  <span className="text-xs">换衣服</span>
                </Badge>
                <Badge
                  variant={mode === 'shoes' ? 'default' : 'outline'}
                  className={`cursor-pointer hover:opacity-80 px-2 py-1 ${
                    mode === 'shoes' ? 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-500' : ''
                  }`}
                  onClick={() => setMode('shoes')}
                >
                  <Footprints className="mr-1 h-3 w-3" />
                  <span className="text-xs">换鞋子</span>
                </Badge>
                <Badge
                  variant={mode === 'accessories' ? 'default' : 'outline'}
                  className={`cursor-pointer hover:opacity-80 px-2 py-1 ${
                    mode === 'accessories' ? 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-500' : ''
                  }`}
                  onClick={() => setMode('accessories')}
                >
                  <Crown className="mr-1 h-3 w-3" />
                  <span className="text-xs">换帽子饰品</span>
                </Badge>
              </div>
            </div>

            {/* 源图片上传 */}
            <div className="space-y-2">
              <Label>模特图片 *</Label>
              <div
                className="flex min-h-[150px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                onClick={() => sourceRef.current?.click()}
              >
                {sourceImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(sourceImage)}
                      alt="模特图"
                      className="max-h-[150px] object-contain"
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
                    <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      点击上传模特图片
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={sourceRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'source')}
                className="hidden"
              />
            </div>

            {/* 人脸图片上传 */}
            {(mode === 'face' || mode === 'both') && (
              <div className="space-y-2">
                <Label>人脸图片 *</Label>
                <div
                  className="flex min-h-[150px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                  onClick={() => faceRef.current?.click()}
                >
                  {faceImage ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(faceImage)}
                        alt="人脸图"
                        className="max-h-[150px] object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFaceImage(null);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <User2 className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        点击上传人脸照片
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={faceRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'face')}
                  className="hidden"
                />
              </div>
            )}

            {/* 背景图片上传 */}
            {(mode === 'background' || mode === 'both') && (
              <div className="space-y-2">
                <Label>背景图片 *</Label>
                <div
                  className="flex min-h-[150px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                  onClick={() => backgroundRef.current?.click()}
                >
                  {backgroundImage ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(backgroundImage)}
                        alt="背景图"
                        className="max-h-[150px] object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBackgroundImage(null);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        点击上传背景图片
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={backgroundRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'background')}
                  className="hidden"
                />
              </div>
            )}

            {/* 换装模式上传 */}
            {(mode === 'outfit' || mode === 'shoes' || mode === 'accessories') && (
              <>
                {/* 服装/鞋子/饰品参考图 */}
                <div className="space-y-2">
                  <Label>
                    {mode === 'outfit' && '服装参考图 *'}
                    {mode === 'shoes' && '鞋子参考图 *'}
                    {mode === 'accessories' && '帽子/饰品参考图 *'}
                  </Label>
                  <div
                    className="flex min-h-[120px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                    onClick={() => outfitRef.current?.click()}
                  >
                    {outfitImage ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(outfitImage)}
                          alt="参考图"
                          className="max-h-[120px] object-contain"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOutfitImage(null);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                        <p className="mt-2 text-xs text-muted-foreground">
                          {mode === 'outfit' && '点击上传目标服装图片'}
                          {mode === 'shoes' && '点击上传目标鞋子图片'}
                          {mode === 'accessories' && '点击上传帽子/饰品图片'}
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={outfitRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'outfit')}
                    className="hidden"
                  />
                </div>

                {/* 服装描述 */}
                <div className="space-y-2">
                  <Label>
                    {mode === 'outfit' && '服装描述（可选）'}
                    {mode === 'shoes' && '鞋子描述（可选）'}
                    {mode === 'accessories' && '饰品描述（可选）'}
                  </Label>
                  <Textarea
                    placeholder={
                      mode === 'outfit' ? '例如：蓝色条纹衬衫，简约风格...' :
                      mode === 'shoes' ? '例如：白色运动鞋，休闲款式...' :
                      '例如：黑色棒球帽，时尚百搭...'
                    }
                    value={outfitPrompt}
                    onChange={(e) => setOutfitPrompt(e.target.value)}
                    rows={2}
                    className="resize-none text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    描述越详细效果越好，可指定颜色、款式、风格等
                  </p>
                </div>
              </>
            )}

            <Button
              onClick={handleSwap}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {mode === 'outfit' && '更换服装'}
                  {mode === 'shoes' && '更换鞋子'}
                  {mode === 'accessories' && '更换饰品'}
                  {!['outfit', 'shoes', 'accessories'].includes(mode) && '开始处理'}
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
                <CardDescription>
                  {mode === 'outfit' && '模特换装后的效果'}
                  {mode === 'shoes' && '模特换鞋后的效果'}
                  {mode === 'accessories' && '模特换饰品后的效果'}
                  {!['outfit', 'shoes', 'accessories'].includes(mode) && '换脸/换背景后的效果'}
                </CardDescription>
              </div>
              {resultImage && (
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
                    <p className="text-xs text-muted-foreground">预计需要20-40秒</p>
                  </div>
                </div>
              ) : resultImage ? (
                <div className="space-y-4">
                  <img
                    src={resultImage}
                    alt="处理结果"
                    className="w-full rounded-lg object-contain"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSwap}
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      重新处理
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">上传素材后选择模式</p>
                    <p className="text-xs">AI将智能完成换脸或换背景</p>
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
