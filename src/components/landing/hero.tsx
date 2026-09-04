import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Activity, Users } from 'lucide-react';
import styles from './landing.module.css';
import { publicNavigationConfig } from '@/lib/config/navigation';

export default function Hero() {
  const isPublicHealth = publicNavigationConfig.primaryAudience === "public-health";

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroLeft}>
        <p style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          {isPublicHealth ? "AI-ASSISTED PUBLIC HEALTH COORDINATION" : "AI-ASSISTED RURAL CARE COORDINATION"}
        </p>
        <h1 className={styles.heroTitle}>
          {isPublicHealth ? "Connect frontline workers, public facilities and district health teams." : "Connect every rural patient to the care they need."}
        </h1>
        <p className={styles.heroSubtitle}>
          {isPublicHealth 
            ? "DiagnoVerse coordinates rural care by empowering frontline health workers with assisted digital triage, low-connectivity offline-first field tools, and longitudinal health records. It bridges patients and facilities through smart referral tracking, follow-up queues, teleconsultation support, and seamless public-health coordination."
            : "DiagnoVerse helps ASHA workers, patients and public-health facilities work together through digital triage, smart referrals, teleconsultation support, longitudinal health records and follow-up tracking—even in low-connectivity areas."
          }
        </p>
        <div className={styles.heroActions} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {publicNavigationConfig.showPatientEntry && (
            <Link href="/en/auth/patient" className={styles.btnPrimary} style={{ background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1' }}>
              Patient Portal
            </Link>
          )}
          {publicNavigationConfig.showDistrictEntry && (
            <Link href="/en/auth/district" className={styles.btnPrimary} style={{ background: '#0f172a' }}>
              Open District Command
            </Link>
          )}
          {publicNavigationConfig.showWorkerEntry && (
            <Link href="/en/auth/worker" className={styles.btnPrimary} style={{ background: 'transparent', border: '1px solid #0d9488', color: '#0d9488' }}>
              Open ASHA Worker Portal
            </Link>
          )}
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
