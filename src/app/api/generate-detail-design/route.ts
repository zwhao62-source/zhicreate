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
    
    // 新增专业设计参数
    const category = formData.get('category') as string || 'fashion';
    const colorScheme = formData.get('colorScheme') as string || 'elegant';
    const layout = formData.get('layout') as string || 'center';
    const font = formData.get('font') as string || 'modern';

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

    // 配色方案详细配置
    const colorSchemes: Record<string, { primary: string; secondary: string; accent: string; mood: string }> = {
      elegant: { primary: '莫兰迪灰棕色', secondary: '米白色', accent: '深棕色', mood: '低调优雅的高级感' },
      luxury: { primary: '香槟金色', secondary: '象牙白', accent: '深棕色', mood: '奢华典雅的贵族气质' },
      fresh: { primary: '清新绿色', secondary: '淡米色', accent: '深绿色', mood: '自然清新的活力感' },
      warm: { primary: '温暖焦糖色', secondary: '奶油白', accent: '深棕色', mood: '温馨甜蜜的食欲感' },
      tech: { primary: '科技深蓝色', secondary: '银灰色', accent: '亮蓝色', mood: '专业信赖的科技感' },
      romantic: { primary: '玫瑰粉色', secondary: '淡粉色', accent: '深玫瑰色', mood: '浪漫温柔的精致感' },
      minimal: { primary: '纯黑色', secondary: '纯白色', accent: '中灰色', mood: '极简主义的纯粹感' },
      vintage: { primary: '复古棕褐色', secondary: '米黄色', accent: '古铜色', mood: '复古文艺的怀旧感' },
      // 新增配色方案
      pastel: { primary: '马卡龙粉蓝', secondary: '淡紫色', accent: '薄荷绿', mood: '少女心的甜蜜感' },
      earth: { primary: '大地棕绿色', secondary: '沙色', accent: '深橄榄色', mood: '自然原始的质朴感' },
      ocean: { primary: '深海蓝色', secondary: '浅蓝灰色', accent: '珊瑚色', mood: '清凉舒爽的海洋感' },
      forest: { primary: '森林深绿色', secondary: '苔藓绿', accent: '暖棕色', mood: '原始森林的生机感' },
      sunset: { primary: '日落橙红色', secondary: '淡紫色', accent: '金黄色', mood: '温暖浪漫的黄昏感' },
      neon: { primary: '霓虹紫粉色', secondary: '深紫色', accent: '荧光绿', mood: '赛博朋克的潮流感' },
      nordic: { primary: '北欧灰白色', secondary: '浅木色', accent: '脏粉色', mood: '简约清冷的北欧感' },
      chinese: { primary: '中国红色', secondary: '金色', accent: '墨黑色', mood: '喜庆大气的中国风' },
    };

    // 版式布局描述
    const layouts: Record<string, string> = {
      center: '居中对称构图，产品居中展示，大气稳重',
      left: '左对齐现代布局，信息层次分明，现代简约',
      magazine: '杂志拼贴风格，创意错落排版，时尚前卫',
      split: '左右分栏设计，左图右文或上图下文，信息清晰',
      overlap: '图文叠加层次，前景产品与背景交融，立体丰富'
    };

    // 字体风格描述
    const fonts: Record<string, string> = {
      modern: '现代无衬线字体，简洁有力，几何感强',
      elegant: '优雅衬线字体，曲线柔美，品质感强',
      playful: '活泼手写字体，亲切友好，轻松自然',
      bold: '粗壮黑体字，冲击力强，视觉震撼'
    };

    // 行业特性描述
    const categoryStyles: Record<string, string> = {
      fashion: '服装品类风格，注重搭配美感，展示时尚潮流',
      beauty: '美妆护肤风格，突出产品功效，展现精致品质',
      digital: '数码科技风格，强调产品性能，体现科技感',
      food: '食品生鲜风格，激发食欲诱惑，展示新鲜美味',
      home: '家居百货风格，营造温馨氛围，突出生活品质',
      baby: '母婴儿童风格，传递安全温馨，体现亲和力',
      sports: '运动户外风格，展现活力动感，体现健康能量',
      jewelry: '珠宝配饰风格，彰显奢华尊贵，突出品质价值'
    };

    // 根据模板类型构建提示词
    const templatePrompts: Record<string, string> = {
      showcase: '专业电商产品展示图。产品占据视觉中心，背景简洁高级。',
      highlight: '电商详情页卖点展示。使用视觉元素突出关键特性，现代设计。',
      scene: '电商产品使用场景图。产品融入真实生活场景，引发共鸣。',
      feature: '产品参数特性展示图。清晰展示产品规格参数，信息图表风格。',
      quality: '品质保证认证展示。突出质量认证和信任标识。',
      promotion: '促销营销推广图。醒目的促销元素，吸引眼球的视觉设计。'
    };

    // 根据风格调整提示词
    const stylePrompts: Record<string, string> = {
      minimalist: '极简设计风格，大量留白，聚焦核心元素，现代优雅。',
      premium: '高端奢华风格，精致质感，金色银色点缀，高级感。',
      vibrant: '活力四射风格，鲜艳色彩，动态构图，年轻时尚。',
      professional: '专业商务风格，中性色调，干净布局，可靠权威。'
    };

    const currentColor = colorSchemes[colorScheme] || colorSchemes.elegant;
    const currentLayout = layouts[layout] || layouts.center;
    const currentFont = fonts[font] || fonts.modern;
    const currentCategory = categoryStyles[category] || categoryStyles.fashion;

    // 构建完整提示词
    let fullPrompt = `Create a professional e-commerce product detail page design for ${category} category. `;
    
    // 添加配色要求
    fullPrompt += `Color scheme: Primary color ${currentColor.primary}, Secondary ${currentColor.secondary}, Accent ${currentColor.accent}. ${currentColor.mood}. `;
    
    // 添加版式要求
    fullPrompt += `Layout style: ${currentLayout}. `;
    
    // 添加字体要求
    fullPrompt += `Typography: ${currentFont}. Use clean, professional text without size labels. `;
    
    // 添加模板要求
    fullPrompt += templatePrompts[template] || templatePrompts.showcase + ' ';
    
    // 添加风格要求
    fullPrompt += stylePrompts[style] || stylePrompts.minimalist + ' ';
    
    // 行业特性
    fullPrompt += currentCategory + '. ';
    
    // 关键：不要添加尺寸标注文字
    fullPrompt += `IMPORTANT: Do NOT add any text showing dimensions, size labels, or resolution text (like "750x800px" or any size numbers) on the image. The design should be clean without size annotations. `;
    
    // 添加质量要求
    if (quality >= 90) {
      fullPrompt += 'Ultra high quality, photorealistic, 4K resolution, perfect details, studio quality.';
    } else if (quality >= 80) {
      fullPrompt += 'High quality, professional photography, excellent details.';
    } else {
      fullPrompt += 'Good quality, clear and sharp.';
    }

    fullPrompt += ` Clean e-commerce design, optimized for online shopping experience, no watermarks, no size labels.`;

    // 解析卖点，按行分割并提取有效卖点
    let parsedPoints: string[] = [];
    if (sellingPoints) {
      const lines = sellingPoints.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // 提取卖点内容（去除数字编号和点号）
      parsedPoints = lines
        .map(line => {
          const match = line.match(/^\d+[\.\、]\s*(.+)/);
          if (match) {
            return match[1].trim();
          }
          return line;
        })
        .filter(point => point.length > 2);
    }

    // 将卖点分组，每组最多3个卖点
    const pointGroups: string[][] = [];
    for (let i = 0; i < parsedPoints.length; i += 3) {
      pointGroups.push(parsedPoints.slice(i, i + 3));
    }

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
      const groupPoints = group.join('; ');
      
      // 如果有卖点，添加到提示词
      let finalPrompt = fullPrompt;
      if (groupPoints) {
        finalPrompt += ` Product features to highlight: ${groupPoints}.`;
      }

      // 使用图生图或文生图
      const response = await client.generate({
        prompt: finalPrompt,
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

    if (generatedImages.length > 0) {
      return NextResponse.json({
        success: true,
        images: generatedImages,
        totalImages: generatedImages.length,
        pointGroups: pointGroups.length,
        pointsPerGroup: Math.min(3, parsedPoints.length),
        designConfig: {
          category,
          colorScheme,
          layout,
          font,
          style
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: '生成失败，请稍后重试',
          pointGroups: pointGroups.length
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('生成详情图失败:', error);
    return NextResponse.json(
      { error: '生成详情图时发生错误' },
      { status: 500 }
    );
  }
}
