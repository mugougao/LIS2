<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <div class="app-shell">
      <nav class="top-nav">
        <span class="nav-title">51LIS低空智能监管系统</span>
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="nav-link--active" exact>规划管理</router-link>
          <router-link to="/conflict" class="nav-link" active-class="nav-link--active">态势监控</router-link>
          <router-link to="/agent" class="nav-link" active-class="nav-link--active">基础设施</router-link>
        </div>
      </nav>
      <div class="app-content">
        <router-view />
      </div>
    </div>
  </n-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { darkTheme, NConfigProvider } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#78BE2D',
    primaryColorHover: '#8FD43E',
    primaryColorPressed: '#5E9C22',
    primaryColorSuppl: '#78BE2D',
    borderRadius: '10px',
    popoverColor: 'rgba(24, 24, 28, 0.72)',
    cardColor: 'rgba(24, 24, 28, 0.72)',
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '10px',
      }
    }
  },
  DatePicker: {
    itemBorderRadius: '10px',
    panelColor: 'rgba(24, 24, 28, 0.72)',
  },
  TimePicker: {
    panelColor: 'rgba(24, 24, 28, 0.72)',
  },
}

const naiveTheme = darkTheme
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background: rgba(62, 63, 62, 0.1);
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
  z-index: 20;
}
.nav-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--green-primary);
  letter-spacing: 0.5px;
}
.nav-links {
  display: flex;
  gap: 4px;
}
.nav-link {
  padding: 6px 18px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}
.nav-link:hover {
  color: var(--green-hover);
  background: rgba(120, 190, 45, 0.08);
}
.nav-link--active {
  color: var(--green-primary);
  background: rgba(120, 190, 45, 0.12);
}
.app-content {
  flex: 1;
  overflow: hidden;
}
</style>

<style>
.n-popover,
.n-select-menu,
.n-date-panel,
.n-time-panel {
  backdrop-filter: blur(12px);
}
</style>
