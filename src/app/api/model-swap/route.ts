import { NextRequest, NextResponse } from 'next/server';

// 方舟API配置
const VOLC_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

function getApiKey(): string | null {
  return process.env.VOLC_API_KEY || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceImage, targetImage, action } = body;

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json({
        error: '请配置VOLC_API_KEY',
        hint: '在环境变量中配置方舟大模型API Key'
      }, { status: 400 });
    }

    if (!sourceImage) {
      return NextResponse.json(
        { error: '请提供源图片' },
        { status: 400 }
      );
    }

    // 模特换脸/换装提示词
    const actionPrompts: Record<string, string> = {
      swap_face: '将第一张图片中的人物面部替换到第二张图片中的人物身上，保持自然逼真',
      change_clothes: '将第一张图片中的人物衣服替换为第二张图片中的服装款式',
      change_background: '将第一张图片的背景替换为第二张图片中的场景',
      swap_shoes: '将第一张图片中的人物鞋子替换为第二张图片中的款式',
      swap_hat: '将第一张图片中的人物帽子/饰品替换为第二张图片中的款式'
    };

    const actionPrompt = actionPrompts[action] || '将第一张图片的人物特征应用到第二张图片中';

    // 调用方舟API生成处理提示词
    const response = await fetch(VOLC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-pro-250123',
        messages: [
          { 
            role: 'system', 
            content: '你是一位专业的AI图像处理专家，擅长生成图像编辑提示词。' 
          },
          { 
            role: 'user', 
            content: `请为以下图像处理任务生成专业的AI图像编辑提示词：\n\n任务：${actionPrompt}\n\n直接输出专业的图像编辑提示词，用于AI图像生成模型。` 
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    const editPrompt = data.choices?.[0]?.message?.content || actionPrompt;

    // 注意：实际图像处理需要调用火山引擎的图像处理服务
    // 这里返回处理提示词，实际的图像处理需要在客户端完成
    
    return NextResponse.json({
      success: true,
      editPrompt: editPrompt.trim(),
      message: '图像编辑提示词已生成，实际处理需要上传图片到图像编辑工具'
    });

  } catch (error: any) {
    console.error('处理图片失败:', error);
    return NextResponse.json(
      { error: error.message || '处理失败，请稍后重试' },
      { status: 500 }
    );
  }
}
