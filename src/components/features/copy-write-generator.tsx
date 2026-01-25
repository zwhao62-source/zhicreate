'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, RefreshCw } from 'lucide-react';

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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success'>('idle');

  const templates = [
    { id: 'zhongcao', name: '种草文案', desc: '适合小红书等平台' },
    { id: 'baowen', name: '爆文改写', desc: '提升文章传播度' },
    { id: 'chanpin', name: '产品介绍', desc: '商品详情页文案' },
    { id: 'shequ', name: '社区互动', desc: '引导用户互动评论' }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('zhongcao');

  const handleGenerate = async () => {
    if (!inputData.sellingPoints) {
      alert('请至少填写商品卖点');
      return;
    }

    setIsLoading(true);
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
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      console.error('生成文案失败:', error);
      alert('生成文案失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopyStatus('success');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI文案生成</h2>
          <p className="text-sm text-muted-foreground">输入商品信息，自动生成高质量营销文案</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>商品信息</CardTitle>
            <CardDescription>填写商品相关信息，AI将为您生成专业文案</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>商品ID（可选）</Label>
                <Input
                  placeholder="输入商品ID"
                  value={inputData.productId}
                  onChange={(e) => setInputData({ ...inputData, productId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>商品链接（可选）</Label>
                <Input
                  placeholder="输入商品链接"
                  value={inputData.productLink}
                  onChange={(e) => setInputData({ ...inputData, productLink: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-red-500">商品卖点 *</Label>
              <Textarea
                placeholder="描述商品的核心卖点、特色、优势等..."
                value={inputData.sellingPoints}
                onChange={(e) => setInputData({ ...inputData, sellingPoints: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>人设风格（可选）</Label>
              <Input
                placeholder="例如：专业测评、达人推荐、真实用户..."
                value={inputData.persona}
                onChange={(e) => setInputData({ ...inputData, persona: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>话题标签（可选）</Label>
              <Input
                placeholder="例如：#好物推荐 #购物攻略"
                value={inputData.topic}
                onChange={(e) => setInputData({ ...inputData, topic: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>文案模板</Label>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <Badge
                    key={template.id}
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    className="cursor-pointer hover:opacity-80"
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成文案
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
                <CardDescription>AI为您生成的营销文案</CardDescription>
              </div>
              {generatedContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copyStatus === 'success' ? (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      复制
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] rounded-lg border bg-slate-50 dark:bg-slate-900 p-4">
              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">AI正在创作中...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {generatedContent}
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">填写商品信息后点击生成</p>
                    <p className="text-xs">AI将为您创作专业文案</p>
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
