const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(path.join(dbDir, 'database.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
const schema = fs.readFileSync(path.join(dbDir, 'schema.sql'), 'utf8');
db.exec(schema);
app.use((req, res, next) => { req.db = db; next(); });
app.use(cors());
app.use(express.json());
app.use('/api', require('./routes')(db));
app.get('/api/items/next-code', (req, res) => {
  const row = db.prepare("SELECT MAX(CAST(SUBSTR(item_code, 4) AS INTEGER)) as maxn FROM clothing_items WHERE item_code LIKE 'CW-%'").get();
  const next = (row.maxn || 0) + 1;
  res.json({ item_code: `CW-${String(next).padStart(5, '0')}` });
});
app.listen(PORT, () => { console.log('✅ 服装仓库服务已启动: http://localhost:'+PORT); });
