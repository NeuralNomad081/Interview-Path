import React from 'react';
import { Calendar, Clock, Award, ChevronRight } from 'lucide-react';
import { Interview } from '../../types';
import { techStackIcons } from '../../data/mockData';

interface InterviewCardProps {
  interview: Interview;
  onClick: () => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, onClick }) => {
  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'in-progress':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'scheduled':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
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
    <div 
      onClick={onClick}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all cursor-pointer group hover:shadow-xl hover:shadow-blue-500/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{interview.companyLogo}</div>
          <div>
            <h3 className="text-white font-semibold text-lg">{interview.role}</h3>
            <p className="text-gray-400 text-sm">{interview.company}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(interview.date)}
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          {interview.duration} minutes
        </div>
        {interview.score && (
          <div className="flex items-center text-gray-400 text-sm">
            <Award className="w-4 h-4 mr-2" />
            Score: {interview.score}/10
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {interview.techStack.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md bg-gray-700 text-gray-300 text-xs"
              title={tech}
            >
              {techStackIcons[tech] || '🔧'} {tech}
            </span>
          ))}
          {interview.techStack.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-700 text-gray-300 text-xs">
              +{interview.techStack.length - 3}
            </span>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
          interview.type === 'technical' ? 'bg-blue-500/20 text-blue-400' :
          interview.type === 'behavioral' ? 'bg-green-500/20 text-green-400' :
          'bg-purple-500/20 text-purple-400'
        }`}>
          {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview
        </span>
      </div>
    </div>
  );
};

export default InterviewCard;