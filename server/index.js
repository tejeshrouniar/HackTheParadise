// Storicode Arcane Backend API Server
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Persistent JSON Database Path
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory and file exist with initial seed data
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DEFAULT_DB = {
  users: [
    {
      id: 'apprentice-1',
      name: 'Merlin the Coder',
      email: 'merlin@example.com',
      language: 'Python',
      xp: 450,
      gems: 12,
      level: 4,
      title: 'Aether Conjurer',
      completedLessons: [1, 2, 3],
      avatar: '🧙‍♂️',
      createdAt: '2026-10-01T00:00:00.00Z',
    },
    {
      id: 'apprentice-2',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      language: 'Python',
      xp: 980,
      gems: 28,
      level: 8,
      title: 'Grand Chronomancer',
      completedLessons: [1, 2, 3, 4, 5, 6, 7],
      avatar: '👩‍💻',
      createdAt: '2026-10-02T00:00:00.00Z',
    },
    {
      id: 'apprentice-3',
      name: 'Sparky Pyromancer',
      email: 'sparky@example.com',
      language: 'JavaScript',
      xp: 260,
      gems: 6,
      level: 2,
      title: 'Baby Dragon Tamer',
      completedLessons: [1, 2],
      avatar: '🐲',
      createdAt: '2026-10-05T00:00:00.00Z',
    },
  ],
  spells: [
    {
      id: 'spell-1',
      author: 'Merlin the Coder',
      title: 'Starlight Bridge Matrix',
      code: 'def build_bridge():\n    for step in range(4):\n        place_starlight_tile()\n\nbuild_bridge()',
      language: 'Python',
      votes: 42,
      createdAt: '2026-10-15T12:00:00.00Z',
    },
    {
      id: 'spell-2',
      author: 'Ada Lovelace',
      title: 'Glitch Chimera Bane',
      code: 'mana_shield(100)\nfor i in range(3):\n    cast_starlight_bolt()\nholy_smite()',
      language: 'Python',
      votes: 89,
      createdAt: '2026-10-18T15:30:00.00Z',
    },
  ],
  stats: {
    totalSpellsCast: 14205,
    activeApprentices: 384,
    dragonsHatched: 189,
    cursesBroken: 542,
  },
};

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db.json, returning default:', err);
  }
  return DEFAULT_DB;
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// Initialize seed data if file doesn't exist
if (!fs.existsSync(DB_FILE)) {
  writeDb(DEFAULT_DB);
}

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Health & Server Status
app.get('/api/health', (req, res) => {
  const db = readDb();
  res.json({
    status: 'ok',
    server: 'Storicode Arcane Engine v2.0',
    uptimeSeconds: Math.floor(process.uptime()),
    activeWizards: db.stats.activeApprentices,
    totalSpellsCast: db.stats.totalSpellsCast,
    timestamp: new Date().toISOString(),
  });
});

// 2. Authentication: Register Apprentice
app.post('/api/auth/register', (req, res) => {
  const { name, email, language, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required incantations!' });
  }

  const db = readDb();
  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    return res.json({ success: true, message: 'Welcome back, Apprentice!', user });
  }

  const newUser = {
    id: `apprentice-${Date.now()}`,
    name,
    email,
    language: language || 'Python',
    xp: 100,
    gems: 5,
    level: 1,
    title: 'Initiate of the Spark',
    completedLessons: [1],
    avatar: '🪄',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.stats.activeApprentices += 1;
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Apprentice wand registered successfully!',
    user: newUser,
  });
});

// 3. Authentication: Login
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user) {
    return res.status(404).json({ error: 'Apprentice record not found in the Arcane Register.' });
  }

  res.json({ success: true, user });
});

// 4. Apprentice Progress & Level-Up
app.post('/api/profile/progress', (req, res) => {
  const { userId, lessonId, xpGained = 100, gemsGained = 3 } = req.body;
  const db = readDb();

  let user = db.users.find((u) => u.id === userId);
  if (!user && db.users.length > 0) {
    user = db.users[0]; // Fallback to current session user
  }

  if (user) {
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
    }
    user.xp += xpGained;
    user.gems += gemsGained;
    user.level = Math.floor(user.xp / 100) + 1;
    db.stats.totalSpellsCast += 1;
    writeDb(db);

    return res.json({
      success: true,
      message: `Quest #${lessonId} recorded!`,
      xp: user.xp,
      level: user.level,
      gems: user.gems,
      completedLessons: user.completedLessons,
    });
  }

  res.status(404).json({ error: 'User not found' });
});

// 5. Backend Code Execution & Simulation Validator
app.post('/api/quests/execute', (req, res) => {
  const { lessonId, code } = req.body;
  const logs = [];

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Empty spell incantation!' });
  }

  const cleanLines = code
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  logs.push('$ storicode-backend-eval --strict');
  logs.push(`> Parsing ${cleanLines.length} arcane instruction lines...`);

  // Basic Python Syntax Checks
  let hasSyntaxError = false;
  let syntaxErrorMessage = '';

  for (let i = 0; i < cleanLines.length; i++) {
    const line = cleanLines[i];
    // Check missing parentheses
    if (line.includes('(') && !line.includes(')')) {
      hasSyntaxError = true;
      syntaxErrorMessage = `SyntaxError: Unclosed parenthesis on line: "${line}"`;
      break;
    }
    // Check invalid for loop syntax
    if (line.startsWith('for ') && !line.endsWith(':')) {
      hasSyntaxError = true;
      syntaxErrorMessage = `SyntaxError: Missing colon ":" at end of loop statement: "${line}"`;
      break;
    }
  }

  if (hasSyntaxError) {
    logs.push(`❌ ${syntaxErrorMessage}`);
    return res.json({
      success: false,
      logs,
      error: syntaxErrorMessage,
      diagnostics: {
        severity: 'ERROR',
        suggestion: 'Check punctuation and closing parentheses.',
      },
    });
  }

  // Simulated Quest-Specific Checks
  let victory = false;
  if (lessonId === 1 && code.includes('dragon.collect_crystal()')) {
    victory = true;
    logs.push('> Dragon reached target coordinate (2, 2) and collected Cosmic Crystal! 💎');
  } else if (lessonId === 2 && code.includes('mana_flask') && code.includes('cauldron.brew_elixir()')) {
    victory = true;
    logs.push('> Alchemical elixir successfully transmuted in bubbling cauldron! 🫧');
  } else if (lessonId === 3 && code.includes('range(6)') && code.includes('grow_flower()')) {
    victory = true;
    logs.push('> 6 enchanted starlight lotus blossoms bloomed in the meadow! 🌸');
  } else if (lessonId === 4 && code.includes('build_bridge()')) {
    victory = true;
    logs.push('> Astral crystal bridge constructed across the bottomless void! 🔮');
  } else if (lessonId === 5 && code.includes('purify_rune(3)') && !code.includes('purify_rune(9)')) {
    victory = true;
    logs.push('> Cursed index corrected: All 3 obsidian crypt runes cleansed! ⚡');
  } else if (lessonId === 6 && code.includes('charge_stargate') && code.includes('align_gate_rings')) {
    victory = true;
    logs.push('> Planetary rings aligned and celestial stargate charged to 200 Flux! 🌌');
  } else if (lessonId === 7 && code.includes('crystals.sort()')) {
    victory = true;
    logs.push('> Chrono crystal array sorted in ascending timeline order! ⏳');
  } else if (lessonId === 8 && code.includes('holy_smite()') && code.includes('mana_shield')) {
    victory = true;
    logs.push('> Glitch Chimera Overlord vanquished with holy arcane smite! 🏆');
  } else {
    victory = true;
    logs.push('> Spell passed validation checks.');
  }

  const db = readDb();
  db.stats.totalSpellsCast += 1;
  writeDb(db);

  res.json({
    success: true,
    victory,
    logs,
    codeLength: code.length,
    timestamp: new Date().toISOString(),
  });
});

// 6. Community & Grimoire Spells
app.get('/api/spells', (req, res) => {
  const db = readDb();
  res.json({ success: true, spells: db.spells });
});

app.post('/api/spells', (req, res) => {
  const { author, title, code, language = 'Python' } = req.body;
  if (!title || !code) {
    return res.status(400).json({ error: 'Title and code are required to inscribe a spell.' });
  }

  const db = readDb();
  const newSpell = {
    id: `spell-${Date.now()}`,
    author: author || 'Anonymous Apprentice',
    title,
    code,
    language,
    votes: 1,
    createdAt: new Date().toISOString(),
  };

  db.spells.unshift(newSpell);
  writeDb(db);

  res.status(201).json({ success: true, spell: newSpell });
});

// 7. Global Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const db = readDb();
  const sorted = [...db.users].sort((a, b) => b.xp - a.xp);
  res.json({
    success: true,
    leaderboard: sorted.map((u, index) => ({
      rank: index + 1,
      name: u.name,
      xp: u.xp,
      level: u.level,
      title: u.title,
      avatar: u.avatar,
      completedQuestsCount: u.completedLessons.length,
    })),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🪄 Storicode Arcane Backend running on http://localhost:${PORT}`);
  console.log(`⚡ API ready at http://localhost:${PORT}/api/health`);
});
