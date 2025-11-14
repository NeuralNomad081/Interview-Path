import { Interview } from '../types';

export const mockInterviews: Interview[] = [
  {
    id: '1',
    type: 'technical',
    role: 'Frontend Developer',
    company: 'TechCorp',
    companyLogo: '🚀',
    date: '2024-01-15',
    techStack: ['React', 'TypeScript', 'Node.js'],
    duration: 45,
    status: 'completed',
    score: 8.5
  },
  {
    id: '2',
    type: 'behavioral',
    role: 'Product Manager',
    company: 'InnovateHub',
    companyLogo: '💡',
    date: '2024-01-10',
    techStack: ['Leadership', 'Analytics', 'Strategy'],
    duration: 30,
    status: 'completed',
    score: 7.8
  },
  {
    id: '3',
    type: 'mixed',
    role: 'Full Stack Developer',
    company: 'StartupXYZ',
    companyLogo: '⚡',
    date: '2024-01-08',
    techStack: ['React', 'Python', 'PostgreSQL'],
    duration: 60,
    status: 'completed',
    score: 9.2
  }
];

export const techStackIcons: Record<string, string> = {
  'React': '⚛️',
  'TypeScript': '📘',
  'Node.js': '🟢',
  'Python': '🐍',
  'PostgreSQL': '🐘',
  'JavaScript': '💛',
  'Leadership': '👥',
  'Analytics': '📊',
  'Strategy': '🎯',
  'AWS': '☁️',
  'Docker': '🐳',
  'MongoDB': '🍃'
};

export const companyLogos = ['🚀', '💡', '⚡', '🎯', '🔥', '💎', '🌟', '🎨'];