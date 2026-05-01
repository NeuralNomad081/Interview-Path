export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Interview {
  id: string;
  type: 'technical' | 'behavioral' | 'mixed';
  role: string;
  company: string;
  companyLogo: string;
  date: string;
  techStack: string[];
  duration: number;
  status: 'completed' | 'in-progress' | 'scheduled';
  score?: number;
}

export interface InterviewConfig {
  role: string;
  type: 'technical' | 'behavioral' | 'mixed';
  experienceLevel: 'entry' | 'mid' | 'senior';
  questionCount: number;
  technologies: string[];
}

export interface QuestionBreakdown {
  questionNumber: number;
  question: string;
  expectedAnswer: string;
  userAnswer: string;
  score: number;
  whatWasRight: string[];
  whatWasWrong: string[];
  feedback: string;
}

export interface FeedbackMetrics {
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
  };
  questionBreakdown?: QuestionBreakdown[];
}