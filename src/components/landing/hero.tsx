import React from 'react';
import { ShieldCheck, Lock, Activity, Users } from 'lucide-react';
import styles from './landing.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroLeft}>
        <h1 className={styles.heroTitle}>Healthcare that reaches where doctors can&apos;t.</h1>
        <p className={styles.heroSubtitle}>
          DiagnoVerse brings clinical-grade AI diagnostics to the remotest parts of India, 
          ensuring everyone has access to accurate and timely health assessments.
        </p>
        <div className={styles.heroActions}>
          <a href="/login" className={styles.btnPrimary}>Open Web App</a>
        </div>
        <div className={styles.trustStrip}>
          <div className={styles.trustItem}>
            <ShieldCheck size={18} color="#0d9488" />
            <span>Clinical Grade</span>
          </div>
          <div className={styles.trustItem}>
            <Lock size={18} color="#0d9488" />
            <span>Secure</span>
          </div>
          <div className={styles.trustItem}>
            <Activity size={18} color="#0d9488" />
            <span>Fast Triage</span>
          </div>
          <div className={styles.trustItem}>
            <Users size={18} color="#0d9488" />
            <span>For Everyone</span>
          </div>
        </div>
      </div>
      <div className={styles.heroRight}>
        <div className={styles.phoneMockup}>
          <div className={styles.phoneNotch}></div>
          <div className={styles.chatInterface}>
            <div className={styles.chatBubbleBot}>
              नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?
            </div>
            <div className={styles.chatBubbleUser}>
              मुझे बुखार है
            </div>
            <div className={styles.chatBubbleBot}>
              क्या आपको ठंड भी लग रही है या सिरदर्द है?
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
