import { NextRequest, NextResponse } from 'next/server';
import { HeaderUtils } from 'coze-coding-dev-sdk';

// 简单的网页抓取方式（不依赖火山SDK）
async function simpleFetch(url: string): Promise<{
  title: string;
  description: string;
  price: string;
  images: string[];
  rawText: string;
}> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();

  // 提取标题
  let title = '';
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // 提取meta描述
  let description = '';
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) {
    description = descMatch[1].trim();
  }

  // 提取商品图片
  const images: string[] = [];
  const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["']/gi);
  for (const match of imgMatches) {
    const src = match[1];
    if (src && (src.startsWith('http') || src.startsWith('//')) && !src.includes('icon') && !src.includes('logo')) {
      const fullUrl = src.startsWith('//') ? 'https:' + src : src;
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  }

  // 提取价格
  let price = '';
  const pricePatterns = [
    /["']price["']\s*:\s*["']?([\d,.]+)/i,
    /price["']?\s*[:=]\s*["']?([\d,.]+)/i,
    /[¥$￥]\s*([\d,.]+)/,
    /价格[：:]\s*[¥$￥]?\s*([\d,.]+)/,
  ];
  
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      price = `¥${match[1]}`;
      break;
    }
  }

  // 提取纯文本
  const rawText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title: title.substring(0, 200),
    description: description.substring(0, 500),
    price,
    images: images.slice(0, 10),
    rawText: rawText.substring(0, 5000)
  };
}

// 使用 AI 分析商品信息
async function analyzeWithAI(
  text: string,
  apiKey: string
): Promise<{
  productName: string;
  shortDescription: string;
  sellingPoints: string[];
  targetAudience: string;
}> {
  const prompt = `请从以下网页内容中提取商品信息，返回JSON格式：

网页内容：${text.substring(0, 4000)}

返回格式：
{
  "productName": "商品名称（简洁，不超过50字）",
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
    },
    body: JSON.stringify({
      model: 'doubao-seed-1-6-lite-251015',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API错误: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';

  // 解析JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('无法解析AI返回结果');
}

export async function POST(request: NextRequest) {
  try {
    const { url, useAI = true } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: '请提供商品链接' },
        { status: 400 }
      );
    }

    // 验证URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: '链接格式不正确' },
        { status: 400 }
      );
    }

    console.log('[fetch-product] 开始获取:', url);

    // 获取网页内容
    let pageData;
    try {
      pageData = await simpleFetch(url);
      console.log('[fetch-product] 网页获取成功，标题:', pageData.title);
    } catch (error) {
      console.error('[fetch-product] 网页获取失败:', error);
      return NextResponse.json(
        { error: `无法访问该链接: ${error instanceof Error ? error.message : '未知错误'}` },
        { status: 500 }
      );
    }

    // 尝试AI分析
    let aiAnalysis = null;
    const apiKey = process.env.VOLC_API_KEY;

    if (useAI && apiKey) {
      try {
        console.log('[fetch-product] 开始AI分析...');
        const combinedText = `${pageData.title}\n\n${pageData.description}\n\n${pageData.rawText.substring(0, 3000)}`;
        aiAnalysis = await analyzeWithAI(combinedText, apiKey);
        console.log('[fetch-product] AI分析成功:', aiAnalysis);
      } catch (error) {
        console.warn('[fetch-product] AI分析失败:', error);
        // AI失败不影响返回结果
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        title: aiAnalysis?.productName || pageData.title || '未知商品',
        description: aiAnalysis?.shortDescription || pageData.description || '',
        price: pageData.price,
        images: pageData.images,
        sellingPoints: aiAnalysis?.sellingPoints || [],
        targetAudience: aiAnalysis?.targetAudience || '',
        hasAI: !!apiKey,
      }
    });

  } catch (error) {
    console.error('[fetch-product] 整体错误:', error);
    return NextResponse.json(
      { error: `读取商品链接失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}
