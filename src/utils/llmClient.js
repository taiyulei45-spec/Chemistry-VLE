// src/utils/llmClient.js

export async function fetchChemistryAnswer(userMessage, chatHistory, moduleContext) {
  const apiKey = import.meta.env.VITE_LLM_API_KEY;
  const apiUrl = import.meta.env.VITE_LLM_API_URL;

  // 1. 构造系统提示词 (System Prompt)，给 AI 洗脑，赋予它专家人设
  const systemPrompt = `
    你现在是国家级精品课程《无机化学与结构化学》的资深 AI 教授。
    当前学生正在学习的模块是：【${moduleContext}】。
    
    你的回答要求：
    1. 极度专业、准确，符合大学化学标准。
    2. 语言生动幽默，善于用生活中的例子解释微观现象。
    3. 引导式教学，不要直接给干瘪的答案，而是启发学生思考。
    4. 适当使用 Markdown 格式（如加粗、列表）让排版美观。
  `;

  // 2. 格式化历史对话，让 AI 拥有记忆
  const messages = [
    { role: 'system', content: systemPrompt },
    // 映射之前的对话历史
    ...chatHistory.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.text
    })),
    // 加上用户的最新问题
    { role: 'user', content: userMessage }
  ];

  try {
    // 3. 发送网络请求调用大模型
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // 替换为你实际使用的模型名称 (如 gpt-3.5-turbo, gemini-pro 等)
        messages: messages,
        temperature: 0.7, // 控制发散程度：0 严谨，1 活跃
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    // 4. 返回 AI 的真实回答
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("AI 引擎调用异常:", error);
    return "抱歉，我的神经计算中枢（API）暂时失去了连接，请检查网络或 API Key 余额。";
  }
}