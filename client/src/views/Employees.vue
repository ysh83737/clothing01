<template>
  <div>
    <h2>员工管理</h2>
    <el-button type="success" style="margin-bottom:12px" @click="dialogVisible=true;reset()">新增员工</el-button>
    <el-table :data="employees" stripe>
      <el-table-column prop="id" label="ID" width="80"/>
      <el-table-column prop="name" label="姓名" width="120"/>
      <el-table-column prop="department" label="部门"/>
      <el-table-column prop="phone" label="联系方式" width="150"/>
      <el-table-column label="操作" width="120">
        <template #default="{row}"><el-button size="small" @click="edit(row)">编辑</el-button><el-button size="small" type="danger" @click="del(row)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑员工':'新增员工'" width="400px">
      <el-form :model="form" label-width="80">
        <el-form-item label="姓名" required><el-input v-model="form.name"/></el-form-item>
        <el-form-item label="部门"><el-input v-model="form.department"/></el-form-item>
        <el-form-item label="联系方式"><el-input v-model="form.phone"/></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api/index.js'
const employees = ref([]), dialogVisible = ref(false), isEdit = ref(false)
const form = ref({ id:null, name:'', department:'', phone:'' })
async function load() { const { data } = await api.getEmployees(); employees.value = data }
function edit(row) { isEdit.value=true; form.value={...row}; dialogVisible.value=true }
function reset() { isEdit.value=false; form.value={id:null,name:'',department:'',phone:''} }
async function submit() {
  if (!form.value.name) return ElMessage.warning('姓名必填')
  if (isEdit.value) { await api.updateEmployee(form.value.id, form.value); ElMessage.success('更新成功') }
  else { await api.addEmployee(form.value); ElMessage.success('添加成功') }
  dialogVisible.value=false; load()
}
async function del(row) {
  await ElMessageBox.confirm('删除 '+row.name+'？','删除确认',{type:'warning'})
  await api.deleteEmployee(row.id); ElMessage.success('已删除'); load()
}
onMounted(load)
</script>
