import { NextRequest, NextResponse } from 'next/server';

// 方舟API配置
const VOLC_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

function getApiKey(): string | null {
  return process.env.VOLC_API_KEY || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '提示词不能为空' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json({
        error: '请配置VOLC_API_KEY',
        hint: '在环境变量中配置方舟大模型API Key'
      }, { status: 400 });
    }

    // 优化提示词
    const systemPrompt = `你是一位专业的AI视频提示词工程师，擅长将简单的动作描述转化为生动、专业的AI视频生成提示词。
请将用户的简单描述扩展为详细的AI视频生成提示词，包含：
1. 具体的人物动作或场景变化
2. 镜头运动方式（如：推镜头、拉镜头、摇镜、跟拍等）
3. 光线和氛围描述
4. 画面风格和质量要求
直接输出优化后的提示词，不要添加任何说明。`;

    const response = await fetch(VOLC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-pro-250123',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请优化以下动作描述：\n\n${prompt}\n\n直接输出优化后的提示词。` }
        ],
        max_tokens: 500,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('方舟API错误:', response.status, errorData);
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    const optimizedPrompt = data.choices?.[0]?.message?.content || prompt;

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      optimizedPrompt: optimizedPrompt.trim()
    });

  } catch (error: any) {
    console.error('优化提示词失败:', error);
    return NextResponse.json(
      { error: error.message || '优化失败，请稍后重试' },
      { status: 500 }
    );
  }
}
