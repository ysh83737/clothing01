<template>
  <div>
    <h2>库存管理</h2>
    <el-form inline style="margin-bottom:12px">
      <el-form-item><el-input v-model="filters.keyword" placeholder="编号/名称搜索" clearable @clear="loadItems"/></el-form-item>
      <el-form-item><el-select v-model="filters.category" placeholder="类别" clearable @change="loadItems"><el-option v-for="c in categories" :key="c" :label="c" :value="c"/></el-select></el-form-item>
      <el-form-item><el-button type="primary" @click="loadItems">查询</el-button><el-button type="success" @click="dialogVisible=true;resetForm()">新增入库</el-button></el-form-item>
    </el-form>
    <el-table :data="items" stripe v-loading="loading">
      <el-table-column prop="item_code" label="编号" width="140"/>
      <el-table-column prop="name" label="名称"/>
      <el-table-column prop="category" label="类别" width="90"/>
      <el-table-column prop="size" label="尺码" width="70"/>
      <el-table-column prop="color" label="颜色" width="80"/>
      <el-table-column prop="quantity" label="库存" width="70"/>
      <el-table-column prop="unit" label="单位" width="70"/>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{row}"><el-tag :type="statusType[row.status]||''">{{ statusLabel[row.status]||row.status }}</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{row}"><el-button size="small" @click="editItem(row)">编辑</el-button><el-button size="small" type="danger" @click="delItem(row)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top:12px" background layout="prev,pager,next" :total="total" :page-size="20" v-model:current-page="page" @current-change="loadItems"/>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑品目':'新服装入库'" width="500px">
      <el-form :model="form" label-width="80">
        <el-form-item label="编号"><el-input v-model="form.item_code" readonly/></el-form-item>
        <el-form-item label="名称" required><el-input v-model="form.name"/></el-form-item>
        <el-form-item label="类别" required><el-select v-model="form.category" placeholder="请选择"><el-option v-for="c in categories" :key="c" :label="c" :value="c"/></el-select></el-form-item>
        <el-form-item label="尺码"><el-input v-model="form.size"/></el-form-item>
        <el-form-item label="颜色"><el-input v-model="form.color"/></el-form-item>
        <el-form-item label="性别"><el-select v-model="form.gender" placeholder="请选择"><el-option label="男" value="男"/><el-option label="女" value="女"/><el-option label="中性" value="中性"/></el-select></el-form-item>
        <el-form-item label="数量" required><el-input-number v-model="form.quantity" :min="0"/></el-form-item>
        <el-form-item label="单位"><el-input v-model="form.unit" style="width:120px"/></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea"/></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="submitForm">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api/index.js'
const categories = ['上衣','裤子','裙子','鞋子','配饰','外套','帽子','其他']
const statusLabel = { available:'在库', lent:'借出', lost:'丢失' }
const statusType = { available:'success', lent:'warning', lost:'danger' }
const items = ref([]), total = ref(0), page = ref(1), loading = ref(false)
const filters = ref({ keyword:'', category:'' })
const dialogVisible = ref(false), isEdit = ref(false)
const form = ref({ id:null, item_code:'', name:'', category:'', size:'', color:'', gender:'', quantity:0, unit:'件', remark:'' })
async function loadItems() {
  loading.value = true
  const { data } = await api.getItems({ page: page.value, pageSize:20, ...filters.value })
  items.value = data.items; total.value = data.total; loading.value = false
}
async function getNextCode() { const { data } = await api.getNextCode(); form.value.item_code = data.item_code }
function resetForm() { isEdit.value=false; form.value={id:null,item_code:'',name:'',category:'',size:'',color:'',gender:'',quantity:0,unit:'件',remark:''}; getNextCode() }
function editItem(row) { isEdit.value=true; form.value={...row}; dialogVisible.value=true }
async function submitForm() {
  if (!form.value.name || !form.value.category) return ElMessage.warning('请填写名称和类别')
  if (isEdit.value) { await api.updateItem(form.value.id, form.value); ElMessage.success('更新成功') }
  else { await api.addItem(form.value); ElMessage.success('入库成功') }
  dialogVisible.value = false; loadItems()
}
async function delItem(row) {
  await ElMessageBox.confirm('确认删除《'+row.name+'》？','删除确认',{type:'warning'})
  await api.deleteItem(row.id); ElMessage.success('已删除'); loadItems()
}
onMounted(() => { loadItems(); getNextCode() })
</script>
