const express = require('express');
const router = express.Router();
module.exports = function(db) {
  function genNo() { return 'LEND-' + Date.now(); }
  router.get('/', (req, res) => {
    const { status, employee_id } = req.query;
    let where = [];
    let params = [];
    if (status) { where.push('lr.status = ?'); params.push(status); }
    if (employee_id) { where.push('lr.employee_id = ?'); params.push(employee_id); }
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const rows = db.prepare('SELECT lr.*, e.name as employee_name, e.department FROM lend_records lr LEFT JOIN employees e ON lr.employee_id=e.id '+whereStr+' ORDER BY lr.id DESC').all(...params);
    res.json(rows);
  });
  router.get('/:id', (req, res) => {
    const record = db.prepare('SELECT lr.*, e.name as employee_name, e.department FROM lend_records lr LEFT JOIN employees e ON lr.employee_id=e.id WHERE lr.id=?').get(req.params.id);
    if (!record) return res.status(404).json({ error: '未找到' });
    const items = db.prepare('SELECT li.*, ci.name as item_name, ci.item_code, ci.unit FROM lend_items li JOIN clothing_items ci ON li.item_id=ci.id WHERE li.record_id=?').all(req.params.id);
    res.json({ ...record, items });
  });
  router.post('/', (req, res) => {
    const { employee_id, lend_date, due_date, event_name, items } = req.body;
    const record_no = genNo();
    const result = db.prepare('INSERT INTO lend_records (record_no,employee_id,lend_date,due_date,event_name) VALUES (?,?,?,?,?)').run(record_no, employee_id, lend_date, due_date||null, event_name||null);
    const record_id = result.lastInsertRowid;
    for (const item of items) {
      db.prepare('INSERT INTO lend_items (record_id,item_id,quantity) VALUES (?,?,?)').run(record_id, item.item_id, item.quantity);
      const ci = db.prepare('SELECT quantity FROM clothing_items WHERE id=?').get(item.item_id);
      db.prepare('UPDATE clothing_items SET quantity=?, status=? WHERE id=?').run(ci.quantity - item.quantity, 'lent', item.item_id);
    }
    res.json({ id: record_id, record_no });
  });
  return router;
};
