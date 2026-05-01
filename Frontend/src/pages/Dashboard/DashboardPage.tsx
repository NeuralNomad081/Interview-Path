import React, { useEffect, useState } from 'react';
import { PlusCircle, TrendingUp, Clock, Award, ChevronRight, BarChart3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/UI/Button';
import InterviewCard from '../../components/Cards/InterviewCard';
import { Interview } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { apiUrl, authHeader } from '../../lib/api';

interface DashboardPageProps {
  onCreateInterview: () => void;
  onViewInterview: (interview: Interview) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onCreateInterview, onViewInterview }) => {
  const { getToken, user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [getToken]);

  const fetchSessions = async () => {
    try {
      const token = await getToken();
      const res = await fetch(apiUrl('/interview/sessions'), {
        headers: authHeader(token),
      });
      if (!res.ok) throw new Error('Failed to load sessions');
      const data = await res.json();
      setInterviews(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(apiUrl(`/interview/${id}`), {
        method: 'DELETE',
        headers: authHeader(token),
      });
      if (!res.ok) throw new Error('Failed to delete interview');
      toast.success('Interview deleted successfully');
      setInterviews(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const averageScore = completedInterviews.length > 0 
    ? completedInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / completedInterviews.length 
    : 0;
  const totalHours = interviews.reduce((acc, i) => acc + (i.duration || 0), 0) / 60;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-surface-400 text-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-surface-500">Track your interview progress and start new practice sessions</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="stat-card">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-surface-500 text-sm font-medium">Total Interviews</p>
                <p className="text-3xl font-bold text-white mt-1">{interviews.length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-brand-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-surface-500 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-white mt-1">{averageScore.toFixed(1)}<span className="text-surface-600 text-lg">/10</span></p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-surface-500 text-sm font-medium">Practice Hours</p>
                <p className="text-3xl font-bold text-white mt-1">{totalHours.toFixed(1)}<span className="text-surface-600 text-lg">h</span></p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Create Interview CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-surface-900" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }} />
          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready for your next interview?</h2>
              <p className="text-brand-200 max-w-md">Practice with our AI interviewer and receive instant, detailed feedback to improve your performance.</p>
            </div>
            <Button
              onClick={onCreateInterview}
              variant="primary"
              size="lg"
              className="bg-white !text-surface-900 hover:bg-surface-100 !from-white !to-white shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              Create New Interview
            </Button>
          </div>
        </motion.div>

        {/* Interview History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Interviews</h2>
          </div>

          {interviews.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No interviews yet</h3>
              <p className="text-surface-500 mb-6 max-w-sm mx-auto">Start your first practice interview and begin tracking your progress.</p>
              <Button onClick={onCreateInterview} variant="primary">
                <PlusCircle className="w-4 h-4" />
                Start Your First Interview
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onClick={() => onViewInterview(interview)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;