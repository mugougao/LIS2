<template>
  <div class="agent-view">
    <div class="placeholder">智能调度模块</div>
  </div>
</template>

<style scoped>
.agent-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 40%, rgba(23, 225, 138, 0.1), transparent 30%),
    linear-gradient(180deg, rgba(5, 18, 20, 0.8), rgba(3, 12, 13, 0.9));
}
.placeholder {
  min-width: 360px;
  padding: 34px 42px;
  border: 1px solid rgba(83, 119, 120, 0.32);
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(8, 25, 27, 0.94), rgba(4, 17, 18, 0.9));
  box-shadow: 0 0 28px rgba(23, 225, 138, 0.1);
  color: var(--green-primary);
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}
</style>
