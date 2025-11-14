import React from 'react';
import { PlusCircle, TrendingUp, Clock, Award, ChevronRight } from 'lucide-react';
import Button from '../../components/UI/Button';
import InterviewCard from '../../components/Cards/InterviewCard';
import { Interview } from '../../types';
import { mockInterviews } from '../../data/mockData';

interface DashboardPageProps {
  onCreateInterview: () => void;
  onViewInterview: (interview: Interview) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onCreateInterview, onViewInterview }) => {
  const completedInterviews = mockInterviews.filter(i => i.status === 'completed');
  const averageScore = completedInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / completedInterviews.length;
  const totalHours = mockInterviews.reduce((acc, i) => acc + i.duration, 0) / 60;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Track your interview progress and create new practice sessions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Interviews</p>
                <p className="text-2xl font-bold text-white mt-1">{mockInterviews.length}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Average Score</p>
                <p className="text-2xl font-bold text-white mt-1">{averageScore.toFixed(1)}/10</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Practice Hours</p>
                <p className="text-2xl font-bold text-white mt-1">{totalHours.toFixed(1)}h</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Create Interview CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready for your next interview?</h2>
          <p className="text-blue-100 mb-6">Practice with our AI interviewer and get instant feedback</p>
          <Button
            onClick={onCreateInterview}
            variant="primary"
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Interview
          </Button>
        </div>

        {/* Interview History */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Interviews</h2>
            <button className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onClick={() => onViewInterview(interview)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;