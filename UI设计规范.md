# Vibe Coding UI 开发规范 - 黑绿科技风 🌿

## 1. 设计理念

- **核心色调**：深邃黑色背景 + 高饱和霓虹绿强调色，营造科技感、未来感与活力。
- **材质与透感**：轻微毛玻璃效果（backdrop-filter）、冷光晕影、微细边框。
- **响应式与可访问性**：确保绿色与黑色对比度符合 WCAG AA 标准（文本对深色背景对比度 ≥ 4.5:1）。
- **微交互**：瞬时动效（0.1s ~ 0.25s），配合发光或边框动画增强反馈。

## 2. 颜色系统

### 基础色
| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--bg-primary` | `#0A0F0F` | 主背景（纯黑微带绿相） |
| `--bg-secondary` | `rgba(17, 21, 21, 0.5)` | 卡片、侧栏、下拉菜单底层（50%透明） |
| `--bg-tertiary` | `#1A1F1F` | 悬浮层、输入框、按钮次要背景 |
| `--border-default` | `#2A3333` | 默认边框 |
| `--border-focus` | `#78BE2D` | 聚焦组件边框（霓虹绿） |

### 绿色主题色
| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--green-primary` | `#78BE2D` | 主绿色（高对比、舒适） |
| `--green-hover` | `#8FD43E` | 悬浮/点亮绿 |
| `--green-active` | `#5E9C22` | 按压/选中绿 |
| `--green-glow` | `rgba(120, 190, 45, 0.4)` | 外发光阴影 |

### 文本 & 图标
| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--text-primary` | `#EDEDED` | 主要文本（高亮白） |
| `--text-secondary` | `#B0C4C4` | 占位符、辅助文本 |
| `--text-disabled` | `#5D6E6E` | 禁用文本 |

### 状态色
- 错误：`#FF5C5C` (搭配半透黑红底)
- 成功：`#78BE2D` (沿用主题绿)
- 警告：`#FFB347`

---

## 3. 全局样式（CSS 变量）

```css
:root {
  --bg-primary: #0A0F0F;
  --bg-secondary: rgba(17, 21, 21, 0.5);
  --bg-tertiary: #1A1F1F;
  --border-default: #2A3333;
  --border-focus: #78BE2D;
  --green-primary: #78BE2D;
  --green-hover: #8FD43E;
  --green-active: #5E9C22;
  --green-glow: rgba(120, 190, 45, 0.4);
  --text-primary: #EDEDED;
  --text-secondary: #B0C4C4;
  --text-disabled: #5D6E6E;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 0 1px rgba(120, 190, 45, 0.2), 0 0 0 3px rgba(120, 190, 45, 0.1);
  --transition-fast: 0.15s ease;
}
```

### 滚动条（科技风必要）
```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}
::-webkit-scrollbar-thumb {
  background: var(--green-primary);
  border-radius: 10px;
}
```

---

## 4. 组件详细规范

### 4.1 按钮 (Button)

#### 尺寸
- **小**：`padding: 6px 14px`，字号 `13px`
- **中**：`padding: 8px 18px`，字号 `14px`
- **大**：`padding: 10px 22px`，字号 `16px`

#### 样式变体
- **主要按钮**：纯绿底 + 黑色文本，悬浮加深亮度
- **次要按钮**：透明底 + 绿边框 + 绿文本，悬浮浅绿底
- **文本按钮**：透明无边框，靠文字和悬浮下划线

#### 状态
- **默认**：背景 `var(--green-primary)`，文字 `#0A0F0F`，无阴影
- **悬浮**：背景 `var(--green-hover)`，缩放 `1.02`，绿光晕
- **按下**：背景 `var(--green-active)`，缩放 `0.98`
- **聚焦**：`box-shadow: var(--shadow-glow)`
- **禁用**：背景 `#3A3F3F`，文字 `#5D6E6E`，无交互

#### 科技风特色
- 默认无边框，但可添加细微内阴影
- 次要按钮边框渐变：`border-image: linear-gradient(135deg, var(--green-primary), #4A7A1A) 1`
- 圆形按钮（图标按钮）：宽高一致，圆角50%

```css
/* 示例主要按钮 */
.btn-primary {
  background: var(--green-primary);
  color: #0A0F0F;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all var(--transition-fast);
  cursor: pointer;
}
.btn-primary:hover {
  background: var(--green-hover);
  box-shadow: 0 0 12px var(--green-glow);
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(1px);
}
.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-glow);
}
```

---

### 4.2 下拉框 (Select / Dropdown)

#### 基础结构
- 触发器：类按钮样式，右侧带箭头图标（绿色三角形或 SVG）
- 弹出面板：毛玻璃黑色底板，圆角 `var(--radius-md)`，边框 `1px solid var(--border-default)`

#### 尺寸与填充
- 高度：`40px`
- 内边距：`0 32px 0 14px`
- 圆角：`var(--radius-md)`
- 背景：`var(--bg-tertiary)`

#### 状态
- **默认**：边框 `var(--border-default)`，文字 `var(--text-primary)`
- **悬浮**：边框 `var(--green-primary)` (或亮起)
- **聚焦**：边框 `var(--border-focus)`，外发光 `var(--shadow-glow)`
- **展开**：触发器箭头旋转 180°，面板淡入 + 轻微向上偏移
- **禁用**：背景 `#141919`，文字 `#5D6E6E`

#### 下拉选项样式
- 选项内边距：`10px 14px`
- 悬浮选项背景：`rgba(120, 190, 45, 0.12)`，文字颜色变绿
- 选中项：左侧绿色勾号或背景微光，绿字
- 分隔线：`1px solid var(--border-default)`

```css
/* 触发器 */
.select-trigger {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 0 32px 0 14px;
  height: 40px;
  color: var(--text-primary);
  transition: all var(--transition-fast);
  cursor: pointer;
}
.select-trigger:hover {
  border-color: var(--green-primary);
}
.select-trigger:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
  outline: none;
}
/* 下拉面板 */
.select-dropdown {
  background: var(--bg-secondary);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  margin-top: 6px;
  overflow: auto;
}
.select-option {
  padding: 10px 14px;
  transition: background 0.1s;
}
.select-option:hover {
  background: rgba(120, 190, 45, 0.1);
  color: var(--green-primary);
}
.select-option.selected {
  background: rgba(120, 190, 45, 0.16);
  color: var(--green-primary);
  font-weight: 500;
}
```

---

### 4.3 搜索框 (Search Input)

#### 布局特征
- 包含搜索图标（放大镜）在左侧，清除按钮（X）在右侧
- 底色半透明或深色，搭配发光聚焦效果

#### 尺寸
- 高度：`40px` 或 `44px` (移动端)
- 内边距：`0 36px 0 40px` （左右分别放图标和清除）
- 圆角：`var(--radius-lg)` 科技风常用胶囊形状，也可 `--radius-md`

#### 状态
- **占位符文本**：`var(--text-secondary)`，倾斜可选
- **聚焦**：边框颜色 `var(--border-focus)`，外发光 `var(--shadow-glow)`，背景略微提亮
- **输入中**：显示清除图标，悬浮变绿
- **禁用**：降低不透明度 `0.5`

```css
.search-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.search-input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: 40px;  /* 胶囊科技风 */
  padding: 0 36px 0 44px;
  height: 42px;
  width: 260px;
  color: var(--text-primary);
  transition: all var(--transition-fast);
}
.search-input:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
  outline: none;
  background: #141A1A;
}
.search-icon {
  position: absolute;
  left: 14px;
  color: var(--text-secondary);
  pointer-events: none;
}
.clear-icon {
  position: absolute;
  right: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.1s;
}
.clear-icon:hover {
  color: var(--green-primary);
  transform: scale(1.1);
}
```

---

### 4.4 时间日期选择器 (Date / Time Picker)

#### 触发控件
- 类似下拉框的输入组，带日历/时钟图标
- 宽度可自适应，最小 `220px`

#### 弹出日历面板
- 背景 `var(--bg-secondary)`，毛玻璃效果（`backdrop-filter: blur(12px)`）
- 头部显示年月，带有切换箭头
- 星期缩写（S M T W T F S），使用绿高亮当前
- 日期单元格：圆形或小圆角，悬浮绿底黑字，选中绿底深色文字
- 当前日期：边框绿色或外围光晕
- 时间选择滚轮：带刻度的金属风格，绿色选中条

#### 状态

**选择器输入框**（同搜索框样式，高度 40px）  
**日历单元格**（宽 36px，高 36px，圆角 28px）  
**禁用日期**：灰色文本，透明背景，不可悬浮  

#### 科技风增强
- 日期切换箭头使用绿色渐变
- 快捷选项（今日、本周）用小型绿色按钮

```css
.datepicker-input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  height: 40px;
  padding: 0 12px;
  color: var(--text-primary);
}
.datepicker-input:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
  outline: none;
}
/* 日历面板 */
.calendar-panel {
  background: rgba(17, 21, 21, 0.96);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
  padding: 16px;
}
.calendar-cell {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  transition: all 0.1s;
  cursor: pointer;
}
.calendar-cell:hover {
  background: rgba(120, 190, 45, 0.2);
  color: var(--green-primary);
}
.calendar-cell.selected {
  background: var(--green-primary);
  color: #0A0F0F;
  font-weight: bold;
  box-shadow: 0 0 8px var(--green-glow);
}
.time-picker-option {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  padding: 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.time-picker-option.active {
  border-color: var(--green-primary);
  background: rgba(120, 190, 45, 0.1);
}
```

---

## 5. 微交互动效参考

- **页面过渡**：深色遮罩渐变，新内容滑入
- **按钮涟漪**：点击时出现绿色扩散波纹（需使用伪元素+scale）
- **下拉/面板出现**：`transform: translateY(-4px) scale(0.98)` → 正常，配合透明度，时长 `0.2s`
- **hover 发光**：使用 `box-shadow: 0 0 8px var(--green-glow)` 并过渡

```css
/* 通用弹出层动画 */
.fade-drop {
  animation: fadeDrop 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}
@keyframes fadeDrop {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 6. 可访问性提示

- 所有交互元素必须具有 `:focus-visible` 样式，禁用默认 outline 但提供 `box-shadow` 发光绿。
- 对比度检查：绿色背景上的文本建议使用 `#0A0F0F`（黑）或白色需确保绿色足够深（当前主绿 `#78BE2D` 对黑底文字无问题，对白底对比度低，但我们只有黑底，所以安全）。
- 禁用状态 `cursor: not-allowed`，透明度降低。
- 提供 `aria-label` 对图标按钮、下拉箭头等。

---

## 7. 示例深色布局（全局结构）

```css
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', 'SF Mono', 'Fira Code', monospace;
  font-weight: 400;
  line-height: 1.5;
}
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
```

## 8. 组件库一致性检查清单

| 组件 | 圆角 | 高度 | 聚焦光晕 | 绿色使用点 |
|------|------|------|----------|-------------|
| 按钮 | 10px | auto | 是 | 背景、边框、字体 |
| 下拉框 | 10px | 40px | 是 | 边框悬浮、选中项文字 |
| 搜索框 | 40px | 42px | 是 | 边框聚焦、清除图标 |
| 日期选择器 | 10px/28px | 40px | 是 | 选中日期背景、当前日期边框 |

## 9. 最后的“vibe coding”指引

使用本规范时，**优先保证黑色 > 绿色 > 微妙发光**的三层关系。所有组件无需过多装饰，通过微交互与光效传递科技感。  
推荐搭配等宽字体用于代码或标签，非衬线字体用于文本。务必拥抱 CSS 变量，便于主题扩展。

---

*规范版本 1.0 – 献给无限可能的黑夜霓虹绿*