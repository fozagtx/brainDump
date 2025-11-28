'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Cloud, CloudRain, CloudSnow, Sun } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useRouter } from 'next/navigation';

const faqs = [
  {
    question: 'Is this therapy?',
    answer: 'No! Brain Dump is a non-therapeutic support tool.',
  },
  {
    question: 'Is my data private?',
    answer: 'Yes. All thoughts are securely stored and never shared.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely! Cancel your monthly or yearly subscription at any time.',
  },
  {
    question: "Does it work if I don't like journaling?",
    answer: 'Yes! No journaling involved.',
  },
  {
    question: 'Do I need to type?',
    answer: 'Nope, but you can if you wish to.',
  },
  {
    question: 'Can I get a discount?',
    answer: 'For special people, we give special discounts - just ask!',
  },
];

const weatherOptions = [
  { value: 'sunny', label: 'Sunny and clear', icon: Sun, color: 'text-yellow-500' },
  { value: 'cloudy', label: 'Cloudy and uncertain', icon: Cloud, color: 'text-gray-400' },
  { value: 'stormy', label: 'Stormy and stirred up', icon: CloudRain, color: 'text-blue-500' },
  { value: 'foggy', label: 'Foggy and unclear', icon: CloudSnow, color: 'text-slate-400' },
];

export default function Home() {
  const router = useRouter();
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = () => {
    if (!selectedWeather) return;

    setIsStarting(true);

    try {
      const session = storage.createSession({
        mind_weather: selectedWeather,
        started_at: new Date().toISOString(),
        thoughts_explored: 0,
      });

      router.push(`/input/${session.id}`);
    } catch (error) {
      console.error('Error starting session:', error);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <nav className="border-b border-slate-700/50 backdrop-blur-sm fixed w-full top-0 z-50 bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-cyan-400" />
              <span className="text-xl font-bold text-white">Brain Dump</span>
            </div>
            <div className="flex gap-6">
              <a href="#about" className="text-slate-300 hover:text-white transition-colors">
                About Us
              </a>
              <a href="#contact" className="text-slate-300 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Quiet the spin. Organise the chaos.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Finally breathe again.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              Messy thoughts feel overwhelming — like your brain is stuck in a washing machine.
            </p>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Brain Dump slows everything down so you can see clearly and feel calm again.
            </p>
          </div>

          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-8 max-w-2xl mx-auto space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">How's your mind weather today?</h2>
              <p className="text-slate-400">
                Choose what best describes your mental state right now
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weatherOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedWeather(option.value)}
                    className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                      selectedWeather === option.value
                        ? 'border-cyan-400 bg-cyan-500/20'
                        : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                    }`}
                  >
                    <Icon className={`w-10 h-10 mx-auto mb-2 ${option.color}`} />
                    <p className="text-white text-sm font-medium">{option.label}</p>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleStartSession}
              disabled={!selectedWeather || isStarting}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold h-14 text-lg disabled:opacity-50"
            >
              {isStarting ? 'Starting...' : 'Start Your Brain Dump'}
            </Button>
          </Card>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
            How It Works
          </h2>
          <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/1mXVRbx9_5M"
              title="Brain Dump Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 backdrop-blur border-slate-700 p-6 hover:bg-slate-800/70 transition-colors"
              >
                <h3 className="text-xl font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-slate-300">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="py-12 px-4 border-t border-slate-700/50">
        <div className="container mx-auto max-w-5xl text-center text-slate-400">
          <p>&copy; 2025 Brain Dump. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
