'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, Download, FileText, RefreshCw, Link2, CheckCircle } from 'lucide-react';
import AdBanner from '@/components/ui/ad-banner';

export default function CopyWriteGenerator() {
  const [inputData, setInputData] = useState({
    productId: '',
    productLink: '',
    sellingPoints: '',
    persona: '',
    topic: ''
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success'>('idle');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success'>('idle');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fetchedProductName, setFetchedProductName] = useState('');

  const templates = [
    { id: 'zhongcao', name: '种草文案', desc: '适合小红书等平台' },
    { id: 'baowen', name: '爆文改写', desc: '提升文章传播度' },
    { id: 'chanpin', name: '产品介绍', desc: '商品详情页文案' },
    { id: 'shequ', name: '社区互动', desc: '引导用户互动评论' }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('zhongcao');

  // 读取商品链接
  const handleFetchLink = async () => {
    console.log('[DEBUG] 按钮点击，productLink =', inputData.productLink);
    
    const linkValue = inputData.productLink?.trim() || '';
    if (!linkValue) {
      alert('请先粘贴商品链接');
      return;
    }

    setIsFetching(true);
    setFetchStatus('fetching');

    try {
      console.log('[DEBUG] 开始请求 API，URL =', linkValue);
      
      const response = await fetch('/api/fetch-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkValue })
      });

      const data = await response.json();
      console.log('[DEBUG] API 返回数据:', JSON.stringify(data));

      if (data.success && data.data) {
        // 自动填充解析出的信息
        setInputData(prev => ({
          ...prev,
          productId: data.data.title || prev.productId,
          sellingPoints: data.data.sellingPoints?.join('\n') || data.data.description || prev.sellingPoints
        }));
        setFetchedProductName(data.data.title || '商品');
        setFetchStatus('success');
      } else {
        alert(data.error || '读取链接失败，请手动填写信息');
        setFetchStatus('error');
      }
    } catch (error) {
      console.error('读取链接失败:', error);
      alert('读取链接失败，请稍后重试');
      setFetchStatus('error');
    } finally {
      setIsFetching(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputData.sellingPoints) {
      alert('请至少填写商品卖点');
      return;
    }

    setIsLoading(true);
    setShowAd(true);
    setGeneratedContent('');

    try {
      const response = await fetch('/api/generate-copywrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inputData,
          template: selectedTemplate
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
                    setGeneratedContent(prev => prev + parsed.content);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
        // 生成成功后立即关闭广告
        setShowAd(false);
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      console.error('生成文案失败:', error);
      alert('生成文案失败，请稍后重试');
      // 生成失败时也要关闭广告
      setShowAd(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdComplete = () => {
    setShowAd(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopyStatus('success');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `营销文案_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    setDownloadStatus('success');
    setTimeout(() => setDownloadStatus('idle'), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 广告横幅 */}
      {showAd && (
        <AdBanner
          duration={15}
          onComplete={handleAdComplete}
          adContent={{
            title: 'AI文案生成',
            description: '正在为您生成高质量营销文案，15秒后即可查看',
            ctaText: '探索更多功能'
          }}
        />
      )}

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold">AI文案生成</h2>
          <p className="text-xs text-muted-foreground">输入商品信息，自动生成高质量营销文案</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 输入区域 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              商品信息
            </CardTitle>
            <CardDescription className="text-xs">填写信息，AI生成专业文案</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">商品ID</Label>
                <Input
                  placeholder="可选"
                  value={inputData.productId}
                  onChange={(e) => setInputData({ ...inputData, productId: e.target.value })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">商品链接</Label>
                <div className="flex gap-1.5">
                  <Input
                    placeholder="粘贴淘宝/京东/天猫等商品链接"
                    value={inputData.productLink}
                    onChange={(e) => {
                      setInputData({ ...inputData, productLink: e.target.value });
                      setFetchStatus('idle');
                    }}
                    className="h-7 text-xs flex-1"
                  />
                  {/* 调试：显示当前链接值 */}
                  {inputData.productLink && (
                    <span className="text-[9px] text-green-500 w-16 truncate">
                      ✓ 已输入
                    </span>
                  )}
                  <Button
                    size="sm"
                    onClick={handleFetchLink}
                    disabled={isFetching}
                    className="h-7 px-3 text-[11px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                  >
                    {isFetching ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : fetchStatus === 'success' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Link2 className="h-3 w-3" />
                    )}
                    <span className="ml-1">读取</span>
                  </Button>
                </div>
                {fetchStatus === 'success' && fetchedProductName && (
                  <p className="text-[10px] text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-2.5 w-2.5" />
                    已读取：{fetchedProductName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-red-500">商品卖点 *</Label>
              <Textarea
                placeholder="描述商品卖点、特色、优势..."
                value={inputData.sellingPoints}
                onChange={(e) => setInputData({ ...inputData, sellingPoints: e.target.value })}
                rows={2}
                className="resize-none text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">人设风格</Label>
              <Input
                placeholder="专业测评/达人推荐/真实用户"
                value={inputData.persona}
                onChange={(e) => setInputData({ ...inputData, persona: e.target.value })}
                className="h-7 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">话题标签</Label>
              <Input
                placeholder="#好物推荐 #购物攻略"
                value={inputData.topic}
                onChange={(e) => setInputData({ ...inputData, topic: e.target.value })}
                className="h-7 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">文案模板</Label>
              <div className="flex flex-wrap gap-1">
                {templates.map((template) => (
                  <Badge
                    key={template.id}
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    className={`cursor-pointer text-[11px] h-6 ${selectedTemplate === template.id ? 'bg-blue-500 hover:bg-blue-600 border-blue-500' : ''}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    {template.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full h-8 text-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  生成文案
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
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <CardTitle className="text-sm">生成结果</CardTitle>
              </div>
              {generatedContent && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-[11px]"
                  >
                    {copyStatus === 'success' ? (
                      <>
                        <span className="mr-1 text-green-600">✓</span>
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        复制
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="h-7 text-[11px] bg-blue-500 hover:bg-blue-600"
                  >
                    {downloadStatus === 'success' ? (
                      <>
                        <span className="mr-1">✓</span>
                        已保存
                      </>
                    ) : (
                      <>
                        <Download className="mr-1 h-3 w-3" />
                        下载
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[320px] rounded-lg border bg-muted/30 p-4">
              {isLoading ? (
                <div className="flex h-[320px] items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                    <p className="mt-2 text-xs text-muted-foreground">AI正在创作中...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="relative">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedContent}
                  </div>
                </div>
              ) : (
                <div className="flex h-[320px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-xs">填写商品信息后点击生成</p>
                    <p className="text-[11px] text-muted-foreground/70">AI将为您创作专业文案</p>
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
