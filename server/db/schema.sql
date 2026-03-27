-- 服装品目
CREATE TABLE IF NOT EXISTS clothing_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  size TEXT,
  color TEXT,
  gender TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT '件',
  status TEXT DEFAULT 'available',
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 员工档案
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 借出记录
CREATE TABLE IF NOT EXISTS lend_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_no TEXT UNIQUE NOT NULL,
  employee_id INTEGER NOT NULL,
  lend_date DATE NOT NULL,
  due_date DATE,
  event_name TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- 借出明细
CREATE TABLE IF NOT EXISTS lend_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (record_id) REFERENCES lend_records(id),
  FOREIGN KEY (item_id) REFERENCES clothing_items(id)
);

-- 归还记录
CREATE TABLE IF NOT EXISTS return_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id INTEGER NOT NULL,
  return_date DATE NOT NULL,
  handled_by TEXT,
  FOREIGN KEY (record_id) REFERENCES lend_records(id)
);

-- 归还明细
CREATE TABLE IF NOT EXISTS return_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  return_record_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  lend_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  condition TEXT DEFAULT 'normal',
  FOREIGN KEY (return_record_id) REFERENCES return_records(id),
  FOREIGN KEY (item_id) REFERENCES clothing_items(id),
  FOREIGN KEY (lend_item_id) REFERENCES lend_items(id)
);

-- 盘点记录
CREATE TABLE IF NOT EXISTS inventory_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_no TEXT UNIQUE NOT NULL,
  session_type TEXT NOT NULL,
  categories TEXT,
  start_date DATE NOT NULL,
  status TEXT DEFAULT 'ongoing',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 盘点明细
CREATE TABLE IF NOT EXISTS inventory_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  system_quantity INTEGER NOT NULL,
  actual_quantity INTEGER,
  discrepancy INTEGER DEFAULT 0,
  handled INTEGER DEFAULT 0,
  remark TEXT,
  FOREIGN KEY (session_id) REFERENCES inventory_sessions(id),
  FOREIGN KEY (item_id) REFERENCES clothing_items(id)
);
