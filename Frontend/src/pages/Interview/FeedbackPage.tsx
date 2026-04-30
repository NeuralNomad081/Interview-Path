import React, { useEffect, useState } from 'react';
import { ArrowLeft, Award, TrendingUp, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';

interface FeedbackMetrics {
  overallScore: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  technicalKnowledge: number;
  areasForImprovement: string[];
  strengths: string[];
  detailedAnalysis?: {
    communication: string;
    technical: string;
    confidence: string;
    overall: string;
  }
}

interface FeedbackPageProps {
  onBack?: () => void;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ onBack }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackMetrics | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`http://localhost:8000/interview/report/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch interview report');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setFeedback(data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchReport();
  }, [id, token]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse flex items-center space-x-3">
          <Award className="w-8 h-8 text-blue-500 animate-spin" />
          <span>Generating AI Feedback Report...</span>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="text-red-500 w-16 h-16" />
        <span className="text-white text-xl">Could not load feedback report.</span>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => { if (onBack) onBack(); else navigate('/dashboard'); }}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Interview Completed</div>
            <div className="text-white font-medium">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">Interview Complete!</h1>
          </div>
          <div className="text-6xl font-bold text-white mb-2">{feedback.overallScore}/10</div>
          <p className="text-green-100 text-lg">Detailed Evaluation Generated</p>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <ScoreCircle score={feedback.communication} label="Communication" />
              <ScoreCircle score={feedback.problemSolving} label="Problem Solving" />
              <ScoreCircle score={feedback.confidence} label="Confidence" />
              <ScoreCircle score={feedback.technicalKnowledge} label="Technical Knowledge" />
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
                {feedback.strengths?.map((strength, index) => (
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
                {feedback.areasForImprovement?.map((area, index) => (
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
                {feedback.detailedAnalysis?.communication || 'Communication evaluation recorded.'}
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Technical Competency</h4>
              <p className="text-gray-400 text-sm mb-4">
                {feedback.detailedAnalysis?.technical || 'Technical analysis completed based on candidate transcript.'}
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Confidence & Presence</h4>
              <p className="text-gray-400 text-sm mb-4">
                {feedback.detailedAnalysis?.confidence || 'Confidence level perceived as satisfactory.'}
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Overall Impression</h4>
              <p className="text-gray-400 text-sm mb-4">
                {feedback.detailedAnalysis?.overall || 'Good overall impression.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="primary" size="lg" className="flex-1" onClick={() => navigate('/create')}>
            Schedule Another Interview
          </Button>
          <Button variant="outline" size="lg" className="flex-1" onClick={() => window.print()}>
            Download Full Report
          </Button>
          <Button variant="ghost" size="lg" onClick={() => { if (onBack) onBack(); else navigate('/dashboard'); }}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;