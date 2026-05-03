import { NextRequest, NextResponse } from 'next/server';

// 方舟API配置
const VOLC_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

function getApiKey(): string | null {
  return process.env.VOLC_API_KEY || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      productName, 
      sellingPoints, 
      style, 
      colorScheme,
      productImage,
      brandName,
      typography
    } = body;

    if (!productName) {
      return NextResponse.json(
        { error: '商品名称不能为空' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();
    
    // 处理卖点数据
    let pointsArray: string[] = [];
    if (sellingPoints) {
      if (typeof sellingPoints === 'string') {
        pointsArray = sellingPoints.split('|').filter(p => p.trim());
      } else if (Array.isArray(sellingPoints)) {
        pointsArray = sellingPoints.filter(p => p && typeof p === 'string');
      }
    }
    
    // 如果没有API Key或卖点为空，使用默认内容
    if (!apiKey || pointsArray.length === 0) {
      const defaultPoints = pointsArray.length > 0 ? pointsArray : [
        '精选优质原料',
        '精湛工艺制作',
        '时尚外观设计',
        '品质保障'
      ];

      return NextResponse.json({
        success: true,
        designData: {
          productName: productName || '商品名称',
          sellingPoints: defaultPoints,
          style: style || 'modern',
          colorScheme: colorScheme || '#FF6B35',
          brandName: brandName || '',
          typography: typography || {
            mainTitle: { fontSize: 48, fontWeight: 700, color: '#1A1A1A' },
            subTitle: { fontSize: 24, fontWeight: 500, color: '#666666' },
            detail: { fontSize: 16, fontWeight: 400, color: '#999999' }
          },
          productImage: productImage || null,
          layouts: generateDefaultLayouts(style || 'modern', defaultPoints)
        },
        message: '使用默认设计数据（请配置VOLC_API_KEY获取AI优化）'
      });
    }

    // 使用AI优化设计
    const systemPrompt = `你是一位专业的电商详情页设计专家，擅长设计吸引人的商品详情图。
请根据提供的信息，设计详情图的布局和内容安排。`;

    const userPrompt = `请为以下商品设计详情图内容：

商品名称：${productName}
品牌：${brandName || '未指定'}
卖点：${pointsArray.join('、')}
风格：${style || '现代简约'}
主色调：${colorScheme || '#FF6B35'}

请生成JSON格式的设计方案，包含：
1. 布局安排（每张图的卖点分布）
2. 字体层级建议
3. 排版建议
直接输出JSON，不要其他内容。`;

    const response = await fetch(VOLC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'doubao-seed-1-5-25-0325',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    const aiDesign = data.choices?.[0]?.message?.content || '';

    // 解析AI设计
    let layouts = [];
    try {
      const jsonMatch = aiDesign.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        layouts = parsed.layouts || generateDefaultLayouts(style, sellingPoints);
      } else {
        layouts = generateDefaultLayouts(style, sellingPoints);
      }
    } catch (e) {
      layouts = generateDefaultLayouts(style, sellingPoints);
    }

    return NextResponse.json({
      success: true,
      designData: {
        productName,
        sellingPoints,
        style: style || 'modern',
        colorScheme: colorScheme || '#FF6B35',
        brandName: brandName || '',
        typography: typography || {
          mainTitle: { fontSize: 48, fontWeight: 700, color: '#1A1A1A' },
          subTitle: { fontSize: 24, fontWeight: 500, color: '#666666' },
          detail: { fontSize: 16, fontWeight: 400, color: '#999999' }
        },
        productImage: productImage || null,
        layouts
      },
      aiSuggestions: aiDesign.substring(0, 500)
    });

  } catch (error: any) {
    console.error('设计详情图失败:', error);
    return NextResponse.json(
      { error: error.message || '设计失败，请稍后重试' },
      { status: 500 }
    );
  }
}

function generateDefaultLayouts(style: string, points: string[]) {
  const layouts = [];
  const pointsPerImage = 3;
  
  for (let i = 0; i < points.length; i += pointsPerImage) {
    layouts.push({
      id: `layout-${i / pointsPerImage + 1}`,
      points: points.slice(i, i + pointsPerImage),
      style: style || 'modern'
    });
  }
  
  return layouts;
}
