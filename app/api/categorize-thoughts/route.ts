import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { thoughts } = await request.json();

    if (!thoughts || !Array.isArray(thoughts)) {
      return NextResponse.json({ error: 'Thoughts array is required' }, { status: 400 });
    }

    const thoughtTexts = thoughts.map((t: any) => t.thought_text).join('\n- ');

    const prompt = `Analyze these thoughts and provide:
1. A category for each (worry, future, rumination, or other)
2. A theme for grouping similar thoughts
3. An overall compassionate reflection (2-3 sentences)

Thoughts:
- ${thoughtTexts}

Respond in JSON format:
{
  "categorized": [
    {
      "index": 0,
      "category": "worry|future|rumination|other",
      "theme": "work|relationships|health|future|etc"
    }
  ],
  "overallReflection": "Your compassionate reflection here"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate mental health companion. Analyze thoughts and provide gentle categorization and reflection.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Categorization error:', error);
    return NextResponse.json({ error: 'Failed to categorize thoughts' }, { status: 500 });
  }
}
