'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Mic, MicOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function InputPage() {
  const params = useParams();
  const router = useRouter();
  const [thoughts, setThoughts] = useState<string[]>(['']);
  const [isSaving, setIsSaving] = useState(false);
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const sessionId = params.id as string;

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleAddThought = () => {
    setThoughts([...thoughts, '']);
  };

  const handleRemoveThought = (index: number) => {
    if (thoughts.length > 1) {
      const newThoughts = thoughts.filter((_, i) => i !== index);
      setThoughts(newThoughts);
    }
  };

  const handleThoughtChange = (index: number, value: string) => {
    const newThoughts = [...thoughts];
    newThoughts[index] = value;
    setThoughts(newThoughts);
  };

  const analyzeAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average);

    animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
  };

  const startRecording = async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      analyzeAudioLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob, index);

        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      mediaRecorder.start();
      setRecordingIndex(index);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecordingIndex(null);
      setAudioLevel(0);
    }
  };

  const transcribeAudio = async (audioBlob: Blob, index: number) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const { text } = await response.json();
      const newThoughts = [...thoughts];
      newThoughts[index] = (newThoughts[index] + ' ' + text).trim();
      setThoughts(newThoughts);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const getVolumeIndicator = () => {
    if (audioLevel < 10) return { text: 'Very Quiet', color: 'text-red-400' };
    if (audioLevel < 30) return { text: 'Quiet', color: 'text-yellow-400' };
    if (audioLevel < 60) return { text: 'Good', color: 'text-green-400' };
    return { text: 'Loud', color: 'text-blue-400' };
  };

  const handleContinue = async () => {
    const validThoughts = thoughts.filter((t) => t.trim().length > 0);

    if (validThoughts.length === 0) return;

    setIsSaving(true);

    try {
      const thoughtsToInsert = validThoughts.map((thought) => ({
        session_id: sessionId,
        thought_text: thought.trim(),
      }));

      const { error } = await supabase.from('thoughts').insert(thoughtsToInsert);

      if (error) throw error;

      await supabase
        .from('sessions')
        .update({ thoughts_explored: validThoughts.length })
        .eq('id', sessionId);

      router.push(`/thoughts/${sessionId}`);
    } catch (error) {
      console.error('Error saving thoughts:', error);
      setIsSaving(false);
    }
  };

  const validThoughtsCount = thoughts.filter((t) => t.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-white">What's on your mind?</h1>
            <p className="text-xl text-slate-300">
              Share the thoughts that have been weighing on you. Add as many as you need.
            </p>
          </div>

          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 p-8 space-y-6">
            <div className="space-y-4">
              {thoughts.map((thought, index) => (
                <div key={index} className="space-y-3">
                  <div className="relative">
                    <Textarea
                      value={thought}
                      onChange={(e) => handleThoughtChange(index, e.target.value)}
                      placeholder={`Thought ${index + 1}: Speak or type your thought...`}
                      className="min-h-24 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-12"
                      disabled={recordingIndex === index || isTranscribing}
                    />
                    {thoughts.length > 1 && recordingIndex !== index && (
                      <button
                        onClick={() => handleRemoveThought(index)}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-slate-600/50 hover:bg-red-500/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {recordingIndex === index ? (
                      <>
                        <Button
                          onClick={stopRecording}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <MicOff className="w-4 h-4 mr-2" />
                          Stop Recording
                        </Button>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-100"
                              style={{ width: `${Math.min(100, (audioLevel / 100) * 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getVolumeIndicator().color}`}>
                            {getVolumeIndicator().text}
                          </span>
                        </div>
                      </>
                    ) : (
                      <Button
                        onClick={() => startRecording(index)}
                        variant="outline"
                        className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                        disabled={recordingIndex !== null || isTranscribing}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {isTranscribing && recordingIndex === null ? 'Transcribing...' : 'Voice Input'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleAddThought}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add another thought
            </Button>

            <div className="pt-4 space-y-3">
              <Button
                onClick={handleContinue}
                disabled={validThoughtsCount === 0 || isSaving}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6 text-lg disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : `Continue with ${validThoughtsCount} thought${validThoughtsCount !== 1 ? 's' : ''}`}
              </Button>
              <p className="text-center text-sm text-slate-400">
                We'll explore each of these thoughts together
              </p>
            </div>
          </Card>

          <div className="text-center text-sm text-slate-400 space-y-2">
            <p>There's no pressure to share everything at once.</p>
            <p>Just what feels right in this moment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
