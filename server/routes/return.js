const express = require('express');
const router = express.Router();
module.exports = function(db) {
  router.post('/', (req, res) => {
    const { record_id, return_date, handled_by, items } = req.body;
    const result = db.prepare('INSERT INTO return_records (record_id,return_date,handled_by) VALUES (?,?,?)').run(record_id, return_date, handled_by||null);
    const return_record_id = result.lastInsertRowid;
    let allReturned = true;
    let anyLost = false;
    for (const item of items) {
      db.prepare('INSERT INTO return_items (return_record_id,item_id,lend_item_id,quantity,condition) VALUES (?,?,?,?,?)').run(return_record_id, item.item_id, item.lend_item_id, item.quantity, item.condition||'normal');
      const ci = db.prepare('SELECT quantity, status FROM clothing_items WHERE id=?').get(item.item_id);
      if (item.condition === 'lost') {
        db.prepare("UPDATE clothing_items SET status='lost' WHERE id=?").run(item.item_id);
        anyLost = true;
      } else {
        db.prepare('UPDATE clothing_items SET quantity=?, status=? WHERE id=?').run(ci.quantity + item.quantity, 'available', item.item_id);
      }
      const lentQty = db.prepare('SELECT SUM(quantity) as n FROM lend_items WHERE item_id=? AND record_id=?').get(item.item_id, record_id).n;
      const retQty = db.prepare("SELECT SUM(quantity) as n FROM return_items ri JOIN return_records rr ON ri.return_record_id=rr.id WHERE ri.item_id=? AND rr.record_id=? AND ri.condition!='lost'").get(item.item_id, record_id).n;
      if ((lentQty - (retQty||0)) > 0) allReturned = false;
    }
    const finalStatus = anyLost ? 'partial_lost' : (allReturned ? 'returned' : 'active');
    db.prepare('UPDATE lend_records SET status=? WHERE id=?').run(finalStatus, record_id);
    res.json({ id: return_record_id });
  });
  return router;
};
