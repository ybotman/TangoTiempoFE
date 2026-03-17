# Organizer Messaging System - Design Document

**Status:** DRAFT - Pending team review
**Lead:** Sarah (Frontend) + Fulton (Backend)
**Stakeholder:** Toby (El Gotan)
**Created:** 2026-03-17

---

## 1. Overview

A messaging system allowing admins to send announcements, updates, and alerts to organizers. Messages appear when users switch to organizer roles and require acknowledgment before dismissing.

## 2. User Stories

### US-1: Admin sends message
> As an admin, I want to send a message to all organizers so they stay informed about system updates, policy changes, or important announcements.

### US-2: Organizer sees unread messages
> As a Regional Organizer/Admin, when I switch to my organizer role, I want to see any unread messages so I don't miss important information.

### US-3: Organizer acknowledges message
> As an organizer, I want to click "I read and understand" so the system knows I've seen the message and won't show it again.

### US-4: Organizer browses message history
> As an organizer, I want to access a message queue/history so I can review past messages I've already acknowledged.

---

## 3. Technical Architecture

### 3.1 Storage: Firestore (NOT MongoDB)

**Rationale:**
- Auth-related feature (ties to Firebase UID)
- Real-time listeners for new messages
- Simpler security rules per-user
- Keeps user data in Firebase ecosystem

### 3.2 Firestore Collections

#### Collection: `organizerMessages`
```javascript
{
  id: string,                    // Firestore auto-ID
  type: 'error' | 'update' | 'announcement',
  title: string,                 // Short title for display
  content: string,               // Full message (markdown?)
  videoUrl: string | null,       // Optional Azure blob URL
  targetRoles: string[],         // ['RegionalOrganizer', 'RegionalAdmin']
  appId: number,                 // 1=TangoTiempo, 2=HarmonyJunction
  priority: 'low' | 'medium' | 'high' | 'urgent',
  createdAt: Timestamp,
  createdBy: string,             // Admin Firebase UID
  expiresAt: Timestamp | null    // Optional expiration
}
```

#### Collection: `organizerMessageReads`
```javascript
{
  id: string,                    // Firestore auto-ID
  messageId: string,             // Reference to message
  userUid: string,               // Firebase UID of organizer
  readAt: Timestamp,
  acknowledged: boolean          // Clicked "I read and understand"
}
```

**Alternative:** Subcollection under each message (`organizerMessages/{messageId}/reads`)

### 3.3 Video Storage

- Videos stored in Azure Blob Storage (existing `event-images` container or new `organizer-videos`)
- Firestore stores the blob URL
- Consider signed URLs for private access

---

## 4. Frontend Components (Sarah)

### 4.1 UnreadMessagesModal
- Triggers on role switch to RegionalOrganizer/RegionalAdmin
- Shows unread messages in sequence
- "I read and understand" button per message
- Blocks until all messages acknowledged (or "Remind me later")

### 4.2 OrganizerMessagesDrawer
- Right-side drawer under Organizer menu
- Shows all messages (read + unread)
- Filter by type, date, read status
- Click to expand full message
- Video player for messages with videoUrl

### 4.3 Firestore Integration
- Real-time listener for new messages
- Query: `where targetRoles contains userRole AND appId == 1`
- Left-join with reads collection to determine unread

---

## 5. Backend Considerations (Fulton)

### 5.1 Admin Message Creation Options

**Option A: CalOps Dashboard** (Dash's domain)
- Add "Messages" section to existing CalOps
- Reuse existing auth/roles infrastructure
- Pro: No new app to maintain
- Con: Couples messaging to CalOps

**Option B: New Mini Admin App**
- Dedicated lightweight app for messaging
- Could expand to other admin functions
- Pro: Clean separation
- Con: Another app to deploy/maintain

**Option C: Firebase Console Direct**
- Admin writes directly to Firestore
- No custom UI needed
- Pro: Zero frontend work
- Con: Less user-friendly, error-prone

**Toby's preference:** TBD - all options viable

**Implementation:**
- POST to Firestore directly (Firebase Admin SDK or client)
- Video upload to Azure, store URL in message

### 5.2 Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Messages: read by authenticated organizers, write by admins
    match /organizerMessages/{messageId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }

    // Reads: users can only read/write their own
    match /organizerMessageReads/{readId} {
      allow read, write: if request.auth.uid == resource.data.userUid
                        || request.auth.uid == request.resource.data.userUid;
    }
  }
}
```

### 5.3 Azure Functions Needed?
- **Maybe:** Video upload endpoint (reuse existing upload-image pattern)
- **Maybe:** Admin notification when message created
- **Probably not:** Most logic is Firestore + frontend

---

## 6. UI/UX Mockup

```
┌─────────────────────────────────────────────────────────────┐
│                    IMPORTANT UPDATE                          │
│                                                              │
│  📢 New Event Submission Guidelines                         │
│                                                              │
│  Starting April 1, all events must include...               │
│  [Full message content here]                                │
│                                                              │
│  ▶️ [Watch Video Explanation]                               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          ✓ I read and understand                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [Remind me later]                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Phases

### Phase 1: Core MVP
- [ ] Firestore collections setup
- [ ] Security rules
- [ ] UnreadMessagesModal (frontend)
- [ ] Read/acknowledge flow
- [ ] Basic admin creation (CalOps or direct Firestore)

### Phase 2: Message History
- [ ] OrganizerMessagesDrawer (right drawer)
- [ ] Filter/search functionality
- [ ] Message type badges

### Phase 3: Video Support
- [ ] Azure video upload endpoint
- [ ] Video player in message modal
- [ ] Thumbnail generation (optional)

---

## 8. Open Questions

1. **Subcollection vs separate collection for reads?**
   - Subcollection: easier to query "who read this message"
   - Separate: easier to query "what has this user read"

2. **Message targeting granularity?**
   - By role only, or by specific organizer/region?

3. **Expiration behavior?**
   - Hide expired messages or show with "expired" badge?

4. **Offline support?**
   - Cache messages for offline viewing?

---

## 9. JIRA Tickets

**Epic:** [TIEMPO-387](https://hdtsllc.atlassian.net/browse/TIEMPO-387) - Organizer Messaging System

- [ ] TIEMPO-387: Organizer Messaging - Firestore Schema
- [ ] TIEMPO-XXX: Organizer Messaging - UnreadMessagesModal
- [ ] TIEMPO-XXX: Organizer Messaging - OrganizerMessagesDrawer
- [ ] TIEMPO-XXX: Organizer Messaging - Admin Creation UI
- [ ] CALBEAF-XXX: Organizer Messaging - Video Upload Endpoint

---

## 10. Team Sign-off

| Role | Name | Status | Date |
|------|------|--------|------|
| Frontend Lead | Sarah | DRAFTED | 2026-03-17 |
| Backend Lead | Fulton | PENDING | - |
| Coordinator | Quinn | PENDING | - |
| Stakeholder | Toby | PENDING | - |
