import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productLink, sellingPoints, persona, topic, template } = body;

    // 验证必填字段
    if (!sellingPoints) {
      return NextResponse.json(
        { error: '商品卖点不能为空' },
        { status: 400 }
      );
    }

    // 根据模板类型生成不同的系统提示
    const systemPrompts: Record<string, string> = {
      zhongcao: `你是一位专业的电商文案创作专家，擅长撰写小红书风格的种草文案。
你的文案应该：
1. 开头吸引眼球，用emoji增加趣味性
2. 突出产品核心卖点和优势
3. 用真实的口吻分享使用体验
4. 包含互动元素，引导用户评论
5. 适当使用话题标签
6. 语言活泼、接地气，贴近年轻人`,
      
      baowen: `你是一位资深的爆文创作专家，擅长打造高传播度的营销文案。
你的文案应该：
1. 用痛点或疑问开头，抓住用户注意力
2. 提供有价值的观点或解决方案
3. 结构清晰，逻辑严密
4. 金句频出，便于传播
5. 引发情感共鸣
6. 适合在社交媒体平台传播`,
      
      chanpin: `你是一位专业的产品文案撰写专家，擅长撰写电商产品详情页文案。
你的文案应该：
1. 全面介绍产品功能和特点
2. 突出产品优势和价值
3. 用数据和事实说话
4. 结构清晰，分点说明
5. 专业而简洁
6. 突出购买理由`,
      
      shequ: `你是一位社区互动营销专家，擅长撰写能够激发用户互动的文案。
你的文案应该：
1. 提出有趣的话题或问题
2. 鼓励用户分享观点和经验
3. 营造讨论氛围
4. 适当引用用户反馈
5. 引导用户参与互动
6. 增强社区归属感`
    };

    const systemPrompt = systemPrompts[template] || systemPrompts.zhongcao;

    // 构建用户提示词
    let userPrompt = `请根据以下商品信息生成${template === 'zhongcao' ? '种草文案' : template === 'baowen' ? '爆文' : template === 'chanpin' ? '产品介绍' : '社区互动文案'}：\n\n`;
    
    if (productId) {
      userPrompt += `商品ID：${productId}\n`;
    }
    
    if (productLink) {
      userPrompt += `商品链接：${productLink}\n`;
    }
    
    userPrompt += `商品卖点：${sellingPoints}\n`;
    
    if (persona) {
      userPrompt += `人设风格：${persona}\n`;
    }
    
    if (topic) {
      userPrompt += `话题标签：${topic}\n`;
    }

    userPrompt += `\n请直接输出文案内容，不要包含其他说明文字。`;

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
          console.error('生成文案失败:', error);
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
