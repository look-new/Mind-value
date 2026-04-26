import type { AIAnalysisResult } from '../types';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

export const analyzeContent = async (title: string, content: string, type: string): Promise<AIAnalysisResult> => {
  // 如果没有配置 API Key，给出一个本地兜底，避免直接报错
  if (!DEEPSEEK_API_KEY) {
    console.warn('未配置 VITE_DEEPSEEK_API_KEY，使用本地默认摘要。');
    return {
      summary: `（本地默认摘要）"${title}"，类型：${type}。建议在项目根目录 .env.local 中配置 VITE_DEEPSEEK_API_KEY 来启用 DeepSeek。`,
      suggestedTags: ['未接入AI', '本地摘要', title || '未分类']
    };
  }

  const prompt = [
    '你是一个帮我整理「个人知识库」的助手。',
    '请阅读我提供的内容，输出：',
    '1）用中文写一个 2–4 句的精炼摘要 summary；',
    '2）给出 3–6 个适合做检索的标签 tags（不要解释）。',
    '',
    '请严格按照下面 JSON 格式返回（不要多余文字）：',
    '{',
    '  "summary": "这里是摘要...",',
    '  "tags": ["标签1", "标签2", "标签3"]',
    '}',
    '',
    `标题: ${title || '无标题'}`,
    `类型: ${type}`,
    `内容: ${content || '（用户未提供正文，只给了标题和简单描述）'}`
  ].join('\n');

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek API error status:', response.status, await response.text());
      throw new Error('DeepSeek API 请求失败');
    }

    const data: any = await response.json();
    const rawContent: string | undefined = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('DeepSeek 返回内容为空');
    }

    // 期望模型按照 JSON 返回，这里尝试解析
    let parsed: { summary?: string; tags?: string[] } = {};
    try {
      // 去掉可能包裹的 ```json ``` 代码块标记
      const cleaned = rawContent
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.warn('解析 DeepSeek JSON 失败，使用原始文本作为摘要。', e);
      parsed.summary = rawContent.trim();
      parsed.tags = [];
    }

    const summary = parsed.summary || rawContent.trim();
    const tags = Array.isArray(parsed.tags) ? parsed.tags : [];

    return {
      summary,
      suggestedTags: tags.length ? tags : ['DeepSeek', type, title || '未分类'],
    };
  } catch (error) {
    console.error('调用 DeepSeek 出错：', error);
    // 出错兜底，避免阻塞你添加内容
    return {
      summary: `（调用 DeepSeek 失败）"${title}" 的智能摘要生成出错，请稍后重试。`,
      suggestedTags: ['AI错误', 'DeepSeek', title || '未分类'],
    };
  }
};
