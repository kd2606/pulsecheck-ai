import React from 'react';
import styles from './landing.module.css';

export default function AshaSection() {
  return (
    <section className={styles.ashaSection}>
      <div className={styles.ashaContainer}>
        <h2 className={styles.ashaTitle}>Empowering ASHA Workers</h2>
        <p className={styles.ashaDesc}>
          An AI co-pilot for ASHA workers. We equip frontline health workers with clinical intelligence, allowing them to confidently screen patients, track vitals, and provide initial guidance before escalating to district hospitals.
        </p>
      </div>
    </section>
  );
}
