import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
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
      setDirection(1);
      setStep(step + 1);
    } else {
      handleStartInterview();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
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

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -100 : 100, opacity: 0 }),
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">What role are you interviewing for?</h2>
              <p className="text-surface-500">Tell me about the position you're preparing for</p>
            </div>
            
            <div className="relative">
              <textarea
                value={config.role || ''}
                onChange={(e) => setConfig({...config, role: e.target.value})}
                placeholder="e.g., Senior Frontend Developer, Product Manager, Data Scientist..."
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-surface-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all duration-200 hover:border-white/20"
              />
              <button
                onClick={toggleVoiceInput}
                className={`absolute bottom-3 right-3 p-2.5 rounded-xl transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 animate-pulse' 
                    : 'bg-white/5 text-surface-400 hover:bg-white/10 hover:text-white border border-white/10'
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
              <p className="text-surface-500">Choose the focus of your practice session</p>
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
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                    config.type === option.value
                      ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{option.icon}</div>
                  <h3 className="text-white font-semibold mb-1">{option.label}</h3>
                  <p className="text-surface-500 text-sm">{option.desc}</p>
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
              <p className="text-surface-500">This helps me adjust the difficulty</p>
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
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                    config.experienceLevel === option.value
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{option.icon}</div>
                  <h3 className="text-white font-semibold mb-1">{option.label}</h3>
                  <p className="text-surface-500 text-sm">{option.desc}</p>
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
              <p className="text-surface-500">Choose the length of your interview session</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { count: 3, label: 'Quick', time: '~10 min' },
                { count: 5, label: 'Standard', time: '~20 min' },
                { count: 8, label: 'Extended', time: '~30 min' },
                { count: 10, label: 'Complete', time: '~45 min' }
              ].map(({ count, label, time }) => (
                <button
                  key={count}
                  onClick={() => setConfig({...config, questionCount: count})}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center ${
                    config.questionCount === count
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="text-3xl font-bold text-white mb-1">{count}</div>
                  <div className="text-surface-400 text-sm font-medium">{label}</div>
                  <div className="text-surface-600 text-xs mt-1">{time}</div>
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
              <p className="text-surface-500">Optional: Add technologies you want to focus on</p>
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
                  className={`p-3 rounded-xl border transition-all duration-200 text-sm font-medium ${
                    config.technologies?.includes(tech)
                      ? 'border-brand-500 bg-brand-500/15 text-brand-400 shadow-sm shadow-brand-500/10'
                      : 'border-white/10 bg-white/5 text-surface-400 hover:border-white/20 hover:text-white hover:bg-white/[0.08]'
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
    <div className="min-h-screen bg-surface-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center text-surface-500 hover:text-white transition-colors gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <div className="text-sm text-surface-500 font-medium">
            Step {step} of {totalSteps}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? 'bg-brand-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-8 md:p-10 mb-8 min-h-[350px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrev}
            variant="outline"
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            variant="primary"
          >
            {step === totalSteps ? (
              <>
                Start Interview
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateInterviewPage;