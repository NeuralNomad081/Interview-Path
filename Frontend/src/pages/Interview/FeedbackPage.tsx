import React, { useEffect, useState } from 'react';
import { ArrowLeft, Award, TrendingUp, AlertCircle, CheckCircle, Star, Download, RotateCcw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Button from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';
import { apiUrl, authHeader } from '../../lib/api';

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
  const { getToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackMetrics | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = await getToken();
        const res = await fetch(apiUrl(`/interview/report/${id}`), {
          headers: authHeader(token),
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
  }, [id, getToken]);

  const ScoreCircle = ({ score, label, delay }: { score: number; label: string; delay: number }) => {
    const percentage = (score / 10) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const color = score >= 8 ? '#10B981' : score >= 6 ? '#F59E0B' : '#EF4444';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay }}
        className="flex flex-col items-center"
      >
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
              fill="none"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray }}
              transition={{ duration: 1, delay: delay + 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{score}</span>
          </div>
        </div>
        <span className="text-surface-400 text-sm text-center">{label}</span>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            <Award className="w-6 h-6 text-brand-400 absolute inset-0 m-auto" />
          </div>
          <span className="text-surface-400 text-sm">Generating AI Feedback Report...</span>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center gap-6 pt-20">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="text-red-400 w-10 h-10" />
        </div>
        <span className="text-white text-xl font-semibold">Could not load feedback report</span>
        <p className="text-surface-500 text-sm">The report may still be generating. Try again in a moment.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  const overallColor = feedback.overallScore >= 8 ? 'from-emerald-500 to-brand-500' : 
                        feedback.overallScore >= 6 ? 'from-amber-500 to-accent-500' : 
                        'from-red-500 to-orange-500';

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => { if (onBack) onBack(); else navigate('/dashboard'); }}
            className="flex items-center text-surface-500 hover:text-white transition-colors gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          <div className="text-right">
            <div className="text-xs text-surface-500 uppercase tracking-wider">Completed</div>
            <div className="text-white text-sm font-medium">{new Date().toLocaleDateString()}</div>
          </div>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative rounded-2xl overflow-hidden mb-8`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${overallColor} opacity-20`} />
          <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" />
          <div className="relative z-10 p-10 md:p-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Interview Complete!</h1>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="text-7xl font-bold text-white mb-3"
            >
              {feedback.overallScore}<span className="text-3xl text-white/50">/10</span>
            </motion.div>
            <p className="text-white/60 text-lg">Overall Performance Score</p>
          </div>
        </motion.div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <h2 className="text-lg font-semibold text-white mb-8 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 gap-8">
              <ScoreCircle score={feedback.communication} label="Communication" delay={0.3} />
              <ScoreCircle score={feedback.problemSolving} label="Problem Solving" delay={0.4} />
              <ScoreCircle score={feedback.confidence} label="Confidence" delay={0.5} />
              <ScoreCircle score={feedback.technicalKnowledge} label="Technical Knowledge" delay={0.6} />
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Strengths
              </h3>
              <div className="space-y-3">
                {feedback.strengths?.map((strength, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-surface-300 text-sm leading-relaxed">{strength}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Areas for Improvement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {feedback.areasForImprovement?.map((area, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-surface-300 text-sm leading-relaxed">{area}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Detailed Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Communication Skills', content: feedback.detailedAnalysis?.communication || 'Communication evaluation recorded.' },
              { title: 'Technical Competency', content: feedback.detailedAnalysis?.technical || 'Technical analysis completed based on candidate transcript.' },
              { title: 'Confidence & Presence', content: feedback.detailedAnalysis?.confidence || 'Confidence level perceived as satisfactory.' },
              { title: 'Overall Impression', content: feedback.detailedAnalysis?.overall || 'Good overall impression.' },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-white font-medium mb-2 text-sm">{section.title}</h4>
                <p className="text-surface-400 text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button variant="primary" size="lg" className="flex-1" onClick={() => navigate('/create')}>
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </Button>
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => window.print()}>
            <Download className="w-4 h-4" />
            Download Report
          </Button>
          <Button variant="outline" size="lg" onClick={() => { if (onBack) onBack(); else navigate('/dashboard'); }}>
            Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default FeedbackPage;