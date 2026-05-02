import { NextRequest, NextResponse } from 'next/server';
import { FetchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 使用 FetchClient 获取网页内容
async function fetchProductPage(url: string, customHeaders?: Record<string, string>): Promise<{
  title: string;
  description: string;
  price: string;
  images: string[];
  rawText: string;
}> {
  const config = new Config();
  const client = new FetchClient(config, customHeaders);

  const response = await client.fetch(url);

  if (response.status_code !== 0) {
    throw new Error(`获取网页失败: ${response.status_message}`);
  }

  // 提取文本内容
  const textItems = response.content.filter(item => item.type === 'text');
  const rawText = textItems.map(item => item.text).join('\n');

  // 提取图片
  const images = response.content
    .filter(item => item.type === 'image')
    .map(item => item.image?.display_url || item.image?.image_url || '')
    .filter(url => url);

  // 提取标题
  const title = response.title || '';

  // 提取描述
  const description = textItems.slice(0, 5).join(' ').substring(0, 500);

  // 尝试提取价格（从文本中查找）
  const priceMatch = rawText.match(/(?:价格|价|￥|¥|\$|price)[:\s]*([\d,.]+)/i);
  const price = priceMatch ? `¥${priceMatch[1]}` : '';

  return {
    title,
    description,
    price,
    images: images.slice(0, 10), // 限制图片数量
    rawText
  };
}

// 使用 AI 分析商品信息
async function analyzeProductWithAI(
  title: string,
  description: string,
  rawText: string,
  customHeaders?: Record<string, string>
): Promise<{
  productName: string;
  shortDescription: string;
  sellingPoints: string[];
  targetAudience: string;
}> {
  const apiKey = process.env.VOLC_API_KEY;

  if (!apiKey) {
    throw new Error('未配置火山方舟 API 密钥 (VOLC_API_KEY)');
  }

  const prompt = `你是一个专业的电商运营专家。请根据以下商品信息提取关键卖点。

商品标题：${title}

商品描述：${description.substring(0, 1000)}

页面内容摘要：${rawText.substring(0, 3000)}

请提取以下信息（用JSON格式返回）：
{
  "productName": "商品名称（简洁）",
  "shortDescription": "一句话描述（20字内）",
  "sellingPoints": ["卖点1", "卖点2", "卖点3"],
  "targetAudience": "目标人群描述"
}

只返回JSON，不要其他内容。`;

  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...customHeaders
    },
    body: JSON.stringify({
      model: 'doubao-seed-1-6-lite-251015',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`AI分析失败: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';

  try {
    // 尝试解析 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // 解析失败，返回默认值
  }

  return {
    productName: title.substring(0, 50),
    shortDescription: description.substring(0, 50),
    sellingPoints: [],
    targetAudience: '电商消费者'
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: '请提供商品链接' },
        { status: 400 }
      );
    }

    // 验证 URL 格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: '链接格式不正确' },
        { status: 400 }
      );
    }

    // 提取转发 headers
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 获取网页内容
    const pageData = await fetchProductPage(url, customHeaders);

    // 使用 AI 分析（如果配置了 API Key）
    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeProductWithAI(
        pageData.title,
        pageData.description,
        pageData.rawText,
        customHeaders
      );
    } catch (error) {
      console.warn('AI分析失败:', error);
      // AI 失败不影响主流程
    }

    return NextResponse.json({
      success: true,
      data: {
        title: aiAnalysis?.productName || pageData.title,
        description: aiAnalysis?.shortDescription || pageData.description.substring(0, 200),
        price: pageData.price,
        images: pageData.images,
        sellingPoints: aiAnalysis?.sellingPoints || [],
        targetAudience: aiAnalysis?.targetAudience || '',
        rawText: pageData.rawText.substring(0, 1000) // 返回部分原文供参考
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: `读取商品链接失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}
