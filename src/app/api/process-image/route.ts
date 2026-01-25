import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const func = formData.get('function') as string;
    const intensity = parseInt(formData.get('intensity') as string || '50');

    // 验证必填字段
    if (!image) {
      return NextResponse.json(
        { error: '请上传图片' },
        { status: 400 }
      );
    }

    // 将图片转换为base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const imageUrl = `data:${image.type};base64,${base64}`;

    // 根据功能类型构建提示词
    const functionPrompts: Record<string, string> = {
      beautify: `Enhance and beautify this photo while maintaining natural appearance. Improve skin texture, adjust lighting and colors to create a more polished and professional look. Beauty level: ${intensity}%`,
      
      watermark: `Remove all watermarks from this image seamlessly while preserving the underlying image quality and details. Clean up any text or logos that appear to be watermarks.`,
      
      enhance: `Enhance the image quality and resolution. Improve sharpness, clarity, and overall visual quality. Upscale and restore details for a more professional and high-definition look.`,
      
      handfeet: `Fix and improve the hands and feet in this image. Correct any unnatural positions, improve proportions, and ensure the hands and feet look natural and well-formed.`,
      
      remove: `Identify and remove unwanted elements or objects from this image. Fill the removed areas with appropriate background that matches the surrounding context seamlessly.`,
      
      outfit: `Transform the outfit in this image. Change the clothing style to something different while keeping the model's pose and facial expression the same. Create a new fashionable look.`
    };

    const basePrompt = functionPrompts[func] || functionPrompts.beautify;

    // 创建生图客户端
    const config = new Config();
    const client = new ImageGenerationClient(config);

    // 使用图生图功能
    const response = await client.generate({
      prompt: basePrompt,
      image: imageUrl,
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
          error: helper.errorMessages.join(', ') || '图片处理失败' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('图片处理失败:', error);
    return NextResponse.json(
      { success: false, error: '处理请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}
