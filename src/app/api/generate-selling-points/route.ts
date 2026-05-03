import { NextRequest, NextResponse } from 'next/server';

// 方舟API配置
const VOLC_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

function getApiKey(): string | null {
  return process.env.VOLC_API_KEY || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, category, description } = body;

    // 验证必填字段
    if (!productName) {
      return NextResponse.json(
        { error: '商品名称不能为空' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      // 如果没有API Key，返回默认卖点模板
      const defaultPoints = [
        '精选优质原料，品质保障',
        '精湛工艺制作，经久耐用',
        '时尚外观设计，彰显品味',
        '细节精益求精，匠心之作',
        '环保材料，健康安全',
        '多重检验，品质放心',
        '专业售后，服务无忧',
        '性价比高，值得拥有'
      ];
      
      return NextResponse.json({ 
        success: true, 
        points: defaultPoints.slice(0, 6),
        message: '使用默认卖点（请配置VOLC_API_KEY获取AI生成）'
      });
    }

    // 构建提示
    const systemPrompt = `你是一位专业的电商营销专家，擅长挖掘和提炼商品的核心卖点。
请根据商品信息，生成6-8个具有吸引力和说服力的卖点。
要求：
1. 每个卖点简洁有力，突出优势（15-25字左右）
2. 聚焦用户痛点和需求
3. 使用具体、可感知的描述
4. 每个卖点独立成行
5. 使用数字编号（1. 2. 3. ...）
6. 语言简洁，适合电商详情页展示
7. 确保卖点涵盖产品功能、品质、服务等多个维度`;

    let userPrompt = `请为以下商品生成卖点：\n\n商品名称：${productName}\n`;
    
    if (category) {
      userPrompt += `商品类别：${category}\n`;
    }
    
    if (description) {
      userPrompt += `商品描述：${description}\n`;
    }

    userPrompt += `\n请生成6-8个卖点，每个卖点独立成行，用数字编号。直接输出卖点内容，不要包含其他说明。`;

    // 调用方舟API
    const response = await fetch(VOLC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-pro-250123',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('方舟API错误:', response.status, errorData);
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 解析卖点
    const points = content
      .split('\n')
      .map((line: string) => line.replace(/^\d+[.、:：]\s*/, '').trim())
      .filter((line: string) => line.length > 5 && line.length < 50);

    return NextResponse.json({ 
      success: true, 
      points: points.slice(0, 8) 
    });

  } catch (error: any) {
    console.error('生成卖点失败:', error);
    
    // 出错时返回默认卖点
    const defaultPoints = [
      '精选优质原料，品质保障',
      '精湛工艺制作，经久耐用',
      '时尚外观设计，彰显品味',
      '细节精益求精，匠心之作',
      '环保材料，健康安全',
      '多重检验，品质放心'
    ];
    
    return NextResponse.json({ 
      success: true, 
      points: defaultPoints,
      message: '使用默认卖点'
    });
  }
}
