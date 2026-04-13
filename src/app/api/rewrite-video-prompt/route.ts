import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, pose, imageType } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: '请输入动作描述' }, { status: 400 });
    }

    const config = new Config();
    const client = new LLMClient(config);

    // 根据选择的动作类型和图片类型优化提示词
    const poseDescriptions: Record<string, string> = {
      walk: '行走/走路',
      rotate: '旋转/转身',
      wave: '挥手/打招呼',
      dance: '舞蹈/律动',
      custom: '自定义动作'
    };

    const imageTypeDesc = imageType || '商品模特图';

    const systemPrompt = `你是一位专业的AI视频生成提示词优化专家。你的任务是将用户简单的动作描述转化为专业、详细的AI视频生成提示词。

核心原则：
1. 保持原描述的核心意图不变
2. 添加专业的动作细节描写（速度、幅度、轨迹）
3. 补充环境氛围和光照描述
4. 添加运动细节，让AI更容易理解和生成
5. 使用英文输出（因为大多数AI视频模型使用英文训练）

动作类型参考：
- 行走(walk)：步伐节奏、重心变化、脚部动作
- 旋转(rotate)：旋转速度、方向、幅度
- 挥手(wave)：频率、幅度、表情配合
- 舞蹈(dance)：节拍、舞步风格、律动方式

请将以下动作描述优化为专业的AI视频生成提示词（英文），只返回优化后的提示词，不要添加其他内容。`;

    const userPrompt = `原始动作描述：${prompt}
动作类型：${poseDescriptions[pose] || '通用'}
图片类型：${imageTypeDesc}

请优化这段动作描述，生成专业的AI视频提示词。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    // 流式响应
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-6-lite-251015',
      temperature: 0.7
    });

    let optimizedPrompt = '';
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              optimizedPrompt += chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n'));
          controller.close();
        } catch (error) {
          console.error('流式生成失败:', error);
          controller.error(error);
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('视频提示词改写失败:', error);
    return NextResponse.json({ 
      error: '提示词改写失败，请稍后重试' 
    }, { status: 500 });
  }
}
