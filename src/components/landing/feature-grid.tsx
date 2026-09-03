"use client";
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Activity, ArrowRightCircle, MessageCircleHeart, FileHeart, MapPin, Users, WifiOff, LayoutDashboard } from 'lucide-react';
import styles from './landing.module.css';

export default function FeatureGrid() {
  const shouldReduceMotion = useReducedMotion();
  const features = [
    {
      icon: <Activity size={32} />,
      title: "Assisted Digital Triage",
      desc: "Capture symptoms, vitals and red flags through a guided workflow. DiagnoVerse helps frontline workers prioritize cases while keeping clinical decisions with qualified professionals."
    },
    {
      icon: <ArrowRightCircle size={32} />,
      title: "Smart Referral Tracking",
      desc: "Create, track and close referrals across sub-centres, PHCs, rural hospitals and district facilities with a clear status timeline."
    },
    {
      icon: <MessageCircleHeart size={32} />,
      title: "Teleconsultation and Queue Support",
      desc: "Connect patients to the appropriate public-health facility through appointment requests, queue visibility and assisted low-bandwidth consultations."
    },
    {
      icon: <FileHeart size={32} />,
      title: "Longitudinal Health Records",
      desc: "Maintain consent-based patient records containing visits, vitals, prescriptions, reports, referrals and follow-up tasks in one continuous care history."
    },
    {
      icon: <MapPin size={32} />,
      title: "Medicine and Diagnostics Visibility",
      desc: "Help workers and patients discover medicine availability, diagnostic services, timings and suitable alternative facilities before travelling."
    },
    {
      icon: <Users size={32} />,
      title: "Follow-up for High-Risk Families",
      desc: "Support ASHA workers with reminders and follow-up tasks for maternal, child and chronic-care patients."
    },
    {
      icon: <WifiOff size={32} />,
      title: "Offline-First Field Work",
      desc: "Record patient information in low-connectivity areas and securely synchronize it when the network becomes available."
    },
    {
      icon: <LayoutDashboard size={32} />,
      title: "Facility Quality Dashboard",
      desc: "Give public-health administrators visibility into waiting time, referral completion, missed follow-ups, high-risk cases and service availability."
    }
  ];

  return (
    <motion.section 
      id="features"
      className={styles.featureGridSection}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className={styles.featureGridContainer}>
        <div className={styles.featureGridHeader}>
          <h2 className={styles.featureGridTitle}>From first contact to completed care</h2>
          <p className={styles.featureCardDesc}>DiagnoVerse strengthens the public-health system by helping frontline workers identify risk, coordinate services and close the loop on every referral.</p>
        </div>
        <div className={styles.featureGridGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureCardIcon}>
                {feature.icon}
              </div>
              <h3 className={styles.featureCardTitle}>{feature.title}</h3>
              <p className={styles.featureCardDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
