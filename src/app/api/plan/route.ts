import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

interface NutrientsData {
  weight: string;
  exercise: string;
  gender: 'male' | 'female' | null;
  format: 'raw' | 'cooked';
  preference: string;
  carbs: number;
  protein: number;
  fat: number;
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as NutrientsData;

    const { carbs, protein, fat, gender, preference, format = 'raw' } = data;

    if (!carbs || !protein || !fat) {
      return NextResponse.json({ error: '缺少营养素数据' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const formatDesc =
      format === 'raw'
        ? '食材重量为生重（未烹饪前的重量）'
        : '食材重量为熟重（烹饪后的重量，方便直接称量）';

    const genderNote = gender === 'female' 
      ? '用户是女性，注意女性在生理期、激素等方面的特殊性。' 
      : gender === 'male' 
        ? '用户是男性。' 
        : '用户性别未知。';

    const preferenceNote = preference 
      ? `\n\n**用户的食材偏好/限制：**\n${preference}\n\n请根据这个偏好调整食材，保持营养素总量不变。如果用户说"不吃XX"，请替换成同类食材；如果用户说"只有XX"，尽量用这些食材组合出方案。`
      : '';

    const systemPrompt = `你是一位专业的营养师和减脂饮食顾问。根据用户提供的营养素需求，生成一份科学、生活化的减脂饮食方案。

## 核心原则
1. 所有食材重量必须精准匹配营养素需求，误差不超过5g
2. 使用常见、易购买的食材，不推荐极端饮食
3. 语言口语化，像给朋友推荐一样，好理解好执行

## 输出格式
${formatDesc}

${genderNote}${preferenceNote}

## 输出结构（必须严格遵守）
### 🌅 早餐
- 食材1：XXg（做法提示）
- 食材2：XXg（做法提示）

### 🌞 午餐
- 食材1：XXg（做法提示）
- 食材2：XXg（做法提示）

### 🌙 晚餐
- 食材1：XXg（做法提示）
- 食材2：XXg（做法提示）

### 💡 油脂建议
- 推荐油脂：橄榄油/山茶油等
- 每日用油量：约XXml

### ⚠️ 注意事项
- 每日盐摄入量：不超过5g`;

    const userPrompt = `请为我生成减脂饮食方案：

**营养素需求：**
- 碳水化合物：${carbs}g/天
- 蛋白质：${protein}g/天
- 脂肪：${fat}g/天

请严格按照输出格式生成，确保三大营养素总量匹配。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(messages, {
            model: 'doubao-seed-1-8-251228',
            temperature: 0.7,
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: '生成方案时出错' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
