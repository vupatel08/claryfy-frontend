'use client';

import { motion } from 'framer-motion';

const stats = [
  { 
    number: '30M+', 
    label: 'Global Canvas Users',
    subtext: 'Ready to enhance their learning'
  },
  { 
    number: '50+', 
    label: 'Early Waitlist Students',
    subtext: 'Growing daily'
  },
  { 
    number: '100%', 
    label: 'Teacher Controlled',
    subtext: 'Full visibility and control'
  }
];

export default function Stats() {
  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-7xl md:text-8xl lg:text-9xl font-black mb-4 text-[#EFEEE7]">{stat.number}</h3>
            <p className="text-2xl md:text-3xl font-bold mb-2 text-[#EFEEE7]/90">{stat.label}</p>
            <p className="text-lg text-[#EFEEE7]/70">{stat.subtext}</p>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="text-center mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        viewport={{ once: true }}
      >
        <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#EFEEE7]/90">
          Join the future of classroom learning
        </p>
      </motion.div>
    </div>
  );
} 