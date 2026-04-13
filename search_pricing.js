const { LLMClient, Config } = require('coze-coding-dev-sdk');

async function searchPricing() {
  const config = new Config();
  const client = new LLMClient(config);
  
  const prompt = `请搜索并总结以下AI电商设计平台的会员定价：
1. 剪映
2. 腾讯智影
3. 创客贴
4. 稿定设计
5. 万兴播爆
6. Synthesia中国版

请列出每个平台的主要会员等级和价格（人民币/月），以及他们的主要功能特点。`;

  const messages = [{ role: 'user', content: prompt }];
  
  try {
    // 使用带搜索能力的模型
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-lite-251015',
      temperature: 0.3
    });
    console.log(response.content);
  } catch (error) {
    console.error('搜索失败:', error);
  }
}

searchPricing();
