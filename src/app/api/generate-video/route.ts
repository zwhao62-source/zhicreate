import { NextRequest, NextResponse } from 'next/server';

// 火山引擎视频API配置
const VIDEO_API_URL = 'https://visual.volccdn.com/video';

function getConfig() {
  return {
    accessKey: process.env.VOLC_ACCESSKEY,
    secretKey: process.env.VOLC_SECRETKEY,
    region: process.env.VOLC_REGION || 'cn-beijing'
  };
}

// 简单的签名生成
async function generateSignature(accessKey: string, secretKey: string, timestamp: number): Promise<string> {
  const crypto = await import('crypto');
  const stringToSign = `POST\n/video\naccess_key=${accessKey}&timestamp=${timestamp}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, prompt, duration = 5 } = body;

    if (!imageUrl && !prompt) {
      return NextResponse.json(
        { error: '请提供图片或描述' },
        { status: 400 }
      );
    }

    const config = getConfig();
    
    // 验证配置
    if (!config.accessKey || !config.secretKey) {
      return NextResponse.json({
        error: '请配置火山引擎AccessKey和SecretKey',
        hint: '在环境变量中配置 VOLC_ACCESSKEY 和 VOLC_SECRETKEY'
      }, { status: 400 });
    }

    // 构建提示词
    let fullPrompt = prompt || 'natural movement, cinematic';
    if (!prompt && imageUrl) {
      fullPrompt = 'gentle camera movement, professional cinematography, high quality';
    }

    // 调用火山引擎视频生成API
    const timestamp = Date.now();
    const signature = await generateSignature(config.accessKey, config.secretKey, timestamp);
    
    const apiUrl = `${VIDEO_API_URL}?access_key=${config.accessKey}&timestamp=${timestamp}&signature=${signature}`;

    const apiBody: Record<string, any> = {
      model: 'general-video-v1',
      prompt: fullPrompt,
      duration: Math.min(Math.max(duration, 4), 12), // 4-12秒
      aspect_ratio: '16:9',
      extra_params: {
        return_url: true
      }
    };

    if (imageUrl) {
      apiBody.image_url = imageUrl;
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
      console.error('视频生成API错误:', response.status, errorText);
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data?.video_url) {
      return NextResponse.json({
        success: true,
        videoUrl: data.data.video_url,
        coverUrl: data.data.cover_url || null,
        duration: data.data.duration || duration
      });
    }

    throw new Error('视频生成失败');

  } catch (error: any) {
    console.error('生成视频失败:', error);
    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
