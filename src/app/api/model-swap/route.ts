import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const source = formData.get('source') as File;
    const face = formData.get('face') as File | null;
    const background = formData.get('background') as File | null;
    const mode = formData.get('mode') as string;

    // 验证必填字段
    if (!source) {
      return NextResponse.json(
        { error: '请上传模特图片' },
        { status: 400 }
      );
    }

    if (mode === 'face' && !face) {
      return NextResponse.json(
        { error: '请上传人脸图片' },
        { status: 400 }
      );
    }

    if (mode === 'background' && !background) {
      return NextResponse.json(
        { error: '请上传背景图片' },
        { status: 400 }
      );
    }

    if (mode === 'both' && (!face || !background)) {
      return NextResponse.json(
        { error: '请上传人脸和背景图片' },
        { status: 400 }
      );
    }

    // 将源图片转换为base64
    const sourceBytes = await source.arrayBuffer();
    const sourceBuffer = Buffer.from(sourceBytes);
    const sourceBase64 = sourceBuffer.toString('base64');
    const sourceImageUrl = `data:${source.type};base64,${sourceBase64}`;

    let prompt = '';

    // 构建提示词
    if (mode === 'face') {
      const faceBytes = await face!.arrayBuffer();
      const faceBuffer = Buffer.from(faceBytes);
      const faceBase64 = faceBuffer.toString('base64');
      const faceImageUrl = `data:${face!.type};base64,${faceBase64}`;

      prompt = `Replace the model's face in the source image with the face from the reference image. Maintain the original pose, lighting, and expression. Create a natural and seamless face swap.`;

      // 使用两张图片（源图和人脸图）进行图生图
      const config = new Config();
      const client = new ImageGenerationClient(config);

      const response = await client.generate({
        prompt: prompt,
        image: [sourceImageUrl, faceImageUrl],
        size: '2K',
        watermark: false,
        responseFormat: 'url'
      });

      const helper = client.getResponseHelper(response);

      if (helper.success && helper.imageUrls.length > 0) {
        return NextResponse.json({
          success: true,
          imageUrl: helper.imageUrls[0]
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: helper.errorMessages.join(', ') || '换脸失败' 
          },
          { status: 500 }
        );
      }
    } 
    else if (mode === 'background') {
      const bgBytes = await background!.arrayBuffer();
      const bgBuffer = Buffer.from(bgBytes);
      const bgBase64 = bgBuffer.toString('base64');
      const bgImageUrl = `data:${background!.type};base64,${bgBase64}`;

      prompt = `Replace the background of the source image with the new background image while keeping the model and their pose exactly the same. Blend seamlessly with proper lighting and perspective.`;

      const config = new Config();
      const client = new ImageGenerationClient(config);

      const response = await client.generate({
        prompt: prompt,
        image: [sourceImageUrl, bgImageUrl],
        size: '2K',
        watermark: false,
        responseFormat: 'url'
      });

      const helper = client.getResponseHelper(response);

      if (helper.success && helper.imageUrls.length > 0) {
        return NextResponse.json({
          success: true,
          imageUrl: helper.imageUrls[0]
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: helper.errorMessages.join(', ') || '换背景失败' 
          },
          { status: 500 }
        );
      }
    } 
    else if (mode === 'both') {
      const faceBytes = await face!.arrayBuffer();
      const faceBuffer = Buffer.from(faceBytes);
      const faceBase64 = faceBuffer.toString('base64');
      const faceImageUrl = `data:${face!.type};base64,${faceBase64}`;

      const bgBytes = await background!.arrayBuffer();
      const bgBuffer = Buffer.from(bgBytes);
      const bgBase64 = bgBuffer.toString('base64');
      const bgImageUrl = `data:${background!.type};base64,${bgBase64}`;

      prompt = `Replace the model's face with the face from the reference image AND replace the background with the new background image. Keep the model's pose and body the same. Create a natural and seamless result with proper lighting and perspective.`;

      const config = new Config();
      const client = new ImageGenerationClient(config);

      const response = await client.generate({
        prompt: prompt,
        image: [sourceImageUrl, faceImageUrl, bgImageUrl],
        size: '2K',
        watermark: false,
        responseFormat: 'url'
      });

      const helper = client.getResponseHelper(response);

      if (helper.success && helper.imageUrls.length > 0) {
        return NextResponse.json({
          success: true,
          imageUrl: helper.imageUrls[0]
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: helper.errorMessages.join(', ') || '处理失败' 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: '无效的处理模式' },
      { status: 400 }
    );

  } catch (error) {
    console.error('处理失败:', error);
    return NextResponse.json(
      { success: false, error: '处理请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}
