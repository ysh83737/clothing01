<template>
  <div>
    <h2>服装借出与归还</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="借出记录" name="list">
        <el-table :data="records" stripe>
          <el-table-column prop="record_no" label="单号" width="180"/>
          <el-table-column prop="employee_name" label="借用人" width="100"/>
          <el-table-column prop="event_name" label="活动名称"/>
          <el-table-column prop="lend_date" label="借出日期" width="120"/>
          <el-table-column prop="due_date" label="应还日期" width="120"/>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{row}"><el-tag :type="stype[row.status]||''">{{ slabel[row.status]||row.status }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{row}">
              <el-button size="small" v-if="row.status==='active'" type="warning" @click="showReturn(row)">归还</el-button>
              <el-button size="small" @click="viewRecord(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="新建借出单" name="create">
        <el-form :model="lendForm" label-width="100" style="max-width:600px">
          <el-form-item label="借用人" required><el-select v-model="lendForm.employee_id" placeholder="选择员工" filterable><el-option v-for="e in employees" :key="e.id" :label="e.name+' - '+e.department" :value="e.id"/></el-select></el-form-item>
          <el-form-item label="活动名称"><el-input v-model="lendForm.event_name" placeholder="如：2024春季展会"/></el-form-item>
          <el-form-item label="借出日期" required><el-date-picker v-model="lendForm.lend_date" type="date" value-format="YYYY-MM-DD" style="width:200px"/></el-form-item>
          <el-form-item label="应还日期"><el-date-picker v-model="lendForm.due_date" type="date" value-format="YYYY-MM-DD" style="width:200px"/></el-form-item>
          <el-form-item label="选择服装">
            <div v-for="(row,i) in lendForm.items" :key="i" style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
              <el-select v-model="row.item_id" placeholder="选服装" style="width:220px" @change="onItemSelect(row)"><el-option v-for="it in availItems" :key="it.id" :label="it.item_code+' '+it.name" :value="it.id"/></el-select>
              <el-input-number v-model="row.quantity" :min="1" :max="row.max_qty||999"/>
              <el-button @click="lendForm.items.splice(i,1)">删除</el-button>
            </div>
            <el-button @click="lendForm.items.push({item_id:null,quantity:1,max_qty:0})">+ 添加服装</el-button>
          </el-form-item>
          <el-form-item><el-button type="primary" @click="submitLend">确认借出</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <el-dialog v-model="detailVisible" title="借出单详情" width="600px">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="单号">{{ detail.record_no }}</el-descriptions-item>
        <el-descriptions-item label="借用人">{{ detail.employee_name }}</el-descriptions-item>
        <el-descriptions-item label="活动">{{ detail.event_name }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag>{{ slabel[detail.status] }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="借出日期">{{ detail.lend_date }}</el-descriptions-item>
        <el-descriptions-item label="应还日期">{{ detail.due_date }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="detail?.items||[]" style="margin-top:12px" stripe>
        <el-table-column prop="item_name" label="服装名称"/><el-table-column prop="item_code" label="编号" width="130"/><el-table-column prop="quantity" label="数量" width="70"/><el-table-column prop="unit" label="单位" width="70"/>
      </el-table>
    </el-dialog>
    <el-dialog v-model="returnVisible" title="归还登记" width="600px">
      <el-form :model="returnForm" label-width="100">
        <el-form-item label="归还日期" required><el-date-picker v-model="returnForm.return_date" type="date" value-format="YYYY-MM-DD" style="width:200px"/></el-form-item>
        <el-form-item label="经手人"><el-input v-model="returnForm.handled_by" style="width:200px"/></el-form-item>
        <el-form-item label="归还明细">
          <el-table :data="returnForm.items" stripe size="small">
            <el-table-column prop="item_name" label="服装"/><el-table-column prop="lend_qty" label="借出数量" width="80"/>
            <el-table-column label="归还数量" width="130"><template #default="{row}"><el-input-number v-model="row.quantity" :min="0" :max="row.lend_qty"/></template></el-table-column>
            <el-table-column label="状态" width="120"><template #default="{row}"><el-select v-model="row.condition" style="width:100px"><el-option label="正常" value="normal"/><el-option label="损坏" value="damaged"/><el-option label="丢失" value="lost"/></el-select></template></el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="returnVisible=false">取消</el-button><el-button type="primary" @click="submitReturn">确认归还</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api/index.js'
const activeTab = ref('list'), records = ref([]), employees = ref([]), availItems = ref([])
const slabel = { active:'进行中', returned:'已归还', partial_lost:'部分丢失' }
const stype = { active:'warning', returned:'success', partial_lost:'danger' }
const detailVisible = ref(false), detail = ref(null), returnVisible = ref(false)
const returnForm = ref({ return_date:'', handled_by:'', record_id:null, items:[] })
const lendForm = ref({ employee_id:null, lend_date:'', due_date:'', event_name:'', items:[] })
async function loadRecords() { const { data } = await api.getLendRecords(); records.value = data }
async function loadMeta() { const [e,i] = await Promise.all([api.getEmployees(), api.getItems({status:'available',pageSize:1000})]); employees.value=e.data; availItems.value=i.data.items }
function onItemSelect(row) { const it=availItems.value.find(x=>x.id===row.item_id); if(it) row.max_qty=it.quantity }
async function submitLend() {
  if(!lendForm.value.employee_id||!lendForm.value.lend_date) return ElMessage.warning('请填写必填项')
  if(!lendForm.value.items.length) return ElMessage.warning('请添加服装')
  await api.createLend(lendForm.value); ElMessage.success('借出成功')
  lendForm.value={employee_id:null,lend_date:'',due_date:'',event_name:'',items:[]}; activeTab.value='list'; loadRecords()
}
async function viewRecord(row) { const { data } = await api.getLendRecord(row.id); detail.value=data; detailVisible.value=true }
function showReturn(row) {
  returnForm.value={return_date:new Date().toISOString().split('T')[0], handled_by:'', record_id:row.id, items:[]}
  api.getLendRecord(row.id).then(({data})=>{ returnForm.value.items=data.items.map(it=>({item_id:it.item_id, lend_item_id:it.id, item_name:it.item_name, lend_qty:it.quantity, quantity:it.quantity, condition:'normal'})); returnVisible.value=true })
}
async function submitReturn() { await api.createReturn(returnForm.value); ElMessage.success('归还成功'); returnVisible.value=false; loadRecords() }
onMounted(()=>{ loadRecords(); loadMeta() })
</script>
