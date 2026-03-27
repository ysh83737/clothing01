const express = require('express');
const router = express.Router();
module.exports = function(db) {
  router.get('/', (req, res) => {
    const { category, status, keyword, page = 1, pageSize = 20 } = req.query;
    let where = [];
    let params = [];
    if (category) { where.push('category = ?'); params.push(category); }
    if (status) { where.push('status = ?'); params.push(status); }
    if (keyword) { where.push('(name LIKE ? OR item_code LIKE ?)'); params.push('%'+keyword+'%', '%'+keyword+'%'); }
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const total = db.prepare('SELECT COUNT(*) as n FROM clothing_items '+whereStr).get(...params).n;
    const offset = (parseInt(page)-1)*parseInt(pageSize);
    const rows = db.prepare('SELECT * FROM clothing_items '+whereStr+' ORDER BY id DESC LIMIT ? OFFSET ?').all(...params, parseInt(pageSize), offset);
    res.json({ items: rows, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  });
  router.post('/', (req, res) => {
    const { item_code, name, category, size, color, gender, quantity, unit, remark } = req.body;
    const result = db.prepare('INSERT INTO clothing_items (item_code,name,category,size,color,gender,quantity,unit,remark) VALUES (?,?,?,?,?,?,?,?,?)').run(item_code,name,category,size||null,color||null,gender||null,quantity||0,unit||'件',remark||null);
    res.json({ id: result.lastInsertRowid, item_code });
  });
  router.put('/:id', (req, res) => {
    const { name,category,size,color,gender,quantity,unit,status,remark } = req.body;
    db.prepare('UPDATE clothing_items SET name=?,category=?,size=?,color=?,gender=?,quantity=?,unit=?,status=?,remark=? WHERE id=?').run(name,category,size||null,color||null,gender||null,quantity,unit||'件',status||'available',remark||null,req.params.id);
    res.json({ ok: true });
  });
  router.delete('/:id', (req, res) => { db.prepare('DELETE FROM clothing_items WHERE id=?').run(req.params.id); res.json({ ok: true }); });
  return router;
};
