# 🎮 Wrecky Ball - Global Leaderboard Game

A fun browser-based defense game where you protect an orb from incoming enemies by knocking them away with your cursor! Features a global leaderboard powered by Supabase.

## 🎯 How to Play
- Move your mouse/finger to control the wrecking ball
- Knock enemies away before they reach the central orb
- Click or right-click to use special wave attacks
- Earn points by launching enemies off-screen
- Survive as long as possible!

## 📦 Files Included
```
wrecky-ball/
├── index.html    # Landing page with leaderboard
├── game.html     # The actual game
└── README.md     # This file
```

## 🚀 Quick Setup (5 minutes)

### Step 1: Setup Supabase Database

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (it's free!)
   - Click "New Project"
   - Fill in:
     - Name: `wrecky-ball`
     - Database Password: (generate a strong one)
     - Region: (choose closest to you)
   - Click "Create new project" (takes ~2 minutes)

2. **Create Database Table**
   - In Supabase dashboard, click "SQL Editor"
   - Click "New Query"
   - Copy and paste this SQL:

```sql
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert scores"
  ON leaderboard FOR INSERT
  TO public
  WITH CHECK (true);
```

   - Click "Run" (bottom right)
   - You should see "Success. No rows returned"

3. **Get Your API Credentials**
   - Click "Project Settings" (gear icon)
   - Click "API" in left menu
   - Copy these two values:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public key**: `eyJxxx...` (long string)

### Step 2: Update Your Files

**In `index.html`:**
- Open the file in a text editor
- Find lines 131-132:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```
- Replace with your actual credentials:
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJxxxxx...';
```

**In `game.html`:**
- Find lines 116-117
- Replace with the SAME credentials

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# In your project folder
vercel login
vercel
```

**Option B: Using GitHub**
1. Create a GitHub repository
2. Push your files
3. Go to https://vercel.com
4. Click "New Project"
5. Import your GitHub repo
6. Click "Deploy"

**Option C: Drag and Drop**
1. Go to https://vercel.com
2. Sign up/login
3. Drag your project folder onto the page
4. Click "Deploy"

### Step 4: Test It!
1. Visit your Vercel URL (e.g., `wrecky-ball.vercel.app`)
2. Enter your name
3. Play the game
4. Check if your score appears in the leaderboard!

## 🎮 Game Controls

### Desktop:
- **Move Mouse** - Control the wrecking ball
- **Left Click** or **Right Click** - Fire special wave attack
- **Mouse Movement** - Knock enemies away

### Mobile:
- **Touch & Drag** - Control the wrecking ball
- **Special Button** - Fire wave attack

## 🏗️ Tech Stack
- **Frontend**: Pure HTML5, CSS3, JavaScript (Canvas API)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **No frameworks or build tools needed!**

## 🔒 Security Notes
- The `anon` key is safe to expose publicly
- Row Level Security (RLS) controls database access
- Players can only INSERT and SELECT scores
- Players cannot DELETE or UPDATE existing scores

## 🐛 Troubleshooting

### Leaderboard won't load
- ✅ Check Supabase URL and API key are correct
- ✅ Verify table was created (check Supabase Table Editor)
- ✅ Open browser console (F12) for error messages

### Score won't submit
- ✅ Check credentials in game.html
- ✅ Verify RLS policies are enabled
- ✅ Check browser console for errors

### Game won't start
- ✅ Make sure both files are in the same directory
- ✅ Check that file names are exactly `index.html` and `game.html`
- ✅ Try opening in a different browser

## 💰 Cost
**Completely FREE!**
- Supabase Free Tier: 500MB database, 50K monthly active users
- Vercel Free Tier: 100GB bandwidth/month, unlimited deployments

Both services are more than enough for a game with thousands of players!

## 🎨 Customization Ideas

### Easy Changes:
- Change colors in CSS
- Modify enemy spawn rate in `game.html`
- Adjust orb HP and special count
- Change player name max length

### Advanced Features:
- Add daily/weekly leaderboards
- Implement user accounts (Supabase Auth)
- Add achievements system
- Store personal high scores
- Add sound effects
- Create power-ups

## 📊 Database Schema

```sql
leaderboard table:
┌────┬─────────────┬───────┬─────────────────────┐
│ id │ player_name │ score │     created_at      │
├────┼─────────────┼───────┼─────────────────────┤
│ 1  │ Alice       │ 450   │ 2025-09-30 10:30:00 │
│ 2  │ Bob         │ 320   │ 2025-09-30 10:35:00 │
└────┴─────────────┴───────┴─────────────────────┘
```

## 🤝 Contributing
Feel free to fork and improve! Some ideas:
- Add multiplayer support
- Create different game modes
- Add enemy types with different behaviors
- Implement combo system

## 📝 License
MIT License - feel free to use for any purpose!

## 🆘 Need Help?
- Check browser console (F12) for errors
- Verify Supabase credentials
- Test database connection in Supabase dashboard
- Make sure both HTML files have the same credentials

## 🎉 Enjoy!
Have fun playing and climbing the leaderboard!

---

Made with ❤️ using vanilla JavaScript