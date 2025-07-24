'use client';

import { motion } from 'framer-motion';
import Stats from './components/Stats';
import Features from './components/Features';
import CTASection from './components/CTASection';
import Benefits from './components/Benefits';

export default function LandingPage() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center snap-start bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.h1 
              className="text-[20rem] md:text-[28rem] lg:text-[35rem] tracking-tighter font-black mb-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#EFEEE7]">CLARYFY</span>
            </motion.h1>
            <motion.p 
              className="text-2xl md:text-3xl lg:text-4xl mb-12 text-[#EFEEE7]/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              ChatGPT BUILT for your classroom
            </motion.p>
            <motion.p
              className="text-lg md:text-xl lg:text-2xl mb-16 text-[#EFEEE7]/70 max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              A verified, course-aware AI copilot for students and teachers.
            </motion.p>
            <motion.a
              href="https://airtable.com/appTtkyfRpPFfB6je/shrtkG3mVFcXvyAoZ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#EFEEE7] text-black px-12 py-6 rounded-lg text-2xl font-semibold hover:bg-[#EFEEE7]/90 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Join Pilot Program
            </motion.a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="h-screen flex items-center snap-start bg-[#EFEEE7]">
        <Benefits />
      </section>

      {/* Stats Section */}
      <section className="h-screen flex items-center snap-start bg-black">
        <Stats />
      </section>

      {/* Features Section */}
      <section className="h-screen flex items-center snap-start bg-[#EFEEE7]">
        <Features />
      </section>

      {/* CTA Section */}
      <section className="h-screen flex items-center snap-start bg-black">
        <CTASection />
      </section>
    </div>
  );
} 