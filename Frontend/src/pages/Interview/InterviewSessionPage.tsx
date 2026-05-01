import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, VideoOff, Video, MessageSquare, Clock, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Button from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';
import { apiUrl, authHeader } from '../../lib/api';

const InterviewSessionPage: React.FC<{onComplete?: () => void}> = ({onComplete}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const config = location.state?.config || { questionCount: 5, role: 'General' };

  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{speaker: string, message: string}[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isAiSpeaking]);

  // Initialize session
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initSession = async () => {
      try {
        const token = await getToken();
        const res = await fetch(apiUrl('/interview/start'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(token),
          },
          body: JSON.stringify({ topic: config.role }),
        });
        if (!res.ok) throw new Error('Failed to start session');
        const data = await res.json();
        setSessionId(data.id);
        const firstRound = data.rounds[0];
        setRoundId(firstRound.id);
        setTranscript([{ speaker: 'AI', message: firstRound.question }]);
        
        // Play audio for the first question
        playAudio(firstRound.id);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, config.role]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async (rId: string) => {
    if (!audioRef.current) return;
    setIsAiSpeaking(true);
    
    const url = apiUrl(`/interview/question/audio/${rId}`);
    console.log("Playing audio from:", url);
    
    audioRef.current.src = url;
    audioRef.current.volume = 1.0;
    audioRef.current.load();
    
    audioRef.current.onloadedmetadata = () => {
      console.log("Audio loaded. Duration:", audioRef.current?.duration);
    };
    audioRef.current.onended = () => setIsAiSpeaking(false);
    audioRef.current.onerror = (e) => {
      console.error("Audio playback error:", e);
      setIsAiSpeaking(false);
    };
    
    try {
      await audioRef.current.play();
    } catch (err) {
      console.error("Audio play failed (interaction required?):", err);
      setIsAiSpeaking(false);
    }
  };

  useEffect(() => {
    if (isVideoOn) {
      const getStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          toast.error('Camera/Microphone access denied');
          setIsVideoOn(false);
        }
      };
      getStream();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOn]);

  const startRecording = async () => {
    try {
      let stream = streamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Use video/webm if we have video, otherwise audio/webm
        const mimeType = isVideoOn ? 'video/webm' : 'audio/webm';
        const recordedBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await submitAnswer(recordedBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Keep the stream alive if video is on, otherwise stop it
      if (!isVideoOn && streamRef.current) {
         streamRef.current.getTracks().forEach(track => track.stop());
         streamRef.current = null;
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (isAiSpeaking) {
        toast.error('Wait for AI to finish speaking');
        return;
      }
      startRecording();
    }
  };

  const submitAnswer = async (recordedBlob: Blob) => {
    if (!roundId) return;
    setLoading(true);
    const audioFormData = new FormData();
    // Use .webm as the extension since that's what browser records
    audioFormData.append('audio_file', recordedBlob, 'answer.webm');

    try {
      const token = await getToken();
      if (isVideoOn) {
        const videoFormData = new FormData();
        videoFormData.append('video_file', recordedBlob, 'answer.webm');
        
        // Let facial emotion process in the background without blocking UX
        fetch(apiUrl(`/interview/answer/video/${roundId}`), {
          method: 'POST',
          headers: authHeader(token),
          body: videoFormData,
        }).catch(e => console.error('Facial submission error:', e));
      }

      const res = await fetch(apiUrl(`/interview/answer/audio/${roundId}`), {
        method: 'POST',
        headers: authHeader(token),
        body: audioFormData,
      });
      if (!res.ok) throw new Error('Failed to submit answer');
      const data = await res.json();
      setTranscript(prev => [...prev, { speaker: 'You', message: data.transcript }]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestion >= config.questionCount) {
      setLoading(true);
      try {
        const token = await getToken();
        await fetch(apiUrl(`/interview/end/${sessionId}`), {
          method: 'POST',
          headers: authHeader(token),
        });
        toast.success('Interview completed!');
        navigate(`/feedback/${sessionId}`);
      } catch (err: any) {
        navigate(`/feedback/${sessionId}`);
      }
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(apiUrl(`/interview/next/${sessionId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(token),
        },
        body: JSON.stringify({ topic: config.role, difficulty: config.experienceLevel || 'medium' }),
      });
      if (!res.ok) throw new Error('Failed to fetch next question');
      const data = await res.json();
      setRoundId(data.id);
      setCurrentQuestion(prev => prev + 1);
      setTranscript(prev => [...prev, { speaker: 'AI', message: data.question }]);
      playAudio(data.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (window.confirm('Are you sure you want to end the interview early? You will still receive feedback for the questions you completed.')) {
      setLoading(true);
      try {
        const token = await getToken();
        await fetch(apiUrl(`/interview/end/${sessionId}`), {
          method: 'POST',
          headers: authHeader(token),
        });
        navigate(`/feedback/${sessionId}`);
      } catch (err: any) {
        toast.error('Failed to end interview properly: ' + err.message);
        navigate(`/feedback/${sessionId}`);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentQuestion / config.questionCount) * 100;

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Header */}
      <div className="bg-surface-900/80 backdrop-blur-xl border-b border-white/5 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white font-medium text-sm">Interview in Progress</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-surface-500 text-xs">Question</span>
              <span className="text-white font-semibold text-sm">{currentQuestion}/{config.questionCount}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-surface-400 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
            <Button onClick={endInterview} variant="outline" size="sm" className="!border-red-500/20 !text-red-400 hover:!bg-red-500/10">
              <LogOut className="w-3.5 h-3.5" />
              End Interview
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-7xl mx-auto mt-3">
          <div className="w-full bg-white/5 rounded-full h-1">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Section */}
        <div className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
            {/* User Video */}
            <div className="relative rounded-2xl overflow-hidden glass-card">
              {isVideoOn ? (
                <div className="w-full h-full bg-surface-900 flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover transform scale-x-[-1]" 
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-surface-900/50 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-surface-600" />
                  </div>
                  <span className="text-surface-600 text-sm">Camera is off</span>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 z-20">
                <span className="bg-surface-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-medium border border-white/10">
                  You
                </span>
              </div>

              {isRecording && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-red-500/30">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-medium">Recording</span>
                </div>
              )}
            </div>

            {/* AI Interviewer */}
            <div className="relative rounded-2xl overflow-hidden glass-card">
              <div className="w-full h-full bg-gradient-to-br from-brand-600/20 via-surface-900 to-brand-800/20 flex items-center justify-center">
                <div className={`relative transition-all duration-500 ${isAiSpeaking ? 'scale-110' : 'scale-100'}`}>
                  {/* Animated rings */}
                  {isAiSpeaking && (
                    <>
                      <div className="absolute inset-[-20px] border-2 border-brand-400/20 rounded-full animate-ping" />
                      <div className="absolute inset-[-40px] border border-brand-400/10 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                    </>
                  )}
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl shadow-brand-500/20">
                    <span className="text-4xl">🤖</span>
                  </div>
                </div>
                
                {/* Repeat Audio Button */}
                {!isAiSpeaking && roundId && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => playAudio(roundId)}
                    className="absolute top-4 right-4 z-30 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm border border-white/10"
                    title="Repeat Question"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
              
              <div className="absolute bottom-4 left-4 z-20">
                <span className="bg-surface-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-medium border border-white/10 flex items-center gap-2">
                  AI Interviewer
                  {isAiSpeaking && (
                    <div className="flex gap-0.5">
                      <div className="w-1 h-3 bg-brand-400 rounded-full animate-bounce" />
                      <div className="w-1 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center mt-6 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecording}
              disabled={loading || isAiSpeaking}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse-glow'
                  : 'bg-white/5 border border-white/10 text-surface-400 hover:bg-white/10 hover:text-white hover:border-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isRecording ? "Stop Recording & Submit" : "Start Recording"}
            >
              {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                isVideoOn
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'bg-white/5 border border-white/10 text-surface-400 hover:bg-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </motion.button>
            
            <Button
              onClick={handleNextQuestion}
              variant="primary"
              disabled={loading || isRecording || isAiSpeaking}
              size="lg"
            >
              {currentQuestion >= config.questionCount ? 'Complete Interview' : 'Next Question'}
            </Button>
          </div>
        </div>

        {/* Transcript Panel */}
        <div className="w-80 lg:w-96 bg-surface-900/50 backdrop-blur-xl border-l border-white/5 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              Live Transcript
            </h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <AnimatePresence>
              {transcript.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl text-sm ${
                    message.speaker === 'AI'
                      ? 'bg-brand-500/10 border border-brand-500/20'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className={`text-xs mb-1.5 font-medium ${
                    message.speaker === 'AI' ? 'text-brand-400' : 'text-surface-500'
                  }`}>
                    {message.speaker === 'AI' ? '🤖 AI Interviewer' : '👤 You'}
                  </div>
                  <div className="text-surface-300 leading-relaxed">
                    {message.message || (loading && message.speaker === 'You' ? 'Processing...' : '')}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && !isRecording && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                <span className="text-surface-500 text-xs">Processing...</span>
              </div>
            )}
            
            {isAiSpeaking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20"
              >
                <div className="text-xs text-brand-400 mb-1.5 font-medium">🤖 AI Interviewer</div>
                <div className="text-surface-300 text-sm flex items-center gap-2">
                  <span>Speaking</span>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-2 bg-brand-400 rounded-full animate-bounce" />
                    <div className="w-1 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default InterviewSessionPage;