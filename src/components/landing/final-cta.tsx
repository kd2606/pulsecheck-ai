import React from 'react';
import styles from './landing.module.css';

export default function FinalCta() {
  return (
    <section className={styles.ctaSection}>
      <h2 className={styles.ctaTitle}>Ready to take control of your health?</h2>
      <p className={styles.ctaDesc}>Join thousands of users across Bharat getting smarter health guidance.</p>
      <a href="/login" className={styles.btnPrimary} style={{ fontSize: '1.25rem', padding: '1rem 2.5rem', display: 'inline-block' }}>
        Open Web App
      </a>
    </section>
  );
}
