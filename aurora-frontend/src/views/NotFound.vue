<template>
  <div class="not-found">
    <div class="container">
      <div class="content">
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>您访问的页面不存在或已被移除</p>
        <router-link to="/">
          <el-button type="primary">返回首页</el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  h1 {
    font-size: 120px;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 20px;
  }
  
  h2 {
    font-size: 32px;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 18px;
    color: var(--text-secondary);
    margin-bottom: 32px;
  }
}
</style>