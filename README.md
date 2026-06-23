# 🚀 GoHighLevel (GHL) Platform API Dashboard

A premium, high-performance, and interactive developer playground and dashboard for exploring, testing, and managing **GoHighLevel (GHL) Platform APIs**. 

Designed with a sleek **dark-mode glassmorphic interface**, it enables developers, agency owners, and SaaS integrators to authenticate securely via **Location ID** and **Bearer Token** to interact with GHL's core CRM, Marketing, and Settings resources directly from their browser.

---

## 🎨 Premium Features

- **⚡ Instant Playground:** Connect via your sub-account credentials and test GHL APIs directly in real-time.
- **🔮 Beautiful Glassmorphism UI:** Built with global CSS custom properties, smooth gradients, responsive sidebar navigation, and interactive hover micro-animations.
- **🔒 Session-Only Security:** Credentials are saved purely in the browser's `sessionStorage` and are never stored on any server or third-party database.
- **🔄 Built-in CORS Bypass:** Fully configured development proxy to route requests to GoHighLevel services without hitting CORS policy errors.
- **📝 Real-time JSON Inspectors:** Includes a tabbed visual layout containing structured card lists alongside raw JSON API responses.

---

## 🛠️ Tech Stack

This project is built using a modern, lightweight frontend tech stack:

*   **Core Framework:** ⚛️ [React 19.x](https://react.dev/) — Component-driven development, state management, and custom hooks.
*   **Build Tool & Dev Server:** ⚡ [Vite 8.x](https://vite.dev/) — Lightning-fast Hot Module Replacement (HMR) and optimized building.
*   **Styling & Design System:** 🎨 Vanilla CSS 3 — Engineered with a fluid HSL design token system, dynamic CSS grid layouts, glow shadows, and media queries for mobile-responsive support.
*   **Linter & Code Quality:** 🔍 [ESLint 10.x](https://eslint.org/) — Enforces modern Javascript structure and React hooks best practices.

---

## 📁 Folder Structure

Below is the directory map of the application:

```text
ghl-platform-apis/
├── public/                 # Static assets folder
├── src/                    # React Source Files
│   ├── api/                # API communication layers
│   │   └── ghlApi.js       # Core GoHighLevel API client & endpoints mapping (utilizes Version: v3 header)
│   ├── components/         # Reusable presentation components
│   │   └── ResultViewer.jsx # Tabbed data explorer (List view vs. Prettified Raw JSON view)
│   ├── modules/            # Feature-specific dashboard interfaces
│   │   ├── CalendarsModule.jsx      # Fetch and search booking calendars
│   │   ├── ContactsModule.jsx       # Read and create CRM contacts
│   │   ├── ConversationsModule.jsx  # Complex chat interface with chat threads, filters, and message sending
│   │   ├── CustomFieldsModule.jsx   # List contact-level custom fields
│   │   ├── CustomValuesModule.jsx   # List location-level custom variables
│   │   ├── FormsModule.jsx          # Explore landing page/marketing forms
│   │   ├── OpportunitiesModule.jsx  # Monitor deals and sales leads
│   │   ├── PipelinesModule.jsx      # Retrieve pipelines and phase details
│   │   ├── TagsModule.jsx           # Query contact tag taxonomies
│   │   ├── UsersModule.jsx          # Retrieve sub-account team members
│   │   └── WorkflowsModule.jsx      # Explore automated action triggers
│   ├── App.css             # Component-level styling and overrides
│   ├── App.jsx             # Main router, navigation sidebar, credential control header, and overview page
│   ├── index.css           # Global design tokens (gradients, variables, scrollbars, keyframe animations)
│   └── main.jsx            # React application entry point
├── eslint.config.js        # ESLint structure definitions
├── index.html              # Entry HTML template
├── package.json            # Manifest file declaring dependencies and scripts
└── vite.config.js          # Development server and proxy configurations
```

---

## 🔌 API Reference & Endpoints Used

The application queries the following endpoints from the GoHighLevel Developer Portal:

### 🏢 Location Core
*   `GET /locations/{locationId}` — Retrieves account details (name, email, phone, location address, company ID, timezone, etc.).

### 👤 CRM & Deals
*   `GET /contacts/` — Fetches contacts inside a location (paginated, with search query filters).
*   `POST /contacts/` — Creates a new contact for the location.
*   `GET /opportunities/search` — Performs deal lookup across pipelines.
*   `GET /opportunities/pipelines` — Lists pipelines along with stages.

### 💬 Chat & Conversations
*   `GET /conversations/search` — Queries conversation threads (supports limit, search query, sorting, contact filters, and token pagination).
*   `POST /conversations/` — Establishes a new conversation with a contact.
*   `GET /conversations/{conversationId}/messages` — Fetches chat history/messages for a thread.
*   `POST /conversations/messages` — Sends a message (SMS, Email, WhatsApp, or Live Chat) to a contact.

### 📅 Marketing & Automation
*   `GET /calendars/` — Queries available booking calendars.
*   `GET /workflows/` — Lists marketing automation workflows.
*   `GET /forms/` — Queries lead forms.
*   `GET /surveys` — Retrieves survey builders.

### ⚙️ Settings & Configuration
*   `GET /locations/{locationId}/customFields` — Pulls custom field properties.
*   `GET /locations/{locationId}/customValues` — Pulls global custom values.
*   `GET /locations/{locationId}/tags` — Pulls account-wide tags.
*   `GET /users/search` — Lists employees and users belonging to the company/location.

---

## 🔑 GoHighLevel API Version & Documentation

### 📌 API Version Details
- This dashboard integrates with **HighLevel API v2** (OAuth 2.0 and Private Integration Tokens).
- **Core Request Headers:**
  - `Authorization: Bearer <Private_Integration_Token_Or_Access_Token>`
  - `Version: v3` *(Specified as `v3` to target the latest available revisions on the `/locations`, `/contacts`, and `/conversations` paths).*
- **CORS Bypass:** During local development, the browser blocks requests directly to `services.leadconnectorhq.com` due to CORS restrictions. The project routes requests to `/api/*` locally, which `vite.config.js` transparently proxies to `https://services.leadconnectorhq.com` with the origin changed.

### 📖 Official Documentation Links
- **Official Developer Portal:** [developers.gohighlevel.com](https://developers.gohighlevel.com/)
- **API Reference & Specifications:** [marketplace.gohighlevel.com/docs/](https://marketplace.gohighlevel.com/docs/)

---

## 📥 Getting Started & Running Locally

Follow these steps to run the project on your machine:

### 1. Prerequisites
Make sure you have **Node.js** (v18.x or higher) and **npm** (v9.x or higher) installed on your system.
Verify using:
```bash
node -v
npm -v
```

### 2. Clone the Repository
Clone the project locally to your workspace:
```bash
git clone https://github.com/YOUR_USERNAME/ghl-platform-apis.git
cd ghl-platform-apis
```

### 3. Install Dependencies
Restore package dependencies using npm:
```bash
npm install
```

### 4. Run the Development Server
Launch the development server:
```bash
npm run dev
```
Once started, open your browser and navigate to the local URL (typically **`http://localhost:5173`**).

### 5. Build for Production
To generate a production-ready optimized build:
```bash
npm run build
```
This builds static resources into the `dist/` directory, which can be easily hosted on platforms like Netlify, Vercel, or AWS S3.

### 6. Preview Production Build
To preview the production bundle locally:
```bash
npm run preview
```

---

## ⚙️ How to Authenticate & Test
1. Log in to your GoHighLevel agency/sub-account dashboard.
2. Generate a **Private Integration Token** or access token via OAuth, and locate your **Location ID** in account settings.
3. Paste the **Location ID** and **Bearer Token** inside the header fields of the dashboard.
4. Click **⚡ Connect**. The dashboard will load the company/location name and unlock access to all the modules.
5. Click on any sidebar category or overview module to load details, query filters, search, and inspect the raw response payloads!

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
