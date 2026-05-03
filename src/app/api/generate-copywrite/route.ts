import { NextRequest, NextResponse } from 'next/server';

// 方舟API配置
const ARK_API_ENDPOINTS = [
  'https://ark.cn-beijing.volces.com/api/v3',
  'https://ark-openapi.volcengine.com/api/v3',
  'https://ark-doubao.volcengine.com/api/v3'
];

const MODELS = ['Doubao-Seed-2.0-pro', 'Doubao-Seed-2.0-lite', 'Doubao-Seed-2.0-mini', 'Doubao-Seed-1.8'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellingPoints, persona, topic, template } = body;

    const apiKey = process.env.VOLC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: '请先配置 VOLC_API_KEY 环境变量' },
        { status: 400 }
      );
    }

    // 根据模板生成不同风格的文案
    let style = '';
    switch (template) {
      case 'zhongcao':
        style = '种草风格：轻松活泼，适合小红书、微博等平台';
        break;
      case 'jiazhuang':
        style = '家装风格：温馨实用，适合家居类平台';
        break;
      case 'meishi':
        style = '美食风格：诱人可口，适合美食平台';
        break;
      default:
        style = '通用风格：简洁有力，适合各类平台';
    }

    const userPrompt = `请为以下商品生成推广文案：

商品卖点：${sellingPoints || '暂无卖点信息'}
目标人群：${persona || '年轻消费者'}
主题标签：${topic || ''}
文案风格：${style}

要求：
1. 标题吸引人，引发好奇
2. 内容真实可信，突出卖点
3. 字数适中（100-300字）
4. 结尾引导互动

请直接输出文案内容，不需要解释。`;

    // 尝试多个endpoint和模型
    let lastError = '';
    
    for (const endpoint of ARK_API_ENDPOINTS) {
      for (const model of MODELS) {
        try {
          const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.8,
              max_tokens: 2000
            })
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            
            if (content) {
              return NextResponse.json({
                success: true,
                content: content,
                model: model
              });
            }
          } else {
            const errorText = await response.text();
            lastError = `endpoint: ${endpoint}, model: ${model}, status: ${response.status}, error: ${errorText}`;
            console.log(`尝试失败: ${lastError}`);
            continue;
          }
        } catch (e) {
          lastError = `endpoint: ${endpoint}, model: ${model}, exception: ${e}`;
          continue;
        }
      }
    }

    // 所有尝试都失败
    console.error('所有endpoint和model都失败:', lastError);
    return NextResponse.json(
      { error: 'AI服务暂时不可用，请稍后重试' },
      { status: 500 }
    );

  } catch (error) {
    console.error('处理请求失败:', error);
    return NextResponse.json(
      { error: '处理请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}
