import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mic, Square, Play, Pause, Download, Save, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BetaGuard from './BetaGuard';

interface Recording {
  id: string;
  poem_id: string | null;
  poem_title: string;
  duration: number;
  recorded_at: string;
  audio_url: string;
}

export default function VoiceRecording() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadRecordings();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [user]);

  const loadRecordings = async () => {
    if (!user) return;

    const mockRecordings: Recording[] = [
      {
        id: '1',
        poem_id: null,
        poem_title: 'Sample Recording 1',
        duration: 45,
        recorded_at: new Date(Date.now() - 86400000).toISOString(),
        audio_url: ''
      },
      {
        id: '2',
        poem_id: null,
        poem_title: 'Sample Recording 2',
        duration: 120,
        recorded_at: new Date(Date.now() - 172800000).toISOString(),
        audio_url: ''
      }
    ];

    setRecordings(mockRecordings);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setCurrentAudio(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setError(null);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not access microphone. Please grant permission and try again.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const saveRecording = async () => {
    if (!currentAudio) return;

    const title = prompt('Enter a title for this recording:');
    if (!title) return;

    const newRecording: Recording = {
      id: Date.now().toString(),
      poem_id: null,
      poem_title: title,
      duration: recordingTime,
      recorded_at: new Date().toISOString(),
      audio_url: currentAudio
    };

    setRecordings([newRecording, ...recordings]);
    setCurrentAudio(null);
    setRecordingTime(0);
  };

  const deleteRecording = (id: string) => {
    if (confirm('Delete this recording?')) {
      setRecordings(recordings.filter(r => r.id !== id));
      if (playingId === id) {
        if (audioRef.current) audioRef.current.pause();
        setPlayingId(null);
      }
    }
  };

  const playRecording = (recording: Recording) => {
    if (playingId === recording.id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();

      if (recording.audio_url) {
        const audio = new Audio(recording.audio_url);
        audioRef.current = audio;
        audio.play();
        setPlayingId(recording.id);

        audio.onended = () => {
          setPlayingId(null);
        };
      }
    }
  };

  const downloadRecording = (recording: Recording) => {
    if (recording.audio_url) {
      const a = document.createElement('a');
      a.href = recording.audio_url;
      a.download = `${recording.poem_title}.webm`;
      a.click();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <BetaGuard>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => window.location.hash = ''}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ArrowLeft size={16} />
          Back to Beta Features
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
            <Mic className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Voice Recording</h2>
            <p className="text-slate-600 dark:text-slate-400">Record audio performances of your poems</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="glass rounded-xl p-8 shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                isRecording && !isPaused
                  ? 'bg-red-100 dark:bg-red-900/30 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}>
                <Mic className={`${
                  isRecording && !isPaused
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`} size={48} />
              </div>
              <div className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
                {formatTime(recordingTime)}
              </div>
              {isRecording && !isPaused && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                  Recording...
                </div>
              )}
              {isPaused && (
                <div className="mt-2 text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Paused
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              {!isRecording && !currentAudio && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Mic size={18} />
                  Start Recording
                </button>
              )}

              {isRecording && !isPaused && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Pause size={18} />
                    Pause
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Square size={18} />
                    Stop
                  </button>
                </>
              )}

              {isPaused && (
                <>
                  <button
                    onClick={resumeRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Mic size={18} />
                    Resume
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Square size={18} />
                    Stop
                  </button>
                </>
              )}

              {currentAudio && (
                <>
                  <button
                    onClick={saveRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Save size={18} />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setCurrentAudio(null);
                      setRecordingTime(0);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Trash2 size={18} />
                    Discard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            My Recordings
          </h3>

          {recordings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Mic size={48} className="mx-auto mb-3 opacity-30" />
              <p>No recordings yet. Start recording to create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {recording.poem_title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span>{formatTime(recording.duration)}</span>
                        <span>•</span>
                        <span>{new Date(recording.recorded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playRecording(recording)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        title={playingId === recording.id ? 'Pause' : 'Play'}
                      >
                        {playingId === recording.id ? (
                          <Pause className="text-slate-700 dark:text-slate-300" size={18} />
                        ) : (
                          <Play className="text-slate-700 dark:text-slate-300" size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => downloadRecording(recording)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="text-slate-700 dark:text-slate-300" size={18} />
                      </button>
                      <button
                        onClick={() => deleteRecording(recording.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="text-red-600 dark:text-red-400" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </BetaGuard>
  );
}
