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
1. **精准量化**：所有食材重量统一使用"克(g)"为单位，禁止使用"碗、个、只、片、条、勺"等模糊单位
2. **多样化蛋白质**：每天的蛋白质来源要多样化，避免一天内全是海鲜。交替使用鸡肉、牛肉、猪肉、鱼肉、虾、鸡蛋、豆腐等
3. **常见食材**：只使用中国家庭常见的食材，如：鸡胸肉、鸡腿肉、牛肉、猪肉、鸡蛋、豆腐、各种常见鱼类（草鱼、鲈鱼、带鱼）、虾、牛奶、豆浆、米饭、糙米、燕麦、面条、各种常见蔬菜（白菜、青菜、西兰花、番茄、黄瓜、冬瓜、茄子、豆角等）
4. **避免稀有食材**：禁止推荐玉米碴粥、皮皮虾、秋葵、芦笋、羽衣甘蓝等不常见或处理麻烦的食材
5. **简单烹饪**：烹饪方式简单实用，如蒸、煮、炒、凉拌，避免复杂的做法

## 输出格式说明
${formatDesc}

${genderNote}${preferenceNote}

## 输出结构（必须严格遵守以下格式）

📋 10天饮食方案

营养素目标（每日）：碳水${carbs}g | 蛋白质${protein}g | 脂肪${fat}g

━━━━━━━━━━━━━━━━━━━━

📅 第1天

🌅 早餐
- 鸡蛋：100g（约2个中等大小）
- 全麦面包：60g
- 牛奶：250g

🌞 午餐
- 糙米饭：150g
- 清蒸鸡胸肉：150g
- 清炒西兰花：200g

🌙 晚餐
- 清蒸鲈鱼：200g
- 凉拌黄瓜：150g
- 冬瓜汤：200g

━━━━━━━━━━━━━━━━━━━━

📅 第2天

🌅 早餐
- 燕麦粥：200g
- 苹果：150g
- 核桃：15g

（继续到第10天，每天的食谱都要不同）

━━━━━━━━━━━━━━━━━━━━

💡 执行小贴士
1. 食材采购建议
2. 烹饪技巧

## 严格要求
- 所有重量统一用"克(g)"，如：鸡蛋：100g，不要写"鸡蛋：2个"
- 每天蛋白质来源要变化，不要连续两天都是海鲜
- 每天每顿饭只提供1个方案
- 10天内每天的食谱尽量不同
- 食材必须是菜市场/超市容易买到的
- 每个食物单独一行，格式为 "- 食材名：重量g"
- 不要在食物后面写做法，保持简洁`;

    const userPrompt = `请为我生成10天减脂饮食方案：

每日营养素需求：
- 碳水化合物：${carbs}g
- 蛋白质：${protein}g  
- 脂肪：${fat}g

严格要求：
1. 所有食材重量统一用"克(g)"，禁止用"个、碗、只、片"等模糊单位
2. 每天蛋白质来源要多样化，不要一天全是海鲜，要鸡肉、牛肉、鱼、虾、豆腐等交替
3. 只用常见食材：鸡胸肉、牛肉、鸡蛋、豆腐、鱼、虾、米饭、面条、各种常见蔬菜
4. 禁止使用：玉米碴粥、皮皮虾、秋葵等不常见食材
5. 每天每顿饭只给1个方案，10天内食谱尽量不重复
6. 每个食物单独一行，格式：- 食材名：重量g`;

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
