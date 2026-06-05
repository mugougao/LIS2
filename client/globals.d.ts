// 全局类型声明：wdpapi App 实例在场景就绪后会挂到 window.App / globalThis.App
// 任何地方都可以直接使用 App，无需 import
declare const App: any;

interface Window {
  App: any;
}
