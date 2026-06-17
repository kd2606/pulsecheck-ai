"use client";
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './landing.module.css';

export default function DataProblem() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.section 
      className={styles.dataProblemSection}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <h2 className={styles.dataProblemHeader}>70% of India lives in rural areas.</h2>
      <div className={styles.dataProblemGrid}>
        <div className={styles.dataProblemCol}>
          <div className={styles.dataProblemNumber}>1:10k</div>
          <div className={styles.dataProblemText}>Doctor to Patient Ratio</div>
          <div className={styles.dataProblemSource}>Source: WHO Report</div>
        </div>
        <div className={styles.dataProblemCol}>
          <div className={styles.dataProblemNumber}>60%</div>
          <div className={styles.dataProblemText}>Lack basic health access</div>
          <div className={styles.dataProblemSource}>Source: Rural Health Statistics</div>
        </div>
        <div className={styles.dataProblemCol}>
          <div className={styles.dataProblemNumber}>&lt;10km</div>
          <div className={styles.dataProblemText}>Travel needed for primary care</div>
          <div className={styles.dataProblemSource}>Source: National Health Mission</div>
        </div>
      </div>
    </motion.section>
  );
}
