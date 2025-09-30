# ⚡ Quick Start Guide - 5 Minutes

## 📋 Checklist

### 1. Supabase Setup (2 min)
- [ ] Go to https://supabase.com → Sign up
- [ ] Create new project → Wait for it to load
- [ ] SQL Editor → Paste SQL below → Run

```sql
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert scores" ON leaderboard FOR INSERT TO public WITH CHECK (true);
```

- [ ] Project Settings → API → Copy **URL** and **anon key**

### 2. Update Files (1 min)
- [ ] Open `index.html` → Find line 131-132 → Paste credentials
- [ ] Open `game.html` → Find line 116-117 → Paste credentials

### 3. Deploy (2 min)
```bash
npm install -g vercel
vercel login
vercel
```

OR just drag folder to https://vercel.com

### 4. Test
- [ ] Visit your .vercel.app URL
- [ ] Enter name → Play → Check leaderboard

## 🔑 What You Need

### From Supabase:
```
URL: https://xxxxx.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Update These Lines:

**index.html (lines 131-132):**
```javascript
const SUPABASE_URL = 'YOUR_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_KEY_HERE';
```

**game.html (lines 116-117):**
```javascript
const SUPABASE_URL = 'YOUR_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_KEY_HERE';
```

## ⚠️ Common Mistakes

❌ Wrong URL format: `xxxxx.supabase.co` (missing https://)
✅ Correct: `https://xxxxx.supabase.co`

❌ Using service_role key instead of anon key
✅ Use the **anon/public** key (starts with eyJ...)

❌ Forgetting to update BOTH files
✅ Update credentials in index.html AND game.html

## 🎯 File Structure

```
wrecky-ball/
├── index.html    ← Landing page (UPDATE LINE 131-132)
├── game.html     ← Game page (UPDATE LINE 116-117)
└── README.md     ← Documentation
```

## 🚀 Deploy Commands

```bash
# Install Vercel
npm install -g vercel

# Login
vercel login

# Deploy (in your project folder)
vercel

# Done! Your URL will be shown
```

## 🐛 If Something Breaks

1. **Leaderboard won't load?**
   - Press F12 → Check Console tab
   - Verify Supabase URL and key
   - Check Supabase Table Editor has `leaderboard` table

2. **Can't submit score?**
   - Make sure credentials are in game.html too
   - Check browser console for errors
   - Verify RLS policies are enabled

3. **Page won't load?**
   - Check file names: `index.html` and `game.html` (lowercase)
   - Both files must be in the same folder
   - Try different browser

## ✅ Success Test

If everything works:
1. Landing page loads with empty leaderboard
2. Enter name → redirected to game
3. Play until game over
4. See "✓ Score submitted!"
5. Back to menu → your score appears!

## 🎮 Controls

**Desktop:** Move mouse + Click for special
**Mobile:** Touch/drag + Special button

## 💡 Tips

- You get 1 special every 100 points
- Enemies speed up over time
- Orb changes color based on HP
- Wave attacks push enemies away

## 🆘 Emergency Help

If nothing works, check:
1. Are both files in the same folder?
2. Did you update credentials in BOTH files?
3. Is your Supabase project active?
4. Are the credentials copied correctly (no spaces)?

## 🎉 That's It!

Your game should now be live at:
`https://wrecky-ball-xxxxx.vercel.app`

Share with friends and compete! 🏆