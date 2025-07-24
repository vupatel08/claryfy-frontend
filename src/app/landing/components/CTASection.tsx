'use client';

import { motion } from 'framer-motion';

export default function CTASection() {
  const airtableUrl = 'https://airtable.com/appTtkyfRpPFfB6je/shrtkG3mVFcXvyAoZ';

  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#EFEEE7]">
          Join Spring '25 Pilot
        </h2>
        
        <p className="text-xl md:text-2xl mb-12 text-[#EFEEE7]/70">
          Limited spots available for early access
        </p>
        
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Button */}
          <motion.a
            href={airtableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#EFEEE7] text-black px-10 py-5 rounded-xl text-xl font-semibold hover:bg-[#EFEEE7]/90 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Early Access
          </motion.a>
          
          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-8 mt-12">
            {['FERPA-Compliant', 'Canvas-Integrated', 'Teacher-Controlled'].map((badge, index) => (
              <motion.div
                key={badge}
                className="text-lg text-[#EFEEE7]/50"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                {badge}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 