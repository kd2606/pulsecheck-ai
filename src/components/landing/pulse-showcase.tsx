import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import styles from './landing.module.css';

export default function PulseShowcase() {
  return (
    <section className={styles.pulseShowcaseSection}>
      <div className={styles.pulseShowcaseLeft}>
        <div className={styles.chatInterface}>
          <div className={styles.chatBubbleUser}>
            chest mein bahut dard ho raha hai
          </div>
          <div className={styles.chatBubbleBot}>
            This sounds like a possible cardiac emergency. Call 108 right now. Please do not wait.
          </div>
        </div>
      </div>
      <div className={styles.pulseShowcaseRight}>
        <h2 className={styles.pulseShowcaseTitle}>Meet Pulse: Your Clinical AI Copilot</h2>
        <ul className={styles.pulseBullets}>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>Understands Hinglish and local nuances natively.</span>
          </li>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>Trained on clinical guidelines to ensure accuracy.</span>
          </li>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>Detects medical emergencies and escalates immediately.</span>
          </li>
          <li className={styles.pulseBullet}>
            <CheckCircle2 size={24} className={styles.pulseBulletIcon} />
            <span>Available 24/7 without any waiting time.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
