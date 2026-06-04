import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, ArrowRight, Sparkles, Target, Zap, Shield, Layers, Users, Share2, Globe, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onGetStarted, onLogin, onSignup }) {
  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-16">
          <div className="flex items-center gap-2">
            <LayoutGrid className="text-primary w-6 h-6" />
            <span className="text-lg font-bold text-on-surface">Task Orchestrator</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button className="text-on-surface-variant text-sm font-medium hover:text-secondary transition-colors">Solutions</button>
            <button className="text-on-surface-variant text-sm font-medium hover:text-secondary transition-colors">Enterprise</button>
            <button className="text-on-surface-variant text-sm font-medium hover:text-secondary transition-colors">Pricing</button>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">Login</button>
            <button 
              onClick={onSignup}
              className="px-6 py-2 text-sm font-medium bg-primary text-on-primary rounded-lg hover:opacity-80 transition-all active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="hero-gradient px-4 md:px-8 py-16 md:py-24 text-center max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-surface-container-high text-secondary border border-outline-variant rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">NEW: Enterprise Grid View</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-on-surface leading-tight">
              Master your workflow with <span className="text-secondary">surgical precision</span>.
            </h1>
            <h2 className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium">
              The professional-grade task management platform designed for high-stakes orchestration. Eliminate clutter and reclaim your peak productivity.
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-primary text-on-primary text-lg font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-surface border border-outline-variant text-on-surface text-lg font-bold rounded-xl hover:bg-surface-container-low transition-all">
                Book a Demo
              </button>
            </div>
          </motion.div>
        </section>

        {/* Bento Grid */}
        <section className="px-4 md:px-8 py-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative shadow-sm"
            >
              <div className="max-w-md space-y-4 z-10">
                <Target className="text-secondary w-10 h-10" />
                <h3 className="text-3xl font-bold text-on-surface">Universal Command Center</h3>
                <p className="text-on-surface-variant font-medium">Centralize tasks from every tool in your ecosystem. High-density views for high-performance teams who need absolute clarity.</p>
              </div>
              <div className="mt-8 rounded-xl overflow-hidden border border-outline-variant/50 z-10 bg-slate-50">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3Co0UxJ3QMdxTAxYI55Ao3hFZlHyKv2kxajfUlFlqBk2fsTo3k9uu4SFk_e138pCjpBZtRfqE32NeLzHGmTu93V-l85kapyJA_jlJOp74eNnQpAWfuwdk6kn6e8z6XzFJvxbcu6IMXOukrFwpaJyCzF9ZbMNhyxbv4qMmXeueIPA4mx_o9u1EoNbiFDVZwOFQDRsndkCc45CXbUL721Poo7zubdIUE6whU_LyuUQvHVnWfZ_w_cQpKsGrU_QG0f2V0YlFNOawA" 
                  alt="Dashboard Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            {/* Performance Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 bg-primary-container border border-outline-variant rounded-2xl p-8 text-on-primary-container flex flex-col justify-center gap-6 shadow-sm"
            >
              <div className="w-12 h-12 bg-on-primary-fixed-variant/20 rounded-xl flex items-center justify-center">
                <Zap className="text-primary-fixed w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Performance First</h3>
              <p className="font-medium opacity-80">Built with a zero-latency engine. Navigate through thousands of tasks without a single millisecond of lag. Designed for speed, tested for scale.</p>
            </motion.div>

            {/* Security Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 bg-surface border border-outline-variant rounded-2xl p-8 shadow-sm"
            >
              <div className="space-y-4">
                <Shield className="text-secondary w-8 h-8" />
                <h4 className="text-xl font-bold text-on-surface">Bank-Grade Security</h4>
                <p className="text-on-surface-variant font-medium">Your data is encrypted end-to-end with enterprise-level compliance as standard.</p>
              </div>
            </motion.div>

            {/* Hub Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 bg-surface border border-outline-variant rounded-2xl p-8 shadow-sm"
            >
              <div className="space-y-4">
                <Layers className="text-secondary w-8 h-8" />
                <h4 className="text-xl font-bold text-on-surface">Seamless Integrations</h4>
                <p className="text-on-surface-variant font-medium">Sync with Slack, GitHub, and 100+ other professional tools out of the box.</p>
              </div>
            </motion.div>

            {/* Collaboration Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 bg-secondary-container border border-outline-variant rounded-2xl p-8 text-on-secondary-container shadow-sm"
            >
              <div className="space-y-4">
                <Users className="w-8 h-8" />
                <h4 className="text-xl font-bold">Real-time Collaboration</h4>
                <p className="font-medium opacity-90">Watch updates happen live. No more status meetings, just pure execution and flow.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 border-y border-outline-variant bg-surface-container-lowest">
          <div className="px-4 md:px-8 max-w-7xl mx-auto text-center">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-12">Powering the world&apos;s most disciplined teams</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale contrast-125 font-black text-2xl">
              <span>VENTURE</span>
              <span>QUANTUM</span>
              <span>ORBITAL</span>
              <span>STRATOS</span>
              <span>AXIS</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 md:px-8 py-24 max-w-7xl mx-auto">
          <div className="bg-primary text-on-primary rounded-[2.5rem] p-12 md:p-24 text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-black relative z-10 max-w-4xl mx-auto leading-tight">Ready to orchestrate your success?</h2>
            <p className="text-lg md:text-xl text-on-primary-container max-w-xl mx-auto opacity-90 relative z-10 font-medium">Join 50,000+ professionals who have optimized their workday. Start your 14-day premium trial today.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <button 
                onClick={onSignup}
                className="px-8 py-4 bg-surface text-primary text-lg font-bold rounded-xl hover:bg-surface-container-high transition-all"
              >
                Create Free Account
              </button>
              <button className="px-8 py-4 border border-on-primary text-on-primary text-lg font-bold rounded-xl hover:bg-on-primary/10 transition-all font-sans">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface py-24 border-t border-outline-variant">
        <div className="px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <LayoutGrid className="text-primary w-6 h-6" />
              <span className="text-lg font-bold text-on-surface">Task Orchestrator</span>
            </div>
            <p className="text-sm font-medium text-on-surface-variant max-w-xs">High-density task management for professional teams. Built with precision and privacy at its core.</p>
          </div>
          <div>
            <h5 className="text-xs font-bold text-on-surface mb-6 uppercase tracking-wider">Product</h5>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><button className="hover:text-secondary transition-colors">Features</button></li>
              <li><button className="hover:text-secondary transition-colors">Integrations</button></li>
              <li><button className="hover:text-secondary transition-colors">Enterprise</button></li>
              <li><button className="hover:text-secondary transition-colors">Solutions</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-on-surface mb-6 uppercase tracking-wider">Resources</h5>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><button className="hover:text-secondary transition-colors">Documentation</button></li>
              <li><button className="hover:text-secondary transition-colors">API Reference</button></li>
              <li><button className="hover:text-secondary transition-colors">Status Page</button></li>
              <li><button className="hover:text-secondary transition-colors">Community</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-on-surface mb-6 uppercase tracking-wider">Company</h5>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><button className="hover:text-secondary transition-colors">About Us</button></li>
              <li><button className="hover:text-secondary transition-colors">Careers</button></li>
              <li><button className="hover:text-secondary transition-colors">Press Kit</button></li>
              <li><button className="hover:text-secondary transition-colors">Contact</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-on-surface mb-6 uppercase tracking-wider">Legal</h5>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><button className="hover:text-secondary transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-secondary transition-colors">Terms of Service</button></li>
              <li><button className="hover:text-secondary transition-colors">Cookie Settings</button></li>
              <li><button className="hover:text-secondary transition-colors">Compliance</button></li>
            </ul>
          </div>
        </div>
        <div className="px-4 md:px-8 max-w-7xl mx-auto pt-10 mt-16 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xs font-medium text-on-surface-variant">© 2024 Task Orchestrator. All rights reserved.</span>
          <div className="flex gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-secondary transition-colors"><Share2 className="w-5 h-5" /></button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-secondary transition-colors"><Globe className="w-5 h-5" /></button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-secondary transition-colors"><ShieldCheck className="w-5 h-5" /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}
