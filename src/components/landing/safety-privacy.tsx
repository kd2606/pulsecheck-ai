"use client";
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import styles from './landing.module.css';

export default function SafetyPrivacy() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section 
      className={styles.safetySection}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div>
        <h2 className={styles.safetyTitle}>Your Data is Secure</h2>
        <div className={styles.safetyList}>
          <div className={styles.safetyItem}>
            <ShieldCheck size={24} color="#0d9488" />
            <span>End-to-end encryption for all health records.</span>
          </div>
          <div className={styles.safetyItem}>
            <ShieldCheck size={24} color="#0d9488" />
            <span>Strict access controls. Only you control your data.</span>
          </div>
          <div className={styles.safetyItem}>
            <ShieldCheck size={24} color="#0d9488" />
            <span>Anonymized processing for AI diagnostics.</span>
          </div>
        </div>
      </div>
      <div>
        <div className={styles.disclaimerBlock}>
          <h3 className={styles.disclaimerTitle}>Medical Disclaimer</h3>
          <p className={styles.disclaimerText}>
            DiagnoVerse AI is intended for informational and triage purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
