// src/utils/llmClient.js

/**
 * 调用 DeepSeek 大模型获取化学科研解答
 * @param {string} userMessage 用户最新输入的问题
 * @param {Array} chatHistory 之前的对话历史数组
 * @param {string} moduleContext 当前学生所处的实验模块上下文
 */
export async function fetchChemistryAnswer(userMessage, chatHistory, moduleContext) {
  // 1. 从环境变量获取配置 (确保你的 .env 文件中有这两个变量)
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  // DeepSeek 官方标准对话接口地址
  const apiUrl = "https://api.deepseek.com/chat/completions";

  // 2. 构造系统提示词 (System Prompt) - 强化专家人设
  const systemPrompt = `
    你现在是国家级精品课程《无机化学与结构化学》的资深 AI 教授，名叫 SmartChem AI。
    当前学生正在学习的模块是：【${moduleContext}】。
    
    你的回答要求：
    1. 极度专业、准确，符合 2026 年最新的大学化学与科研标准。
    2. 语言生动，善于用类比解释微观现象（如将电子云比作蜂群）。
    3. 引导式教学：在给出答案后，尝试抛出一个相关的小问题引导学生深入思考。
    4. 严格使用 Markdown 格式（加粗、有序/无序列表、Latex数学公式）确保排版极度专业。
  `;

  // 3. 格式化对话历史 (只取最近 6 条，防止超过 Token 限制并节省成本)
  const limitedHistory = chatHistory.slice(-6).map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...limitedHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    // 4. 发送网络请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', 
        messages: messages,
        temperature: 0.7, // 0.7 兼顾了严谨性与表达的丰富度
        max_tokens: 1500, // 增加字数上限，方便展示长图表或复杂推导
        stream: false
      })
    });

    // 5. 错误处理逻辑
    if (!response.ok) {
      if (response.status === 402) return "⚠️ 算力余额不足：实验室的 AI 节点需要充值能量，请联系管理员。";
      if (response.status === 401) return "⚠️ 身份验证失败：API Key 配置有误，请检查实验舱环境变量。";
      throw new Error(`API 返回异常: ${response.status}`);
    }

    const data = await response.json();
    
    // 6. 返回 AI 的回答内容
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("AI 引擎调用异常:", error);
    return "抱歉，由于算力节点波动（网络或接口异常），我暂时无法处理您的请求。请稍后再试或检查您的网络连接。";
  }
}