import React from 'react';
import { ArrowLeft, Award, TrendingUp, AlertCircle, CheckCircle, Star } from 'lucide-react';
import Button from '../../components/UI/Button';
import { FeedbackMetrics } from '../../types';

interface FeedbackPageProps {
  onBack: () => void;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ onBack }) => {
  const mockFeedback: FeedbackMetrics = {
    overallScore: 8.5,
    communication: 9,
    problemSolving: 8,
    confidence: 7,
    technicalKnowledge: 9,
    areasForImprovement: [
      'Work on explaining complex concepts more clearly',
      'Pause more to think before answering technical questions',
      'Practice discussing project challenges in more detail'
    ],
    strengths: [
      'Excellent technical knowledge and implementation skills',
      'Clear communication and well-structured responses',
      'Good understanding of best practices',
      'Confident delivery and professional demeanor'
    ]
  };

  const ScoreCircle = ({ score, label }: { score: number; label: string }) => {
    const percentage = (score / 10) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#374151"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={score >= 8 ? "#10B981" : score >= 6 ? "#F59E0B" : "#EF4444"}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{score}</span>
          </div>
        </div>
        <span className="text-gray-400 text-sm text-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Interview Completed</div>
            <div className="text-white font-medium">January 15, 2024</div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">Interview Complete!</h1>
          </div>
          <div className="text-6xl font-bold text-white mb-2">{mockFeedback.overallScore}/10</div>
          <p className="text-green-100 text-lg">Excellent Performance</p>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <ScoreCircle score={mockFeedback.communication} label="Communication" />
              <ScoreCircle score={mockFeedback.problemSolving} label="Problem Solving" />
              <ScoreCircle score={mockFeedback.confidence} label="Confidence" />
              <ScoreCircle score={mockFeedback.technicalKnowledge} label="Technical Knowledge" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Strengths */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                Strengths
              </h3>
              <div className="space-y-3">
                {mockFeedback.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Star className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {mockFeedback.areasForImprovement.map((area, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Detailed Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Communication Skills</h4>
              <p className="text-gray-400 text-sm mb-4">
                You demonstrated excellent verbal communication throughout the interview. Your responses were well-structured and easy to follow. Consider working on more concise explanations for complex technical concepts.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Technical Competency</h4>
              <p className="text-gray-400 text-sm mb-4">
                Strong technical foundation with good understanding of React and modern JavaScript. Your problem-solving approach was logical and methodical. Great job explaining your thought process.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Confidence & Presence</h4>
              <p className="text-gray-400 text-sm mb-4">
                You maintained good eye contact and spoke clearly. There were moments of hesitation during complex questions - practicing out loud can help build confidence for these situations.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Overall Impression</h4>
              <p className="text-gray-400 text-sm mb-4">
                Very strong performance overall. You would be a competitive candidate for most senior frontend positions. Focus on the improvement areas to reach the next level.
              </p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="primary" size="lg" className="flex-1">
            Schedule Another Interview
          </Button>
          <Button variant="outline" size="lg" className="flex-1">
            Download Full Report
          </Button>
          <Button variant="ghost" size="lg" onClick={onBack}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;