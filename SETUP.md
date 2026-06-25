# Tahini Tracker — Setup Guide
## From zero to live app in ~45 minutes

---

## What you'll set up
1. Supabase — your cloud database (free)
2. The app running on your laptop (for testing)
3. Vercel — your live URL accessible from any device (free)
4. PWA — install it on your phone like a native app

---

## STEP 1 — Supabase (your database)

1. Go to **https://supabase.com** and sign up with Google or email (free)
2. Click **"New project"**
   - Name: `tahini-tracker`
   - Database password: choose something strong and save it
   - Region: pick **Frankfurt** (closest to Egypt)
3. Wait ~2 minutes for the project to be created
4. Go to **SQL Editor** (left sidebar)
5. Click **"New query"**, paste the entire contents of `schema.sql`, click **Run**
   - You should see "Success. No rows returned"
6. Go to **Settings → API** (left sidebar)
7. Copy two values — you will need them in Step 2:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`

---

## STEP 2 — Set up the app on your laptop

### You need Node.js installed
- Go to **https://nodejs.org** → download the LTS version → install it
- To check it worked: open Terminal (Mac) or Command Prompt (Windows) and type:
  ```
  node --version
  ```
  You should see something like `v20.11.0`

### Install and run the app
Open Terminal / Command Prompt and run these commands one by one:

```bash
# 1. Go into the app folder
cd tahini-app

# 2. Install dependencies (only needed once)
npm install

# 3. Create your environment file
cp .env.example .env
```

Now open the `.env` file in any text editor (Notepad, TextEdit, VS Code) and fill in your Supabase values:

```
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-actual-anon-key...
```

Save the file, then:

```bash
# 4. Start the app
npm run dev
```

Open your browser and go to **http://localhost:5173**

You should see the app with sample data. Try adding an order to confirm it saves.

---

## STEP 3 — Deploy to the web (Vercel)

This gives you a real URL like `https://tahini-tracker.vercel.app` that works from any device.

1. Go to **https://github.com** and create a free account
2. Create a new repository called `tahini-tracker` (private is fine)
3. Upload all the app files to it (or use the GitHub Desktop app)

4. Go to **https://vercel.com** and sign up with your GitHub account (free)
5. Click **"Add New Project"** → import your `tahini-tracker` repository
6. Before clicking Deploy, click **"Environment Variables"** and add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
7. Click **Deploy**
8. In ~2 minutes you'll have a live URL

✅ Your app is now live. Open it on your phone.

---

## STEP 4 — Install on your phone (PWA)

### Android (Chrome)
1. Open your Vercel URL in Chrome on your Android phone
2. Tap the **three dots menu** (top right)
3. Tap **"Add to Home screen"**
4. Tap **Add**
5. Done — it appears on your home screen like a native app

### iPhone (Safari)
1. Open your Vercel URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share button** (box with arrow at bottom)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**
5. Done

The app will open fullscreen with no browser bar, just like a real app.

---

## STEP 5 — Offline mode confirmation

1. Open the app on your phone
2. Turn on Airplane mode
3. Add a test order — it saves locally
4. Turn Airplane mode off
5. The order automatically syncs to Supabase within seconds

The amber dot in the top bar means you're offline. It disappears when you reconnect.

---

## Daily backup (optional but recommended)

Every month, go to Dashboard → Export. You'll get an Excel file with all your data. Save it to Google Drive. This is your personal backup independent of Supabase.

---

## Troubleshooting

**"Cannot read properties of undefined"** — your .env file is missing or has the wrong keys. Double-check Step 2.

**App loads but data doesn't save** — check your Supabase project is active (free projects pause after 7 days of inactivity — just log in to Supabase to wake it up).

**Can't install on iPhone** — make sure you're using Safari, not Chrome or Firefox.

**Vercel deployment fails** — make sure the environment variables are set before deploying.

---

## What everything costs

| Service | Cost |
|---------|------|
| Supabase | Free (up to 500MB, 50,000 rows — you won't hit this for years) |
| Vercel | Free (up to 100GB bandwidth/month) |
| Domain name (optional) | ~$10/year if you want tahinistore.com |

**Total: Free.**

---

## Future upgrades (when you need them)

- Add login/password → Supabase Auth (built in, free)
- Multiple users → same Auth system
- Custom domain → Vercel Settings → Domains
- Automatic WhatsApp messages → Twilio or WhatsApp Business API (when order volume justifies the cost)
