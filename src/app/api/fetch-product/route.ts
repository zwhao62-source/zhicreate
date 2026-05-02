import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface VolcanoLLMResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 火山引擎 API 调用
async function callVolcanoLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
  const accessKey = process.env.VOLC_ACCESSKEY;
  const secretKey = process.env.VOLC_SECRETKEY;

  if (!accessKey || !secretKey) {
    throw new Error('未配置火山引擎 API 密钥');
  }

  const region = 'cn-north-1';
  const service = 'volcengineai';
  const host = 'open.volcengineapi.com';
  const version = '2025-01-01';
  const action = 'ChatCompletions';
  const algorithm = 'HMAC-SHA256';

  // 生成时间戳和日期
  const now = new Date();
  const timestamp = Math.floor(now.getTime() / 1000);
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');

  // 构建请求体
  const requestBody = {
    model: 'doubao-seed-1-6-lite-251015',
    messages: messages,
    temperature: 0.3,
    stream: false
  };

  // 签名计算
  const signedHeaders = 'content-type;host;x-date';
  const contentType = 'application/json';

  const canonicalRequest = [
    'POST',
    '/',
    '',
    `content-type:application/json`,
    `host:${host}`,
    `x-date:${new Date().toISOString()}`,
    '',
    signedHeaders,
    crypto.createHash('sha256').update(JSON.stringify(requestBody)).digest('hex')
  ].join('\n');

  const credentialScope = `${dateStr}/${region}/${service}/request`;
  const stringToSign = [
    algorithm,
    new Date().toISOString(),
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');

  const signingKey = crypto
    .createHmac('SHA256', `VOLCENGINE4${secretKey}`)
    .update(dateStr)
    .digest();
  const signature = crypto
    .createHmac('SHA256', signingKey)
    .update(stringToSign)
    .digest('hex');

  const authHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  // 发起请求
  const response = await fetch(`https://${host}/${version}/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'Host': host,
      'X-Date': new Date().toISOString(),
      'Authorization': authHeader
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${errorText}`);
  }

  const data = await response.json() as VolcanoLLMResponse;
  return data.choices[0]?.message?.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: '请提供商品链接' }, { status: 400 });
    }

    // 验证URL格式
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: '链接格式不正确' }, { status: 400 });
    }

    // 使用原生fetch获取页面内容
    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    });

    if (!fetchResponse.ok) {
      return NextResponse.json({ 
        error: '无法获取页面内容，请检查链接是否有效' 
      }, { status: 400 });
    }

    const htmlContent = await fetchResponse.text();
    
    // 提取页面标题
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';
    
    // 提取meta描述
    const descMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const metaDesc = descMatch ? descMatch[1].trim() : '';
    
    // 提取商品关键词
    const keywordsMatch = htmlContent.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    const keywords = keywordsMatch ? keywordsMatch[1].trim() : '';
    
    // 尝试提取商品价格
    const pricePatterns = [
      /["']price["']\s*:\s*["']?(\d+\.?\d*)/i,
      /price["']?\s*[:=]\s*["']?(\d+\.?\d*)/i,
      /¥\s*(\d+\.?\d*)/,
      /\$\s*(\d+\.?\d*)/,
    ];
    let price = null;
    for (const pattern of pricePatterns) {
      const match = htmlContent.match(pattern);
      if (match) {
        price = match[1];
        break;
      }
    }
    
    // 提取品牌信息
    const brandPatterns = [
      /["']brand["']\s*:\s*["']([^"']+)["']/i,
      /品牌["']?\s*[:=]\s*["']([^"']+)["']/i,
    ];
    let brand = null;
    for (const pattern of brandPatterns) {
      const match = htmlContent.match(pattern);
      if (match) {
        brand = match[1];
        break;
      }
    }
    
    // 提取页面正文文本（简单去除HTML标签）
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let textContent = '';
    if (bodyMatch) {
      textContent = bodyMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000);
    }

    // 准备提取提示
    const extractPrompt = `你是一个专业的电商商品信息提取助手。请从以下网页内容中提取商品的关键信息。

要求：
1. 商品名称：从标题或商品名称中提取
2. 商品卖点/特色：列出商品的主要特点和优势
3. 商品规格（如有）：颜色、尺寸、材质等
4. 价格信息（如有）
5. 品牌信息（如有）
6. 适用人群/场景（如有）

请用JSON格式返回，字段如下：
- productName: 商品名称
- sellingPoints: 商品卖点列表（数组，每项一个卖点）
- specifications: 规格信息（字符串或null）
- price: 价格信息（字符串或null）
- brand: 品牌信息（字符串或null）
- targetAudience: 适用人群/场景（字符串或null）

如果无法提取某项信息，请返回null。

网页标题：${pageTitle || '无'}
商品关键词：${keywords || '无'}
Meta描述：${metaDesc || '无'}

网页正文内容：
${textContent || metaDesc || '无法提取正文内容'}`;

    // 使用火山引擎 API 提取商品信息
    const llmContent = await callVolcanoLLM([
      { role: 'user', content: extractPrompt }
    ]);

    // 解析LLM返回的JSON
    let productInfo;
    try {
      // 尝试提取JSON
      const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productInfo = JSON.parse(jsonMatch[0]);
      } else {
        // 如果没有找到JSON，返回原始内容作为卖点
        productInfo = {
          productName: pageTitle || '未识别到商品名称',
          sellingPoints: [llmContent.slice(0, 500)],
          specifications: null,
          price: price,
          brand: brand,
          targetAudience: null
        };
      }
    } catch {
      // 解析失败，使用基本信息和原始内容
      productInfo = {
        productName: pageTitle || '未识别到商品名称',
        sellingPoints: [llmContent.slice(0, 500)],
        specifications: null,
        price: price,
        brand: brand,
        targetAudience: null
      };
    }

    return NextResponse.json({
      success: true,
      productInfo,
      pageTitle
    });
  } catch (error) {
    console.error('读取商品链接失败:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '读取链接失败，请稍后重试' 
    }, { status: 500 });
  }
}
