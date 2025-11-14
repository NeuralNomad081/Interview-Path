import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Mic, MicOff } from 'lucide-react';
import Button from '../../components/UI/Button';
import { InterviewConfig } from '../../types';
import { toast } from 'sonner';

interface CreateInterviewPageProps {
  onBack: () => void;
  onStartInterview: (config: InterviewConfig) => void;
}

const CreateInterviewPage: React.FC<CreateInterviewPageProps> = ({ onBack, onStartInterview }) => {
  const [step, setStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [config, setConfig] = useState<Partial<InterviewConfig>>({
    role: '',
    type: 'technical',
    experienceLevel: 'mid',
    questionCount: 5,
    technologies: []
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleStartInterview();
    }
  };

  const handleStartInterview = () => {
    if (!config.role) {
      toast.error('Please specify the role you\'re interviewing for');
      return;
    }

    onStartInterview(config as InterviewConfig);
    toast.success('Interview created successfully! Good luck!');
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.info('Voice input activated. Speak now...');
      // In a real app, this would start speech recognition
      setTimeout(() => {
        setIsListening(false);
        toast.success('Voice input processed');
      }, 3000);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">What role are you interviewing for?</h2>
              <p className="text-gray-400">Tell me about the position you're preparing for</p>
            </div>
            
            <div className="relative">
              <textarea
                value={config.role || ''}
                onChange={(e) => setConfig({...config, role: e.target.value})}
                placeholder="e.g., Senior Frontend Developer, Product Manager, Data Scientist..."
                className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={toggleVoiceInput}
                className={`absolute bottom-3 right-3 p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">What type of interview?</h2>
              <p className="text-gray-400">Choose the focus of your practice session</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'technical', label: 'Technical', desc: 'Coding & problem solving', icon: '💻' },
                { value: 'behavioral', label: 'Behavioral', desc: 'Soft skills & experiences', icon: '🗣️' },
                { value: 'mixed', label: 'Mixed', desc: 'Combination of both', icon: '🔄' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setConfig({...config, type: option.value as any})}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    config.type === option.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-3">{option.icon}</div>
                  <h3 className="text-white font-semibold mb-1">{option.label}</h3>
                  <p className="text-gray-400 text-sm">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">What's your experience level?</h2>
              <p className="text-gray-400">This helps me adjust the difficulty</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'entry', label: '0-2 years', desc: 'Entry level position', icon: '🌱' },
                { value: 'mid', label: '3-7 years', desc: 'Mid-level experience', icon: '🌳' },
                { value: 'senior', label: '8+ years', desc: 'Senior level role', icon: '🌲' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setConfig({...config, experienceLevel: option.value as any})}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    config.experienceLevel === option.value
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-3">{option.icon}</div>
                  <h3 className="text-white font-semibold mb-1">{option.label}</h3>
                  <p className="text-gray-400 text-sm">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">How many questions?</h2>
              <p className="text-gray-400">Choose the length of your interview session</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[3, 5, 8, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => setConfig({...config, questionCount: count})}
                  className={`p-6 rounded-xl border-2 transition-all text-center ${
                    config.questionCount === count
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl font-bold text-white mb-1">{count}</div>
                  <div className="text-gray-400 text-sm">
                    {count === 3 ? 'Quick' : count === 5 ? 'Standard' : count === 8 ? 'Extended' : 'Complete'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Any specific technologies?</h2>
              <p className="text-gray-400">Optional: Add technologies you want to focus on</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'AWS', 'Docker', 'MongoDB'].map((tech) => (
                <button
                  key={tech}
                  onClick={() => {
                    const technologies = config.technologies || [];
                    const newTechnologies = technologies.includes(tech)
                      ? technologies.filter(t => t !== tech)
                      : [...technologies, tech];
                    setConfig({...config, technologies: newTechnologies});
                  }}
                  className={`p-3 rounded-lg border transition-all text-sm ${
                    config.technologies?.includes(tech)
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="text-sm text-gray-400">
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={() => setStep(Math.max(1, step - 1))}
            variant="outline"
            disabled={step === 1}
          >
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            variant="primary"
          >
            {step === totalSteps ? (
              <>
                Start Interview
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateInterviewPage;