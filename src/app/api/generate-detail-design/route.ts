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
    
    // 专业设计参数
    const category = formData.get('category') as string || 'fashion';
    const colorScheme = formData.get('colorScheme') as string || 'elegant';
    const layout = formData.get('layout') as string || 'center';
    const font = formData.get('font') as string || 'modern';

    // 字体层级参数
    const headlineSize = formData.get('headlineSize') as string || 'large';
    const headlineWeight = formData.get('headlineWeight') as string || 'bold';
    const headlineAlign = formData.get('headlineAlign') as string || 'center';
    const subheadlineSize = formData.get('subheadlineSize') as string || 'medium';
    const subheadlineWeight = formData.get('subheadlineWeight') as string || 'medium';
    const subheadlineAlign = formData.get('subheadlineAlign') as string || 'center';
    const bodySize = formData.get('bodySize') as string || 'small';
    const bodyWeight = formData.get('bodyWeight') as string || 'light';
    const bodyAlign = formData.get('bodyAlign') as string || 'left';

    // 验证必填字段
    if (!image && !sellingPoints) {
      return NextResponse.json(
        { error: '请提供商品图片或卖点信息' },
        { status: 400 }
      );
    }

    // 解析尺寸
    const [width, height] = size.split('x').map(Number);

    // 创建图片URL
    let imageUrl: string | undefined;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      imageUrl = `data:${image.type};base64,${base64}`;
    }

    // 配色方案配置
    const colorSchemes: Record<string, { primary: string; secondary: string; accent: string; mood: string }> = {
      elegant: { primary: '莫兰迪灰棕', secondary: '米白', accent: '深棕', mood: '低调优雅的高级感' },
      luxury: { primary: '香槟金', secondary: '象牙白', accent: '深棕', mood: '奢华典雅的贵族气质' },
      fresh: { primary: '清新绿', secondary: '淡米色', accent: '深绿', mood: '自然清新的活力感' },
      warm: { primary: '焦糖色', secondary: '奶油白', accent: '深棕', mood: '温馨甜蜜的食欲感' },
      tech: { primary: '深蓝', secondary: '银灰', accent: '亮蓝', mood: '专业信赖的科技感' },
      romantic: { primary: '玫瑰粉', secondary: '淡粉', accent: '深玫瑰', mood: '浪漫温柔的精致感' },
      minimal: { primary: '纯黑', secondary: '纯白', accent: '中灰', mood: '极简主义的纯粹感' },
      vintage: { primary: '复古棕褐', secondary: '米黄', accent: '古铜', mood: '复古文艺的怀旧感' },
      pastel: { primary: '马卡龙粉蓝', secondary: '淡紫', accent: '薄荷绿', mood: '少女心的甜蜜感' },
      earth: { primary: '大地棕绿', secondary: '沙色', accent: '深橄榄', mood: '自然原始的质朴感' },
      ocean: { primary: '深海蓝', secondary: '浅蓝灰', accent: '珊瑚色', mood: '清凉舒爽的海洋感' },
      forest: { primary: '森林深绿', secondary: '苔藓绿', accent: '暖棕', mood: '原始森林的生机感' },
      sunset: { primary: '日落橙红', secondary: '淡紫', accent: '金黄', mood: '温暖浪漫的黄昏感' },
      neon: { primary: '霓虹紫粉', secondary: '深紫', accent: '荧光绿', mood: '赛博朋克的潮流感' },
      nordic: { primary: '北欧灰白', secondary: '浅木色', accent: '脏粉', mood: '简约清冷的北欧感' },
      chinese: { primary: '中国红', secondary: '金色', accent: '墨黑', mood: '喜庆大气的中国风' },
      japanese: { primary: '日式素色', secondary: '深灰', accent: '朱红', mood: '素雅禅意的和风感' },
      korean: { primary: '奶油白', secondary: '杏色', accent: '浅棕', mood: '温柔清新的韩式感' },
      tropical: { primary: '热带橙绿', secondary: '海蓝', accent: '金黄', mood: '热情活力的热带感' },
      cyber: { primary: '赛博深紫', secondary: '电光紫', accent: '霓虹蓝', mood: '未来科技感' },
    };

    // 版式布局描述
    const layouts: Record<string, string> = {
      center: '居中对称构图，产品居中展示，大气稳重，视觉焦点集中',
      left: '左对齐现代布局，信息层次分明，现代简约，留白舒适',
      magazine: '杂志拼贴风格，创意错落排版，时尚前卫，大字号标题',
      split: '左右分栏设计，图文并茂，信息清晰，便于阅读',
      overlap: '图文叠加层次，前景产品与背景交融，立体丰富，氛围感强'
    };

    // 字体风格描述
    const fonts: Record<string, string> = {
      modern: '现代无衬线字体（如Helvetica/思源黑体），几何感强，简洁有力',
      elegant: '优雅衬线字体（如Times/思源宋体），曲线柔美，品质感强',
      playful: '活泼手写字体，亲切友好，轻松自然，适合年轻群体',
      bold: '粗壮黑体字，冲击力强，视觉震撼，适合促销场景'
    };

    // 行业特性
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

    // 字体层级配置
    const headlineSizes: Record<string, string> = {
      large: '超大字号标题（48-72px），醒目震撼，一眼吸引注意力',
      medium: '中大字号标题（32-48px），清晰有力，突出重点',
      small: '适中字号标题（24-32px），精致内敛，低调优雅'
    };

    const headlineWeights: Record<string, string> = {
      bold: '粗体字重，强调重量感，视觉冲击力强',
      medium: '中等字重，平衡稳重，易读且有力度',
      light: '细体字重，轻盈优雅，高级感十足'
    };

    const headlineAligns: Record<string, string> = {
      center: '居中对齐，大气稳重，适合焦点展示',
      left: '左对齐，现代简洁，符合阅读习惯',
      right: '右对齐，个性独特，适合特殊排版'
    };

    const subheadlineSizes: Record<string, string> = {
      large: '大号副标题（28-36px），辅助主标题，补充关键信息',
      medium: '中号副标题（20-28px），清晰说明产品特色',
      small: '小号副标题（16-20px），精致低调，辅助阅读'
    };

    const bodySizes: Record<string, string> = {
      large: '大号正文（16-20px），详细说明，易于阅读',
      medium: '中号正文（14-16px），标准大小，舒适阅读',
      small: '小号正文（12-14px），信息密度高，详尽展示'
    };

    const currentColor = colorSchemes[colorScheme] || colorSchemes.elegant;
    const currentLayout = layouts[layout] || layouts.center;
    const currentFont = fonts[font] || fonts.modern;
    const currentCategory = categoryStyles[category] || categoryStyles.fashion;

    // 构建字体层级描述
    const typographyDesc = `
Typography Hierarchy:
- Headline (主标题): ${headlineSizes[headlineSize]}. ${headlineWeights[headlineWeight]}. ${headlineAligns[headlineAlign]} alignment.
- Subheadline (副标题): ${subheadlineSizes[subheadlineSize]}. Clear product description supporting the headline.
- Body text (详情说明): ${bodySizes[bodySize]}. ${bodyWeight === 'light' ? '细体轻量，易读舒适' : bodyWeight === 'medium' ? '中等字重，平衡清晰' : '粗体有力，重点强调'}. ${bodyAlign === 'left' ? '左对齐，标准阅读' : bodyAlign === 'center' ? '居中对齐，优雅排列' : '右对齐，个性排版'} format.
- Clear visual hierarchy: Headline > Subheadline > Body. Each level should be visually distinct.
    `.trim();

    // 根据模板类型构建提示词
    const templatePrompts: Record<string, string> = {
      showcase: '专业电商产品展示图。产品占据视觉中心，背景简洁高级，文字排版层次分明。',
      highlight: '电商详情页卖点展示。使用视觉元素突出关键特性，文字与图标结合，现代设计。',
      scene: '电商产品使用场景图。产品融入真实生活场景，引发共鸣，文字说明自然融入。',
      feature: '产品参数特性展示图。清晰展示产品规格参数，信息图表风格，层次分明。',
      quality: '品质保证认证展示。突出质量认证和信任标识，文字专业可信。',
      promotion: '促销营销推广图。醒目的促销元素，吸引眼球的视觉设计，文字冲击力强。'
    };

    // 风格描述
    const stylePrompts: Record<string, string> = {
      minimalist: '极简设计风格，大量留白，聚焦核心元素，现代优雅。',
      premium: '高端奢华风格，精致质感，金色银色点缀，高级感。',
      vibrant: '活力四射风格，鲜艳色彩，动态构图，年轻时尚。',
      professional: '专业商务风格，中性色调，干净布局，可靠权威。'
    };

    // 构建完整提示词
    let fullPrompt = `Create a professional e-commerce product detail page design for ${currentCategory}. `;
    
    // 配色要求
    fullPrompt += `Color scheme: Primary ${currentColor.primary}, Secondary ${currentColor.secondary}, Accent ${currentColor.accent}. ${currentColor.mood}. `;
    
    // 布局要求
    fullPrompt += `Layout: ${currentLayout}. `;
    
    // 字体风格
    fullPrompt += `Font style: ${currentFont}. `;
    
    // 字体层级（关键）
    fullPrompt += typographyDesc + ' ';
    
    // 模板要求
    fullPrompt += templatePrompts[template] || templatePrompts.showcase + ' ';
    
    // 风格要求
    fullPrompt += stylePrompts[style] || stylePrompts.minimalist + ' ';
    
    // 重要：不要添加尺寸标注
    fullPrompt += `IMPORTANT: Do NOT add any text showing dimensions, size labels, resolution text (like "750x800px" or "px"), or any measurement annotations on the image. Design should be clean and professional without size labels. `;
    
    // 质量要求
    if (quality >= 90) {
      fullPrompt += 'Ultra high quality, photorealistic, 4K resolution, perfect details, studio quality.';
    } else if (quality >= 80) {
      fullPrompt += 'High quality, professional photography, excellent details.';
    } else {
      fullPrompt += 'Good quality, clear and sharp.';
    }

    fullPrompt += ' Clean e-commerce design, no watermarks, no size labels.';

    // 解析卖点
    let parsedPoints: string[] = [];
    if (sellingPoints) {
      const lines = sellingPoints.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      parsedPoints = lines
        .map(line => {
          const match = line.match(/^\d+[\.\、]\s*(.+)/);
          return match ? match[1].trim() : line;
        })
        .filter(point => point.length > 2);
    }

    // 卖点分组
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

    // 生成图片
    for (let groupIndex = 0; groupIndex < pointGroups.length; groupIndex++) {
      const group = pointGroups[groupIndex];
      let finalPrompt = fullPrompt;
      
      if (group.length > 0) {
        finalPrompt += ` Product features: ${group.join('; ')}.`;
      }

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
          typography: {
            headline: { size: headlineSize, weight: headlineWeight, align: headlineAlign },
            subheadline: { size: subheadlineSize, weight: subheadlineWeight, align: subheadlineAlign },
            body: { size: bodySize, weight: bodyWeight, align: bodyAlign }
          }
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: '生成失败，请稍后重试', pointGroups: pointGroups.length },
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
