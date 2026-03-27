const express = require('express');
const router = express.Router();
module.exports = function(db) {
  function genNo() { return 'INV-' + Date.now(); }
  router.post('/', (req, res) => {
    const { session_type, categories, start_date } = req.body;
    const session_no = genNo();
    const catArr = Array.isArray(categories) ? JSON.stringify(categories) : categories;
    const result = db.prepare('INSERT INTO inventory_sessions (session_no,session_type,categories,start_date) VALUES (?,?,?,?)').run(session_no, session_type, catArr||null, start_date);
    const session_id = result.lastInsertRowid;
    let items;
    if (session_type === 'full') {
      items = db.prepare("SELECT id, quantity as system_quantity FROM clothing_items WHERE status!='lost'").all();
    } else {
      items = db.prepare("SELECT id, quantity as system_quantity FROM clothing_items WHERE category IN ("+categories.map(()=>'?').join(',')+") AND status!='lost'").all(...categories);
    }
    for (const item of items) {
      db.prepare('INSERT INTO inventory_items (session_id,item_id,system_quantity) VALUES (?,?,?)').run(session_id, item.id, item.system_quantity);
    }
    res.json({ id: session_id, session_no });
  });
  router.get('/:id', (req, res) => {
    const session = db.prepare('SELECT * FROM inventory_sessions WHERE id=?').get(req.params.id);
    if (!session) return res.status(404).json({ error: '未找到' });
    const items = db.prepare('SELECT ii.*, ci.name, ci.item_code, ci.category, ci.unit FROM inventory_items ii JOIN clothing_items ci ON ii.item_id=ci.id WHERE ii.session_id=?').all(req.params.id);
    res.json({ ...session, items });
  });
  router.put('/:id', (req, res) => {
    const { items } = req.body;
    for (const item of items) {
      db.prepare('UPDATE inventory_items SET actual_quantity=?, discrepancy=?, handled=?, remark=? WHERE id=?').run(item.actual_quantity, (item.actual_quantity||0)-item.system_quantity, item.handled?1:0, item.remark||null, item.id);
      if (item.handled && item.discrepancy !== 0) {
        db.prepare('UPDATE clothing_items SET quantity=? WHERE id=?').run(item.actual_quantity, item.item_id);
      }
    }
    res.json({ ok: true });
  });
  router.put('/:id/complete', (req, res) => {
    db.prepare("UPDATE inventory_sessions SET status='completed' WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  });
  return router;
};
