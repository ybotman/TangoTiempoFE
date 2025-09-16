'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './organizer-join.module.css'

export default function OrganizerJoinPage() {
  const [expandedProcess, setExpandedProcess] = useState({})

  const toggleProcess = (id) => {
    setExpandedProcess(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const processSteps = [
    {
      id: 'account',
      title: '1. Create Account',
      summary: 'Quick 2-minute signup with email verification',
      details: [
        'Sign up with your email and password',
        'Verify your email address',
        'Complete your organizer profile with contact info',
        'Add your organization name and website (optional)',
        'Set your primary city/region for event listings'
      ]
    },
    {
      id: 'venue',
      title: '2. Setup Your Venues (if needed)',
      summary: 'Add the locations where you host events',
      details: [
        'Search our database for existing venues or add new ones',
        'Provide venue name and full address',
        'Our system automatically geocodes for map display',
        'Add venue details: capacity, floor type, parking info',
        'Upload venue photos (coming soon)',
        'Save multiple venues for quick event creation'
      ]
    },
    {
      id: 'events',
      title: '3. Add Events',
      summary: 'Fast event creation with recurring support',
      details: [
        'Choose event type: Milonga, Practica, Class, Festival, Workshop',
        'Select from your saved venues or add new',
        'Set date, time, and recurrence pattern',
        'Add event description and special notes',
        'Include pricing information (free, fixed, or sliding scale)',
        'Add links to registration or tickets',
        'Preview how your event appears to dancers',
        'Publish immediately or schedule for later'
      ]
    },
    {
      id: 'manage',
      title: '4. Manage & Update',
      summary: 'Keep your listings current with easy tools',
      details: [
        'Dashboard view of all your events',
        'Quick edit for last-minute changes',
        'Cancel or postpone with automatic notifications',
        'Duplicate events for similar future listings',
        'Track views and interest (analytics coming soon)',
        'Export your event data anytime',
        'Bulk update tools for multiple events'
      ]
    },
    {
      id: 'promote',
      title: '5. Promotion & Growth (Coming Soon)',
      summary: 'Optional tools to reach more dancers',
      details: [
        'Featured event placement in search results',
        'Email notifications to dancers in your area',
        'Social media integration and sharing tools',
        'Event reminder notifications',
        'Dancer RSVP and interest tracking',
        'Direct messaging with interested dancers',
        'Co-promotion with other organizers'
      ]
    }
  ]

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Join as a Tango Event Organizer</h1>
          <p className={styles.subhead}>
            Be part of the first FREE national tango calendar.
            Help dancers find your milongas, practicas, and classes.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/auth/login" className={styles.ctaPrimary}>
              Start Listing Events Now
            </Link>
          </div>
          <p className={styles.launchNote}>
            Already the Northeast's primary tango calendar
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className={styles.mission}>
        <div className={styles.missionContent}>
          <h2>Why TangoTiempo?</h2>
          <p>
            We're building <strong>a comprehensive, FREE</strong> tango calendar
            for the United States. No fees, no gatekeeping, no favoritism - just a
            shared resource for the entire tango community. The Northeast region
            (especially Boston) is nearly complete, and we're expanding nationwide.
          </p>
          <div className={styles.statusBadge}>
            <span className={styles.badge}>100% Free Forever</span>
          </div>
        </div>
      </section>

      {/* Benefits for Organizers */}
      <section className={styles.benefits}>
        <h2>Benefits for Organizers</h2>
        <div className={styles.benefitGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>📍</div>
            <h3>Be Found Easily</h3>
            <p>Dancers search by location, date, and event type to find you</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>🔄</div>
            <h3>Recurring Events</h3>
            <p>Set it once for weekly/monthly events - no repeated entry</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>🗺️</div>
            <h3>Map Integration</h3>
            <p>Your venues appear on our interactive map automatically</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>📱</div>
            <h3>Mobile Ready</h3>
            <p>Dancers can find and save your events on any device</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>🎯</div>
            <h3>Reach Travelers</h3>
            <p>Visiting dancers and teachers can discover your events</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>💰</div>
            <h3>Always Free</h3>
            <p>No listing fees, no commissions, no hidden costs</p>
          </div>
        </div>
      </section>

      {/* The Process - Expandable */}
      <section className={styles.process} id="process">
        <h2>The Complete Process</h2>
        <p className={styles.processSubhead}>
          Click each step to see detailed information
        </p>

        {/* Image placeholder */}
        <div className={styles.processImage}>
          <p>[ Process flow diagram will go here ]</p>
        </div>

        <div className={styles.processSteps}>
          {processSteps.map((step) => (
            <div key={step.id} className={styles.processStep}>
              <button
                className={styles.processHeader}
                onClick={() => toggleProcess(step.id)}
                aria-expanded={expandedProcess[step.id]}
              >
                <div className={styles.processTitle}>
                  <h3>{step.title}</h3>
                  <p>{step.summary}</p>
                </div>
                <span className={styles.processToggle}>
                  {expandedProcess[step.id] ? '−' : '+'}
                </span>
              </button>

              {expandedProcess[step.id] && (
                <div className={styles.processDetails}>
                  <ul>
                    {step.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className={styles.quickStart}>
        <h2>Quick Start in 10 Minutes</h2>
        <div className={styles.quickSteps}>
          <div className={styles.quickStep}>
            <span className={styles.quickTime}>2 min</span>
            <h3>Sign Up</h3>
            <p>Create account & verify email</p>
          </div>
          <div className={styles.quickStep}>
            <span className={styles.quickTime}>3 min</span>
            <h3>Add Venue</h3>
            <p>Enter your event location</p>
          </div>
          <div className={styles.quickStep}>
            <span className={styles.quickTime}>5 min</span>
            <h3>List Event</h3>
            <p>Create your first listing</p>
          </div>
        </div>
      </section>

      {/* Current Coverage */}
      <section className={styles.coverage}>
        <h2>Our Expansion Plan</h2>
        <div className={styles.coverageGrid}>
          <div className={styles.coverageRegion}>
            <h3>✅ Active Regions</h3>
            <ul>
              <li>Boston & Greater Boston</li>
              <li>New York City Metro</li>
              <li>Philadelphia Area</li>
              <li>Washington DC Region</li>
            </ul>
          </div>
          <div className={styles.coverageRegion}>
            <h3>🚀 2025-2026 Expansion</h3>
            <p style={{color: '#c0c0c0', lineHeight: '1.6'}}>
              We're just starting our active rollout.
              Major cities across the United States
              will be added throughout 2025-2026.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className={styles.faqs}>
        <h2>Organizer FAQs</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h3>Is it really free?</h3>
            <p>Yes, 100% free to list all your events. Optional promotion tools may be offered later, but basic listing will always be free.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Can I list multiple venues?</h3>
            <p>Yes, add as many venues as you need and reuse them for quick event creation.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>What about recurring events?</h3>
            <p>Full support for weekly, bi-weekly, and monthly recurring events. Set once and forget!</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Can I edit events after posting?</h3>
            <p>Yes, update or cancel anytime. Changes appear immediately.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Do you share my data?</h3>
            <p>Never. Your data belongs to you. We don't sell or share organizer information.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>What if I need help?</h3>
            <p>Email support available, plus comprehensive documentation and video tutorials (coming soon).</p>
          </div>
        </div>
      </section>

      {/* Coming Soon for Others */}
      <section className={styles.comingSoon}>
        <h2>Coming Soon: DJ & Teacher Features</h2>
        <div className={styles.comingSoonGrid}>
          <div className={styles.comingSoonCard}>
            <h3>For DJs</h3>
            <ul>
              <li>Professional profiles</li>
              <li>Availability calendar</li>
              <li>Direct booking requests</li>
              <li>Music style preferences</li>
            </ul>
            <span className={styles.eta}>Q1 2025</span>
          </div>
          <div className={styles.comingSoonCard}>
            <h3>For Teachers</h3>
            <ul>
              <li>Class & workshop listings</li>
              <li>Tour schedules</li>
              <li>Student registration</li>
              <li>Video demonstrations</li>
            </ul>
            <span className={styles.eta}>Q1 2025</span>
          </div>
          <div className={styles.comingSoonCard}>
            <h3>For Taxi Dancers</h3>
            <ul>
              <li>Availability status</li>
              <li>Event attendance</li>
              <li>Direct messaging</li>
              <li>Reviews & ratings</li>
            </ul>
            <span className={styles.eta}>Q2 2025</span>
          </div>
        </div>
      </section>


      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaContent}>
          <h2>Ready to Join the Movement?</h2>
          <p>
            Help us build the future of tango event discovery.
            Start listing your events today - it takes less than 10 minutes!
          </p>
          <div className={styles.finalButtons}>
            <Link href="/auth/login" className={styles.ctaPrimary}>
              Create Organizer Account
            </Link>
            <Link href="/calendar" className={styles.ctaSecondary}>
              See the Calendar
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}