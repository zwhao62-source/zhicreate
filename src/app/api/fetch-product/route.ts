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

// 方舟 API Key 方式调用（推荐）
async function callArkLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.VOLC_API_KEY;

  if (!apiKey) {
    throw new Error('未配置火山方舟 API 密钥 (VOLC_API_KEY)');
  }

  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'doubao-seed-1-6-lite-251015',
      messages: messages,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${errorText}`);
  }

  const data = await response.json() as VolcanoLLMResponse;
  return data.choices[0]?.message?.content || '';
}

// 火山引擎 AccessKey/SecretKey 方式调用（旧方式）
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

  const now = new Date();
  const timestamp = Math.floor(now.getTime() / 1000);
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');

  const requestBody = {
    model: 'doubao-seed-1-6-lite-251015',
    messages: messages,
    temperature: 0.3,
    stream: false
  };

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

// 统一调用入口（优先使用方舟 API Key）
async function callLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
  // 优先使用方舟 API Key
  if (process.env.VOLC_API_KEY) {
    return callArkLLM(messages);
  }
  // 降级使用 AccessKey/SecretKey
  return callVolcanoLLM(messages);
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
      return NextResponse.json({ error: '获取商品信息失败，请检查链接是否正确' }, { status: 400 });
    }

    const html = await fetchResponse.text();

    // 提取商品信息
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i) ||
                       html.match(/"title"\s*:\s*"([^"]+)"/i) ||
                       html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

    const title = titleMatch ? titleMatch[1].trim().substring(0, 200) : '未知商品';

    // 提取描述
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/"description"\s*:\s*"([^"]+)"/i);
    const description = descMatch ? descMatch[1].trim().substring(0, 500) : '';

    // 调用大模型分析商品信息
    let productInfo = {
      title: title,
      description: description,
      price: '',
      category: '',
      features: [] as string[],
      analysis: ''
    };

    // 如果有 API 密钥，调用 LLM 分析
    if (process.env.VOLC_API_KEY || process.env.VOLC_ACCESSKEY) {
      try {
        const analysisPrompt = `你是一个专业的电商商品分析师。请从以下商品信息中提取关键卖点和建议：

商品标题：${title}
商品描述：${description}

请以JSON格式返回，包含：
- category: 商品类别
- price: 价格（如果能找到）
- features: 3-5个核心卖点（每个不超过20字）
- analysis: 一段50字左右的营销建议

只返回JSON，不要其他内容。`;

        const llmResponse = await callLLM([
          { role: 'system', content: '你是一个专业的电商商品分析师，擅长提取商品卖点和营销建议。' },
          { role: 'user', content: analysisPrompt }
        ]);

        // 尝试解析 LLM 返回的 JSON
        try {
          const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            productInfo = {
              ...productInfo,
              category: analysis.category || '',
              features: analysis.features || [],
              analysis: analysis.analysis || '',
              price: analysis.price || ''
            };
          }
        } catch {
          // 解析失败，使用原始信息
          productInfo.analysis = llmResponse.substring(0, 200);
        }
      } catch (llmError) {
        console.error('LLM 调用失败:', llmError);
        productInfo.analysis = '商品信息提取成功，请手动补充卖点';
      }
    } else {
      productInfo.analysis = '请配置火山方舟 API 密钥以获取智能分析';
    }

    return NextResponse.json({
      success: true,
      data: productInfo
    });

  } catch (error) {
    console.error('商品信息获取失败:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '服务器错误'
    }, { status: 500 });
  }
}
