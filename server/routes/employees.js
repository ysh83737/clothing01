const express = require('express');
const router = express.Router();
module.exports = function(db) {
  router.get('/', (req, res) => { res.json(db.prepare('SELECT * FROM employees ORDER BY id DESC').all()); });
  router.post('/', (req, res) => {
    const { name, department, phone } = req.body;
    const result = db.prepare('INSERT INTO employees (name,department,phone) VALUES (?,?,?)').run(name, department||null, phone||null);
    res.json({ id: result.lastInsertRowid, name });
  });
  router.put('/:id', (req, res) => {
    const { name, department, phone } = req.body;
    db.prepare('UPDATE employees SET name=?,department=?,phone=? WHERE id=?').run(name, department||null, phone||null, req.params.id);
    res.json({ ok: true });
  });
  router.delete('/:id', (req, res) => { db.prepare('DELETE FROM employees WHERE id=?').run(req.params.id); res.json({ ok: true }); });
  return router;
};
