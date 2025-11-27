'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap } from 'lucide-react';
import { storage, Session, Thought } from '@/lib/storage';

export default function CompletePage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [thought, setThought] = useState<Thought | null>(null);
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = params.id as string;

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const sessionData = storage.getSession(sessionId);
      setSession(sessionData);

      const thoughts = storage.getThoughtsBySession(sessionId);
      const thoughtData = thoughts.length > 0 ? thoughts[0] : null;
      setThought(thoughtData);

      if (thoughtData) {
        await getInsight(thoughtData);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsight = async (thoughtData: Thought) => {
    try {
      const response = await fetch('/api/analyze-thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thoughtText: thoughtData.thought_text,
          category: thoughtData.category,
          theme: thoughtData.theme,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsight(data.insight);
      }
    } catch (error) {
      console.error('Error getting insight:', error);
    }
  };

  const getWeatherLabel = (weather?: string) => {
    const labels: Record<string, string> = {
      sunny: 'Sunny and clear',
      cloudy: 'Cloudy and uncertain',
      stormy: 'Stormy and stirred up',
      foggy: 'Foggy and unclear',
    };
    return weather ? labels[weather] || weather : 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Reflecting on your journey...</p>
        </div>
      </div>
    );
  }

  const emotionEntries: [string, number][] = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Sparkles className="w-16 h-16 text-blue-400 mx-auto" />
            <h1 className="text-4xl font-bold text-white">Session complete</h1>
            <p className="text-xl text-slate-300">You took some time to look inside, and that matters.</p>
          </div>

          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">MIND WEATHER</span>
              </div>
              <p className="text-2xl text-white font-semibold">{getWeatherLabel(session?.mind_weather)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Thoughts explored</p>
                <p className="text-3xl font-bold text-white">{session?.thoughts_explored || 0}</p>
              </div>
            </div>

            {emotionEntries.length > 0 && (
              <div>
                <p className="text-slate-400 text-sm mb-3">Emotions that showed up most</p>
                <div className="space-y-2">
                  {emotionEntries.map(([emotion, intensity]) => (
                    <div key={emotion} className="flex items-center justify-between">
                      <span className="text-white capitalize">{emotion}</span>
                      <span className="text-slate-400">{intensity}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {insight && (
            <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur border-blue-700/50 p-8">
              <div className="space-y-3">
                <p className="text-blue-300 text-sm font-medium">REFLECTION</p>
                <p className="text-lg text-white leading-relaxed">{insight}</p>
              </div>
            </Card>
          )}

          <div className="flex flex-col gap-4">
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6 text-lg"
            >
              Start a new session
            </Button>

            <p className="text-center text-sm text-slate-400">
              Come back whenever you need to unload
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
