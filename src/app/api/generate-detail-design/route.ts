import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const sellingPoints = formData.get('sellingPoints') as string;
    const size = formData.get('size') as string;
    const template = formData.get('template') as string;
    const style = formData.get('style') as string;
    const quality = parseInt(formData.get('quality') as string || '80');

    // 验证必填字段
    if (!image && !sellingPoints) {
      return NextResponse.json(
        { error: '请提供商品图片或卖点信息' },
        { status: 400 }
      );
    }

    // 解析尺寸
    const [width, height] = size.split('x').map(Number);

    // 创建图片URL（如果有上传图片）
    let imageUrl: string | undefined;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      imageUrl = `data:${image.type};base64,${base64}`;
    }

    // 根据模板类型构建提示词
    const templatePrompts: Record<string, string> = {
      showcase: `Professional e-commerce product showcase image. Display the product prominently with clean, minimalist composition. High quality, professional lighting, sharp focus on product details. E-commerce detail page design, ${width}x${height}px resolution.`,
      
      highlight: `E-commerce detail page highlighting product selling points. Use visual elements like arrows, badges, icons, or highlighted text boxes to emphasize key features. Modern design, professional layout, engaging visual hierarchy. ${width}x${height}px, high quality.`,
      
      scene: `E-commerce product lifestyle scene image. Show the product in real-life usage context to help customers imagine using it. Natural lighting, realistic environment, relatable scenario. Professional e-commerce photography style. ${width}x${height}px.`,
      
      feature: `Professional e-commerce product specifications and features display. Clean layout showing product parameters, technical details, and features in an organized, readable format. Infographic style, modern design, clear typography. ${width}x${height}px resolution.`,
      
      quality: `E-commerce quality assurance and certification display. Highlight quality badges, certification marks, and trust indicators. Premium design, trustworthy appearance, professional layout. High quality, detailed. ${width}x${height}px.`,
      
      promotion: `E-commerce promotional marketing image. Eye-catching design with promotional elements, discount badges, and call-to-action. Vibrant colors, energetic composition, marketing-focused layout. Professional commercial design. ${width}x${height}px.`
    };

    // 根据风格调整提示词
    const stylePrompts: Record<string, string> = {
      minimalist: 'Minimalist design, clean and simple, lots of white space, focus on essential elements, modern and elegant.',
      premium: 'Premium luxury style, rich textures, gold or silver accents, sophisticated color palette, high-end feel, luxurious and exclusive.',
      vibrant: 'Vibrant and energetic style, bold colors, dynamic composition, youthful and trendy, eye-catching and exciting.',
      professional: 'Professional corporate style, neutral colors, clean layout, trustworthy and reliable, business-appropriate, serious and authoritative.'
    };

    const basePrompt = templatePrompts[template] || templatePrompts.showcase;
    const stylePrompt = stylePrompts[style] || stylePrompts.minimalist;

    // 解析卖点，按行分割并提取有效卖点
    let parsedPoints: string[] = [];
    if (sellingPoints) {
      const lines = sellingPoints.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // 提取卖点内容（去除数字编号和点号）
      parsedPoints = lines
        .map(line => {
          // 匹配开头的数字编号（如 "1. "、"1、"等）
          const match = line.match(/^\d+[\.\、]\s*(.+)/);
          if (match) {
            return match[1].trim();
          }
          return line;
        })
        .filter(point => point.length > 2); // 过滤太短的内容
    }

    // 将卖点分组，每组最多3个卖点
    const pointGroups: string[][] = [];
    for (let i = 0; i < parsedPoints.length; i += 3) {
      pointGroups.push(parsedPoints.slice(i, i + 3));
    }

    // 如果没有卖点，生成一张空白的详情图
    if (pointGroups.length === 0) {
      pointGroups.push([]);
    }

    // 创建生图客户端
    const config = new Config();
    const client = new ImageGenerationClient(config);
    const generatedImages: string[] = [];

    // 为每组卖点生成一张详情图
    for (let groupIndex = 0; groupIndex < pointGroups.length; groupIndex++) {
      const group = pointGroups[groupIndex];

      // 构建当前组的卖点文本
      const groupPoints = group.join('; ');
      
      // 构建完整提示词
      let fullPrompt = `Create a professional e-commerce product detail page design. ${basePrompt} ${stylePrompt}`;
      
      // 添加卖点信息（最多3个）
      if (groupPoints) {
        fullPrompt += ` Product features to highlight (maximum 3 points): ${groupPoints}. `;
      }
      
      // 添加质量提示
      if (quality >= 90) {
        fullPrompt += 'Ultra high quality, photorealistic, 4K resolution, perfect details.';
      } else if (quality >= 80) {
        fullPrompt += 'High quality, professional photography, excellent details.';
      } else {
        fullPrompt += 'Good quality, clear and sharp.';
      }

      fullPrompt += ` E-commerce standard, optimized for online shopping experience.`;

      // 使用图生图或文生图
      const response = await client.generate({
        prompt: fullPrompt,
        image: imageUrl,
        size: '2K',
        watermark: false,
        responseFormat: 'url'
      });

      const helper = client.getResponseHelper(response);

      if (helper.success && helper.imageUrls.length > 0) {
        generatedImages.push(...helper.imageUrls);
      } else {
        console.error(`生成第 ${groupIndex + 1} 张详情图失败:`, helper.errorMessages);
      }
    }

    // 返回所有生成的详情图
    if (generatedImages.length > 0) {
      return NextResponse.json({
        success: true,
        images: generatedImages,
        totalImages: generatedImages.length,
        pointGroups: pointGroups.length,
        pointsPerGroup: Math.min(3, parsedPoints.length)
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: '详情图生成失败，请稍后重试' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('生成详情图失败:', error);
    return NextResponse.json(
      { success: false, error: '处理请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}
