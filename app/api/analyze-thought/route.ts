import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { thoughtText, feeling, reflection } = await request.json();

    if (!thoughtText) {
      return NextResponse.json({ error: 'Thought text is required' }, { status: 400 });
    }

    const prompt = `You are a compassionate mental health companion. Analyze this thought and provide gentle insights.

Thought: "${thoughtText}"
Primary Feeling: ${feeling || 'Not specified'}
User Reflection: ${reflection || 'None provided'}

Provide a brief, compassionate response (2-3 sentences) that:
1. Acknowledges their feeling
2. Offers a gentle perspective
3. Encourages self-compassion

Keep the tone warm, non-judgmental, and supportive.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate mental health companion who helps people explore their thoughts with kindness and wisdom.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const insight = completion.choices[0]?.message?.content || 'Thank you for sharing this thought.';

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze thought' }, { status: 500 });
  }
}
