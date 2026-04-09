# 🚀 Project Setup Instructions

Follow the steps below to run the project locally.

---

## 1. Clone the Repository

```bash
git clone https://github.com/joseph101kt/job_portal_barabari.git
cd job_portal_barabari
```

---

## 2. Install Dependencies

```bash
yarn install
```

---

## 3. Setup Environment Variables

Create a file named **`.env.local`** inside:

```
apps/mobile/
```

Paste the following into it:

```env
# SUPABASE
# Public (safe for the browser)
EXPO_PUBLIC_SUPABASE_URL=https://wmgdsspjzonfxwurupxt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZ2Rzc3Bqem9uZnh3dXJ1cHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTM4NDMsImV4cCI6MjA4OTk4OTg0M30.WJUThhscW_K7KXzHffE1ZGLNlJxWdeEE0deLYLN-LKE

# LIVEKIT
# Public (safe for the browser)
EXPO_PUBLIC_LIVEKIT_URL=wss://prepare-wympvblz.livekit.cloud
LIVEKIT_URL=wss://prepare-wympvblz.livekit.cloud

# API
EXPO_PUBLIC_API_URL=https://joseph-k-mobile.expo.app
```

---

## 4. Start the Development Server

Run the following command:

```bash
npm run dev
```

---

## 5. Open the App

* Wait until the Expo server starts
* You will see a QR code in the terminal
* Below it, there will be a link like:

```
http://localhost:8081
```

👉 Open this link in your browser to view the app

---

## ✅ You're all set!

You should now be able to:

* Browse jobs
* Apply as a seeker
* Chat in real-time
* Start video interviews

---
