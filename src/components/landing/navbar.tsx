"use client";

import React, { useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import styles from './landing.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLogo}>
        <Activity size={28} />
        <span>DiagnoVerse</span>
      </div>
      
      <div className={styles.navLinks}>
        <a href="#features" className={styles.navLink}>Features</a>
        <a href="#safety" className={styles.navLink}>Safety</a>
        <a href="#about" className={styles.navLink}>About</a>
      </div>

      <div className={styles.navRight}>
        <a href="/login" className={styles.btnPrimary}>Open App</a>
      </div>

      <button className={styles.mobileMenuBtn} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className={styles.mobileDrawer}>
          <a href="#features" className={styles.navLink} onClick={() => setIsOpen(false)}>Features</a>
          <a href="#safety" className={styles.navLink} onClick={() => setIsOpen(false)}>Safety</a>
          <a href="#about" className={styles.navLink} onClick={() => setIsOpen(false)}>About</a>
          <a href="/login" className={styles.btnPrimary} style={{ textAlign: 'center' }} onClick={() => setIsOpen(false)}>Open App</a>
        </div>
      )}
    </nav>
  );
}
