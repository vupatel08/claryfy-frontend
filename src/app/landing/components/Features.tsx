'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const features = [
  {
    title: 'Canvas Integration',
    description: 'Pulls real files, lectures, and assignments directly from your courses',
    details: 'No more copy-pasting content'
  },
  {
    title: 'Smart Summaries',
    description: 'AI-generated summaries that teachers can review and approve',
    details: 'Verified by your professors'
  },
  {
    title: 'Course-Aware Q&A',
    description: 'Get answers based on your actual course content, not generic web results',
    details: 'Context-aware responses'
  },
  {
    title: 'See it in action: CMSC422',
    description: `Last Lecture Summary:
• Decision Trees and Random Forests
• Tree structure and information gain
• Ensemble methods and bagging
• Feature importance visualization

Student Questions:
Q: "What's the difference between bagging and boosting?"
A: [AI-generated explanation with course context]`,
    isExample: true
  }
];

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  const nextFeature = () => {
    setActiveFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setActiveFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <motion.h2 
        className="text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-black text-center mb-20 text-black"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        How It Works
      </motion.h2>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="grid md:grid-cols-3 gap-8">
          {features.slice(0, 3).map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-black rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#EFEEE7]">{feature.title}</h3>
              <p className="text-xl mb-3 text-[#EFEEE7]/80">{feature.description}</p>
              {!feature.isExample && (
                <p className="text-lg text-[#EFEEE7]/60">{feature.details}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Desktop Example */}
        <motion.div 
          className="mt-20 bg-black rounded-2xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold mb-6 text-[#EFEEE7]">See it in action: CMSC422</h3>
          <div className="bg-[#1A1A1A] rounded-xl p-6">
            <pre className="text-lg text-[#EFEEE7]/90 whitespace-pre-wrap font-mono">
              {features[3].description}
            </pre>
          </div>
        </motion.div>
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden relative">
        <div className="overflow-hidden">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-black rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-4 text-[#EFEEE7]">{features[activeFeature].title}</h3>
            {features[activeFeature].isExample ? (
              <div className="bg-[#1A1A1A] rounded-xl p-4">
                <pre className="text-base text-[#EFEEE7]/90 whitespace-pre-wrap font-mono">
                  {features[activeFeature].description}
                </pre>
              </div>
            ) : (
              <>
                <p className="text-lg mb-3 text-[#EFEEE7]/80">{features[activeFeature].description}</p>
                <p className="text-base text-[#EFEEE7]/60">{features[activeFeature].details}</p>
              </>
            )}
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevFeature}
            className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
          <div className="flex gap-2">
            {features.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === activeFeature ? 'bg-black' : 'bg-black/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextFeature}
            className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
} 