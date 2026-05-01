import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  Mic, Brain, BarChart3, Sparkles, Shield, Zap, 
  ArrowRight, CheckCircle, Star, Play, ChevronRight,
  Target, TrendingUp, Users, Award, Clock, MessageSquare,
  Headphones, Video, FileText
} from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

/* ──── animated counter ──── */
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ──── feature card ──── */
const FeatureCard = ({ icon: Icon, title, description, delay }: {
  icon: React.ElementType; title: string; description: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass-card-hover p-8 group"
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-7 h-7 text-brand-400" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-surface-400 leading-relaxed">{description}</p>
  </motion.div>
);

/* ──── step card ──── */
const StepCard = ({ number, title, description, delay }: {
  number: string; title: string; description: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative text-center group"
  >
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/50 transition-shadow duration-300">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-surface-400 leading-relaxed max-w-xs mx-auto">{description}</p>
  </motion.div>
);

/* ──── testimonial card ──── */
const TestimonialCard = ({ name, role, content, rating, delay }: {
  name: string; role: string; content: string; rating: number; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-8"
  >
    <div className="flex mb-4">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-5 h-5 text-accent-400 fill-accent-400" />
      ))}
    </div>
    <p className="text-surface-300 leading-relaxed mb-6 italic">"{content}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
        {name.charAt(0)}
      </div>
      <div>
        <div className="text-white font-medium text-sm">{name}</div>
        <div className="text-surface-500 text-xs">{role}</div>
      </div>
    </div>
  </motion.div>
);


const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-surface-950">
      {/* ═══ Noise overlay ═══ */}
      <div className="noise-overlay" />

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated blobs */}
        <div className="hero-blob w-[600px] h-[600px] bg-brand-500 -top-40 -left-40 animate-float" />
        <div className="hero-blob w-[500px] h-[500px] bg-accent-500 -bottom-40 -right-40 animate-float-delayed" />
        <div className="hero-blob w-[400px] h-[400px] bg-brand-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-brand-300 text-sm font-medium">AI-Powered Interview Preparation</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8"
          >
            <span className="text-white">Ace every interview with </span>
            <span className="gradient-text">AI coaching</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-surface-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Practice with a realistic AI interviewer that listens, adapts, and gives you
            detailed feedback — so you walk into your real interview with confidence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <SignedOut>
              <button onClick={() => navigate('/signup')} className="btn-primary text-lg px-8 py-4 gap-2">
                Start Practicing Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary text-lg px-8 py-4 gap-2">
                Sign In
              </button>
            </SignedOut>
            <SignedIn>
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-lg px-8 py-4 gap-2">
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </SignedIn>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 text-surface-500"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['bg-brand-500', 'bg-accent-500', 'bg-blue-500', 'bg-purple-500'].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-surface-950 flex items-center justify-center text-white text-xs font-bold`}>
                    {['S', 'A', 'M', 'R'][i]}
                  </div>
                ))}
              </div>
              <span className="text-sm">Join 2,000+ job seekers</span>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-accent-400 fill-accent-400" />
              ))}
              <span className="text-sm ml-1">4.9/5 rating</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-surface-600 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 border-2 border-surface-600 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-1"
            />
          </div>
        </motion.div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative z-10 -mt-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 2000, suffix: '+', label: 'Active Users' },
              { value: 15000, suffix: '+', label: 'Interviews Completed' },
              { value: 95, suffix: '%', label: 'Success Rate' },
              { value: 4.9, suffix: '/5', label: 'User Rating' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value === 4.9 ? (
                    <span>4.9<span className="text-surface-500">/5</span></span>
                  ) : (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <div className="text-surface-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-brand-400 text-xs font-semibold uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything you need to <span className="gradient-text">land the job</span>
            </h2>
            <p className="text-surface-400 text-lg max-w-2xl mx-auto">
              Our AI interviewer simulates real interview conditions with voice interaction, 
              adaptive questioning, and comprehensive feedback analysis.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Mic} title="Voice-First Interview" description="Practice with natural voice interaction. Speak your answers just like in a real interview, and get transcribed responses for review." delay={0} />
            <FeatureCard icon={Brain} title="AI Adaptive Questions" description="Our AI adjusts difficulty based on your responses, ensuring you're always challenged at the right level for maximum growth." delay={0.1} />
            <FeatureCard icon={BarChart3} title="Detailed Analytics" description="Get comprehensive scores on communication, problem-solving, confidence, and technical knowledge after every session." delay={0.2} />
            <FeatureCard icon={Video} title="Video Practice Mode" description="Enable camera for facial expression analysis. Get feedback on body language and non-verbal communication cues." delay={0.3} />
            <FeatureCard icon={Target} title="Role-Specific Prep" description="Tailored questions for any role — from software engineering and product management to data science and design." delay={0.4} />
            <FeatureCard icon={FileText} title="Instant Report Cards" description="Receive actionable feedback reports highlighting your strengths, areas for improvement, and specific suggestions." delay={0.5} />
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-950/30 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 mb-6">
              <Play className="w-3.5 h-3.5 text-accent-400" />
              <span className="text-accent-400 text-xs font-semibold uppercase tracking-wider">How It Works</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Start practicing in <span className="gradient-text">3 easy steps</span>
            </h2>
            <p className="text-surface-400 text-lg max-w-2xl mx-auto">
              Set up your mock interview in under a minute and start receiving expert-level feedback instantly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-brand-500/50 via-brand-400/50 to-brand-500/50" />
            
            <StepCard number="1" title="Configure Your Session" description="Choose your target role, interview type, experience level, and number of questions." delay={0} />
            <StepCard number="2" title="Practice with AI" description="Answer questions via voice. Our AI interviewer listens and asks follow-up questions naturally." delay={0.15} />
            <StepCard number="3" title="Get Your Report" description="Receive a detailed feedback report with scores, strengths, and actionable improvement areas." delay={0.3} />
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
              <Users className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-brand-400 text-xs font-semibold uppercase tracking-wider">Testimonials</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Loved by <span className="gradient-text">job seekers</span>
            </h2>
            <p className="text-surface-400 text-lg max-w-2xl mx-auto">
              See what our users have to say about their interview preparation experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Priya Sharma"
              role="Software Engineer at Google"
              content="InterviewPath's AI interviewer felt incredibly realistic. The adaptive questioning pushed me to think deeper, and the detailed feedback helped me identify blind spots I didn't know I had."
              rating={5}
              delay={0}
            />
            <TestimonialCard
              name="Alex Chen"
              role="Product Manager at Meta"
              content="I practiced 10+ sessions before my PM interview. The behavioral question practice was spot-on, and the confidence score tracking helped me monitor my progress over time."
              rating={5}
              delay={0.1}
            />
            <TestimonialCard
              name="Rahul Patel"
              role="Data Scientist at Amazon"
              content="The voice-first approach makes practice sessions feel natural. I could practice anywhere, anytime. The technical question quality is on par with actual FAANG interviews."
              rating={5}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-surface-900" />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%),
                                radial-gradient(circle at 70% 50%, rgba(20,184,154,0.2) 0%, transparent 60%)`
            }} />

            <div className="relative z-10 p-12 md:p-16 text-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to nail your next interview?
              </h2>
              <p className="text-brand-200 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of professionals who've transformed their interview skills
                with AI-powered practice sessions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SignedOut>
                  <button onClick={() => navigate('/signup')} className="bg-white text-surface-900 hover:bg-surface-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl inline-flex items-center gap-2">
                    Get Started — It's Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </SignedOut>
                <SignedIn>
                  <button onClick={() => navigate('/create')} className="bg-white text-surface-900 hover:bg-surface-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl inline-flex items-center gap-2">
                    Start a New Interview
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </SignedIn>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/5 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">InterviewPath</span>
              </div>
              <p className="text-surface-500 leading-relaxed max-w-sm">
                AI-powered interview preparation platform that helps you practice, 
                improve, and land your dream job with confidence.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                {['Features', 'How It Works', 'Pricing', 'FAQ'].map(link => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(/\s/g, '-')}`} className="text-surface-500 hover:text-brand-400 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Contact', 'Privacy Policy'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-surface-500 hover:text-brand-400 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-surface-600 text-sm">
              © {new Date().getFullYear()} InterviewPath. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-surface-600 hover:text-brand-400 transition-colors text-sm">Terms</a>
              <a href="#" className="text-surface-600 hover:text-brand-400 transition-colors text-sm">Privacy</a>
              <a href="#" className="text-surface-600 hover:text-brand-400 transition-colors text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
