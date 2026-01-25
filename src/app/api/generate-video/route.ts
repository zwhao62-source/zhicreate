import { NextRequest, NextResponse } from 'next/server';
import { VideoGenerationClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const pose = formData.get('pose') as string;
    const duration = parseInt(formData.get('duration') as string || '5');

    // 验证必填字段
    if (!image) {
      return NextResponse.json(
        { error: '请上传模特图片' },
        { status: 400 }
      );
    }

    // 验证时长范围
    if (duration < 2 || duration > 10) {
      return NextResponse.json(
        { error: '视频时长必须在2-10秒之间' },
        { status: 400 }
      );
    }

    // 将图片转换为base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const imageUrl = `data:${image.type};base64,${base64}`;

    // 根据动作类型构建提示词
    const posePrompts: Record<string, string> = {
      walk: 'Model walking naturally with confident posture, smooth camera movement following the model',
      rotate: 'Model slowly turning around to show different angles, 360 degree rotation, smooth camera movement',
      wave: 'Model waving hand naturally with friendly expression, engaging gesture',
      dance: 'Model dancing gracefully with elegant movements, artistic performance'
    };

    const basePrompt = posePrompts[pose] || posePrompts.rotate;

    // 构建完整提示词
    let fullPrompt = `Professional fashion model showcasing clothing with natural movements. ${basePrompt}. `;
    
    if (prompt) {
      fullPrompt += `Additional instructions: ${prompt}`;
    } else {
      fullPrompt += 'Cinematic lighting, high quality, professional photography.';
    }

    // 创建视频生成客户端
    const config = new Config();
    const client = new VideoGenerationClient(config);

    // 构建内容数组
    const content = [
      {
        type: 'image_url' as const,
        image_url: {
          url: imageUrl
        },
        role: 'first_frame' as const
      },
      {
        type: 'text' as const,
        text: fullPrompt
      }
    ];

    // 生成视频
    const response = await client.videoGeneration(content, {
      model: 'doubao-seedance-1-5-pro-251215',
      duration: duration,
      ratio: '16:9',
      resolution: '720p',
      watermark: false,
      generateAudio: false
    });

    if (response.videoUrl) {
      return NextResponse.json({
        success: true,
        videoUrl: response.videoUrl
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: response.response?.error_message || '视频生成失败' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('生成视频失败:', error);
    return NextResponse.json(
      { success: false, error: '处理请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}
