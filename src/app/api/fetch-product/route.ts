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

  // 提取标题 - 多种方式
  let title = '';
  
  // 1. title标签
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/_天猫|旗舰店|淘宝旺旺|阿里巴巴/g, '').trim();
  }
  
  // 2. og:title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (!title && ogTitleMatch) {
    title = ogTitleMatch[1].trim();
  }
  
  // 3. 商品名称
  const productNameMatch = html.match(/["']title["']\s*[:=]\s*["']([^"']{5,100})["']/i);
  if (!title && productNameMatch) {
    title = productNameMatch[1].trim();
  }

  // 4. JSON-LD 结构化数据（常见电商平台）
  if (!title) {
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        title = jsonLd.name || jsonLd.headline || '';
      } catch {}
    }
  }
  
  // 5. 天猫/淘宝特殊格式
  if (!title) {
    // 方式A: JSON数据中的title
    const tbTitleMatch = html.match(/["']title["']\s*:\s*["']([^"']{10,200})["']/g);
    if (tbTitleMatch) {
      for (const match of tbTitleMatch) {
        const t = match.match(/["']title["']\s*:\s*["']([^"']+)["']/);
        if (t && t[1].length > 10) {
          title = t[1];
          break;
        }
      }
    }
  }
  
  // 6. window.__INITIAL_STATE__ 或类似数据
  if (!title) {
    const stateMatch = html.match(/window\.__\w+__\s*=\s*(\{[^;]+);/);
    if (stateMatch) {
      const titleInState = stateMatch[1].match(/title["']?\s*[:=]\s*["']([^"']+)["']/);
      if (titleInState) {
        title = titleInState[1];
      }
    }
  }
  
  // 7. data-title 属性
  if (!title) {
    const dataTitleMatch = html.match(/data-title=["']([^"']{5,200})["']/i);
    if (dataTitleMatch) {
      title = dataTitleMatch[1];
    }
  }
  
  // 8. item-title 或 product-title 类名
  if (!title) {
    const classTitleMatch = html.match(/<(?:h1|h2|span|div)[^>]*(?:item-title|product-title|title|subject)[^>]*>([^<]{5,100})</i);
    if (classTitleMatch) {
      title = classTitleMatch[1].trim();
    }
  }
  
  // 9. 提取页面中第一个较长的文本作为备选
  if (!title) {
    const longTextMatch = html.match(/<span[^>]*>([^<]{20,150})<\/span>/g);
    if (longTextMatch) {
      for (const match of longTextMatch) {
        const text = match.replace(/<[^>]+>/g, '').trim();
        if (text && text.length > 15 && !text.includes('http') && !text.includes('button')) {
          title = text;
          break;
        }
      }
    }
  }

  // 提取meta描述
  let description = '';
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) {
    description = descMatch[1].trim();
  }
  
  // og:description
  if (!description) {
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDescMatch) {
      description = ogDescMatch[1].trim();
    }
  }

  // 提取商品图片 - 多种方式
  const images: string[] = [];
  
  // 1. og:image
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    const imgUrl = ogImageMatch[1].startsWith('//') ? 'https:' + ogImageMatch[1] : ogImageMatch[1];
    images.push(imgUrl);
  }
  
  // 2. 所有图片
  const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["']/gi);
  for (const match of imgMatches) {
    const src = match[1];
    if (src && (src.startsWith('http') || src.startsWith('//')) && 
        !src.includes('icon') && !src.includes('logo') && !src.includes('1x1')) {
      const fullUrl = src.startsWith('//') ? 'https:' + src : src;
      if (!images.includes(fullUrl) && images.length < 10) {
        images.push(fullUrl);
      }
    }
  }

  // 3. data-src 懒加载图片
  const dataSrcMatches = html.matchAll(/data-src=["']([^"']+)["']/gi);
  for (const match of dataSrcMatches) {
    const src = match[1];
    if (src && (src.startsWith('http') || src.startsWith('//')) && 
        !src.includes('icon') && !src.includes('logo')) {
      const fullUrl = src.startsWith('//') ? 'https:' + src : src;
      if (!images.includes(fullUrl) && images.length < 10) {
        images.push(fullUrl);
      }
    }
  }
  
  // 4. 天猫/淘宝商品图
  const tbImgMatch = html.match(/(https?:\/\/img\.alicdn\.com\/[^"'>\s]+)/g);
  if (tbImgMatch && images.length < 3) {
    for (const img of tbImgMatch.slice(0, 5)) {
      if (!images.includes(img) && images.length < 10) {
        images.push(img);
      }
    }
  }
  
  // 5. JSON数据中的图片
  const jsonImgMatch = html.match(/["']image["']\s*:\s*["']([^"']+)["']/gi);
  if (jsonImgMatch && images.length < 3) {
    for (const match of jsonImgMatch.slice(0, 3)) {
      const imgUrl = match.match(/["']image["']\s*:\s*["']([^"']+)["']/);
      if (imgUrl && (imgUrl[1].startsWith('http') || imgUrl[1].startsWith('//'))) {
        const fullUrl = imgUrl[1].startsWith('//') ? 'https:' + imgUrl[1] : imgUrl[1];
        if (!images.includes(fullUrl) && images.length < 10) {
          images.push(fullUrl);
        }
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
