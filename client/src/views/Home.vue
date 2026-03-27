<template>
  <div>
    <h2>数据看板</h2>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6"><el-card><div class="stat-label">库存总量</div><div class="stat-num">{{ dash.totalItems }}</div></el-card></el-col>
      <el-col :span="6"><el-card><div class="stat-label">当前在借</div><div class="stat-num" style="color:#e6a23c">{{ dash.lentItems }}</div></el-card></el-col>
      <el-col :span="6"><el-col :span="6"><el-card><div class="stat-label">丢失</div><div class="stat-num" style="color:#f56c6c">{{ dash.lostItems }}</div></el-card></el-col></el-col>
      <el-col :span="6"><el-card><div class="stat-label">进行中借单</div><div class="stat-num">{{ dash.activeRecords }}</div></el-card></el-col>
    </el-row>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="12"><el-card><template #header>今日动态</template><div>借出: {{ dash.todayLend }} 单 &nbsp;|&nbsp; 归还: {{ dash.todayReturn }} 单</div></el-card></el-col>
    </el-row>
    <el-card><template #header>最近借出记录</template>
      <el-table :data="dash.recentLend" stripe>
        <el-table-column prop="record_no" label="单号" width="180"/>
        <el-table-column prop="employee_name" label="借用人" width="100"/>
        <el-table-column prop="event_name" label="活动名称"/>
        <el-table-column prop="lend_date" label="借出日期" width="120"/>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{row}"><el-tag :type="row.status==='active'?'warning':row.status==='returned'?'success':'danger'">{{ row.status }}</el-tag></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/index.js'
const dash = ref({ totalItems:0, lentItems:0, lostItems:0, todayLend:0, todayReturn:0, activeRecords:0, recentLend:[] })
onMounted(async () => { const { data } = await api.getDashboard(); dash.value = data })
</script>
<style scoped>
.stat-label { font-size: 13px; color: #999; margin-bottom: 8px; }
.stat-num { font-size: 32px; font-weight: bold; color: #409eff; }
</style>
