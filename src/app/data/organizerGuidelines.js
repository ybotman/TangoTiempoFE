// Shared source-of-truth for Regional Organizer Rules of Engagement /
// community guidelines. Extracted from UserSettingApplyROTerms.js so the
// welcome page (TIEMPO-454) can render the same content the apply-time
// terms modal does.

export const ROE_SECTIONS = [
  {
    id: 'responsibilities',
    title: 'Organizer Responsibilities',
    content: `As a Regional Organizer, you agree to:

• Create and manage authentic Argentine Tango events in your assigned region
• Maintain accurate and up-to-date event information including dates, times, locations, and descriptions
• Upload appropriate event images that represent the tango community professionally
• Respond to community inquiries about your events in a timely manner
• Collaborate with other organizers to avoid scheduling conflicts when possible
• Represent the tango community with professionalism and respect`,
  },
  {
    id: 'event-standards',
    title: 'Event Quality Standards',
    content: `IMPORTANT: Only strictly Argentine Tango events are permitted.

• Events MUST be exclusively Argentine Tango (milongas, practicas, classes, workshops)
• NO fusion events (tango-swing, tango-salsa, etc.)
• NO non-tango dance events
• Events must feature traditional Argentine Tango music or live tango orchestras
• Alternative/neo-tango events are acceptable if clearly labeled
• Events must be kept reasonably up-to-date or may be reverted to AI-Discovered status`,
  },
  {
    id: 'ai-protection',
    title: 'AI Monitoring & Protection',
    content: `Your events will be monitored by our AI system for quality and compliance:

• AI scans all events for Argentine Tango authenticity
• Events detected as non-tango will be flagged for review
• Repeatedly posting non-tango events may result in organizer privileges suspension
• Outdated events (not updated for 30+ days past event date) may be auto-archived
• AI-discovered duplicates of your events will be merged under your organizer profile
• You retain full control over events you create, but must maintain them actively`,
  },
  {
    id: 'permissions',
    title: 'Permissions & Access',
    content: `Your Regional Organizer role includes all Named User (NU) permissions plus:

• CREATE events in your assigned cities/regions
• EDIT all details of events you create
• UPLOAD images for your events
• DELETE events you've created (with 30-day soft delete)
• VIEW analytics for your events
• MANAGE your organizer profile and contact information
• REQUEST additional cities/regions through Regional Admins`,
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    content: `By accepting these terms, you acknowledge:

• TangoTiempo reserves the right to modify or revoke organizer privileges
• Violations of the Argentine Tango-only policy may result in immediate suspension
• You are responsible for the accuracy of all information you post
• You grant TangoTiempo license to display your event information
• You will not use the platform for spam, harassment, or illegal activities
• Your organizer account is non-transferable
• These terms may be updated with notice to active organizers`,
  },
];
