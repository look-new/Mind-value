const test = require('node:test');
const assert = require('node:assert/strict');

const DeepSeekService = require('../js/deepseekService.js');

test('parseDeepSeekContent 能解析 markdown code fence 中的 JSON', function () {
  const input = '```json\n{"summary":"测试摘要","tags":["A","B"]}\n```';
  const parsed = DeepSeekService._parseDeepSeekContent(input);

  assert.equal(parsed.summary, '测试摘要');
  assert.deepEqual(parsed.tags, ['A', 'B']);
});

test('parseDeepSeekContent 能解析带前后说明文本的 JSON 片段', function () {
  const input = '好的，结果如下：\n{"summary":"片段摘要","tags":["检索"]}\n谢谢';
  const parsed = DeepSeekService._parseDeepSeekContent(input);

  assert.equal(parsed.summary, '片段摘要');
  assert.deepEqual(parsed.tags, ['检索']);
});

test('parseDeepSeekContent 在非 JSON 内容时回退原文', function () {
  const input = '这是一段普通文本，不是 JSON';
  const parsed = DeepSeekService._parseDeepSeekContent(input);

  assert.equal(parsed.summary, input);
  assert.deepEqual(parsed.tags, []);
});
