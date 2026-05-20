import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

interface NutrientsData {
  weight: string;
  exercise: string;
  gender: 'male' | 'female';
  fastMode: boolean;
  carbs: number;
  protein: number;
  fat: number;
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as NutrientsData & {
      preference?: string;
      format?: 'raw' | 'cooked';
    };

    const { carbs, protein, fat, gender, preference, format = 'raw' } = data;

    if (!carbs || !protein || !fat) {
      return NextResponse.json({ error: '缺少营养素数据' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const formatDesc =
      format === 'raw'
        ? '标准生重版：食材重量为生重（未烹饪前的重量）'
        : '方便熟重版：食材重量为熟重（烹饪后的重量，方便直接称量）';

    const systemPrompt = `你是一位专业的营养师和减脂饮食顾问。你的任务是根据用户提供的营养素需求，生成一份科学、生活化的减脂饮食方案。

## 核心原则
1. 所有食材重量必须精准匹配用户提供的营养素需求，误差不超过5g
2. 使用常见、易购买的食材，不推荐极端饮食（如零碳水、全水煮）
3. 保持生活化减脂的定位，让普通人也能执行
4. 语言口语化，像给朋友推荐一样，好理解好执行

## 性别调整
${gender === 'female' ? '用户是女性，注意女性在生理期、激素等方面的特殊性，食材选择可以更温和。' : '用户是男性，可以适当增加蛋白质丰富的食材。'}

## 输出格式
${formatDesc}

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

### 💡 油脂选择建议
- 推荐油脂：橄榄油/山茶油等
- 每日用油量：约XXml

### ⚠️ 钠摄入量提醒
- 每日盐摄入量建议：不超过5g
- 注意隐形钠来源：酱油、酱料等

### 📊 动态调整规则
- 7-10天后评估体重变化
- 如果掉秤过快（每周>1.5kg），每日增加10-15g碳水
- 如果掉秤偏慢（每周<0.5kg），每日减少10-15g碳水`;

    const userPrompt = `请为我生成一份减脂饮食方案：

**我的营养素需求：**
- 碳水化合物：${carbs}g/天
- 蛋白质：${protein}g/天
- 脂肪：${fat}g/天

${preference ? `**我的食材偏好/限制：**\n${preference}` : '没有特别的食材偏好'}

请严格按照输出格式生成方案，确保三大营养素总量匹配（误差不超过5g）。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 使用流式输出
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
