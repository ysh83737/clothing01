const express = require('express');
const router = express.Router();
module.exports = function(db) {
  router.use('/items', require('./items')(db));
  router.use('/employees', require('./employees')(db));
  router.use('/lend-records', require('./lend')(db));
  router.use('/return-records', require('./return')(db));
  router.use('/inventory', require('./inventory')(db));
  router.use('/dashboard', require('./dashboard')(db));
  return router;
};
