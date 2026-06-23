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
- **CORS & Connection Modes:** During browser sessions, direct API requests to `services.leadconnectorhq.com` are blocked by default browser CORS restrictions. To resolve this on both development and production environments, the app includes a dropdown selector in the header bar:
  - **Server Proxy (api) [Default]:** Directs requests locally relative to the folder where the app is loaded (`api`), which requires a server proxy configuration in production (such as Nginx, Apache, Laravel, or our built-in PHP proxy) to route requests to GoHighLevel. Allows hosting the app inside root folders or subdirectories seamlessly.
  - **Direct GHL Connection:** Directs requests directly to `https://services.leadconnectorhq.com`. This is ideal for static hostings (like VS Code Live Server, Netlify, or Github Pages), but requires users to run a browser extension (such as "Allow CORS: Access-Control-Allow-Origin") to bypass CORS blocks in their client browser.

### 📖 Official Documentation Links
- **Official Developer Portal:** [developers.gohighlevel.com](https://developers.gohighlevel.com/)
- **API Reference & Specifications:** [marketplace.gohighlevel.com/docs/](https://marketplace.gohighlevel.com/docs/)

---

## 🌐 Production Server Configurations (For `/api` Proxy)

If you host your built static files (`dist` folder) on a live server and select the **Server Proxy (`/api`)** mode, you must configure your server to proxy incoming `/api` traffic to GoHighLevel.

### 1. Nginx Configuration
Add this configuration inside your Nginx server block:
```nginx
location /api/ {
    proxy_pass https://services.leadconnectorhq.com/;
    proxy_set_header Host services.leadconnectorhq.com;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS headers for API accessibility
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Version, Content-Type, Accept' always;
}
```

### 2. Apache Configuration (`.htaccess`)
Ensure `mod_proxy` and `mod_rewrite` are active, and add the following to your root directory `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ https://services.leadconnectorhq.com/$1 [P,L]
```

### 3. Laravel Backend Route Proxy (Recommended for Laravel & React workspaces)
If this app is paired with a Laravel backend (e.g. running on `https://instantquoteform.com`), you can add a route forwarder inside Laravel's `routes/api.php`:
```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::any('{any}', function (Request $request, $any) {
    $targetUrl = 'https://services.leadconnectorhq.com/' . $any;
    
    $response = Http::withHeaders([
        'Authorization' => $request->header('Authorization'),
        'Version'       => $request->header('Version', 'v3'),
        'Content-Type'  => 'application/json',
    ])->send($request->method(), $targetUrl, [
        'body'  => $request->getContent(),
        'query' => $request->query(),
    ]);

    return response($response->body(), $response->status())
        ->header('Content-Type', $response->header('Content-Type'));
})->where('any', '.*');
```

### 4. Vercel Configuration (`vercel.json`)
For Vercel deployments, write a `vercel.json` file in the project root:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://services.leadconnectorhq.com/:path*"
    }
  ]
}
```

### 5. Netlify Configuration (`_redirects`)
For Netlify, create a `_redirects` file under the `/public` folder (so it copies to `/dist` output):
```text
/api/*  https://services.leadconnectorhq.com/:splat  200
```

### 6. SiteGround & Shared Hosting PHP Proxy (Built-in)
Because SiteGround and most other shared hosting platforms disable Apache's `mod_proxy` (the `[P]` redirect flag) for security reasons, the standard `.htaccess` proxy rule will result in a 404. 

To solve this, we have provided a pre-configured PHP proxy script (`proxy.php`) and `.htaccess` file inside the `public/` folder. This routes all traffic from `https://yourdomain.com/api/...` securely to GoHighLevel via PHP's `curl` utility and prevents Apache from stripping key authentication headers:

1. Build the app using:
   ```bash
   npm run build
   ```
2. Upload the **contents** of the `dist/` folder directly to your SiteGround domain's `public_html` root (including the `.htaccess` and `proxy.php` files).
3. Connect inside the app's topbar using the **Server Proxy (api)** option.

💡 *For a detailed architectural breakdown of this issue, how PHP cURL resolves Apache proxy restrictions, and root vs subdirectory routing behavior, read our [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide.*

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
git clone https://github.com/harisnaveed/ghl-api-playground.git
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
