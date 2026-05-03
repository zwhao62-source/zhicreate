import { NextRequest, NextResponse } from 'next/server';

// 火山引擎配置
const VOLC_REGION = 'cn-beijing';
const IMAGE_API_URL = 'https://visual.volccdn.com/image';

function getConfig() {
  return {
    accessKey: process.env.VOLC_ACCESSKEY,
    secretKey: process.env.VOLC_SECRETKEY,
    region: process.env.VOLC_REGION || VOLC_REGION,
    apiKey: process.env.VOLC_API_KEY
  };
}

// 简单的签名生成（用于火山引擎API）
async function generateSignature(accessKey: string, secretKey: string, timestamp: number): Promise<string> {
  const crypto = await import('crypto');
  const stringToSign = `GET\n/image\naccess_key=${accessKey}&timestamp=${timestamp}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const style = formData.get('style') as string;
    const scene = formData.get('scene') as string;
    const size = formData.get('size') as string || '1024x1024';

    if (!image && !prompt) {
      return NextResponse.json(
        { error: '请提供商品图片或描述提示' },
        { status: 400 }
      );
    }

    const config = getConfig();
    
    // 如果没有配置火山密钥，返回错误提示
    if (!config.accessKey || !config.secretKey) {
      return NextResponse.json({
        error: '请配置火山引擎AccessKey和SecretKey',
        hint: '在环境变量中配置 VOLC_ACCESSKEY 和 VOLC_SECRETKEY',
        details: '商品图生成需要火山引擎的图片生成服务'
      }, { status: 400 });
    }

    // 构建提示词
    const stylePrompts: Record<string, string> = {
      realistic: 'realistic photography, professional lighting, high quality product photo',
      fashion: 'fashion magazine style, trendy, stylish, editorial photography',
      minimalist: 'minimalist style, clean white background, simple and elegant',
      lifestyle: 'lifestyle photography, natural setting, warm atmosphere'
    };

    const scenePrompts: Record<string, string> = {
      studio: 'professional photography studio, studio lighting',
      outdoor: 'outdoor natural light, beautiful scenery',
      indoor: 'modern indoor setting, bright and clean',
      cafe: 'cozy cafe atmosphere, warm lighting',
      street: 'urban street style, city backdrop',
      beach: 'beach setting, sunny day, ocean'
    };

    let fullPrompt = prompt || '';
    if (style && stylePrompts[style]) {
      fullPrompt += ', ' + stylePrompts[style];
    }
    if (scene && scenePrompts[scene]) {
      fullPrompt += ', ' + scenePrompts[scene];
    }
    fullPrompt += ', high quality, 4K, commercial photography';

    // 处理上传的图片
    let imageUrl: string | undefined;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      imageUrl = `data:${image.type};base64,${base64}`;
    }

    // 调用火山引擎图片生成API
    const timestamp = Date.now();
    const signature = await generateSignature(config.accessKey, config.secretKey, timestamp);
    
    const apiUrl = `${IMAGE_API_URL}?access_key=${config.accessKey}&timestamp=${timestamp}&signature=${signature}`;

    const apiBody: any = {
      prompt: fullPrompt,
      model: 'general-v1.4',
      aspect_ratio: size === '800x800' ? '1:1' : size === '1024x1024' ? '1:1' : '16:9',
      extra_params: {
        return_url: true
      }
    };

    if (imageUrl) {
      apiBody.input_image = imageUrl;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('图片生成API错误:', response.status, errorText);
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data?.images?.length > 0) {
      return NextResponse.json({
        success: true,
        images: data.data.images.map((img: any) => ({
          url: img.url,
          width: img.width || 1024,
          height: img.height || 1024
        }))
      });
    }

    throw new Error('图片生成失败');

  } catch (error: any) {
    console.error('生成商品图失败:', error);
    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
