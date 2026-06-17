"use client";
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './landing.module.css';

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section 
      id="how-it-works" 
      className={styles.howItWorksSection}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <h2 className={styles.howItWorksHeader}>How It Works</h2>
      <div className={styles.howItWorksGrid}>
        <div className={styles.stepCard}>
          <div className={styles.stepNumber}>1</div>
          <h3 className={styles.stepTitle}>Describe Symptoms</h3>
          <p className={styles.stepDesc}>Type or speak your symptoms in your own language. Pulse understands conversational inputs perfectly.</p>
        </div>
        <div className={styles.stepCard}>
          <div className={styles.stepNumber}>2</div>
          <h3 className={styles.stepTitle}>AI Assessment</h3>
          <p className={styles.stepDesc}>The AI asks follow-up questions and compares your data against vast clinical knowledge bases.</p>
        </div>
        <div className={styles.stepCard}>
          <div className={styles.stepNumber}>3</div>
          <h3 className={styles.stepTitle}>Actionable Triage</h3>
          <p className={styles.stepDesc}>Get clear guidance on whether to see a doctor, visit an ER, or simply rest at home.</p>
        </div>
      </div>
    </motion.section>
  );
}
