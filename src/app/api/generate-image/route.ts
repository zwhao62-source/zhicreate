import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const style = formData.get('style') as string;
    const scene = formData.get('scene') as string;
    const size = formData.get('size') as string || '800x800';

    // 验证必填字段
    if (!image && !prompt) {
      return NextResponse.json(
        { error: '请提供商品图片或描述提示' },
        { status: 400 }
      );
    }

    // 创建图片URL（如果有上传图片）
    let imageUrl: string | undefined;
    if (image) {
      // 将图片转换为base64
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      imageUrl = `data:${image.type};base64,${base64}`;
    }

    // 根据风格和场景构建提示词
    const stylePrompts: Record<string, string> = {
      realistic: 'professional photography, realistic lighting, high quality, 4K resolution',
      fashion: 'fashion magazine style, trendy, chic, vogue photography',
      minimalist: 'minimalist style, clean background, simple composition',
      lifestyle: 'lifestyle photography, natural lighting, candid feel'
    };

    const scenePrompts: Record<string, string> = {
      studio: 'in a professional photography studio, studio lighting, clean background',
      outdoor: 'outdoor setting, natural light, beautiful scenery',
      indoor: 'indoor setting, modern interior, well-lit space',
      cafe: 'in a cozy cafe, warm lighting, coffee shop atmosphere',
      street: 'street photography, urban environment, city backdrop',
      beach: 'beach setting, ocean view, sunny day, natural light'
    };

    let fullPrompt = '';
    
    if (imageUrl) {
      // 如果有图片，进行图生图
      fullPrompt = `Transform this product image into a professional model showcase. Product main image size: ${size}. `;
      fullPrompt += `${stylePrompts[style] || stylePrompts.realistic}. `;
      fullPrompt += `${scenePrompts[scene] || scenePrompts.studio}. `;
      
      if (prompt) {
        fullPrompt += `Additional instructions: ${prompt}`;
      }
    } else {
      // 纯文生图
      fullPrompt = `Professional e-commerce product photography showing a model wearing the product. Product main image size: ${size}. `;
      fullPrompt += `${stylePrompts[style] || stylePrompts.realistic}. `;
      fullPrompt += `${scenePrompts[scene] || scenePrompts.studio}. `;
      
      if (prompt) {
        fullPrompt += `${prompt}`;
      }
    }

    // 创建生图客户端
    const config = new Config();
    const client = new ImageGenerationClient(config);

    const response = await client.generate({
      prompt: fullPrompt,
      size: '2K',
      watermark: false,
      image: imageUrl,
      responseFormat: 'url'
    });

    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls.length > 0) {
      return NextResponse.json({
        success: true,
        images: helper.imageUrls
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: helper.errorMessages.join(', ') || '图片生成失败' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('生成图片失败:', error);
    return NextResponse.json(
      { success: false, error: '处理请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}
