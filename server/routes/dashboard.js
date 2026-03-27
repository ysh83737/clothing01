const express = require('express');
const router = express.Router();
module.exports = function(db) {
  router.get('/', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const totalItems = db.prepare("SELECT SUM(quantity) as n FROM clothing_items WHERE status!='lost'").get().n || 0;
    const lentItems = db.prepare("SELECT SUM(li.quantity) as n FROM lend_items li JOIN lend_records lr ON li.record_id=lr.id WHERE lr.status='active'").get().n || 0;
    const lostItems = db.prepare("SELECT COUNT(*) as n FROM clothing_items WHERE status='lost'").get().n || 0;
    const todayLend = db.prepare("SELECT COUNT(*) as n FROM lend_records WHERE lend_date=?").get(today).n || 0;
    const todayReturn = db.prepare("SELECT COUNT(*) as n FROM return_records WHERE return_date=?").get(today).n || 0;
    const activeRecords = db.prepare("SELECT COUNT(*) as n FROM lend_records WHERE status='active'").get().n || 0;
    const recentLend = db.prepare("SELECT lr.*, e.name as employee_name FROM lend_records lr LEFT JOIN employees e ON lr.employee_id=e.id ORDER BY lr.id DESC LIMIT 5").all();
    res.json({ totalItems, lentItems, lostItems, todayLend, todayReturn, activeRecords, recentLend });
  });
  return router;
};
