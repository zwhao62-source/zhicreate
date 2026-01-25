'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Upload, Download, RefreshCw, User2, Image as ImageIcon } from 'lucide-react';

export default function ModelSwap() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'face' | 'background' | 'both'>('face');
  
  const sourceRef = useRef<HTMLInputElement>(null);
  const faceRef = useRef<HTMLInputElement>(null);
  const backgroundRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'source' | 'face' | 'background') => {
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
      }
      setResultImage('');
    }
  };

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
      console.error('换脸/换背景失败:', error);
      alert('处理失败，请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `swapped-result.png`;
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
          <h2 className="text-2xl font-bold">模特换脸与背景更换</h2>
          <p className="text-sm text-muted-foreground">轻松替换模特面部或背景，打造不同效果</p>
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
              <div className="flex gap-2">
                <Badge
                  variant={mode === 'face' ? 'default' : 'outline'}
                  className={`cursor-pointer hover:opacity-80 p-3 ${
                    mode === 'face' ? 'bg-gradient-to-r from-orange-500 to-red-600' : ''
                  }`}
                  onClick={() => setMode('face')}
                >
                  <User2 className="mr-2 h-4 w-4" />
                  仅换脸
                </Badge>
                <Badge
                  variant={mode === 'background' ? 'default' : 'outline'}
                  className={`cursor-pointer hover:opacity-80 p-3 ${
                    mode === 'background' ? 'bg-gradient-to-r from-orange-500 to-red-600' : ''
                  }`}
                  onClick={() => setMode('background')}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  仅换背景
                </Badge>
                <Badge
                  variant={mode === 'both' ? 'default' : 'outline'}
                  className={`cursor-pointer hover:opacity-80 p-3 ${
                    mode === 'both' ? 'bg-gradient-to-r from-orange-500 to-red-600' : ''
                  }`}
                  onClick={() => setMode('both')}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  换脸+背景
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
                <CardDescription>换脸/换背景后的效果</CardDescription>
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
