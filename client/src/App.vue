<template>
  <div id="app">
    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="$route.path" router>
          <el-menu-item index="/"><el-icon><HomeFilled/></el-icon>首页</el-menu-item>
          <el-menu-item index="/items"><el-icon><Box/></el-icon>库存管理</el-menu-item>
          <el-menu-item index="/employees"><el-icon><User/></el-icon>员工管理</el-menu-item>
          <el-menu-item index="/lend"><el-icon><TopRight/></el-icon>服装借出</el-menu-item>
          <el-menu-item index="/inventory"><el-icon><DocumentChecked/></el-icon>库存盘点</el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header style="display:flex;align-items:center">
          <span style="font-size:18px;font-weight:bold">服装仓库管理系统</span>
        </el-header>
        <el-main><router-view/></el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup>
import { HomeFilled, Box, User, TopRight, DocumentChecked } from '@element-plus/icons-vue'
</script>
<style>
body { margin: 0; font-family: 'PingFang SC', sans-serif; }
.el-aside { background: #f5f5f5; height: 100vh; }
.el-header { background: #409eff; color: white; font-size: 18px; }
</style>
