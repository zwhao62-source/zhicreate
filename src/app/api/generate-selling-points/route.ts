import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, category, description } = body;

    // 验证必填字段
    if (!productName) {
      return NextResponse.json(
        { error: '商品名称不能为空' },
        { status: 400 }
      );
    }

    // 构建系统提示
    const systemPrompt = `你是一位专业的电商营销专家，擅长挖掘和提炼商品的核心卖点。
请根据商品信息，生成6-9个具有吸引力和说服力的卖点。
要求：
1. 每个卖点简洁有力，突出优势（20-30字左右）
2. 聚焦用户痛点和需求
3. 使用具体、可感知的描述
4. 每个卖点独立成行
5. 使用数字编号（1. 2. 3. ...）
6. 语言简洁，适合电商详情页展示
7. 确保卖点涵盖产品功能、品质、服务等多个维度`;

    // 构建用户提示
    let userPrompt = `请为以下商品生成卖点：\n\n商品名称：${productName}\n`;
    
    if (category) {
      userPrompt += `商品类别：${category}\n`;
    }
    
    if (description) {
      userPrompt += `商品描述：${description}\n`;
    }

    userPrompt += `\n请生成6-9个卖点，每个卖点独立成行，用数字编号。直接输出卖点内容，不要包含其他说明。`;

    // 创建 LLM 客户端
    const config = new Config();
    const client = new LLMClient(config);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(messages, {
            temperature: 0.8,
            model: 'doubao-seed-1-8-251228'
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const content = chunk.content.toString();
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          // 发送完成信号
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('生成卖点失败:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '生成失败，请稍后重试' })}\n\n`));
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error) {
    console.error('处理请求失败:', error);
    return NextResponse.json(
      { error: '处理请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}
