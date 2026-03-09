/**
 * DeepSeek AI 分析服务
 * 
 * API Key 配置方式（任选其一）：
 * 1. 在浏览器控制台设置: localStorage.setItem('mindvault_deepseek_api_key', '你的API密钥')
 * 2. 或在 index.html 的 <head> 中添加: <script>window.MINDVAULT_DEEPSEEK_API_KEY = '你的API密钥';</script>
 */

var DeepSeekService = (function () {
  var API_URL = 'https://api.deepseek.com/chat/completions';

  function getApiKey() {
    return window.MINDVAULT_DEEPSEEK_API_KEY || 
           localStorage.getItem('mindvault_deepseek_api_key') || 
           '';
  }

  function parseDeepSeekContent(rawContent) {
    var text = (rawContent || '').trim();
    if (!text) {
      return { summary: '', tags: [] };
    }

    var cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    var parsed = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      var match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (err) {
          parsed = null;
        }
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return { summary: text, tags: [] };
    }

    return {
      summary: typeof parsed.summary === 'string' && parsed.summary.trim() ? parsed.summary.trim() : text,
      tags: Array.isArray(parsed.tags) ? parsed.tags : []
    };
  }

  function analyzeContent(title, content, type) {
    var apiKey = getApiKey();

    if (!apiKey) {
      console.warn('⚠️ 未配置 DeepSeek API Key，使用本地默认摘要。');
      return Promise.resolve({
        summary: '（本地默认摘要）"' + title + '"，类型：' + type + '。建议配置 API Key 来启用 DeepSeek 智能摘要。',
        suggestedTags: ['未接入AI', '本地摘要', title || '未分类']
      });
    }

    var prompt = [
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
      '标题: ' + (title || '无标题'),
      '类型: ' + type,
      '内容: ' + (content || '（用户未提供正文，只给了标题和简单描述）')
    ].join('\n');

    return fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    })
    .then(function (response) {
      if (!response.ok) {
        return response.text().then(function (text) {
          console.error('DeepSeek API error:', response.status, text);
          throw new Error('DeepSeek API 请求失败');
        });
      }
      return response.json();
    })
    .then(function (data) {
      var rawContent = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

      if (!rawContent) {
        throw new Error('DeepSeek 返回内容为空');
      }

      var parsed = parseDeepSeekContent(rawContent);
      var tags = parsed.tags;

      return {
        summary: parsed.summary,
        suggestedTags: tags.length ? tags : ['DeepSeek', type, title || '未分类']
      };
    })
    .catch(function (error) {
      console.error('调用 DeepSeek 出错：', error);
      return {
        summary: '（调用 DeepSeek 失败）"' + title + '" 的智能摘要生成出错，请稍后重试。',
        suggestedTags: ['AI错误', 'DeepSeek', title || '未分类']
      };
    });
  }

  var exported = {
    analyzeContent: analyzeContent,
    _parseDeepSeekContent: parseDeepSeekContent
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }

  return exported;
})();
