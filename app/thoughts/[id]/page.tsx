'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';
import { storage, Session, Thought } from '@/lib/storage';

const categoryColors: Record<string, string> = {
  worry: 'bg-blue-400',
  future: 'bg-orange-400',
  rumination: 'bg-pink-400',
  other: 'bg-gray-400',
};

const themePositions: Record<string, { x: number; y: number }> = {
  work: { x: 15, y: 35 },
  relationships: { x: 65, y: 25 },
  future: { x: 40, y: 50 },
  health: { x: 25, y: 65 },
  other: { x: 70, y: 60 },
};

export default function ThoughtsPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedThought, setSelectedThought] = useState<string | null>(null);

  const sessionId = params.id as string;

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const sessionData = storage.getSession(sessionId);
      setSession(sessionData);

      const thoughtsData = storage.getThoughtsBySession(sessionId);

      if (thoughtsData && thoughtsData.length > 0) {
        if (!thoughtsData[0].category) {
          await categorizeThoughts(thoughtsData);
        } else {
          setThoughts(thoughtsData);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeThoughts = async (thoughtsData: Thought[]) => {
    try {
      const response = await fetch('/api/categorize-thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thoughts: thoughtsData }),
      });

      if (response.ok) {
        const { categorized, overallReflection } = await response.json();

        const updatedThoughts = thoughtsData.map((thought, index) => {
          const cat = categorized[index];
          const updatedThought = {
            ...thought,
            category: cat?.category || 'other',
            theme: cat?.theme || 'other',
          };

          storage.updateThought(thought.id, {
            category: cat?.category || 'other',
            theme: cat?.theme || 'other',
          });

          return updatedThought;
        });

        storage.updateSession(sessionId, { overall_reflection: overallReflection });

        setSession((prev) => prev ? { ...prev, overall_reflection: overallReflection } : null);
        setThoughts(updatedThoughts);
      }
    } catch (error) {
      console.error('Error categorizing thoughts:', error);
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === 'all') return thoughts.length;
    return thoughts.filter((t) => t.category === category).length;
  };

  const filteredThoughts = selectedCategory === 'all'
    ? thoughts
    : thoughts.filter((t) => t.category === selectedCategory);

  const topEmotions: [string, number][] = [];

  const thoughtsByTheme: Record<string, Thought[]> = {};
  filteredThoughts.forEach((thought) => {
    const theme = thought.theme || 'other';
    if (!thoughtsByTheme[theme]) {
      thoughtsByTheme[theme] = [];
    }
    thoughtsByTheme[theme].push(thought);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Analyzing your thoughts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push(`/session/${sessionId}`)}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="text-slate-300 hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Take a look at your mind</h1>
              <p className="text-slate-300">
                These bubbles show the thoughts you just shared, grouped by feeling and theme. Take a moment to explore them before we go any deeper.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-6">
                  <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      All ({getCategoryCount('all')})
                    </button>
                    <button
                      onClick={() => setSelectedCategory('worry')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === 'worry'
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Worry ({getCategoryCount('worry')})
                    </button>
                    <button
                      onClick={() => setSelectedCategory('future')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === 'future'
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Future ({getCategoryCount('future')})
                    </button>
                    <button
                      onClick={() => setSelectedCategory('rumination')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === 'rumination'
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Rumination ({getCategoryCount('rumination')})
                    </button>
                    <button
                      onClick={() => setSelectedCategory('other')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === 'other'
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Other ({getCategoryCount('other')})
                    </button>
                  </div>

                  <div className="relative h-96 bg-slate-900/30 rounded-lg">
                    {filteredThoughts.map((thought, index) => {
                      const position = themePositions[thought.theme || 'other'] || { x: 50, y: 50 };
                      const offset = index * 10;
                      const colors = ['bg-blue-400', 'bg-orange-400', 'bg-pink-400', 'bg-purple-400'];
                      const bgColor = colors[index % colors.length];

                      return (
                        <button
                          key={thought.id}
                          onClick={() => setSelectedThought(thought.id === selectedThought ? null : thought.id)}
                          style={{
                            position: 'absolute',
                            left: `${position.x + (offset % 30) - 15}%`,
                            top: `${position.y + (Math.floor(offset / 30) * 15) - 15}%`,
                          }}
                          className={`${bgColor} rounded-full p-6 shadow-lg hover:scale-110 transition-transform cursor-pointer max-w-[140px]`}
                        >
                          <p className="text-white text-xs font-medium line-clamp-3">
                            {thought.thought_text}
                          </p>
                        </button>
                      );
                    })}

                    {filteredThoughts.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-slate-400">No thoughts in this category</p>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <p className="text-slate-400 text-sm">Tap any bubble to rename it</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Top emotions right now</h3>
                  <div className="space-y-3">
                    {topEmotions.map(([emotion, intensity]) => (
                      <div key={emotion}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white capitalize">{emotion}</span>
                          <span className="text-slate-400">{intensity}/10</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                            style={{ width: `${(intensity as number / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Where your thoughts are sitting</h3>
                  <div className="space-y-2">
                    {Object.entries(thoughtsByTheme).map(([theme, themeThoughts]) => (
                      <div key={theme} className="flex items-center justify-between">
                        <span className="text-slate-300 capitalize">{theme}</span>
                        <span className="text-slate-400">
                          {themeThoughts.length} thought{themeThoughts.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {session?.overall_reflection && (
                  <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur border-blue-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Overall reflection</h3>
                    <p className="text-slate-200 text-sm leading-relaxed">{session.overall_reflection}</p>
                    <p className="text-slate-400 text-xs mt-4">
                      You don't need to fix anything right now. Just noticing where your mind is busy is already a powerful step.
                    </p>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => router.push(`/complete/${sessionId}`)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-8 py-6"
              >
                Begin reflection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
