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
        ? '⚠️ 所有食材重量为【生重】，即未烹饪前的重量'
        : '⚠️ 所有食材重量为【熟重】，即烹饪后的重量，方便直接称量';

    const genderNote = gender === 'female'
      ? '用户是女性，注意女性在生理期、激素等方面的特殊性，可适当增加铁质丰富的食材。'
      : gender === 'male'
        ? '用户是男性。'
        : '用户性别未知。';

    const preferenceNote = preference
      ? `\n\n**用户的食材偏好/限制：**\n${preference}\n\n请根据这个偏好调整食材，保持营养素总量不变。如果用户说"不吃XX"，请替换成同类食材；如果用户说"只有XX"，尽量用这些食材组合出方案。`
      : '';

    const systemPrompt = `你是一位专业的营养师和减脂饮食顾问。根据用户提供的营养素需求，生成一份为期10天的减脂饮食方案。

## 核心原则
1. **多样化原则**：10天内每天的食谱尽量不同，避免重复，让饮食更有趣味性
2. **精准匹配**：每日三大营养素总量必须精准匹配，误差不超过5g
3. **生活化食材**：使用常见、易购买的食材，不推荐极端饮食或稀有食材
4. **可执行性**：烹饪方式简单实用，适合普通家庭操作

## 输出格式说明
${formatDesc}

${genderNote}${preferenceNote}

## 输出结构（必须严格遵守以下格式，每行一个食物）

📋 10天饮食方案

营养素目标（每日）：碳水${carbs}g | 蛋白质${protein}g | 脂肪${fat}g

━━━━━━━━━━━━━━━━━━━━

📅 第1天

🌅 早餐
- 鸡蛋：2个
- 全麦面包：2片
- 牛奶：250ml

🌞 午餐
- 糙米饭：150g
- 清蒸鸡胸肉：150g
- 清炒西兰花：200g

🌙 晚餐
- 蒸鱼：200g
- 凉拌黄瓜：150g
- 紫菜蛋花汤：1碗

━━━━━━━━━━━━━━━━━━━━

📅 第2天

🌅 早餐
- 燕麦粥：200g
- 苹果：1个
- 核桃：2个

（继续到第10天，每天的食谱都要不同）

━━━━━━━━━━━━━━━━━━━━

💡 执行小贴士
1. 食材采购建议
2. 烹饪技巧

## 重要提醒
- 每天每顿饭只提供1个方案
- 10天内每天的食谱尽量不同
- 食材重量要精确标注
- 每个食物单独一行，格式为 "- 食材名：重量"
- 不要在食物后面写做法，保持简洁`;

    const userPrompt = `请为我生成10天减脂饮食方案：

每日营养素需求：
- 碳水化合物：${carbs}g
- 蛋白质：${protein}g  
- 脂肪：${fat}g

要求：
1. 每天每顿饭只给1个方案
2. 10天内食谱尽量不重复
3. 每个食物单独一行，格式：- 食材名：重量
4. 确保三大营养素每日总量匹配`;

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
