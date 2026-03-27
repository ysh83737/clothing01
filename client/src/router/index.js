import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Items from '../views/Items.vue'
import Employees from '../views/Employees.vue'
import Lend from '../views/Lend.vue'
import Inventory from '../views/Inventory.vue'
const routes = [
  { path: '/', component: Home },
  { path: '/items', component: Items },
  { path: '/employees', component: Employees },
  { path: '/lend', component: Lend },
  { path: '/inventory', component: Inventory },
]
export default createRouter({ history: createWebHistory(), routes })
