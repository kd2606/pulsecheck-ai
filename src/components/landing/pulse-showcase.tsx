import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import styles from './landing.module.css';

export default function PulseShowcase() {
  return (
    <section className={styles.pulseShowcaseSection}>
      <div className={styles.pulseShowcaseLeft}>
        <div className={styles.chatInterface}>
          <div className={styles.chatBubbleUser}>
            I want to see my referral status
          </div>
          <div className={styles.chatBubbleBot}>
            Your referral to the District Hospital is active. Please visit before Friday.
          </div>
        </div>
      </div>
      <div className={styles.pulseShowcaseRight}>
        <h2 className={styles.pulseShowcaseTitle}>Your care journey, connected.</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '2rem', lineHeight: 1.6 }}>
          Check symptoms, access public-health services, view your care history, receive reminders and stay connected with your healthcare worker—without losing continuity between facilities.
        </p>
        <ul className={styles.pulseBullets}>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>Check symptoms safely</span>
          </li>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>Find nearby public facilities</span>
          </li>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>Request appointments and teleconsultations (Coming in pilot)</span>
          </li>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>View prescriptions and reports (Coming in pilot)</span>
          </li>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>Track referrals and follow-ups</span>
          </li>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>Manage family health needs</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
