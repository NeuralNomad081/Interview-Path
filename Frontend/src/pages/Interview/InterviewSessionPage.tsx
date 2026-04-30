import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, VideoOff, Video, MessageSquare, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';

const InterviewSessionPage: React.FC<{onComplete?: () => void}> = ({onComplete}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const config = location.state?.config || { questionCount: 5, role: 'General' };

  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{speaker: string, message: string}[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch('http://localhost:8000/interview/start', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ topic: config.role })
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
  }, [token, config.role]);

  const playAudio = async (rId: string) => {
    setIsAiSpeaking(true);
    try {
      const res = await fetch(`http://localhost:8000/interview/question/audio/${rId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => setIsAiSpeaking(false);
        audio.play();
      } else {
        setIsAiSpeaking(false);
      }
    } catch {
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
        // Create webm blob combining audio and potential video if camera was on
        const audioBlob = new Blob(audioChunksRef.current, { type: 'video/webm' });
        await submitAnswer(audioBlob);
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
      // We don't stop the stream tracks anymore here, because the video preview uses them
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
      startRecording();
    }
  };

  const submitAnswer = async (audioBlob: Blob) => {
    if (!roundId) return;
    setLoading(true);
    const audioFormData = new FormData();
    audioFormData.append('audio_file', audioBlob, 'answer.webm');

    try {
      if (isVideoOn) {
        const videoFormData = new FormData();
        videoFormData.append('video_file', audioBlob, 'answer.webm');
        
        // Let facial emotion process in the background without awaiting to block UX strictly
        fetch(`http://localhost:8000/interview/answer/video/${roundId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: videoFormData
        }).catch(e => console.error("Facial submission silent error:", e));
      }

      const res = await fetch(`http://localhost:8000/interview/answer/audio/${roundId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: audioFormData
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
      toast.success("Interview completed!");
      if (onComplete) onComplete();
      else navigate(`/feedback/${sessionId}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/interview/next/${sessionId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ topic: config.role, difficulty: config.experienceLevel || "medium" })
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Interview in Progress</span>
            <div className="text-gray-400 text-sm">
              Question {currentQuestion} of {config.questionCount}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeElapsed)}
            </div>
            <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
              Exit
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Section */}
        <div className="flex-1 bg-gray-900 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[60vh]">
            {/* User Video */}
            <div className="relative bg-gray-800 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10" />
              {isVideoOn ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover transform scale-x-[-1]" 
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-gray-500" />
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 z-20">
                <span className="bg-black/50 px-3 py-1 rounded-full text-white text-sm">You</span>
              </div>
            </div>

            {/* AI Interviewer */}
            <div className="relative bg-gray-800 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10" />
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className={`text-6xl transition-all duration-500 ${
                  isAiSpeaking ? 'scale-110 animate-pulse' : 'scale-100'
                }`}>
                  🤖
                </div>
                {isAiSpeaking && (
                  <div className="absolute inset-0 border-4 border-blue-400 rounded-xl animate-ping" />
                )}
              </div>
              
              <div className="absolute bottom-4 left-4 z-20">
                <span className="bg-black/50 px-3 py-1 rounded-full text-white text-sm flex items-center">
                  AI Interviewer
                  {isAiSpeaking && (
                    <div className="ml-2 flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={toggleRecording}
              disabled={loading || isAiSpeaking}
              className={`p-4 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              } disabled:opacity-50`}
              title={isRecording ? "Stop Recording & Submit" : "Start Recording"}
            >
              {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-colors ${
                isVideoOn
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            
            <Button
              onClick={handleNextQuestion}
              variant="primary"
              disabled={loading || isRecording}
            >
              {currentQuestion >= config.questionCount ? 'Complete Interview' : 'Next Question'}
            </Button>
          </div>
        </div>

        {/* Transcript Panel */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Live Transcript
            </h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {transcript.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.speaker === 'AI'
                    ? 'bg-blue-500/20 border-l-4 border-blue-500'
                    : 'bg-gray-700 border-l-4 border-green-500'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">{message.speaker}</div>
                <div className="text-white text-sm">{message.message || (loading && message.speaker === 'You' ? 'Processing...' : '')}</div>
              </div>
            ))}
            
            {loading && !isRecording && (
               <div className="text-center text-gray-500 text-sm italic">Loading...</div>
            )}
            
            {isAiSpeaking && (
              <div className="p-3 rounded-lg bg-blue-500/20 border-l-4 border-blue-500">
                <div className="text-xs text-gray-400 mb-1">AI</div>
                <div className="text-white text-sm flex items-center">
                  <span>Speaking...</span>
                  <div className="ml-2 flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSessionPage;