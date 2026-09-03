import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

export default function FinalCta() {
  return (
    <section className={styles.ctaSection}>
      <h2 className={styles.ctaTitle}>Ready to Bridge the Healthcare Gap?</h2>
      <p className={styles.ctaText}>Join thousands of health workers already using DiagnoVerse.</p>
      <Link href="/en/auth" className={styles.btnPrimary}>
        Access Portal
      </Link>
    </section>
  );
}
