<template>
  <div>
    <h2>库存盘点</h2>
    <el-card style="margin-bottom:16px">
      <el-form inline>
        <el-form-item label="盘点类型"><el-radio-group v-model="invForm.session_type"><el-radio label="full">全量盘点</el-radio><el-radio label="partial">指定类别</el-radio></el-radio-group></el-form-item>
        <el-form-item label="类别" v-if="invForm.session_type==='partial'">
          <el-select v-model="invForm.categories" multiple placeholder="选择类别"><el-option v-for="c in categories" :key="c" :label="c" :value="c"/></el-select>
        </el-form-item>
        <el-form-item label="盘点日期"><el-date-picker v-model="invForm.start_date" type="date" value-format="YYYY-MM-DD"/></el-form-item>
        <el-form-item><el-button type="primary" @click="startInventory">开始盘点</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-table v-if="currentSession" stripe>
      <template #header><h3>盘点单号：{{ currentSession.session_no }} &nbsp; <el-tag>{{ currentSession.session_type==='full'?'全量':'指定类别' }}</el-tag> &nbsp; <el-tag type="info">{{ currentSession.status }}</el-tag></h3></template>
      <el-table-column prop="item_code" label="编号" width="130"/>
      <el-table-column prop="name" label="服装名称"/>
      <el-table-column prop="category" label="类别" width="90"/>
      <el-table-column prop="system_quantity" label="系统库存" width="100"/>
      <el-table-column label="实盘数量" width="130">
        <template #default="{row}"><el-input-number v-model="row.actual_quantity" :min="0" size="small"/></template>
      </el-table-column>
      <el-table-column label="差异" width="80">
        <template #default="{row}"><span :style="{color: (row.actual_quantity||0)-row.system_quantity===0?'green':'red'}">{{ (row.actual_quantity||0)-row.system_quantity }}</span></template>
      </el-table-column>
      <el-table-column label="备注" width="150"><template #default="{row}"><el-input v-model="row.remark" size="small" placeholder="差异说明"/></template></el-table-column>
      <el-table-column label="已处理" width="80"><template #default="{row}"><el-checkbox v-model="row.handled"/></template></el-table-column>
    </el-table>
    <div v-if="currentSession && currentSession.status==='ongoing'" style="margin-top:16px">
      <el-button type="primary" @click="saveInventory">保存结果</el-button>
      <el-button type="success" @click="completeInventory">完成盘点</el-button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api/index.js'
const categories = ['上衣','裤子','裙子','鞋子','配饰','外套','帽子','其他']
const invForm = ref({ session_type:'full', categories:[], start_date: new Date().toISOString().split('T')[0] })
const currentSession = ref(null)
async function startInventory() {
  if(invForm.value.session_type==='partial' && !invForm.value.categories.length) return ElMessage.warning('请选择盘点类别')
  const { data } = await api.createInventory(invForm.value)
  const detail = await api.getInventory(data.id)
  currentSession.value = detail.data
  ElMessage.success('盘点已开始')
}
async function saveInventory() {
  const items = currentSession.value.items.map(it=>({ id:it.id, item_id:it.item_id, system_quantity:it.system_quantity, actual_quantity:it.actual_quantity, discrepancy:(it.actual_quantity||0)-it.system_quantity, handled:it.handled||false, remark:it.remark||'' }))
  await api.updateInventory(currentSession.value.id, { items })
  ElMessage.success('已保存')
}
async function completeInventory() {
  await saveInventory()
  await api.completeInventory(currentSession.value.id)
  currentSession.value = null
  ElMessage.success('盘点已完成')
}
</script>
