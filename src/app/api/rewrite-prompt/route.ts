import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, scene, size } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: '请提供描述提示' }, { status: 400 });
    }

    // 构建提示词优化请求
    const rewritePrompt = `你是一个专业的AI图像生成提示词工程师。请将用户的简单描述优化成专业、详细的图像生成提示词。

原始描述：${prompt}
风格：${style || '真实感'}
场景：${scene || '摄影棚'}
尺寸：${size || '800x800'}

请按照以下规则优化提示词：
1. 扩展描述细节，增加专业摄影术语
2. 添加光照、氛围、色调描述
3. 补充构图、角度建议
4. 包含画质、风格关键词
5. 用英文输出（因为AI生图模型通常用英文效果更好）

输出格式：直接输出优化后的英文提示词，不要加引号或其他格式标记，不要超过200个单词。

优化后的提示词：`;

    // 调用LLM API
    const response = await fetch(`${process.env.COZE_API_BASE_URL || 'https://api.coze.cn'}/v3/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COZE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: process.env.COZE_BOT_ID,
        user_id: 'prompt-rewriter',
        stream: false,
        messages: [
          {
            role: 'user',
            content: rewritePrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('LLM API调用失败');
    }

    const data = await response.json();
    
    if (data.code === 0 && data.messages && data.messages.length > 0) {
      const assistantMessage = data.messages.find((m: any) => m.role === 'assistant');
      const rewrittenPrompt = assistantMessage?.content?.trim() || prompt;
      
      return NextResponse.json({
        success: true,
        originalPrompt: prompt,
        rewrittenPrompt: rewrittenPrompt
      });
    } else {
      throw new Error('API返回数据格式错误');
    }

  } catch (error) {
    console.error('提示词改写失败:', error);
    
    // 如果API调用失败，使用规则引擎进行简单优化
    const fallbackRewrite = (originalPrompt: string, style: string, scene: string) => {
      const styleKeywords: Record<string, string[]> = {
        realistic: ['professional photography', 'high quality', 'realistic', 'natural lighting', 'sharp focus'],
        fashion: ['fashion photography', 'magazine style', 'trendy', 'editorial', 'studio lighting'],
        minimalist: ['minimalist', 'clean background', 'simple', 'white background', 'modern'],
        lifestyle: ['lifestyle', 'casual', 'natural', 'authentic', 'candid shot']
      };

      const sceneKeywords: Record<string, string[]> = {
        '专业摄影棚': ['professional studio', 'controlled lighting', 'backdrop'],
        '家居客厅': ['living room setting', 'home environment', 'cozy atmosphere'],
        '海滩': ['beach setting', 'sunlight', 'ocean backdrop', 'natural light'],
        '咖啡馆': ['cafe atmosphere', 'warm lighting', 'cozy setting'],
        '摄影棚': ['studio', 'professional lighting', 'clean backdrop'],
        '街道': ['urban street', 'city background', 'modern environment'],
        '公园': ['park setting', 'outdoor', 'natural lighting', 'green background'],
        '卧室': ['bedroom setting', 'home environment', 'soft lighting'],
      };

      const keywords = [
        ...(styleKeywords[style] || styleKeywords.realistic),
        ...(sceneKeywords[scene] || []),
        'e-commerce product photography',
        'high resolution',
        'commercial quality',
        'detailed'
      ];

      // 简单组合
      const enhanced = `${originalPrompt}, ${keywords.slice(0, 8).join(', ')}. Professional e-commerce product photography, ${style}, high quality image.`;
      
      return enhanced;
    };

    const { prompt: originalPrompt = '', style = '', scene = '' } = await request.json().catch(() => ({}));
    const rewritten = fallbackRewrite(originalPrompt, style, scene);

    return NextResponse.json({
      success: true,
      originalPrompt,
      rewrittenPrompt: rewritten,
      isFallback: true
    });
  }
}
