"use client";
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Stethoscope, ScanLine, Brain, Landmark, MessageCircleHeart, FileHeart } from 'lucide-react';
import styles from './landing.module.css';

export default function FeatureGrid() {
  const shouldReduceMotion = useReducedMotion();
  const features = [
    {
      icon: <Stethoscope size={32} />,
      title: "Automated Triage",
      desc: "Instantly categorize symptom severity to prioritize urgent medical cases over routine queries."
    },
    {
      icon: <ScanLine size={32} />,
      title: "Prescription Scanning",
      desc: "Digitize and interpret handwritten prescriptions to avoid medication errors and improve accessibility."
    },
    {
      icon: <Brain size={32} />,
      title: "AI Diagnostics",
      desc: "Leverage advanced machine learning to detect early signs of common diseases from simple inputs."
    },
    {
      icon: <Landmark size={32} />,
      title: "Government Integration",
      desc: "Seamlessly connects with national health registries and adheres to all local compliance laws."
    },
    {
      icon: <MessageCircleHeart size={32} />,
      title: "Multilingual Chat",
      desc: "Engage with patients in their native languages through an intuitive and accessible conversational interface."
    },
    {
      icon: <FileHeart size={32} />,
      title: "Secure Health Records",
      desc: "Maintain immutable and fully encrypted electronic health records that patients own and control."
    }
  ];

  return (
    <motion.section 
      className={styles.featureGridSection}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className={styles.featureGridContainer}>
        <div className={styles.featureGridHeader}>
          <h2 className={styles.featureGridTitle}>Comprehensive Care Capabilities</h2>
          <p className={styles.featureCardDesc}>Equipping the frontier of rural healthcare with modern tools.</p>
        </div>
        <div className={styles.featureGridGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureCardIcon}>
                {feature.icon}
              </div>
              <h3 className={styles.featureCardTitle}>{feature.title}</h3>
              <p className={styles.featureCardDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
