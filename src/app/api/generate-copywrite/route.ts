import { NextRequest, NextResponse } from 'next/server';
import { getARKApiKey } from '@/lib/api-keys';

export const runtime = 'edge';

const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

interface GenerateCopywriteRequest {
  sellingPoints?: string;
  productName?: string;
  productDescription?: string;
  productCategory?: string;
  targetAudience?: string;
  persona?: string;
  topic?: string;
  template?: 'zhongcao' | 'xiaohongshu' | 'weibo' | 'moments';
  language?: 'zh' | 'en';
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function generateCopywriteWithAI(messages: Message[], apiKey: string): Promise<string> {
  try {
    const response = await fetch(ARK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-lite-260215',
        messages: messages,
        stream: false,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('方舟API错误:', response.status, errorText);
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('方舟返回错误:', data.error);
      throw new Error(data.error.message || 'AI服务错误');
    }

    // 提取回复内容
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }

    throw new Error('无法解析AI响应');
  } catch (error) {
    console.error('AI调用失败:', error);
    throw error;
  }
}

function generateDefaultCopywrite(params: GenerateCopywriteRequest): string {
  const sellingPoints = params.sellingPoints?.split('|').filter(Boolean) || [];
  const productName = params.productName || '商品';
  const template = params.template || 'zhongcao';

  const pointsText = sellingPoints.length > 0 
    ? sellingPoints.map((p, i) => `${i + 1}. ${p.trim()}`).join('\n')
    : '1. 精选材质，品质保障\n2. 做工精细，经久耐用\n3. 时尚设计，美观大方';

  const templates = {
    zhongcao: `# ${productName} 种草推荐

✨ 今天要给大家安利一款超级好用的产品！

${sellingPoints.map(p => `🌟 ${p.trim()}`).join('\n')}

📝 产品亮点：
${pointsText}

💖 使用感受：
这款${productName}真的太赞了！无论是质量还是外观都超出预期，性价比超高！强烈推荐给大家！

🏷️ 相关标签：
${params.topic || '#好物推荐 #种草 #值得购买'}`,

    xiaohongshu: `# ${productName}测评 

姐妹们！挖到宝了！
.
.
.

这款${productName}真的绝绝子！

✅ 优点：
${sellingPoints.map(p => `• ${p.trim()}`).join('\n')}

❌ 缺点：
暂时没发现

💰 性价比：
⭐⭐⭐⭐⭐ 超值！

姐妹们冲鸭！冲冲冲！`,
  };

  return templates[template as keyof typeof templates] || templates.zhongcao;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCopywriteRequest = await request.json();
    
    const apiKey = getARKApiKey();
    
    // 构建提示词
    const systemPrompt = `你是一位专业的电商营销文案专家，擅长创作各种风格的种草文案。请根据用户提供的商品信息，生成吸引人的营销文案。

支持以下文案模板：
1. zhongcao - 淘宝/天猫种草文案
2. xiaohongshu - 小红书风格文案
3. weibo - 微博推广文案
4. moments - 微信朋友圈文案

请确保文案：
- 语言生动、有感染力
- 突出商品卖点
- 符合目标受众的阅读习惯
- 使用合适的emoji增加趣味性`;

    let userMessage = '';
    
    if (body.sellingPoints) {
      userMessage += `商品卖点：${body.sellingPoints}`;
    }
    if (body.productName) {
      userMessage += `\n商品名称：${body.productName}`;
    }
    if (body.productDescription) {
      userMessage += `\n商品描述：${body.productDescription}`;
    }
    if (body.productCategory) {
      userMessage += `\n商品类别：${body.productCategory}`;
    }
    if (body.targetAudience) {
      userMessage += `\n目标受众：${body.targetAudience}`;
    }
    if (body.persona) {
      userMessage += `\n目标人群：${body.persona}`;
    }
    if (body.topic) {
      userMessage += `\n相关话题：${body.topic}`;
    }
    
    const template = body.template || 'zhongcao';
    userMessage += `\n\n请生成一篇${template === 'zhongcao' ? '淘宝/天猫种草文案' : template === 'xiaohongshu' ? '小红书风格文案' : '种草文案'}。`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    // 如果有API Key，调用AI生成
    if (apiKey) {
      try {
        const result = await generateCopywriteWithAI(messages, apiKey);
        return NextResponse.json({
          success: true,
          content: result,
        });
      } catch (error) {
        console.error('AI生成失败，使用默认文案:', error);
        // AI失败时返回默认文案
        return NextResponse.json({
          success: true,
          content: generateDefaultCopywrite(body),
          message: '使用默认文案（AI服务暂时不可用）',
        });
      }
    } else {
      // 没有API Key时返回默认文案
      return NextResponse.json({
        success: true,
        content: generateDefaultCopywrite(body),
        message: '使用默认文案（请配置VOLC_API_KEY启用AI生成）',
      });
    }
  } catch (error) {
    console.error('生成文案失败:', error);
    return NextResponse.json(
      { success: false, error: '生成文案失败，请稍后重试' },
      { status: 500 }
    );
  }
}
