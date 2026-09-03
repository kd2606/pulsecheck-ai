import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerSection}>
      <div className={styles.footerGrid}>
        <div>
          <div className={styles.navLogo} style={{ marginBottom: '1rem' }}>DiagnoVerse AI</div>
          <p style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: '1rem' }}>
            DiagnoVerse is an AI-assisted rural care coordination platform designed to improve access, referral completion and continuity across public-health services.
          </p>
          <p style={{ color: '#4b5563', lineHeight: 1.4, fontSize: '0.75rem' }}>
            <strong>Disclaimer:</strong> DiagnoVerse is a healthcare workflow and triage-support prototype. It does not replace professional medical diagnosis, treatment or emergency services. In an emergency, contact local emergency services or visit the nearest healthcare facility.
          </p>
        </div>
        <div>
          <h4 className={styles.footerColTitle}>Product</h4>
          <div className={styles.footerLinks}>
            <Link href="/dashboard" className={styles.footerLink}>Web App / Features</Link>
            <Link href="#how-it-works" className={styles.footerLink}>How It Works</Link>
            <Link href="/en/auth/district" className={styles.footerLink} style={{ color: '#0d9488' }}>District Command Login</Link>
          </div>
        </div>
        <div>
          <h4 className={styles.footerColTitle}>Company</h4>
          <div className={styles.footerLinks}>
            <Link href="/en/about" prefetch={false} className={styles.footerLink}>About Us</Link>
            <Link href="/contact" prefetch={false} className={styles.footerLink}>Contact</Link>
          </div>
        </div>
        <div>
          <h4 className={styles.footerColTitle}>Legal</h4>
          <div className={styles.footerLinks}>
            <Link href="/en/privacy-policy" prefetch={false} className={styles.footerLink}>Privacy Policy</Link>
            <Link href="/disclaimer" prefetch={false} className={styles.footerLink}>Medical Disclaimer</Link>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        &copy; {new Date().getFullYear()} DiagnoVerse AI. All rights reserved.
      </div>
    </footer>
  );
}
