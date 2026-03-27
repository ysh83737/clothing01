import axios from 'axios'
const api = axios.create({ baseURL: '/api' })
export default {
  // 品目
  getItems: (params) => api.get('/items', { params }),
  addItem: (data) => api.post('/items', data),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
  getNextCode: () => api.get('/items/next-code'),
  // 员工
  getEmployees: () => api.get('/employees'),
  addEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),
  // 借出
  getLendRecords: (params) => api.get('/lend-records', { params }),
  getLendRecord: (id) => api.get(`/lend-records/${id}`),
  createLend: (data) => api.post('/lend-records', data),
  // 归还
  createReturn: (data) => api.post('/return-records', data),
  // 盘点
  createInventory: (data) => api.post('/inventory', data),
  getInventory: (id) => api.get(`/inventory/${id}`),
  updateInventory: (id, data) => api.put(`/inventory/${id}`, data),
  completeInventory: (id) => api.put(`/inventory/${id}/complete`),
  // 看板
  getDashboard: () => api.get('/dashboard'),
}
