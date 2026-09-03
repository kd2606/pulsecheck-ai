import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Activity, Users } from 'lucide-react';
import styles from './landing.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroLeft}>
        <p style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          AI-ASSISTED RURAL CARE COORDINATION
        </p>
        <h1 className={styles.heroTitle}>Connect every rural patient to the care they need.</h1>
        <p className={styles.heroSubtitle}>
          DiagnoVerse helps ASHA workers, patients and public-health facilities work together through digital triage, smart referrals, teleconsultation support, longitudinal health records and follow-up tracking—even in low-connectivity areas.
        </p>
        <div className={styles.heroActions} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/en/auth/patient" className={styles.btnPrimary}>
            User Login
          </Link>
          <Link href="/en/auth/worker" className={styles.btnPrimary} style={{ background: 'transparent', border: '1px solid #0d9488', color: '#0d9488' }}>
            ASHA Worker Login
          </Link>
        </div>
        <div className={styles.trustStrip}>
          <div className={styles.trustItem}>
            <ShieldCheck size={18} color="#0d9488" />
            <span>Protocol-Guided</span>
          </div>
          <div className={styles.trustItem}>
            <Lock size={18} color="#0d9488" />
            <span>Consent-Based Records</span>
          </div>
          <div className={styles.trustItem}>
            <Activity size={18} color="#0d9488" />
            <span>Faster Referrals</span>
          </div>
          <div className={styles.trustItem}>
            <Users size={18} color="#0d9488" />
            <span>Built for Rural Care</span>
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
