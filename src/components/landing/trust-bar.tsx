import React from 'react';
import { ShieldAlert, FileSearch, AlertTriangle, BookOpen } from 'lucide-react';
import styles from './landing.module.css';

export default function TrustBar() {
  return (
    <section className={styles.trustBarSection}>
      <div className={styles.trustBarGrid}>
        <div className={styles.trustBarItem}>
          <div className={styles.trustBarIcon}>
            <ShieldAlert size={32} />
          </div>
          <div className={styles.trustBarText}>Built with clinical safety guardrails</div>
        </div>
        <div className={styles.trustBarItem}>
          <div className={styles.trustBarIcon}>
            <FileSearch size={32} />
          </div>
          <div className={styles.trustBarText}>Audit-logged for CDSCO compliance</div>
        </div>
        <div className={styles.trustBarItem}>
          <div className={styles.trustBarIcon}>
            <AlertTriangle size={32} />
          </div>
          <div className={styles.trustBarText}>Hardcoded emergency overrides for red-flag symptoms</div>
        </div>
        <div className={styles.trustBarItem}>
          <div className={styles.trustBarIcon}>
            <BookOpen size={32} />
          </div>
          <div className={styles.trustBarText}>Open-source emergency protocols</div>
        </div>
      </div>
    </section>
  );
}
