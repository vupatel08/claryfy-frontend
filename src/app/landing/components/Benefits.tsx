'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const studentBenefits = [
  'Verified lecture summaries',
  'Course-specific Q&A',
  'AI-powered Chrome extension',
  'Real coursework integration',
  'Smart study materials',
  'Instant concept explanations'
];

const teacherBenefits = [
  'Full visibility into AI usage',
  'Student confusion insights',
  'Content review controls',
  'Usage pattern analytics',
  'Approve AI-generated content',
  'Track learning progress'
];

export default function Benefits() {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');

  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <motion.h2 
        className="text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-black text-center mb-20 text-black"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        Built for Everyone
      </motion.h2>

      {/* Mobile Toggle */}
      <div className="md:hidden mb-12 flex justify-center">
        <div className="bg-black/10 p-1 rounded-xl inline-flex items-center">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-8 py-3 rounded-lg text-lg font-medium transition-all ${
              activeTab === 'students'
                ? 'bg-black text-[#EFEEE7]'
                : 'text-black/70 hover:text-black'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-8 py-3 rounded-lg text-lg font-medium transition-all ${
              activeTab === 'teachers'
                ? 'bg-black text-[#EFEEE7]'
                : 'text-black/70 hover:text-black'
            }`}
          >
            Teachers
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
        {/* For Students */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-black rounded-2xl p-10"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-8 text-[#EFEEE7]">For Students</h3>
          <ul className="space-y-6">
            {studentBenefits.map((benefit, index) => (
              <motion.li
                key={benefit}
                className="flex items-start gap-4 text-xl text-[#EFEEE7]/90"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <span className="text-green-400 text-2xl">✓</span>
                {benefit}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* For Teachers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-black rounded-2xl p-10"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-8 text-[#EFEEE7]">For Teachers</h3>
          <ul className="space-y-6">
            {teacherBenefits.map((benefit, index) => (
              <motion.li
                key={benefit}
                className="flex items-start gap-4 text-xl text-[#EFEEE7]/90"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <span className="text-green-400 text-2xl">✓</span>
                {benefit}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'students' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black rounded-2xl p-8"
        >
          <h3 className="text-3xl font-bold mb-8 text-[#EFEEE7]">
            For {activeTab === 'students' ? 'Students' : 'Teachers'}
          </h3>
          <ul className="space-y-6">
            {(activeTab === 'students' ? studentBenefits : teacherBenefits).map((benefit, index) => (
              <motion.li
                key={benefit}
                className="flex items-start gap-4 text-lg text-[#EFEEE7]/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <span className="text-green-400 text-xl">✓</span>
                {benefit}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
} 