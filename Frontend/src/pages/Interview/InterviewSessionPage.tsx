import React, { useState, useEffect } from 'react';
import { Mic, MicOff, VideoOff, Video, MessageSquare, Clock } from 'lucide-react';
import Button from '../../components/UI/Button';
import { InterviewConfig } from '../../types';

interface InterviewSessionPageProps {
  config: InterviewConfig;
  onComplete: () => void;
}

const InterviewSessionPage: React.FC<InterviewSessionPageProps> = ({ config, onComplete }) => {
  const [isRecording, setIsRecording] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([
    { speaker: 'AI', message: 'Hello! I\'m excited to conduct your interview today. Let\'s start with the first question.' },
    { speaker: 'AI', message: 'Can you tell me about yourself and why you\'re interested in this role?' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate AI speaking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAiSpeaking(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const simulateNextQuestion = () => {
    if (currentQuestion < config.questionCount) {
      setCurrentQuestion(prev => prev + 1);
      const questions = [
        'What is your experience with React and modern JavaScript frameworks?',
        'Describe a challenging project you worked on and how you overcame obstacles.',
        'How do you handle tight deadlines and pressure in your work?',
        'What are your thoughts on test-driven development?'
      ];
      
      const newMessage = {
        speaker: 'AI' as const,
        message: questions[currentQuestion - 1] || 'Tell me about your problem-solving approach.'
      };
      
      setTranscript(prev => [...prev, newMessage]);
    } else {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
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
            <Button onClick={onComplete} variant="outline" size="sm">
              End Interview
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Section */}
        <div className="flex-1 bg-gray-900 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* User Video */}
            <div className="relative bg-gray-800 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10" />
              {isVideoOn ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="text-6xl">👤</div>
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
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full transition-colors ${
                isVideoOn
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            
            <Button
              onClick={simulateNextQuestion}
              variant="primary"
              disabled={currentQuestion >= config.questionCount}
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
                <div className="text-white text-sm">{message.message}</div>
              </div>
            ))}
            
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