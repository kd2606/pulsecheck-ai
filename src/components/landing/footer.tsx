import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerSection}>
      <div className={styles.footerGrid}>
        <div>
          <div className={styles.navLogo} style={{ marginBottom: '1rem' }}>DiagnoVerse AI</div>
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
            Accessible, accurate, and instant AI-powered healthcare triage for everyone.
          </p>
        </div>
        <div>
          <h4 className={styles.footerColTitle}>Product</h4>
          <div className={styles.footerLinks}>
            <Link href="/dashboard" className={styles.footerLink}>Web App / Features</Link>
            <Link href="#how-it-works" className={styles.footerLink}>How It Works</Link>
          </div>
        </div>
        <div>
          <h4 className={styles.footerColTitle}>Company</h4>
          <div className={styles.footerLinks}>
            <Link href="/about" className={styles.footerLink}>About Us</Link>
            <Link href="/contact" className={styles.footerLink}>Contact</Link>
          </div>
        </div>
        <div>
          <h4 className={styles.footerColTitle}>Legal</h4>
          <div className={styles.footerLinks}>
            <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
            <Link href="/disclaimer" className={styles.footerLink}>Medical Disclaimer</Link>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        &copy; {new Date().getFullYear()} DiagnoVerse AI. All rights reserved.
      </div>
    </footer>
  );
}
