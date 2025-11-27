'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, RotateCcw, X } from 'lucide-react';
import { storage, Thought } from '@/lib/storage';

type Question = {
  id: string;
  text: string;
  type: 'choice' | 'text';
  options?: { value: string; label: string }[];
  placeholder?: string;
};

const questions: Question[] = [
  {
    id: 'can-change',
    text: 'Is this something you can still change in any way, or is it more about accepting what has already happened?',
    type: 'choice',
    options: [
      { value: 'can-change', label: 'I can change something about it' },
      { value: 'accept', label: "I can't change it; I may need to accept it" },
      { value: 'not-sure', label: "I'm not sure yet" },
    ],
  },
  {
    id: 'helps-hurts',
    text: 'Does holding onto this thought mostly help you, or mostly hurt you?',
    type: 'choice',
    options: [
      { value: 'helps', label: 'It mostly helps me' },
      { value: 'hurts', label: 'It mostly hurts me' },
      { value: 'not-sure', label: "I'm not sure" },
    ],
  },
  {
    id: 'feeling',
    text: 'When this thought shows up, what feeling do you notice most strongly?',
    type: 'text',
    placeholder: 'For example: anxious, guilty, sad, tense, heavy, angry, numb, or something else',
  },
  {
    id: 'reflection',
    text: 'Let\'s look gently at this thought: "I\'m stressing about the future like what if I never get my life properly sorted." What part of this feels most true to you?',
    type: 'text',
    placeholder: 'Type a few words about how this feels...',
  },
  {
    id: 'intensity',
    text: 'On a scale of 1-10, how intense does this thought feel right now?',
    type: 'text',
    placeholder: 'Enter a number from 1 to 10',
  },
];

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sessionId = params.id as string;
  const currentQuestion = questions[currentStep];
  const totalSteps = questions.length;
  const currentThought = thoughts[currentThoughtIndex];

  useEffect(() => {
    loadThoughts();
  }, [sessionId]);

  useEffect(() => {
    if (currentThought && !isLoading) {
      narrateText(currentQuestion.text);
    }
  }, [currentStep, isLoading]);

  const loadThoughts = () => {
    try {
      const data = storage.getThoughtsBySession(sessionId);

      if (!data || data.length === 0) {
        router.push(`/input/${sessionId}`);
        return;
      }

      setThoughts(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading thoughts:', error);
      setIsLoading(false);
    }
  };

  const narrateText = async (text: string) => {
    try {
      const response = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);

        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('Narration error:', error);
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeCurrentThought();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeCurrentThought = () => {
    if (!currentThought) return;

    setIsLoading(true);

    try {
      const intensity = parseInt(answers.intensity) || 5;

      const updatedThoughts = [...thoughts];
      updatedThoughts[currentThoughtIndex] = {
        ...currentThought,
        category: answers['can-change'],
        theme: answers['helps-hurts'],
      };
      setThoughts(updatedThoughts);

      storage.updateThought(currentThought.id, {
        category: answers['can-change'],
        theme: answers['helps-hurts'],
      });

      if (currentThoughtIndex < thoughts.length - 1) {
        setCurrentThoughtIndex(currentThoughtIndex + 1);
        setCurrentStep(0);
        setAnswers({});
        setIsLoading(false);
      } else {
        storage.updateSession(sessionId, { completed_at: new Date().toISOString() });
        router.push(`/thoughts/${sessionId}`);
      }
    } catch (error) {
      console.error('Error completing thought:', error);
      setIsLoading(false);
    }
  };

  const canProceed = answers[currentQuestion.id] && answers[currentQuestion.id].length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your thoughts...</p>
        </div>
      </div>
    );
  }

  if (!currentThought) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300">No thoughts found</p>
          <Button onClick={() => router.push(`/input/${sessionId}`)} className="mt-4">
            Add Thoughts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <audio ref={audioRef} className="hidden" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(0)}
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

          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">FOCUS THOUGHT</span>
                <span className="text-sm text-slate-400">
                  Step {currentStep + 1} of {totalSteps}
                </span>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-300 italic">"{currentThought.thought_text}"</p>
              </div>
              <div className="text-sm text-slate-400">
                Thought {currentThoughtIndex + 1} of {thoughts.length}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl text-white leading-relaxed">{currentQuestion.text}</h3>

              {currentQuestion.type === 'choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        answers[currentQuestion.id] === option.value
                          ? 'border-blue-400 bg-blue-500/20'
                          : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                      }`}
                    >
                      <p className="text-white">{option.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'text' && (
                <div>
                  {currentQuestion.id === 'intensity' ? (
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  ) : (
                    <Textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="min-h-24 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="text-slate-300"
              >
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8"
              >
                {isLoading
                  ? 'Saving...'
                  : currentStep === totalSteps - 1
                  ? currentThoughtIndex === thoughts.length - 1
                    ? 'Complete Session'
                    : 'Next Thought'
                  : 'Next'}
              </Button>
            </div>
          </Card>

          <p className="text-center text-sm text-slate-400 mt-6">
            You're not trying to fix anything here. Just noticing how this thought feels and what it does to you is already a big step.
          </p>
        </div>
      </div>
    </div>
  );
}
