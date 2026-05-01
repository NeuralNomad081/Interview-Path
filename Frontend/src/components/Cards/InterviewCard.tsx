import React from 'react';
import { Calendar, Clock, Award, ChevronRight, Trash2 } from 'lucide-react';
import { Interview } from '../../types';
import { techStackIcons } from '../../data/mockData';
import { motion } from 'framer-motion';

interface InterviewCardProps {
  interview: Interview;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, onClick, onDelete }) => {
  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'in-progress':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'scheduled':
        return 'text-brand-400 bg-brand-400/10 border-brand-400/20';
      default:
        return 'text-surface-400 bg-surface-400/10 border-surface-400/20';
    }
  };

  const getTypeColor = (type: Interview['type']) => {
    switch (type) {
      case 'technical':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'behavioral':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="glass-card p-6 cursor-pointer group hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 relative"
    >
      {/* Status indicator line */}
      <div className={`absolute top-0 left-6 right-6 h-px ${
        interview.status === 'completed' ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent' :
        interview.status === 'in-progress' ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' :
        'bg-gradient-to-r from-transparent via-brand-500 to-transparent'
      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{interview.companyLogo}</div>
          <div>
            <h3 className="text-white font-semibold text-base leading-tight">{interview.role}</h3>
            <p className="text-surface-500 text-sm mt-0.5">{interview.company}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(interview.status)}`}>
            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this interview?')) {
                  onDelete(interview.id);
                }
              }}
              className="p-1.5 text-surface-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="Delete Interview"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-surface-500 text-sm">
          <Calendar className="w-3.5 h-3.5 mr-2" />
          {formatDate(interview.date)}
        </div>
        <div className="flex items-center text-surface-500 text-sm">
          <Clock className="w-3.5 h-3.5 mr-2" />
          {interview.duration} minutes
        </div>
        {interview.score && (
          <div className="flex items-center text-surface-500 text-sm">
            <Award className="w-3.5 h-3.5 mr-2 text-brand-400" />
            <span className="text-brand-400 font-medium">Score: {interview.score}/10</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {interview.techStack.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 text-surface-400 text-xs border border-white/5"
              title={tech}
            >
              {techStackIcons[tech] || '🔧'} {tech}
            </span>
          ))}
          {interview.techStack.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 text-surface-500 text-xs border border-white/5">
              +{interview.techStack.length - 3}
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all duration-200" />
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getTypeColor(interview.type)}`}>
          {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview
        </span>
      </div>
    </motion.div>
  );
};

export default InterviewCard;