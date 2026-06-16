# iMessage Clone - MERN Stack Application

A premium, feature-rich real-time messaging clone of iMessage built using the **MERN (MongoDB, Express, React, Node.js) stack**. This application integrates real-time WebSockets, Clerk Authentication with webhook synchronization, dynamic theme accent presets, custom backdrop wallpapers, keyboard typing audio, and ImageKit-powered media uploads (images and videos).

---

## 🚀 Key Features

* **Real-time Messaging**: Powered by **Socket.io** using direct WebSocket transports (bypassing HTTP polling handshakes for <100ms message speed) with multi-connection/tab tracking to ensure seamless presence syncing.
* **Clerk Authentication**: Secure session management with Clerk, utilizing webhooks to automatically sync user profile creation, updates, and deletion into the MongoDB database.
* **Consolidated Settings Modal**: A unified settings panel (gear icon) with sub-tabs for appearance theme presets, dark/light mode toggles, preset/custom wallpaper selections, keyboard sound click selectors (with list-based muting), and notification settings.
* **Dynamic Backdrop Wallpapers**: Dynamic folder scanning using Vite's `import.meta.glob`. Drop any image into the `frontend/src/assets/wallpapers/` folder and it will automatically be detected and rendered as a choice in the UI.
* **Media Uploads (Images & Videos)**: Optimised file uploads via ImageKit. Files are sized, compressed, and delivered efficiently (e.g. WebP/AVIF format auto-detection and video poster frame generation).
* **Premium UX/UI**: Implemented with glassmorphism, fluid micro-animations, slide-overs, and a responsive structure built on Tailwind CSS.

---

## 📂 Project Architecture

The project is organized into two primary workspaces under a single repository:

```
├── backend/                  # Express API Server
│   ├── src/
│   │   ├── controllers/      # Route handler controllers (Auth, Messages)
│   │   ├── lib/              # Database connection, Socket.io, and ImageKit integrations
│   │   ├── middleware/       # Authentication, Multer file filters
│   │   ├── models/           # Mongoose Database Schemas (User, Message)
│   │   ├── routes/           # Express Route Declarations
│   │   ├── seeds/            # User seeding scripts for testing
│   │   ├── scripts/          # Cleanup and localtunnel helper scripts
│   │   ├── webhooks/         # Clerk User sync webhook router
│   │   └── server.js         # Express main application setup
│   └── package.json
│
├── frontend/                 # Vite SPA Frontend
│   ├── src/
│   │   ├── assets/           # Wallpapers, logo assets
│   │   ├── components/       # Reusable React UI Components (Auth, Chat)
│   │   │   ├── settings/     # Modular settings tabs (Theme, Backdrop, Sounds)
│   │   │   └── SettingsModal.jsx # Root settings dialog trigger component
│   │   ├── context/          # Theme & Wallpaper Context providers
│   │   ├── data/             # Scanned wallpaper arrays and theme presets
│   │   ├── hooks/            # Keyboard sounds, media queries, and scrolling hooks
│   │   ├── lib/              # Axios instance setup & ImageKit helpers
│   │   ├── pages/            # Page structures (AuthPage, ChatPage)
│   │   ├── store/            # Zustand State Stores (useAuthStore, useChatStore)
│   │   ├── App.jsx           # Main Router & notifications mounting
│   │   └── index.jsx         # App mounting index
│   └── package.json
│
├── Dockerfile                # Monolithic production build (Vite + Express)
└── README.md                 # Project Documentation
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Instance (Local or MongoDB Atlas)
- Clerk Account (For Publishable/Secret Keys and Webhook signing)
- ImageKit Account (For media file storage)

### 2. Backend Configurations
Create a `.env` file under the `/backend` directory:
```env
PORT=3000
DATABASE_MONGODB_URI=your_mongodb_connection_string
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SIGNIN_KEY=your_clerk_webhook_signing_secret
NODE_ENV=development
```

Start the backend development server:
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Configurations
Create a `.env` file under the `/frontend` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:3000
VITE_BACKEND_API_URL=http://localhost:3000/api
```

Start the frontend Vite server:
```bash
cd frontend
npm install
npm run dev
```

---

## 🎛️ Utility & Administrative Scripts

Several convenience scripts are provided in the `/backend` workspace to streamline development and administrative maintenance:

### 1. Database & Asset Purge (`npm run db:clean`)
Reset your MongoDB collections, Clerk user registry, and ImageKit assets simultaneously or selectively using flags:
```bash
# Clean everything (MongoDB database, ImageKit files, and Clerk users)
npm run db:clean

# Clean only specific targets
npm run db:clean -- --db         # Purges MongoDB Users & Messages collections
npm run db:clean -- --imagekit   # Purges all uploaded files from ImageKit
npm run db:clean -- --clerk      # Deletes all user accounts from Clerk API
```

### 2. Local Port Tunneling (`npm run tunnel`)
Expose your local backend server to the internet using `localtunnel` so that you can receive and test Clerk's webhook callbacks in real-time on localhost:
```bash
npm run tunnel
```

---

## 📦 Production Deployment (Render Monolith)

This application is configured for a **monolithic Docker deployment** on Render. The `Dockerfile` at the root compiles the Vite frontend and bundles it directly into the Express `public/` static directory. Express then serves the API endpoints alongside the compiled frontend:

1. **Stage 1 (Frontend Build)**: Downloads dependencies and compiles the React application into `/app/frontend/dist`.
2. **Stage 2 (Backend Build)**: Copies source files and compiles the backend ESM code into `/app/dist`.
3. **Stage 3 (Runner)**: Copies the production build assets (Express routes serve `/public` containing the React build outputs) to minimize container size, running standard Node.js to start the server.

### Render Build Commands
- **Build Command**: `docker build -t imessage-clone .`
- **Start Command**: `node dist/server.js`
- **Environment Variables**: Make sure to define all variables listed in `.env.render` under your Render Dashboard Settings.
