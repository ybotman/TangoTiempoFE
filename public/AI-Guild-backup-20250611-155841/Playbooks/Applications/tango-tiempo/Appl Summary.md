# TangoTiempo.com

**TangoTiempo** is the United States’ first fully dedicated Argentine Tango event calendar. It provides a centralized, intuitive, and mobile-friendly interface for dancers, organizers, and tango communities to post, find, and interact with tango events.

## Short cut name is often just 
* TT or
* TT.com

---

## 🌐 Live Site

> [https://tangotiempo.com](https://tangotiempo.com)

---

## 📐 Architecture Overview

- **Frontend:**  
  - Built with **Next.js 15** (App Router) and **React 19+**  
  - Styled using **MUI (Material-UI v6+)**  
  - SSR + CSR hybrid setup for fast loading and SEO
- **Backend API:**  
  - Node.js (v20) + Express (served separately)
  - Hosted on Azure App Service
- **Database:**  
  - MongoDB Atlas (GeoJSON support for venue search)
- **Auth & Hosting:**  
  - Firebase Authentication (Organizers & Admin roles)
  - Cloudflare for CDN and domain management
- **CI/CD:**  
  - GitHub Actions for automated builds and deployments
- **Analytics:**  
  - Vercel Analytics + Google Analytics integration

---

## 📦 Folder Structure (Frontend)

```shell
src/
├── app/               # Next.js app router directory
│   ├── layout.js      # Root layout
│   └── page.jsx       # Landing page
├── components/        # Shared components (UI, forms, context)
├── firebase/          # Firebase client config & helpers
├── hooks/             # Custom React hooks
├── lib/               # API utilities, constants, helper funcs
├── styles/            # Global styles, MUI theme
├── public/            # Static assets (favicon, images)
└── types/             # PropTypes & shared JS types


⸻

🔐 Roles & Permissions
	•	Named User (NU):
	•	Can favorite organizers, get event notifications (tiered), and see banners
	•	Organizer:
	•	Manages events (CRUD), venue linking, ad campaigns
	•	Regional Organizer (RO):
	•	Approves new organizers/venues for their region
	•	Admin (via CalOps):
	•	Full control (CRUD for events, orgs, venues, banners)

⸻

📊 Feature Highlights
	•	📅 Advanced Calendar Filtering: by location, category, date
	•	📍 Venue Geolocation & Mapping
	•	🔔 Tiered Notification System: based on favorite orgs + region
	•	🖼️ Banner Ad Campaigns: organizers can run and target
	•	🔒 Secure Firebase Auth: role-based content access
	•	🧪 Cypress E2E Testing (Planned)
	•	⚙️ Admin Tool (CalOps): separate admin dashboard for ops

⸻

🚀 Getting Started (Local Dev)

# Frontend
cd tangotiempo.com
npm install
npm run dev

Dependencies:
	•	Node 20+
	•	MongoDB URI (set in .env.local)
	•	Firebase API keys (set in .env.local)

⸻

🧪 Testing

Cypress integration for:
	•	Event views
	•	Organizer auth flow
	•	API fetch validation (frontend and backend)

⸻

📝 Environment Variables (.env.local)

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api


⸻

🤝 Contributing

Pull requests welcome! Use feature branches and ensure PropTypes and tests are in place.

⸻

🛡️ License

© 2025 TangoTiempo.com – All Rights Reserve