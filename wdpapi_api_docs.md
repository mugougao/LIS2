# WDP API Documentation
> Version: 2.2.1 | Updated: 2026-02-27 19:27:50

## Overview

This document contains all API interface descriptions for WDP API.

## 通用事件监听

### 通用事件监听
**Title:** 通用事件监听

注册云渲染事件

```javascript
App.Renderer.RegisterEvent([
    {
        name: 'onStopedRenderCloud', func: function (res) {
            // io client disconnect
            // 渲染服务中断 todo
        }
    },
    {
        name: 'onVideoReady', func: function () {
            // 视频流链接成功 todo
        }
    }
])
```
注销云渲染事件

```javascript
App.Renderer.UnRegisterEvent(['onStopedRenderCloud']);
```
∗注册云渲染事件（可重复注册）

```javascript
App.Renderer.RegisterEvents([
	{
        name: 'onStopedRenderCloud', func: (res) => {
            // io client disconnect
            // 渲染服务中断 todo
        }
    },
  	...
]);
```
∗注销重复已注册云渲染事件

```javascript
App.Renderer.UnRegisterEvents(['onStopedRenderCloud']);
```
注册场景事件

```javascript
 await App.Renderer.RegisterSceneEvent([
    {
      name: 'OnWdpSceneIsReady', func: async function (res) {
        // { "event_name": "OnWdpSceneIsReady", "result": { "progress": 100 } }
        if(res.result.progress === 100) {
            // 场景加载完成
        }
      }
    },
    {
      name: 'OnWdpSceneChanged', func: async function (res) {
        // 实体对象操作后回调；
        // res.result --> {added[object]，updated[object]，removed[object]}
      }
    },
    {
      name: 'OnMouseEnterEntity', func: async function (res) {
        // 鼠标滑入实体事件回调; 包含数据信息与实体对象
        //1.15.0支持window鼠标滑入
      }
    },
    {
      name: 'OnMouseOutEntity', func: async function (res) {
        // 鼠标滑出实体事件回调; 包含数据信息与实体对象
        //1.15.0支持window鼠标滑入
      }
    },
    {
      name: 'OnEntityClicked', func: async function (res) {
        // 覆盖物被点击事件回调; 包含数据信息与实体对象
        // 新增triggerType类型，区分左，中，右鼠标事件>=1.15.1
      }
    },
    {
      name: 'OnEntityDbClicked', func: async function (res) {
        // 覆盖物被双击点击事件回调; 包含数据信息与实体对象
      }
    },
    {
      name: 'OnWebJSEvent', func: async function (res) {
        // 接收widnow内嵌页面发送的数据
        // { "event_name": "OnWebJSEvent", "result": { "name": "自定义name", "args": "自定义数据" }}
      }
    },
    {
      name: 'MeasureResult', func: async function (res) {
        // 测量工具数据回调
      }
    },
   {
      name: 'OnMoveAlongPathProcessEvent', func: async function (res) {
        // 支持1.14.0(包含1.14.0)版本以上
        // 覆盖物沿路径移动(节点监测)
      }
    },
   {
      name: 'OnRealTimeVideoEvent', func: async function (res) {
        // 支持1.14.0(包含1.14.0)版本以上
        // 实时视频关闭按钮点击销毁后的事件
      }
    },
    {
      name: 'OnMoveAlongPathEndEvent', func: async function (res) {
        // 覆盖物移动结束信息回调
      }
    },
    {
      name: 'OnCameraMotionStartEvent', func: async function (res) {
        // 相机运动开始信息回调
        // 相机运动回调事件
        /*
          E_API_FocusToEntities：FocusToNodes（相机聚焦nodeId单体）；Focus（相机聚集实体）
          E_API_FocusToAllEntities：FocusToAll（按类型聚焦实体）；
          E_API_FocusToPosition：FlyTo（相机聚焦到坐标点）；
          E_API_CameraStop：stop(停止相机移动/旋转)；
          E_API_FollowEntitiy：Follow（相机跟随实体）；
          E_API_CameraMove：Move（相机移动）；
          E_API_CameraRotate：Rotate（相机旋转）；
          E_API_CameraAround：Around（场景旋转）；
          E_API_PlayCameraRoam：PlayCameraRoam（漫游）；
          E_API_UpdateCamera：SetCameraPose（设置镜头位置）；ResetCameraPose（重置镜头位置）；UpdateCamera（更新镜头位置）；注：只有镜头位置发生变化时才会触发
          E_DeviceInput：CameraStepRotate（相机step旋转）；CameraStepZoom（相机step缩放）；
          */
      }
    },
    {
      name: 'OnCameraMotionEndEvent', func: async function (res) {
        // 相机运动结束信息回调
      }
    },
  {
      name: 'OnCameraRoamingFrame', func: async function (res) {
        // 相机漫游节点事件
      }
    },
    {
      name: 'PickPointEvent', func: async function (res) {
        // 取点工具取点数据回调
      }
    },
    {
      name: 'OnEntitySelectionChanged', func: async function (res) {
        // 实体被选取[框选]、数据回调
      }
    },
    {
      name: 'OnEntityNodeSelectionChanged', func: async function (res) {
        // 模型node选择状态变化数据回调
      }
    },
    {
       name: 'OnEntityReady', func: async function (res) {
           // 3DTilesEntity，WMSEntity，WMTSEntity 加载完成;
           // {success: true, message: '', result: { object: 对象, progress: 100 }}
        }
     },
 
    {
       name: 'OnCreateGeoLayerEvent', func: async function (res) {
           // 用于GisApi； WMS,WMTS 添加 报错回调
        }
     },
    {
       name: 'OnGeoLayerFeatureClicked', func: async function (res) {
           // 用于GisApi；点击实体回调
        }
     }
  ])
```
获取场景事件

```javascript
await App.Renderer.GetRegisterSceneEvent();
```
注销场景事件

```javascript
await App.Renderer.UnRegisterSceneEvent(['OnWdpSceneIsReady']);
```
∗场景事件注册（可重复注册）

```javascript
await App.Renderer.RegisterSceneEvents([
    {
        name: 'OnEntityClicked', func: async function (res) {
            console.log(res)
        }
    }
])
```
∗获取已注册重复注册事件

```javascript
const res = await App.Renderer.GetRegisterSceneEvents();
console.log(res);
```
∗注销已注册重复注册事件

```javascript
await App.Renderer.UnRegisterSceneEvents(['OnEntityClicked'])
```
注册监听错误事件

```javascript
await App.Renderer.RegisterErrorEvent([
	{
     // 配合字段检测使用
      name: 'OnValidateError',
      func: (res) => {
          // 业务代码 
      }
	}
]);
```
注销错误事件

```javascript
await App.Renderer.UnRegisterErrorEvent(['OnValidateError']);
```
关闭云渲染

```javascript
App.Renderer.Stop()
```
设置默认键盘

```javascript
App.System.SetDefaultKeyboard(boolean); 
```
设置默认浏览器功能键盘

```javascript
await App.System.SetDefaultBrowserFunctionKeyboard(boolean);
```
---

## 场景初始

### 初始场景
**Title:** 初始场景

初始场景

```javascript
// 安装 wdpapi
npm install wdpapi
```
```javascript
// 引入 wdpapi
import WdpApi from "wdpapi";
```
```javascript
// 设置初始化参数
const App = new WdpApi({
  id: 'player', // [必填] 渲染场景容器(DOM id)
  url: 'http://IP:Port/service', // [必填] 云渲染服务地址,通过云平台获取
  order: '8099702a64dbb8ef4a0a2f7b5b1c42b0', // [必填] 云渲染口令, 通过云平台获取
  resolution: [3840, 2160], //[选填] 设置云渲染输出分辨率[宽度，高度]
  debugMode: 'normal', //[选填] none: 无日志输出, normal: 普通级别日志输出，high：高级别日志输出，all：全日志输出
  keyboard: { //[选填] 键盘事件（开关）
    normal: false, //[选填] 键盘事件, 不包含 F1~F12 [默认禁用]
    func: false //[选填] 键盘 F1 ~ F12 按键 [默认禁用]
  },
  prefix: '', // [选填] 二次代理时填写的云平台路径名（/service）
  initLog: false, // [选填]  true = 显示品牌logo日志， false=不显示品牌logo日志
  bCached: false, // [选填]  true = 场景加载完。默认缓存场景中所有对象， false = 场景加载完。不缓存场景中所有对象
});
```
参数说明:

参数 | 值 | 类型 | 备注
--- | --- | --- | ---
id |  | string | 渲染3D场景窗口的Dom节点
url |  | string | 云渲染服务地址
order |  | string | 渲染口令
resolution | [100~7680, 100~4320] | [Integer] | 设置云渲染输出分辨率注: chrome浏览器最高支持4K: 4096 * 2160; 使用51Browser可以达到8K支持 7680 * 4320
debugMode | none, normal, high,all | string | none: 不打印日志;normal: 普通日志(传输数据结果);high: 高级日志,包括鼠标点击等底层传输日志;all:全部日志
keyboard | normal | boolean | normal: true/false 键盘事件
func | boolean | func: true/false 浏览器F1~F12功能键
prefix |  |  | 设置2次代理，默认为空，设置不代理
initLog | false/true | boolean | true = 显示品牌logo日志， false=不显示品牌logo日志
bCached | false/true | boolean | true = 场景加载完。默认缓存场景中所有entity， false = 场景加载完。不缓存场景中所有entity

参数重置

```javascript
await App.System.SetOption({
    "url": "https://dtp-api.51aes.com",
    "order": "2399702a64dbb8ef4a0a2f7b5b1c41a0",
    "resolution": [3840,2160]
})
```
渲染模式

```javascript
await App.Renderer.SetRendererMode('type', [3840, 2160]);
```
**参数说明：**

参数 | 值 | 类型 | 备注
--- | --- | --- | ---
type | full, fixed | string | 渲染模式; full: 自动适应容器尺寸; fixed: 固定分辨率
resolution | [100~7680, 100~4320] | Integer | 渲染分辨率; fixed时有效注: chrome浏览器最高支持4K: 4096 * 2160; 使用51Browser可以达到8K支持 7680 * 4320

设置接口请求超时时长

用于大数据api接口调用



```javascript
await App.System.SetTimeoutTime(30000); //30s; 默认: 10s
```
启动场景

```javascript
App.Renderer.Start().then((res: any) => {
    if (res.success) {
        // 初始场景事件
        App.Renderer.RegisterEvent([
            {
                name: 'onVideoReady', func: async function (res: any) {
                    // 视频流链接成功
                }
            },
            {
                name: 'onStopedRenderCloud', func: async function (res: any) {
                    // 渲染服务中断
                }
            }
        ])
        // 场景事件回调
        App.Renderer.RegisterSceneEvent([
            {
                name: 'OnWdpSceneIsReady', func: async function (res: any) {
                    if(res.result.progress === 100) {
                        // 场景加载完成
                    }
                }
            },
            {
                name: 'OnEntityClicked', func: async function (res: any) {
                    // Entity被点击事件回调; 包含数据信息与实体对象
                }
            },
            {
                name: 'OnMouseEnterEntity', func: async function (res: any) {
                    // 鼠标滑入实体事件回调; 包含数据信息与实体对象
                }
            },
            {
                name: 'OnMouseOutEntity', func: async function (res: any) {
                    // 鼠标滑出实体事件回调; 包含数据信息与实体对象
                }
            },
            {
                name: 'OnWebJSEvent', func: async function (res: any) {
                    // 接收widnow内嵌页面发送的数据
                }
            },
            {
                name: 'MeasureResult', func: async function (res: any) {
                    // 测量工具数据回调
                }
            },
            {
                name: 'OnMoveAlongPathEndEvent', func: async function (res: any) {
                    // 覆盖物移动结束信息回调
                }
            },
            {
                name: 'OnCameraMotionStartEvent', func: async function (res: any) {
                    // 相机运动开始信息回调
                }
            },
            {
                name: 'OnCameraMotionEndEvent', func: async function (res: any) {
                    // 相机运动结束信息回调
                }
            },
            {
                name: 'PickPointEvent', func: async function (res: any) {
                    // 取点工具取点数据回调
                }
            },
            {
                name: 'OnEntitySelectionChanged', func: async function (res: any) {
                    // 实体被选取、数据回调
                }
            },
            {
                name: 'OnEntityReady', func: async function (res: any) {
                    // 3DTilesEntity，WMSEntity，WMTSEntity 加载完成;
                    // {success: true, message: '', result: { object: 对象, progress: 100 }}
                }
            }
        ])
    }
}).catch(err => {
    console.log(err)
});
```
成员函数

<ol><li data-list="bullet">**Add(object)**</li></ol>		用途: 向场景中, 添加实体; 示例如下



```javascript
const path = new App.Path({ "polyline":  { "coordinates": [121.50007292,31.22579403,30]}, "pathStyle":  style })
cosnt res = await App.Scene.Add(path);
console.log(res);
```
<ol><li data-list="bullet">**Covering.Clear()**</li></ol>		用途: 清除场景中的所有覆盖物实体



场景回到初始化状态

```javascript
await App.Scene.ResetSceneState();
```
---

## 场景相机

### 相机模式/位置/限制设置
**Title:** 相机模式/位置/限制设置

设置镜头模式

```javascript
const res = await App.CameraControl.SetCameraMode('RTS');
console.log(res);

/*
  RTS (飞行模式)
  FPS (第一人称模式)
  TPS (第三人称模式)
*/
```


<h5>**相机模式操作:**</h5>快捷键 | RTS：沙盘模式 | FPS：第一人称模式 | TPS：第三人称模式
--- | --- | --- | ---
鼠标右键 | 旋转视角 | 环视周围 | 调整朝向
Alt+鼠标右键 | 无 | 无 | 相机围绕鼠标中心旋转
鼠标左键 | 平移相机(与地面平行前后左右移动) | 环视周围 | 平移相机(与地面平行前后左右移动)
W/↑ | 与地面平行前进 | 前进 | 沿机身角度前进
S/↓ | 与地面平行后退 | 后退 | 沿机身角度后退
A/← | 与地面平行向左移动 | 向左移动 | 与地面平行向左移动
D/→ | 与地面平行向右移动 | 向右移动 | 与地面平行向右移动
E/PgUp | 上升 | 无 | 上升
Q/PgDn | 下降 | 无 | 下降
空格 | 无 | 跳起(高度x2后落地) | 无
C | 无 | 下蹲(高度/2) | 无
Shift+移动 | 加速移动(移动速度x3) | 加速移动(移动速度x3) | 加速移动(移动速度x3)

设置镜头自身旋转

```javascript
const res = await App.CameraControl.ToggleCameraSelfRotate(true);
console.log(res); 
```
参数 | 备注
--- | ---
true/false | 当镜头模式为飞行模式时，设置成true，镜头以自身旋转；设置成false，镜头以场景的屏幕中心旋转

获取镜头位置

```javascript
const res = await App.CameraControl.GetCameraPose();
console.log(res);
```
设置镜头位置

```javascript
const jsondata = {
  "location": [121.48537621,31.23840069,900],
  "rotation": {
    "pitch": -35, //俯仰角, 参考(-90~0)
    "yaw": 0 //偏航角, 参考(-180~180)
  },
  "flyTime": 1 //过渡时长(单位:秒)
}

const res = await App.CameraControl.SetCameraPose(jsondata);
console.log(res);
```
重置镜头位置

```javascript
//相机初始状态效果若不理想，可以对相机初始状态进行调整
const jsondata = {
  "state": 'Default', //Default: 相机初始状态; Last: 相机最后一次位置
  "flyTime": 1, //过渡时长(单位:秒)
}

const res = await App.CameraControl.ResetCameraPose(jsondata);
console.log(res);
```
参数 | 备注
--- | ---
Default | 相机的初始状态；若相机初始状态效果若不理想，可以对相机初始状态进行调整；初始镜头的值在log中的WdpCameraStartEntity可以找到
Last | 相机最后一次位置，即SetCameraPose设置的最后一次位置

获取镜头Limit值

```javascript
const res = await App.CameraControl.GetCameraLimit();
console.log(res);
```
设置镜头Limit值

```javascript
const jsondata = {
  "locationLimit": [ //设置相机位置区域(至少三个坐标点,三角区域)[选填]
    [121.47095414, 31.22534628],
    [121.47264982, 31.23423431],
    [121.49467492, 31.24871524]
  ],
  "pitchLimit": [-80, 0], //俯仰角; 取值范围[-90~0]
  "yawLimit": [-100, 100], //偏航角; 取值范围[-180~180]
  "viewDistanceLimit": [100, 1000] //相机距离实体距离范围
}

const res = await App.CameraControl.SetCameraLimit(jsondata);
console.log(res);
```
设置镜头固定Limit值

```javascript
const jsondata = {
  "locationLimit": 100, // 鼠标拖动场景时, 相机前后左右移动[-100,100]范围(单位:米)
  "pitchLimit": 10, // 当前pitch(俯仰角)可移动的[-10,0]范围; 取值范围[0~90]
  "yawLimit": 20, // 当前yaw(偏航角)可移动的[-20,20]范围; 取值范围[0~180]
  "viewDistanceLimit": 100 // 鼠标滚轮时, 当前视距的[-100,100]范围(单位:米)
}

const res = await App.CameraControl.SetCameraLockLimit(jsondata);
console.log(res);
```
重制镜头Limit值

```javascript
const res = await App.CameraControl.ResetCameraLimit('Default');
// Default: 相机初始Limit; Free: 无Limit限制

console.log(res);
```
设置镜头速度

```javascript
const res = await App.CameraControl.SetCameraSpeed({
    rotationYawSpeedScale: 1, // [选填] 左右旋转时候的相机速度倍率，1.0是正常速度(取值>=0)
    rotationPitchSpeedScale: 1, // [选填] 上下旋转时候的相机速度倍率，1.0是正常速度(取值>=0)
    zoomSpeedScale: 1, // [选填] 滚轮鼠标缩放的相机速度，1.0是正常速度(取值>=0)
    keyMovementBaseSpeed: 1, // [选填] 键盘控制相机移动的速度，1.0是正常速度(取值>=0)
    enableDynamicSpeed: true // [选填] 是否开启动态速度 (默认开启) 如果开启 离地面越远相机速度越快
});
console.log(res);
  
```
获取镜头速度

```javascript
const res = await App.CameraControl.GetCameraSpeed();
console.log(res);
```
设置镜头圆圈动画

```javascript
const res = await App.CameraControl.SetCameraAnimation({
    showTouchEffect: true, // [选填] 是否显示点击鼠标之后的圆圈动画效果，默认开启
    showRotateICON: true // [选填] 是否显示旋转镜头时候的圆圈图标，默认开启
});
console.log(res);
```
获取镜头圆圈动画

```javascript
const res = await App.CameraControl.GetCameraAnimation();
console.log(res);
```
---

### 相机通用行为
**Title:** 相机通用行为

获取相机信息

```javascript
const res = await App.CameraControl.GetCameraInfo();
console.log(res);
```
更新相机信息

```javascript
const jsondata = {
  location: [121.48940131, 31.25135281, 500],
  locationLimit: [], //设置相机位置区域(至少三个坐标点,三角区域)[选填]
  rotation: { pitch: -30, yaw: 0 },
  pitchLimit: [-90, 0], // 俯仰角, 参考(-90~0)
  yawLimit: [-180, 180], // 偏航角, 参考(-180~180)
  viewDistanceLimit: [500, 600],
  fieldOfView: 90, // 相机视锥横向视角[0, 120]
  controlMode: "RTS", // 控制模式; RTS (飞行模式); TPS (第三人称模式); FPS (第一人称模式)
  flyTime: 1, // 过渡时长(单位:秒)
};

await App.CameraControl.UpdateCamera(jsondata);
```
**参数：**

参数 | 类型 | 必填 | 取值范围
--- | --- | --- | ---
Location | array |  | 
locationLimit | array |  | 设置相机位置区域(至少三个坐标点,三角区域) [选填]
rotation | object |  | 
-pitch | number | -30 | [-90,0]
-yaw | number | 0 | [-180,180]
pitchLimit | array | [-90,0] | [-90,0]
yawLimit | array | [-180,180] | [-180,180]
viewDistanceLimit | array | [0,10000] | [0,+∞)
fieldOfView | number | 90 | [0,120]
controlMode | string | RTS, TPS, FPS | RTS (飞行模式); TPS (第三人称模式); FPS (第一人称模式)

相机速度移动

```javascript
const res = await App.CameraControl.Move({
  direction: 'right', // 移动方向
  velocity: 10 //速度(单位: 米/秒)
});

console.log(res)
```
**参数：**

参数 | 类型 | 必填 | 取值范围
--- | --- | --- | ---
direction | string |  | forward 前;backward 后;left 左;right 右;up 上;down 下
velocity | number |  | 速度(单位: 米/秒)

![](/profile/upload/2025/11/27/相机速度移动_20251127182339A026.gif)}]

相机距离移动

```javascript
const res = await App.CameraControl.Move({
  direction: 'right', // 移动方向
  distance: 10, //距离（单位：米）
  velocity: 10 //速度(单位: 米/秒)
});
/*
direction: 移动方向
  forward 前; 
  backward 后; 
  left 左; 
  right 右; 
  up 上; 
  down 下;
*/
```
相机速度旋转

```javascript
const res = await App.CameraControl.Rotate({
  direction: "right",
  velocity: 10,
});

console.log(res);
```
**参数说明：**

参数 | 类型 | 必填 | 取值范围
--- | --- | --- | ---
direction | string |  | up; down; left; right
velocity | number |  | 速度(单位: 米/秒)

![](/profile/upload/2025/11/27/相机速度旋转_20251127182638A027.gif)}]

相机角度旋转

```javascript
await App.CameraControl.Rotate({
  direction: 'right', //旋转方向
  angle: 20, //角度
  velocity: 10 //速度(单位: 米/秒)
});
// direction: up; down; left; right
  
```
相机围绕目标旋转

```javascript
const jsondata = {
  "targetPosition": [121.53148991,31.2427778,57],
  "rotation": {
    "pitch": -25, //俯仰角(-90~0)
    "yaw": 0, //偏航角(-180~180; 0:东; 90:南; -90:北)
  },
  "distance": 3000, //距离(单位:米)
  "flyTime": 1 //过渡时长(单位:秒)
}
await App.CameraControl.FlyTo(jsondata)
await wait(1500);
// 先飞到某个地方，然后再旋转
const res = await App.CameraControl.Around({
  direction: 'clockwise', //旋转方向
  velocity: 10 //速度(单位: 米/秒)
});
// direction: clockwise 顺时针; anticlockwise 逆时针


```
![](/profile/upload/2025/11/27/相机围绕目标旋转_20251127182759A028.gif)}]

停止移动、旋转

```javascript
await App.CameraControl.Stop();
```
---

### 相机Step行为
**Title:** 相机Step行为

相机step移动

```javascript
const res = await App.CameraControl.CameraStepMove({
  moveDirection: "E_Forward", // 移动方向
  step: 0.5, //速度的倍率 -1 ~ 1
  bContinuous: true, //是否连续
});

console.log(res);


/*
  moveDirection: 移动方向
  E_Forward: 前;
  E_Backward: 后;
  E_Left: 左;
  E_Right: 右;
  E_Up: 上;
  E_Down: 下
*/
```
**参数：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
moveDirection | string |  | E_Forward,E_Backward,E_Left,E_Right,E_Up,E_Down | E_Forward: 前E_Backward: 后E_Left: 左E_Right: 右E_Up: 上E_Down: 下
step | number |  | [-1~1] | 速度的倍率
bContinuous | boolean |  | true, false | 是否连续

相机step旋转

```javascript
const res = await App.CameraControl.CameraStepRotate({
  rotateDirection: 'E_Pitch', //E_Pitch: 俯仰角, E_Yaw: 偏航角
  step: 0.5, //速度的倍率 -1 ~ 1
  bContinuous: true //是否连续
});

console.log(res);
```
参数：

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
rotateDirection | string |  | E_Pitch, E_Yaw | E_Pitch: 俯仰角, E_Yaw: 偏航角
step | number |  | [-1~1] | 速度的倍率
bContinuous | boolean |  | true, false | 是否连续

相机step缩放

```javascript
const res = await App.CameraControl.CameraStepZoom({
  step: 0.5, //速度的倍率 -1 ~ 1
  bContinuous: true //是否连续
});

console.log(res);
```
**参数：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
step | number |  | [-1~1] | 速度的倍率; (正数放大视野; 负数缩小视野)
bContinuous | boolean |  | true, false | 是否连续

停止移动、旋转、缩放

```javascript
await App.CameraControl.StopCameraStepUpdate();
```
---

### 相机聚焦行为
**Title:** 相机聚焦行为

相机聚焦到坐标点

```javascript
const jsondata = {
    "targetPosition": [121.48533665,31.24164246,30],
    "rotation": {
        "pitch": -30, //俯仰角, 参考(-90~0)
        "yaw": 0, //偏航角, 参考(-180~180; 0:东; 90:南; -90:北)
    },
    "distance": 500, //距离(单位:米)
    "flyTime": 1 //过渡时长(单位:秒)
}

await App.CameraControl.FlyTo(jsondata)
```
**参数描述：**

参数 | 是否必填 | 默认值 | 备注
--- | --- | --- | ---
targetPostion | 是 | 无 | 位置
rotation | 否 | "pitch": -30,"yaw": 0, | 
distance | 否 | 10 | 距离
flyTime | 否 | 1 | 镜头飞行时间

相机聚焦nodeId单体

AESTiles底板（自动生成底板）整体为一个实体（EID），AES底板上的每个单体有不重复的nodeId。



```javascript
const jsondata = {
  // "entity": entity, // 默认是AESTiles对象，如果对象是Instance是必填
  "nodeIds": ['895874688','882098004'], // 实体 nodeIds
  "rotation": {
    "pitch": -30, // 俯仰角(-90~0)
    "yaw": 0 // 偏航角(-180~180; 0:东; 90:南; -90:北)
  },
  "distanceFactor": 0.4, //距离(单位:米)
  "flyTime": 1 //过渡时长(单位:秒)
}
// 如果entity对象是Instance
// const res = await App.CameraControl.FocusToNodes(jsondata, "Instance");
const res = await App.CameraControl.FocusToNodes(jsondata);
console.log(res);

/*
* @param {*} jsondata - 聚焦节点的JSON数据；
* @param {type} string- 可选参数，默认为Tiles。当设置type是Instance时，entity必须传Instance所属的Entity对象；当type设置Tiles时，entity为当前AESTiles的对象，也可以不填；当type设置Project时，entity为当前项目的Project对象，也可以不填；
*/
```
相机聚焦到实体

各类覆盖物、用户模型、官方静态模型、官方骨骼模型等都为实体概念。



```javascript
const jsondata = {
  rotation: {
    pitch: -30, //俯仰角, 参考(-90~0)
    yaw: 0, //偏航角, 参考(-180~180; 0:东; 90:南; -90:北)
  },
  distanceFactor: 0.4, //参数范围[0.1~1]; 实体占满屏幕百分比
  flyTime: 1, //过渡时长(单位:秒)
  entity: [pathObject], //实体对象
};

await App.CameraControl.Focus(jsondata);
```
按类型聚焦实体

```javascript
await App.CameraControl.FocusToAll({
  types: ["Poi", "Path"], // 实体类型
  bFilterForExclude: false, // 是否排除指定的类型
});


// types (注意大小写)
/*
  RealTimeVideo  实时视频
  Window  窗口
  Poi  POI
  Particle  特效
  Text3D  3D文字
  Viewshed  可视域
  Path  路径
  Parabola  迁徙图
  Range  区域轮廓
  HeatMap  热力图
  ColumnarHeatMap  柱状热力图
  SpaceHeatMap  点云热力图
  RoadHeatMap  路径热力图
*/
```
聚焦全部实体

```javascript
await App.CameraControl.FocusToAll();
```
相机跟随实体

```javascript
const jsondata = {
  followRotation: {
    pitch: -20, //俯仰角, 参考(-90~0)
    yaw: 20, //偏航角, 参考(-180~180; 0:东; 90:南; -90:北)
  },
  useRelativeRotation: true, //相对实体进行offset
  distance: 200,
  bFPS: true, //true 第一人称视角/false 第三人称视角
  entity: followParticle, //实体对象
};

await App.CameraControl.Follow(jsondata);
```
![](/profile/upload/2025/11/28/相机跟随实体_20251128152653A045.gif)}]

停止相机跟随

```javascript
await App.CameraControl.Stop();
```
![](/profile/upload/2025/11/28/停止相机跟随_20251128152657A046.gif)}]

---

### 相机漫游
**Title:** 相机漫游

相机漫游

```javascript
const jsondata = {
  frames: [
    {
      location: [121.49067713, 31.11991912, 300],
      rotation: {
        pitch: -25, //俯仰角, 参考(-90~0)
        yaw: 0, //偏航角, 参考(-180~180; 0:东; 90:南; -90:北)
      },
      time: 20, //镜头到下一帧的时间(单位:秒)
    },
    {
      location: [121.49060113, 31.114312, 300],
      rotation: {
        pitch: -15,
        yaw: 80,
      },
      time: 20,
    },
    {
      location: [121.49687008, 31.13777349, 300],
      rotation: {
        pitch: -20,
        yaw: 160,
      },
      time: 15,
    },
    {
      location: [121.49441582, 31.13728981, 300],
      rotation: {
        // 最后一帧 镜头停止后的姿态，不需要写时间
        pitch: -15,
        yaw: 240,
      },
    },
  ],
};

const entityObj = new App.CameraRoam(jsondata);
const res = await App.Scene.Add(entityObj);

// 开启相机漫游
const args = {
  progressRatio: 0, //镜头位置切换到整体漫游比例,范围[0,1]
  speedRatio: 1, //相机漫游移动倍率
  bReverse: false, //是否反向
};

await App.CameraControl.PlayRoam(entityObj, args);
```
**CameraRoam参数：**

参数 | 类型 | 必填 | 默认值 | 备注
--- | --- | --- | --- | ---
bAutoRotation | boolean | 否 | false | 镜头是否自动对准下一个目标点
bResetAfterFinished | boolean | 否 | ture | 镜头结束时是否重置
frames[].location | Array | 否 | 无 | 漫游的动画帧
frames[].rotation | {pitch: number, yaw: number} | 否 | 无 | 镜头角度pitch: 俯仰角(-90~0)yaw: 偏航角(-180~180; 0:东; 90:南; -90:北)
frames[].time | number | 否 | 无 | 相机到下一帧的时间(单位:秒)最后一帧不需要写时间，因为时间是帧与帧之间的**PlayRoam参数：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
progressRatio | number | 否 | [0,1] | 镜头位置切换到整体漫游比例,范围[0,1]
speedRatio | number | 否 |  | 相机漫游移动倍率
bReverse | boolean | 否 |  | 是否反向

暂停漫游

```javascript
const res = await App.CameraControl.PauseRoam({
      bEnableRotatingOnPause: false,
      bEnableZoomingOnPause: false
    });
console.log(res);
```
参数 | 类型 | 必填 | 默认值 | 备注
--- | --- | --- | --- | ---
opt.bEnableRotatingOnPause | boolean | 否 | false | 是否运行暂停时旋转镜头&gt;=1.15.1
opt.bEnableZoomingOnPause | boolean | 否 | false | 是否允许暂停时缩放镜头&gt;=1.15.1

继续漫游

```javascript
const res = await App.CameraControl.PlayRoam();
console.log(res);
```
停止漫游

```javascript
const res = await App.CameraControl.StopRoam();
console.log(res);
```
更新相机漫游

```javascript
const jsondata = {
  "frames": [
    {
      "location": [121.48216421, 31.10446008, 300],
      "rotation": {
        "pitch": -25, //俯仰角, 参考(-90~0)
        "yaw": -90, //偏航角, 参考(-180~180; 0:东; 90:南; -90:北)
      },
      "time": 20 //镜头到下一帧的时间(单位:秒)
    },
    {
      "location": [121.48405533, 31.12949274, 300],
      "rotation": {
        "pitch": -15,
        "yaw": 0
      },
      "time": 20
    },
    {
      "location": [121.48880933, 31.13466789, 300],
      "rotation": {
        "pitch": -25,
        "yaw": 90
      }
    }
  ]
}

// roamObj 为 new App.CameraRoam({...}) 时创建的对象;
await roamObj.Update(jsondata);

// 开启相机漫游
const args = {
  "state": "play", //play:漫游; pause:暂停; stop:结束
  "progressRatio": 0, //镜头位置切换到整体漫游比例,范围[0,1]
  "speedRatio": 1, //相机漫游移动倍率
  "bReverse": false //是否反向
}

await App.CameraControl.PlayCameraRoam(roamObj, args);
```
获取镜头漫游进度

```javascript
await App.CameraControl.GetCameraRoamingInfo(obj); // 漫游对象

```
参数 | 类型 | 必填 | 默认值 | 备注
--- | --- | --- | --- | ---
obj | cord&lt;string,any&gt; | 是 | 无 | CameraRoam对象

获取相机漫游信息

```javascript
// roamObj 为 new App.CameraRoam({...}) 时创建的对象;
const _res = await roamObj.Get();
console.log(_res);
```
停止相机漫游

```javascript
await App.CameraControl.Stop()
```
---

## 通用基础属性

### App.Scene
**Title:** App.Scene

Add (往场景里添加entity)

```javascript
await App.Scene.Add(obj, {
  "calculateCoordZ": {   // 坐标类型及坐标高度; [可选] 最高优先级
    "coordZRef": "surface",   // surface: 表面;  ground: 地面;  altitude: 海拔
    "coordZOffset": 50   // 高度(单位:米)
  }
});
```
**参数描述**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
object | Array | Object |  |  | 对象数组或对象
calculateCoordZ | coordZRef | string | 可选 | surface, ground, altitude | surface:表面; ground:地面; altitude:海拔
coordZOffset | number | 可选 |  | 高度(单位:米)calculateCoordZ 最高优先级; 缺省时采用obj里的坐标coordz

**返回：**



```javascript
{
    "success": true, // true, false
    "message": '',
    "result": {
        "object": {}, // "objects": [],
        "sceneChangeInfo": {}
    }
}
```
Update (多个相同类型对象统一更新)

注：只应用于覆盖物类型



```javascript
await App.Scene.Update([obj, obj, ...],
    { poiStyle: { ... } }, {
    "calculateCoordZ": {   // 坐标类型及坐标高度; [可选] 最高优先级
        "coordZRef": "surface",   // surface: 表面;  ground: 地面;  altitude: 海拔
        "coordZOffset": 50   // 高度(单位:米)
    }
});
```
**返回：**



```javascript
{
    success: true,
    message: '',
    result: {
        sceneChangeInfo: {
            updated: [obj1, obj2]
        }
    }
}
```
Updates (多个类型对象更新)

注：只应用于覆盖物类型



```javascript
await App.Scene.Updates([
    { object: entityObj1, jsonData: entityObj1Json},
    { object: entityObj2, jsonData: entityObj2Json},
], {
    "calculateCoordZ": {   // 坐标类型及坐标高度; [可选] 最高优先级
        "coordZRef": "surface",   // surface: 表面;  ground: 地面;  altitude: 海拔
        "coordZOffset": 50   // 高度(单位:米)
    }
});
```
**返回：**



```javascript
{
    success: true,
    message: '',
    result: {
        sceneChangeInfo: {
            updated: [obj1, obj2]
        }
    }
}
```
Create (批量添加相同分类的entity)

```javascript
await App.Scene.Create({
    ... // 默认属性值
}, [{
   ... // 批量属性值
}], {
    "calculateCoordZ": {   // 坐标类型及坐标高度; [可选] 最高优先级
        "coordZRef": "surface",   // surface: 表面;  ground: 地面;  altitude: 海拔
        "coordZOffset": 50   // 高度(单位:米)
      }
   }
);
```
**返回：**



```javascript
{
    "success": true, // true, false
    "message": '',
    "result": {
        "objects": [obj, ...]
        "sceneChangeInfo": {}
    }
}
```
Creates (批量添加不同分类的entity)

```javascript
await App.Scene.Creates([{
	... // 批量属性值
}], {
    "calculateCoordZ": {   // 坐标类型及坐标高度; [可选] 最高优先级
        "coordZRef": "surface",   // surface: 表面;  ground: 地面;  altitude: 海拔
        "coordZOffset": 50   // 高度(单位:米)
      }
   }
);
```
**返回：**



```javascript
{
    "success": true, // true, false
    "message": '',
    "result": {
        "objects": [obj, ...]
        "sceneChangeInfo": {}
    }
}
```
GetAll (获取场景中所有entity对象)

```javascript
await App.Scene.GetAll();
```
GetByEids (通过eid获取对象)

```javascript
await App.Scene.GetByEids(['-9151314316185345952', '-9151314316965221260', ...]);
```
GetByEntityName (通过entityName获取entity)

```javascript
await App.Scene.GetByEntityName(['name01', 'name02', ...]);
```
GetByCustomId (通过customId获取entity)

```javascript
await App.Scene.GetByCustomId(['cuId01', 'cuId02', ...]);
```
GetByTypes (通过类型获取entity)

```javascript
await App.Scene.GetByTypes(['Poi', 'Static', ...]); //更多类型查看: 实体类型表
```
Delete (批量删除entity)

```javascript
await App.Scene.Delete([obj, obj, ...]);
```
ClearByTypes (批量删除entity)

```javascript
await App.Scene.ClearByTypes(['xxx', 'xxx', ...]);
/*
  Static           静态模型
  Skeletal         骨骼模型
  Hierarchy        结构模型
  ISEHierarchy     ISE结构模型
  Effects          粒子特效
*/

/*
  RealTimeVideo    实时视频
  Window           窗口
  Poi              POI
  Particle         特效
  Effects          粒子特效
  Light            灯光
  Text3D           3D文字
  Viewshed         可视域
  Path             路径
  Parabola         迁徙图
  Range            区域轮廓
  HeatMap          热力图
  ColumnarHeatMap  柱状热力图
  SpaceHeatMap     点云热力图
  RoadHeatMap      路径热力图
  Raster           栅格图
  HighlightArea    高亮区域
*/
```
ClearByObjects (批量删除entity)

```javascript
await App.Scene.ClearByObjects([obj, obj, ...]);
```
ClearByEids(批量删除entity)

```javascript
await App.Scene.ClearByEids(['xxx', 'xxx', ...]);
```
Covering.Clear (删除场景中所有覆盖物)

```javascript
await App.Scene.Covering.Clear();
```
ClearByCustomId (通过customId批量删除)

```javascript
await App.Scene.ClearByCustomId(['xxx', 'xxx', ...]);
```
ClearByEntityName (通过entityName批量删除)

```javascript
await App.Scene.ClearByEntityName(['xxx', 'xxx', ...]);
```
UpdateByCustomId (通过customId批量更新同类entity)

```javascript
await App.Scene.UpdateByCustomId(['xxx', 'xxx', ...], { poiStyle: { ... } }, {
    "calculateCoordZ": {   // 坐标类型及坐标高度; [可选] 最高优先级
        "coordZRef": "surface",   // surface: 表面;  ground: 地面;  altitude: 海拔
        "coordZOffset": 50   // 高度(单位:米)
    }
});
```
UpdateByCustomIds (通过customId批量更新不同类entity)

```javascript
await App.Scene.UpdateByCustomId([
        { customId: 'cuId01', poiStyle: { ... } },
        { customId: 'cuId02', pathStyle: { ... } }
    ], {
    "calculateCoordZ": {   // 坐标类型及坐标高度; [可选] 最高优先级
        "coordZRef": "surface",   // surface: 表面;  ground: 地面;  altitude: 海拔
        "coordZOffset": 50   // 高度(单位:米)
    }
});
```
UpdateByEntityName (通过entityName批量更新同类entity)

```javascript
await App.Scene.UpdateByEntityName(['xxx', 'xxx', ...], { poiStyle: { ... } }, {
    "calculateCoordZ": {   // 坐标类型及坐标高度; [可选] 最高优先级
        "coordZRef": "surface",   // surface: 表面;  ground: 地面;  altitude: 海拔
        "coordZOffset": 50   // 高度(单位:米)
    }
});
```
UpdateByEntityNames (通过entityName批量更新不同类entity)

```javascript
await App.Scene.UpdateByEntityNames([
        { entityName: 'name01', poiStyle: { ... } },
        { entityName: 'name02', pathStyle: { ... } }
    ], {
    "calculateCoordZ": {   // 坐标类型及坐标高度; [可选] 最高优先级
        "coordZRef": "surface",   // surface: 表面;  ground: 地面;  altitude: 海拔
        "coordZOffset": 50   // 高度(单位:米)
    }
});
```
SetVisibleByObjects (批量显隐entity)

```javascript
await App.Scene.SetVisibleByObjects([obj, obj, ...], false);
```
SetVisible (批量显隐entity)

```javascript
await App.Scene.SetVisible([obj, obj, ...], false);
```
SetLocation (多个对象移动到同一个位置)

```javascript
await App.Scene.SetLocation([obj, obj, ...], { x: 121.50796384, y: 31.23267352, z: 50 });
```
SetLocations (多个对象移动到不同位置)

```javascript
await App.Scene.SetLocations([
    { object: obj1, location: { x: 121.50796384, y: 31.23267352, z: 50 } },
    { object: obj2, location: { x: 121.52796384, y: 31.25267352, z: 50 } },
]);
```
SetRotator (多个对象旋转到同一角度)

```javascript
await App.Scene.SetRotator([obj, obj, ...], { pitch: 70, yaw: 20, roll: 80 });
```
SetRotators (多个对象旋转到不同角度)

```javascript
await App.Scene.SetRotators([
    { object: obj1, rotator: { pitch: 70, yaw: 20, roll: 80 } }
    { object: obj2, rotator: { pitch: 50, yaw: 30, roll: 70 } }
]);
```
SetScale3D (多个对象缩放相同倍数)

```javascript
await App.Scene.SetScale3D([obj, obj, ...], { x: 10, y: 50, z: 50 });
```
SetScale3Ds (多个对象缩放不同倍数)

```javascript
await App.Scene.SetScale3Ds([
    { object: obj, scale3d: { x: 10, y: 50, z: 50 } }
]);
```
SetLocked (多个对象同时锁定解锁)

```javascript
await App.Scene.SetLocked([obj, obj, ...], false);
```
GetBound (获取对象的bounding box数据; 实体box范围)

```javascript
await App.Scene.GetBound([obj, obj, obj]);
```
**返回：**



```javascript
{
    "success": true,
    "message": "",
    "result": {
        "entitiesBound": {  //Cartesian 笛卡尔坐标
            "min": [
                575.0857058653336,
                583.5574901356209,
                11.27789306640625
            ],
            "max": [
                1730.7478152403335,
                -1138.2877247081292,
                601.21044921875
            ],
            "isValid": 1
        }
    }
}
```
---

### Geometry
**Title:** Geometry

Geometry GIS坐标: point 单点实体

```javascript
const object = new App.Poi({
  "location": [121.46434372, 31.23499129, 200],
  "poiStyle": { ... }
})
```
**参数描述：**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
location | array |  | 格式: [lng, lat, coordz]; coordz: 海拔高度
poiStyle | JSON |  | JSON 数据

Geometry GIS坐标: polyline 多点实体

```javascript
const object = new App.Path({
    "polyline": {
        "coordinates": [
            [121.49968476, 31.24861346, 44],
            [121.49956979, 31.25093239, 96],
            [121.47613890, 31.23725069, 39]
        ]
    },
    "pathStyle": { ... }
});​
```
**参数描述**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
polyline-coordinates | array |  | 坐标位置,格式[[lng, lat, coordz],[[lng, lat, coordz],....]
pathStyle | JSON |  | JSON 数据

Geometry GIS坐标: polygon2D 多点实体

```javascript
const object= new App.Range({
    "polygon2D": {
        "coordinates": [
            [  //外环坐标数据
                [121.44988564758069, 31.250519581243555],
                [121.44931229954645, 31.237062463089813],
                [121.47069915607464, 31.23800903013435],
                [121.46964214200186, 31.251854247249092]
            ],
            [  //内环坐标数据
                [121.45523929837454, 31.247795686070997],
                [121.45496451671893, 31.240059486959915],
                [121.46707798490596, 31.24170746459223]
            ]
        ]
    },
    "rangeStyle": { ... }
})
```
<h5>**参数描述**</h5>参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
polyline-coordinates | array |  | 坐标，格式中第一个数组为外环，后续为内环：[ [[lng,lat],[lng,lat],....], [[lng,lat],[lng,lat],....], ....]
rangeStyle | JSON |  | JSON 数据

Geometry GIS坐标: points 多点实体

```javascript
const object = new App.HeatMap({
    "points": {
        "features": [
            { "point": [121.49656333, 31.22702479, 49], "value": 89 },
            { "point": [121.46434372, 31.23499129, 60], "value": 62 },
            { "point": [121.49099537, 31.23099794, 22], "value": 54 }
        ]
    },
    "heatMapStyle": { ... }
});
```
**参数描述：**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
points.features | point | array |  | [lng,lat,coordz]
 | value | number |  | 需要在“mappingValueRange”定义的区间内
heatMapStyle |  | JSON |  | JSON 数据

---

### 基础与自定义属性
**Title:** 基础与自定义属性

基础与自定义属性

3D文字Text3D为示例, 适用所有实体覆盖物



```javascript
const obj = new App.Text3D({
    ... ...
    // 基础属性，所有实例全部具有
    "bLocked": true, //添加的实体是否锁定, 不可点击、框选等操作(true/false) [可选]
    "bVisible": true, //添加的实体是否可见(true/false) [可选]

    // 自定义属性，所有实例全部具有; 按业务需求 自行定义内容
    "entityName": "myName", //[可选]
    "customId": "myId", //[可选]
    "customData": { //[可选]
        "data": "myCustomData"
    }

})
```
**参数描述：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
bLocked | boolean | 可选 | true, false | 添加的实体是否锁定, 不可点击、框选等操作
bVisible | boolean | 可选 | true, false | 添加的实体是否可见
entityName | string | 可选 |  | 配置后可使用EntityName系列功能
customId | string | 可选 |  | 配置后可使用CustomId系列功能
customData | object | 可选 |  | 按业务需求配置**属性设置**

以字母b开始的key; Get/Set属性省略字母b, 且首字母大写



```javascript
// 获取 getter:
// 方式一:
console.log("bLocked:: ", obj.bLocked);
console.log("bVisible:: ", obj.bVisible);
console.log("entityName:: ", obj.entityName);
console.log("customId:: ", obj.customId);

// 方式二:
console.log("GetLocked:: ", await obj.GetLocked());
console.log("GetVisible:: ", await obj.GetVisible());
console.log("GetEntityName:: ", await obj.GetEntityName());
console.log("GetCustomId:: ", await obj.GetCustomId());
```
```javascript
// 设置 setter:
// 方式一:
obj.bLocked = false;
obj.bVisible = false;
obj.entityName = 'newName';
obj.customId = 'newId';

// 方式二:
await obj.SetLocked(false);
await obj.SetVisible(false);
await obj.SetEntityName('newName');
await obj.SetCustomId('newId');
```
接收一：对象点击事件

```javascript
text3d.onClick(async ev => {
    const obj = ev.result.object;
    console.log(await obj.Get());
})
```
接收二：事件监听回调

```javascript
App.Renderer.RegisterSceneEvents([
  {
    name: 'OnEntityClicked', func: async function (res) {
      // 覆盖物被点击事件回调; 包含数据信息与实体对象
      if (res.result.object.entityName === "myName") {
        const jsondata = {
          "text3DStyle": {
            "text": "更新3D文字",
            "color": "a421ffff",
            "type": "plain",
            "outline": 0.2,
            "portrait": false,
            "space": 0.2
          }
        }
        const newObj = res.result.object;
        newObj.Update(jsondata, {
          "calculateCoordZ": {  //[可选] 最高优先级
            "coordZRef": "surface",//surface:表面;ground:地面;altitude:海拔
            "coordZOffset": 0 //高度(单位:米)
          }
        });

        const info = await newObj.Get();
        console.log(info)
      };
    }
  }
])
```
---

### 实体扩展属性
**Title:** 实体扩展属性

实体扩展属性

其它实例属性参照各实例属性字段



```javascript
// particleObj 为 new App.Particle({...}) 时创建的对象;

// 获取Particle属性
async function getParticleAttr () {
    // 方式一:
    console.log("location:: ", particleObj.location);
    console.log("type:: ", particleObj.particleType);
    console.log("rotator:: ", particleObj.rotator);
    console.log("scale3d:: ", particleObj.scale3d);

    // 方式二:
    console.log("location:: ", await particleObj.GetLocation());
    console.log("type:: ", await particleObj.GetParticleType());
    console.log("rotator:: ", await particleObj.GetRrotator());
    console.log("scale3d:: ", await particleObj.GetScale3d());
}
getParticleAttr();


// 设置Particle属性
async function setParticleAttr () {
    // 方式一:
    particleObj.location = [121.46141528,31.23360944,86];
    particleObj.particleType = "vehicle_car_white";
    particleObj.rotator = {
        "pitch": 0, "yaw": 40, "roll": 0
    };
    particleObj.scale3d = [200, 200, 200];

    // 方式二:
    await particleObj.SetLocation([121.46141528,31.23360944,86]);
    await particleObj.SetParticleType("vehicle_car_white");
    await particleObj.SetRotator({
        "pitch": 0, "yaw": 40, "roll": 0
    });
    await particleObj.SetScale3d([200, 200, 200]);
}
setParticleAttr();

```
实例中属性字段key是type时，设置属性时映射的新字段为sType



```javascript
// pathObj 为 new App.Path({...}) 时创建的对象;

// 获取Path属性
async function getPathAttr (attr) {
    // 方式一:
    console.log("coordinates:: ", pathObj.coordinates);
    console.log("sType:: ", pathObj.sType);
    console.log("width:: ", pathObj.width);
    console.log("color:: ", pathObj.color);
    console.log("passColor:: ", pathObj.passColor);

    // 方式二:
    console.log("coordinates:: ", await pathObj.GetCoordinates());
    console.log("sType:: ", await pathObj.GetsType());
    console.log("width:: ", await pathObj.GetWidth());
    console.log("color:: ", await pathObj.GetColor());
    console.log("passColor:: ", await pathObj.GetPassColor());
}
getPathAttr();


// 设置Path属性
async function setPathAttr (attr) {
    // 方式一:
    pathObj.coordinates = [
      [121.50056782,31.22792919,23],
      [121.49728647,31.22611933,90],
      [121.48236809,31.23146931,60]
    ];
    pathObj.sType = "solid";
    pathObj.width = 50;
    pathObj.color = "ff4b3dff";
    pathObj.passColor = "affff2ff";

    // 方式二:
    await pathObj.SetCoordinates([
      [121.50056782,31.22792919,23],
      [121.49728647,31.22611933,90],
      [121.48236809,31.23146931,60]
    ]);
    await pathObj.SetsType("solid");
    await pathObj.SetWidth(50);
    await pathObj.SetColor("ff4b3dff");
    await pathObj.SetPassColor("affff2ff");
}
setPathAttr();
```
---

### 实体通用方法
**Title:** 实体通用方法

实体成员函数

示例: Text3D 成员函数



```javascript
const obj = new App.Text3D({ ... });
obj.Update(json);
obj.Get/SetLocation(json);
obj.Get/SetRotator(json);
obj.Get/SetScale3d(json);
obj.Get/SetLocked(boolean);
obj.Get/SetVisible(boolean);
obj.Get/SetEntityName(string);
obj.Get/SetCustomId(string);
obj.Get/SetCustomData(json);
obj.Get();
obj.oType;  //get
obj.bLocked = boolean;   //get/set
obj.location = [121.49328325, 31.23863899, 10];   //get/set
obj.rotator = {pitch: 0, yaw: 60, roll: 0}   //get/set
obj.scale3d = [5,5,5];   //get/set
obj.bVisible = boolean;   //get/set
obj.entityName = '';   //get/set
obj.customId = '';   //get/set
obj.customData = {};   //get/set
obj.Delete(); //不支持工程模型
obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
})
obj.onMouseEnter(ev => {
    console.log(ev);
})
obj.onMouseOut(ev => {
    console.log(ev);
})
```
Update(data)

用途：更新Text3D实体

data同Add时的参数

Get/SetLocation(jsondata)

用途：获取/设置Text3D实体位置

const jsondata = [121.48073857,31.22738813,67]

Get/SetRotator(jsondata)

用途：获取/设置Text3D实体旋转

单体3D实体对象有效 (场景特效: Particle, 3D文字: Text3D, 可视域: Viewshed, 粒子特效: Effects, 灯光: Light, 模型)



```javascript
const jsondata = {
    "pitch": 0, //俯仰角, 参考(-180~180)
    "yaw": 30, //偏航角, 参考(-180~180)
    "roll": 0 //翻滚角, 参考(-180~180)
}
```
Get/SetScale3d(jsondata)

用途：获取/设置Text3D实体缩放

单体3D实体对象有效 (场景特效: Particle, 3D文字: Text3D, 可视域: Viewshed, 粒子特效: Effects, 灯光: Light, 模型)



```javascript
const jsondata = [200,200,200]; //缩放比例(x,y,z)坐标轴
```
Get/SetLocked(boolean)

用途：获取/设置Text3D实体锁定/解锁

锁定后不可点击、框选等操作

true:锁定；false：解锁

Get/SetVisible(boolean)

用途：获取/设置Text3D实体显隐

true:显示；false：隐藏

Get/SetEntityName(string)

用途：获取/设置Text3D 自定义EntityName (按业务所需)



Get/SetCustomId(string)

用途：获取/设置Text3D 自定义CustomId (按业务所需)



Get/SetCustomData(json)

用途：获取/设置Text3D 自定义CustomData (按业务所需)



Get()

用途：获取Text3D信息



oType

用途：获取Text3D实体的类型



bRemoved

用途：获取Text3D实体是否已删除



Delete()

用途：删除Text3D实体



onClick()

onMouseEnter()

onMouseOut()

---

### rotation 相关
**Title:** rotation 相关

相机相关Focus

```javascript
const jsondata = {
    "rotation": {
        "pitch": -30, //俯仰角, 参考(-90~0)
        "yaw": 0, //偏航角, 参考(-180~180; 0:东; 90:南; -90:北)
    }
}
```
**参数描述：**

参数 | 取值范围 | 描述
--- | --- | ---
rotation | pitch | [-90~0] | 
yaw | [-180~180] | 0:东; 90:南; -90:北

---

### rotator 相关
**Title:** rotator 相关

实体相关

```javascript
const jsondata = {
    "rotator": {
      "pitch": 0, //俯仰角, 参考(-180~180)
      "yaw": 30, //偏航角, 参考(-180~180)
      "roll": 0 //翻滚角, 参考(-180~180)
    }
}
```
**参数描述：**

正东为x轴

参数 | 取值范围 | 描述
--- | --- | ---
rotator | pitch | [-180~180] | 俯仰角
 | yaw | [-180~180] | 偏航角
 | roll | [-180~180] | 翻滚角

---

### 实体类型表
**Title:** 实体类型表

实体类型对应表

适用于通用行为里对需求类型的API操作；如下：



```javascript
awiat App.Scene.GetByTypes(types);
awiat App.Scene.ClearByTypes(types);
```
**参数说明：**

类型 | 备注 | GetByTypes是否支持 | ClearByObjects是否支持
--- | --- | --- | ---
Tiles | 底板图层 | 是 | 是
Static | 静态模型 | 是 | 是
Skeletal | 骨骼模型 | 是 | 是
Hierarchy | 结构模型 | 是 | 是
ISEHierarchy | ISE结构模型 | 是 | 是
ModelerWater | 水面水体 | 是 | 是
ModelerRiver | 河道水岸 | 是 | 是
ModelerEmbank | 挡水岸堤 | 是 | 是
Vegetation | 区域植被 | 是 | 是
CameraStart | 镜头初始状态 | 是 | 是
CameraRoam | 镜头漫游 | 是 | 是
Bound | 覆盖物沿路径移动 | 是 | 是
Environment | 环境 | 是 | 是
RealTimeVideo | 实时视频 | 是 | 是
Window | 窗口 | 是 | 是
Poi | POI | 是 | 是
Particle | 特效 | 是 | 是
Effects | 粒子特效 | 是 | 是
Text3D | 3D文字 | 是 | 是
Light | 灯光 | 是 | 是
Viewshed | 可视域 | 是 | 是
Path | 路径 | 是 | 是
Parabola | 迁徙图 | 是 | 是
Range | 区域轮廓 | 是 | 是
HeatMap | 热力图 | 是 | 是
ColumnarHeatMap | 柱状热力图 | 是 | 是
SpaceHeatMap | 点云热力图 | 是 | 是
RoadHeatMap | 路径热力图 | 是 | 是
Raster | 栅格图 | 是 | 是
HighlightArea | 高亮区域 | 是 | 是
ProjectModel | 工程模型 | 是 | 否
ProjectInstance | 工程Instance模型 | 是 | 否

---

## 实体/单体通用行为

### 实体一般行为
**Title:** 实体一般行为

通过[类型]获取实体

```javascript
const types = ['Particle', 'Path'];
const { result } = await App.Scene.GetByTypes(types);
console.log(result);

// types
/*
  Static           静态模型
  Skeletal         骨骼模型
  Hierarchy        结构模型
  ISEHierarchy     ISE结构模型
  ProjectModel     工程摆放模型
  ProjectInstance  工程Instance

  RealTimeVideo    实时视频
  Window           窗口
  Poi              POI
  Particle         特效
  Effects          粒子特效
  Text3D           3D文字
  Light            灯光
  Viewshed         可视域
  Path             路径
  Parabola         迁徙图
  Range            区域轮廓
  HeatMap          热力图
  ColumnarHeatMap  柱状热力图
  SpaceHeatMap     点云热力图
  RoadHeatMap      路径热力图
  MeshHeatMap      3D网格热力图
  Raster           栅格图
  HighlightArea    高亮区域
*/
```
通过EntityName获取实体

```javascript
// BasicInfoAtom: { "entityName": "商业办公楼", "customId": "myId", "customData": "{'data':'myCustomData'}" }
const EntityName = ["myName1","myName2"];
const res = await App.Scene.GetByEntityName(["EntityName"]);
console.log(res);
```
通过CustomId获取实体

```javascript
// BasicInfoAtom: { "entityName": "商业办公楼", "customId": "myId", "customData": "{'data':'myCustomData'}" }
const customId = ["myId1","myId2"];
const res = await App.Scene.GetByCustomId(["customId"]);
console.log(res);
```
通过Eids获取实体

```javascript
const Eids = [
  '-9151314316185345952',
  '-9151314316965221260',
  '-9151314316350575262'
];

const res = await App.Scene.GetByEids(Eids);
console.log(res);
```
获取全部实体对象

```javascript
const { result } = await App.Scene.GetAll();
console.log(result)

// 示例: 获取AES静态模型信息
const modelObj = result?.Static?.[0];
const model = await modelObj.Get();
console.log(model);

// 示例: 隐藏AES静态模型
modelObj.SetVisible(false); // true: 显示; false: 隐藏


// 示例: 更新路径Path
for (i = 0; i < result?.Path.length; i++) {
  const pathObj = result.Path[i];
  pathObj.Update({
    "pathStyle": {
      "type": "solid",
      "width": 20,
      "color": "ffadfbff",
      "passColor": "29ff52ff"
    }
  }, {
    calculateCoordZ: {  //坐标类型及坐标高度; [可选] 最高优先级
      coordZRef: "surface",  //surface:表面; ground:地面; altitude:海拔
      coordZOffset: 50
    }
  })
  

/* 回调实体类型
  Tiles            底板图层
  Static           静态模型
  Skeletal         骨骼模型
  Hierarchy        结构模型
  ISEHierarchy     ISE结构模型
  CameraStart      镜头初始状态

  RealTimeVideo    实时视频
  Window           窗口
  Poi              POI
  Particle         特效
  Effects          粒子特效
  Text3D           3D文字
  Light            灯光
  Viewshed         可视域
  Path             路径
  Parabola         迁徙图
  Range            区域轮廓
  HeatMap          热力图
  ColumnarHeatMap  柱状热力图
  SpaceHeatMap     点云热力图
  RoadHeatMap      路径热力图
  MeshHeatMap      3D网格热力图
  Raster           栅格图
  HighlightArea    高亮区域
*/
```
实体落地

注：目前不支持工程模型落地



```javascript
// 示例Particle(特效) 落地
// particleObj 为 new App.Particle({...}) 时创建的对象;

const res = await particleObj.SnapTo({
  calculateCoordZ: {
    coordZRef: "ground", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 10 //高度(单位:米)
  }
});
console.log(res);
```
![](/profile/upload/2025/11/28/实体落地_20251128164426A047.gif)}]

设置实体显隐

```javascript
// 示例Particle(特效) 显隐
// particleObj 为 new App.Particle({...}) 时创建的对象;

// SetVisible (true or false)
const res = await particleObj.SetVisible(false);
console.log(res);
```
通过[对象]显隐实体

```javascript
const objs = [ // 实体对象
  particleObj, pathObj
];
const res = await App.Scene.SetVisibleByObjects(objs,false);
console.log(res);
//true: 显示; false: 隐藏

```
通过[类型]删除实体

```javascript
注：目前不支持ProjectModel和ProjectInstance

const types = ["Particle", "Range"];
const res = await App.Scene.ClearByTypes(types);
console.log(res);

/* types (注意大小写)
   Static:          静态模型
   Skeletal:        骨骼模型
   Hierarchy        结构模型
   ISEHierarchy     ISE结构模型

   RealTimeVideo    实时视频
   Window           窗口
   Poi              POI
   Particle         特效
   Effects          粒子特效
   Text3D           3D文字
   Light            灯光
   Viewshed         可视域
   Path             路径
   Parabola         迁徙图
   Range            区域轮廓
   HeatMap          热力图
   ColumnarHeatMap  柱状热力图
   SpaceHeatMap     点云热力图
   RoadHeatMap      路径热力图
   MeshHeatMap      3D网格热力图
   Raster           栅格图
   HighlightArea    高亮区域
*/

```
通过[对象]删除实体

```javascript
注：目前不支持ProjectModel和ProjectInstance
const objs = [ // 实体对象
  particleObj, pathObj
];
const res = await App.Scene.ClearByObjects(objs);

```
通过[Eids]删除实体

```javascript
注：目前不支持ProjectModel和ProjectInstance
const Eids = [
    '-9151314316185345952',
    '-9151314316965221260',
    '-9151314316350575262'
];
const res = await App.Scene.ClearByEids(Eids);
console.log(res);
```
---

### Eid通用行为
**Title:** Eid通用行为

通过Eid获取实体

```javascript
// 鼠标点击场景内实体, 会收到返回的实体Eid
 
const res= await App.Scene.GetByEids(["-91513143085896763520","-91513143077246328320"]);
console.log(res);

const obj = res.result[0]; // 其中某个对象
console.log(await obj.Get()); // 获取此实体信息

```
**返回：**



```javascript
{
    success: true,
    message: '',
    result: [obj, ...]
}
```
通过[Eids]删除实体

```javascript
注：目前不支持ProjectModel和ProjectInstance
const Eids = [
  '-9151314316185345952',
  '-9151314316965221260',
  '-9151314316350575262'
];
const res = await App.Scene.ClearByEids(Eids);
console.log(res);

```
---

### EntityName通用行为
**Title:** EntityName通用行为

通过EntityName获取实体

```javascript
// 方式一：
const { result } = await App.Scene.GetByTypes(['Static','Path']);
const name = await result['Path']?.[0]?.Get();
console.error(name.result.entityName); //商业办公楼

// 方式二：
const {result} = await Object.Get();
console.error(result.entityName); //商业办公楼

const res= await App.Scene.GetByEntityName(["商业办公楼"]);
console.log(res);

const obj = res.result[0];
console.log(await obj.Get());


/*
  Static           静态模型
  Skeletal         骨骼模型
  Hierarchy        结构模型
  ISEHierarchy     ISE结构模型
  Effects          粒子特效
  ModelerWater     水面水体
  ModelerRiver     河道水岸
  ModelerEmbank    挡水岸堤
  Vegetation       区域植被

  RealTimeVideo    实时视频
  Window           窗口
  Poi              POI
  Particle         特效
  Effects          粒子特效
  Text3D           3D文字
  Light            灯光
  Viewshed         可视域
  Path             路径
  Parabola         迁徙图
  Range            区域轮廓
  HeatMap          热力图
  ColumnarHeatMap  柱状热力图
  SpaceHeatMap     点云热力图
  RoadHeatMap      路径热力图
  MeshHeatMap      3D网格热力图
  Raster           栅格图
  HighlightArea    高亮区域
*/
```
通过EntityName更新实体

```javascript
// 此示例通过EntityName更新路径(path)样式
const jsondata = {
  "pathStyle": {
  "type": "solid",
  "width": 120,
  "color": "aa6afeff",
  "passColor": "ffe077ff"
  }
}

const EntityName = ["myName1", "myName2"];
const res = await App.Scene.UpdateByEntityName(EntityName, jsondata);
console.log(res);

```
通过EntityNames更新实体

```javascript
// 此示例通过entityNames更新路径(path)样式
const jsondata = [
  {
    "pathStyle": {
      "type": "solid",
      "width": 120,
      "color": "c4ff5bff",
      "passColor": "ff1bc8ff"
    },
    "entityName": "myName1" //分类标识
 },
 {
    "pathStyle": {
      "type": "arrow",
      "width": 200,
      "color": "e2faffff",
      "passColor": "faff7dff"
    },
    "entityName": "myName2"
  }
]

const res = await App.Scene.UpdateByEntityNames(jsondata);
console.log(res);
```
通过EntityName聚焦实体

```javascript
const jsondata = {
  "rotation": {
      "pitch": -30, //俯仰角, 参考(-90~0)
      "yaw": 0 //偏航角, 参考(-180~180; 0:东; 90:南; -90:北)
  },
  "distanceFactor": 0.5, //参数范围[0.1~1]; 实体占满屏幕百分比
  "flyTime": 1, //过渡时长(单位:秒)
}

const EntityName = ["myName1", "myName2"];
const res = await App.CameraControl.FocusByEntityName(EntityName, jsondata);
console.log(res);
```
通过EntityName删除实体

```javascript
const EntityName = ["myName1", "myName2"];
const res = await App.Scene.ClearByEntityName(EntityName);
console.log(res);
```
---

### CustomId通用行为
**Title:** CustomId通用行为

通过CustomId获取实体

```javascript
// 方式一：
const { result } = await App.Scene.GetByTypes(['Static','Path']);
const name = await result['Path']?.[0]?.Get();
console.error(name.result.customId); //商业办公楼

// 方式二：
const {result} = await Object.Get();
console.error(result.customId); //商业办公楼

const res= await App.Scene.GetByCustomId(["myId"]);
console.log(myId);

const obj = res.result[0];
console.log(await obj.Get());


/*
  Static           静态模型
  Skeletal         骨骼模型
  Hierarchy        结构模型
  ISEHierarchy     ISE结构模型
  Effects          粒子特效
  ModelerWater     水面水体
  ModelerRiver     河道水岸
  ModelerEmbank    挡水岸堤
  Vegetation       区域植被

  RealTimeVideo    实时视频
  Window           窗口
  Poi              POI
  Particle         特效
  Effects          粒子特效
  Text3D           3D文字
  Light            灯光
  Viewshed         可视域
  Path             路径
  Parabola         迁徙图
  Range            区域轮廓
  HeatMap          热力图
  ColumnarHeatMap  柱状热力图
  SpaceHeatMap     点云热力图
  RoadHeatMap      路径热力图
  MeshHeatMap      3D网格热力图
  Raster           栅格图
  HighlightArea    高亮区域
*/
```
通过CustomId更新实体

```javascript
// 此示例通过customId更新路径(path)样式
const jsondata = {
  "pathStyle": {
    "type": "solid",
    "width": 120,
    "color": "aa6afeff",
    "passColor": "ffe077ff"
  }
}

const customId = ["myId1", "myId2"];
const res = await App.Scene.UpdateByCustomId(customId, jsondata);
console.log(res);
```
通过CustomIds更新实体

```javascript
// 此示例通过customIds更新路径(path)样式
const jsondata = [
  {
    "pathStyle": {
      "type": "solid",
      "width": 120,
      "color": "c4ff5bff",
      "passColor": "ff1bc8ff"
    },
    "customId": "myId1" //分类标识
 },
 {
    "pathStyle": {
      "type": "arrow",
      "width": 200,
      "color": "e2faffff",
      "passColor": "faff7dff"
    },
    "customId": "myId2"
  }
]

const res = await App.Scene.UpdateByCustomIds(jsondata);
console.log(res);
```
通过CustomId聚焦实体

```javascript
const jsondata = {
  "rotation": {
      "pitch": -30, //俯仰角, 参考(-90~0)
      "yaw": 0 //偏航角, 参考(-180~180; 0:东; 90:南; -90:北)
  },
  "distanceFactor": 0.4, //参数范围[0.1~1]; 实体占满屏幕百分比
  "flyTime": 1, //过渡时长(单位:秒)
}

const customId = ["myId1", "myId2"];
const res = await App.CameraControl.FocusByCustomId(customId, jsondata);
console.log(res);
```
通过CustomId删除实例

```javascript
const customId = ["myId1", "myId2"];
const res = await App.Scene.ClearByCustomId(customId);
console.log(res);
```
---

### 实体操作行为
**Title:** 实体操作行为

获取屏幕内实体

```javascript
const res = await App.Tools.Picker.GetEntitiesInViewport(['Particle'], false);
console.log(res);
//参数一: 筛选实体类型
//参数二: 反向筛选(true/false)

//示例
const entityObj = res.result.objects[0];
console.log(await entityObj.Get());


/* 实体类型(注意大小写)
  Static           静态模型
  Skeletal         骨骼模型
  Hierarchy        结构模型
  ISEHierarchy     ISE结构模型
  Effects          粒子特效
  
  RealTimeVideo    实时视频
  Window           窗口
  Poi              POI
  Particle         特效
  Effects          粒子特效
  Text3D           3D文字
  Light            灯光
  Viewshed         可视域
  Path             路径
  Parabola         迁徙图
  Range            区域轮廓
  HeatMap          热力图
  ColumnarHeatMap  柱状热力图
  SpaceHeatMap     点云热力图
  RoadHeatMap      路径热力图
  MeshHeatMap      3D网格热力图
*/
```
获取屏幕指定区域内实体

```javascript
const res = await App.Tools.Picker.PickEntityByRectangle({
  p0: [0,0], //屏幕左上角像素坐标
  p1: [window.innerWidth,window.innerHeight], //屏幕右下角像素坐标
  bMustBeFullyEnclosed: false,
  entityTypeFilter: ["Path"], //实体类型
  bFilterForExclude: false, //反向筛选(true/false)
  selectMode: 'New' //['New'(单选), 'Add'(加选), 'Subtract'(减选), 'Reverse'(反选)]
})

console.log(res);
const entityObj = res.result[0];
console.log(await entityObj.Get());


/* 实体类型(注意大小写)
  Static           静态模型
  Skeletal         骨骼模型
  Hierarchy        结构模型
  ISEHierarchy     ISE结构模型
  Effects          粒子特效

  RealTimeVideo    实时视频
  Window           窗口
  Poi              POI
  Particle         特效
  Effects          粒子特效
  Text3D           3D文字
  Light            灯光
  Viewshed         可视域
  Path             路径
  Parabola         迁徙图
  Range            区域轮廓
  HeatMap          热力图
  ColumnarHeatMap  柱状热力图
  SpaceHeatMap     点云热力图
  RoadHeatMap      路径热力图
  MeshHeatMap      3D网格热力图
*/
```
鼠标框选获取实体

```javascript
await App.Tools.Picker.StartRectPick({
  "bMustBeFullyEnclosed": true,
  "entityTypeFilter": [], //筛选实体类型
  "bFilterForExclude": false, //反向筛选entityTypeFilter (true/false)
  "selectMode": "New", //['None', 'New'(单选), 'Add'(加选), 'Subtract'(减选), 'Reverse'(反选)]
  "highlightColor": "2afe17",
  "rectangleStyle": {
    "borderColor": "d9ff88", //选框颜色
    "borderThickness": 1 //选框线宽
  }
})




/* entityTypeFilter (注意大小写)
  Tiles:           底板图层
  Static           静态模型
  Skeletal         骨骼模型
  Hierarchy        结构模型
  ISEHierarchy     ISE结构模型
  Effects          粒子特效

  RealTimeVideo    实时视频
  Window           窗口
  Poi              POI
  Particle         特效
  Effects          粒子特效
  Text3D           3D文字
  Light            灯光
  Viewshed         可视域
  Path             路径
  Parabola         迁徙图
  Range            区域轮廓
  HeatMap          热力图
  ColumnarHeatMap  柱状热力图
  SpaceHeatMap     点云热力图
  RoadHeatMap      路径热力图
  MeshHeatMap      3D网格热力图
*/
```
结束框选

```javascript
await App.Tools.Picker.EndRectPick();

```
鼠标点选获取[描边]实体/单体

```javascript
const jsondata = {
  pickFilter: {
    //tip::: [可选]
    filterEntityTypes: [], //筛选实体类型
    excludeEntities: [], //排除实体对象
    bFilterForExclude: false, //反向筛选(true/false)
  },
  selectionMode: "New", //['None', 'New'(单选), 'Add'(加选), 'Subtract'(减选), 'Reverse'(反选)]
};

await App.Setting.SetDefaultActionSetting(jsondata);
```
Gizmo行为

```javascript
/* 覆盖物实体 Gizmo：
    1、先向场景中添加实体 (如:Particle(特效))
    2、开启Gizmo模式, 开启实体选取
    3、选中添加的particle, 实体自动Gizmo模式
    注: Poi, Particle(特效), Text3D(3D文字), Viewshed(可视域) 有效
  */

  /* AES模型 Gizmo：
    1、开启Gizmo模式, 开启实体选取
    2、选中AES模型, 模型自动Gizmo模式
  */
  
  // 开启Gizmo模式
await App.Setting.SetGizmoSetting({
    gizmoState: "Enable", //开关Gizmo (Enable/Disable)
    gizmoCoordinateSystem: "World", //世界坐标系
    bPreserveScaleRatio: true //保持实体缩放比例
})

// 开启实体选取
await App.Setting.SetDefaultActionSetting( {
  "selectionMode": "New"
});
```
---

### 设置实体/单体轮廓&高亮
**Title:** 设置实体/单体轮廓&高亮

自定义实体/单体[轮廓 高亮]样式

```javascript
// 自定义轮廓、高亮样式(styleName, hexa颜色; alpha: 高亮有效)
App.Setting.SetVisualColorStyle('customStyleName', "0f5dff4c")     // 'customStyleName'为自定义颜色名称，定义好后，可在设置高亮时传入

const style = await App.Setting.GetVisualColorStyle();
console.log(style);


// 设置轮廓线宽
App.Setting.SetOutlineThickness(2);  //自定义线宽

const thickness= await App.Setting.GetOutlineThickness();
console.log(thickness);

```
设置实体轮廓

```javascript
// 添加的覆盖物/模型对象
// entityObj1和entityObj2是场景中对象
entityObj1.SetEntityOutline({
    bOutline : true,
    styleName: "Blue"
  })

App.Scene.SetEntityOutline({
    entities: [entityObj1,entityObj2],
    bOutline : true,
    styleName: "Blue"
  });


```
设置实体高亮

```javascript
// 添加的覆盖物/模型对象
// entityObj1和entityObj2是场景中对象
entityObj1.SetEntityHighlight({
    bHighlight: true,
    styleName: "Blue"
  })

App.Scene.SetEntityHighlight({
    entities: [entityObj1,entityObj2],
    bHighlight: true,
    styleName: "Blue"
  })
```
styleName 颜色列表

序号 | styleName | hexa
--- | --- | ---
0 | Default | FFBF0077
1 | Black | 00000077
2 | DarkBlue | 00008B77
3 | MediumBlue | 0000CD77
4 | Blue | 0000FF77
5 | DarkGreen | 00640077
6 | Green | 00800077
7 | SpringGreen | 00FF7F77
8 | MidnightBlue | 19197077
9 | ForestGreen | 2E8B5777
10 | SeaGreen | 2E8B5777
11 | LimeGreen | 32CD3277
12 | RoyalBlue | 4169E177
13 | SteelBlue | 4682B477
14 | Maroon | 80000077
15 | Purple | 80008077
16 | Olive | 80800077
17 | Gray | 80808077
18 | SkyBlue | 87CEEB77
19 | BlueViolet | 8A2BE277
20 | DarkRed | 8B000077
21 | LightGreen | 90EE9077
22 | MediumPurple | 9370DB77
23 | DarkViolet | 9400D377
24 | PaleGreen | 98FB9877
25 | YellowGreen | 9ACD3277
26 | Sienna | A0522D77
27 | Brown | A52A2A77
28 | DarkGray | A9A9A977
29 | LightBlue | ADD8E677
30 | GreenYellow | ADFF2F77
31 | PowderBlue | B0E0E677
32 | Silver | C0C0C077
33 | IndianRed | CD5C5C77
34 | Chocolate | D2691E77
35 | LightGray | D3D3D377
36 | Thistle | D8BFD877
37 | Orchid | DA70D677
38 | GoldenRod | DAA52077
39 | Plum | DDA0DD77
40 | LightCyan | E0FFFF77
41 | DarkSalmon | E9967A77
42 | Violet | EE82EE77
43 | LightCoral | F0808077
44 | Wheat | F5DEB377
45 | Salmon | FA807277
46 | Linen | FAF0E677
47 | DeepPink | FF149377
48 | OrangeRed | FF450077
49 | Tomato | FF634777
50 | HotPink | FF69B477
51 | Coral | FF7F5077
52 | DarkOrange | FF8C0077
53 | LightSalmon | FFA07A77
54 | Orange | FFA50077
55 | LightPink | FFB6C177
56 | Pink | FFC0CB77
57 | Gold | FFD70077
58 | FloralWhite | FFFAF077
59 | Snow | FFFAFA77
60 | Yellow | FFFF0077
61 | LightYellow | FFFFE077
62 | Ivory | FFFFF077
63 | White | FFFFFF77

---

### 选中实体操作行为
**Title:** 选中实体操作行为

添加选中实体

```javascript
// 方法一
await App.Scene.Selection.Add([obj, obj, ...]);
//方法二
await App.Scene.AddSelection([obj, obj, ...]);
```
获取所有选中实体

```javascript
const res = await App.Scene.GetSelection();
console.log(res);
```
取消选中实体

```javascript
const res = await App.Scene.GetSelection();
const someObj = res.result;
App.Scene.RemoveSelection(someObj);
```
取消所有选中实体

```javascript
App.Scene.ClearSelection();
```
---

### 选中单体操作行为
**Title:** 选中单体操作行为

添加选中单体

∗此单体为底板自动生成的单体



```javascript
const res = await App.Scene.GetTiles();
if (res.success && res.result?.Tiles?.length > 0) {
  const tilesObj = res.result.Tiles[0];

  // xxx 为底板上模型的nodeId
  const res = await App.Scene.NodeSelection.Add(tilesObj , ['xxx', 'xxx']);
  console.log(res);
}
```
取消选中单体

```javascript
const res = await App.Scene.GetTiles();
if (res.success && res.result?.Tiles?.length > 0) {
  const tilesObj = res.result.Tiles[0];

  // xxx 为底板上模型的nodeId
  const res = await App.Scene.NodeSelection.Remove(tilesObj, ['xxx', 'xxx']);
  console.log(res);
}


```
取消所有选中单体

```javascript
const res = await App.Scene.NodeSelection.Clear();
console.log(res);
```
选中单体轮廓描边

```javascript
const res = await App.Scene.NodeSelection.Draw();
console.log(res);
```
---

### 实体[裁剪]行为
**Title:** 实体[裁剪]行为

[裁剪]热力图

```javascript
const geo = {
  "coordinates": [
    [
      [121.497223,31.251557,0],
      [121.476501,31.237163,0],
      [121.514851,31.245237,0]
    ]
  ]
}

//geo + 镂空颜色(可选); heatmapObj 为 new HeatMap({...}) 时创建的对象;
const res = await heatmapObj.Clip(geo, "bd20ffff");
console.log(res)

//await heatmapObj.UnClip();  //取消裁剪

```
![](/profile/upload/2025/11/28/裁剪热力图_20251128171505A048.jpg)}]

[裁剪]柱状热力图

```javascript
const geo = {
  "coordinates": [
    [
      [121.497223,31.251557,0],
      [121.476501,31.237163,0],
      [121.514851,31.245237,0]
    ]
  ]
}

//geo + 镂空颜色(可选); columnarheatmap 为 new ColumnarHeatMap({...}) 时创建的对象;
const res = await columnarheatmapObj.Clip(geo, "fef595ff");
console.log(res)
//await columnarheatmapObj.UnClip();  //取消裁剪
```
---

### 实体[编辑]行为
**Title:** 实体[编辑]行为

[编辑]路径

```javascript
const jsondata = {
  "method": "add", //add; delete
  "index": [2, 0], //坐标点索引
  "coordinates": [
    [121.46164010, 31.22692061, 11],
    [121.46881138, 31.22606828, 68]
    ]
}

const res = await pathObj.Modify(jsondata);  // pathObj 为 new Path({...}) 时创建的对象;
console.log(res)


/*
  method: "add" ::::::
  index: [n], 在坐标点索引n+1之后添加坐标点;
  index: [n+1], 在最后一个坐标点索引之外添加坐标点;

  method: "delete" ::::::
  index: [2], 删除第2个坐标点;
  index: [2,10], 删除[2~10]之间的数据点;
*/
```
[编辑]区域热力图

```javascript
const mapdata = [],
    points = [
        [121.49378441, 31.22786931, 21],
        [121.48928671, 31.22207976, 14],
        [121.48146687, 31.25121877, 81],
        [121.46073678, 31.22045260, 42]
    ];
for (let i = 0; i < points.length; i++) {
    mapdata.push({
        "point": points[i],
        "value": Math.floor(Math.random() * 100)
    })
}

const jsondata = {
    "method": "add", //add; delete
    "index": [2, 0], //坐标点索引
    "features": mapdata
}

const res = await heatmapObj.Modify(jsondata);  // heatmapObj为 new HeatMap({...}) 时创建的对象;
console.log(res)

/*
  method: "add" ::::::
  index: [n], 在坐标点索引n+1之后添加坐标点;
  index: [n+1], 在最后一个坐标点索引之外添加坐标点;

  method: "delete" ::::::
  index: [2], 删除第2个坐标点;
  index: [2,10], 删除[2~10]之间的坐标点;
*/
```
[编辑]柱状热力图

```javascript
const mapdata = [],
    points = [
        [121.49378441, 31.22786931, 21],
        [121.48928671, 31.22207976, 14],
        [121.48146687, 31.25121877, 81],
        [121.46073678, 31.22045260, 42]
    ];
for (let i = 0; i < points.length; i++) {
    mapdata.push({
        "point": points[i],
        "value": Math.floor(Math.random() * 100)
    })
}

const jsondata = {
    "method": "add", //add; delete
    "index": [2, 0], //坐标点索引
    "features": mapdata
}

const res = await colheatmapObj.Modify(jsondata);  // colheatmapObj为 new ColumnarHeatMap({...}) 时创建的对象;
console.log(res)

/*
  method: "add" ::::::
  index: [n], 在坐标点索引n+1之后添加坐标点;
  index: [n+1], 在最后一个坐标点索引之外添加坐标点;

  method: "delete" ::::::
  index: [2], 删除第2个坐标点;
  index: [2,10], 删除[2~10]之间的坐标点;
*/
```
[编辑]点云热力图

```javascript
const mapdata = [],
    points = [
        [121.49378441, 31.22786931, 21],
        [121.48928671, 31.22207976, 14],
        [121.48146687, 31.25121877, 81],
        [121.46073678, 31.22045260, 42]
    ];
for (let i = 0; i < points.length; i++) {
    mapdata.push({
        "point": points[i],
        "value": Math.floor(Math.random() * 100)
    })
}

const jsondata = {
    "method": "add", //add; delete
    "index": [2, 0], //坐标点索引
    "features": mapdata
}

const res = await spaceheatmapObj.Modify(jsondata);  // spaceheatmapObj为 new SpaceHeatMap({...}) 时创建的对象;
console.log(res)

/*
  method: "add" ::::::
  index: [n], 在坐标点索引n+1之后添加坐标点;
  index: [n+1], 在最后一个坐标点索引之外添加坐标点;

  method: "delete" ::::::
  index: [2], 删除第2个坐标点;
  index: [2,10], 删除[2~10]之间的坐标点;
*/
```
[编辑]路径热力图

```javascript
const mapdata = [],
      points = [
        [121.49179549,31.24038985,18],
        [121.51553357,31.23050451,93],
        [121.48560978,31.24052903,12],
        [121.51587775,31.25126291,78]
        ];
for (let i = 0; i < points.length; i++) {
  mapdata.push({
    "point": points[i],
    "value": Math.floor(Math.random() * 100)
  })
}

const jsondata = {
  "method": "add", //add; delete
  "index": [2], //坐标点索引
  "features": mapdata
}

const res = await roadheatmapObj.Modify(jsondata);  // roadheatmapObj为 new RoadHeatMap({...}) 时创建的对象;
console.log(res)



/*
  method: "add" ::::::
  index: [n], 在坐标点索引n+1之后添加坐标点;
  index: [n+1], 在最后一个坐标点索引之外添加坐标点;

  method: "delete" ::::::
  index: [2], 删除第2个坐标点;
  index: [2,10], 删除[2~10]之间的坐标点;
*/
```
---

### 实体[批量]行为
**Title:** 实体[批量]行为

[批量]添加实例 (同类型)

示例: 批量添加路径(path); 同类型实体



```javascript
const normal = { // ========== 通用样式
  "type": "Path",
  "entityName": "myName",  //可选
  "pathStyle": {
    "width": 100,
    "passColor": "dc0affff"
  }
}
const dataArr = [ // ========== 数据体
  {
    "polyline": {
      "coordinates": [
        [121.48595648, 31.24834326, 30],
        [121.48600786, 31.24252899, 30],
        [121.50577283, 31.22653989, 30]
      ]
    },
    "customId": "myId1",
    "pathStyle": {
      "type": "arrow",
      "color": "78ffffff"
    }
  },
  {
    "polyline": {
      "coordinates": [
        [121.49709136, 31.22516669, 30],
        [121.49662428, 31.23543741, 30],
        [121.51043061, 31.22969411, 30]
      ]
    },
    "customId": "myId2",
    "pathStyle": {
      "type": "solid",
      "color": "52f1feff"
    }
  }
]

const res = await App.Scene.Create(normal, dataArr,
  {  //  [可选] 坐标类型及坐标高度; 最高优先级
    calculateCoordZ: {
      coordZRef: "surface", // surface: 表面; ground: 地面; altitude: 海拔
      coordZOffset: 50 // 高度(单位:米)
    }
  }
)
console.log(res)
```
[批量]添加实例 (多类型)

```javascript
const jsondata = [
  //====== Window  窗口
  {
    "type": "Window",
    "location": [121.46426478,31.22406702,47],
    "windowStyle": {
      "url": "http://wdpapi.51aes.com/doc-static/images/static/echarts.html",
      "size": [500, 350],
      "offset": [0, 0]
    },
    "bVisible": true,
    "entityName": "myName1",
    "customId": "myId1",
    "customData": {
      "data": "Window"
    }
  },

  //====== Poi
  {
    "type": "Poi",
    "location": [121.46491415,31.21866105,87],
    "poiStyle": {
      "markerNormalUrl": "http://wdpapi.51aes.com/doc-static/images/static/markerNormal.png",
      "markerActivateUrl": "http://wdpapi.51aes.com/doc-static/images/static/markerActive.png",
      "markerSize": [100, 228],
      "labelBgImageUrl": "http://wdpapi.51aes.com/doc-static/images/static/LabelBg.png",
      "labelBgSize": [200, 50],
      "labelBgOffset": [50, 200],
      "labelContent": [" 文本内容A", "ff0000ff", "24"]
    },
    "bVisible": true,
    "entityName": "myName2",
    "customId": "myId2",
    "customData": {
      "data": "Poi"
    }
  },

  //====== Particle  特效
  {
    "type": "Particle",
    "location": [121.49172858,31.22476437,67],
    "rotator": {
      "pitch": 0,
      "yaw": 30,
      "roll": 0
    },
    "bVisible": true,
    "scale3d": [50, 50, 50],
    "particleType": "vehicle_taxi",
    "entityName": "myName3",
    "customId": "myId3",
    "customData": {
      "data": "Particle"
    }
  },

  //====== Text3D  3D文字
  {
    "type": "Text3D",
    "location": [121.46376561,31.22870602,76],
    "rotator": {
      "pitch": 0,
      "yaw": 30,
      "roll": 0
    },
    "scale3d": [1000, 100, 100],
    "text3DStyle": {
      "text": "3D文字",
      "color": "10ff1bff",
      "type": "plain",
      "outline": 0.4,
      "portrait": false,
      "space": 0.1
    },
    "bVisible": true,
    "entityName": "myName4",
    "customId": "myId3",
    "customData": {
      "data": "Text3D"
    }
  },

  //====== Viewshed  可视域
  {
    "type": "Viewshed",
    "location": [121.47315875,31.24472542,27],
    "rotator": {
      "pitch": 0,
      "yaw": 30,
      "roll": 0
    },
    "viewshedStyle": {
      "fieldOfView": 70,
      "radius": 600,
      "outline": true,
      "hiddenColor": "ff136dff",
      "visibleColor": "feaecfff"
    },
    "bVisible": true,
    "entityName": "myName5",
    "customId": "myId5",
    "customData": {
      "data": "Viewshed"
    }
  },

  //====== Path  路径
  {
    "type": "Path",
    "polyline": {
      "coordinates": [
        [121.50114770,31.23691142,93],
        [121.48007773,31.22050415,27],
        [121.47985493,31.24031196,45],
        [121.49030648,31.23537047,33]
      ]
    },
    "pathStyle": {
      "type": "arrow",
      "width": 100,
      "color": "eaffc7ff",
      "passColor": "ff6d96ff"
    },
    "bVisible": true,
    "entityName": "myName6",
    "customId": "myId6",
    "customData": {
      "data": "Path"
    }
  },

  //====== Parabola  迁徙图
  {
    "type": "Parabola",
    "polyline": {
      "coordinates": [
        [121.47607446,31.24372538,84],
        [121.48749492,31.23361823,8]
      ]
    },
    "parabolaStyle": {
      "topHeight": 800,
      "topScale": 1,
      "type": "scanline",
      "width": 20,
      "color": "b1ff8bff",
      "gather": true
    },
    "bVisible": true,
    "entityName": "myName7",
    "customId": "myId7",
    "customData": {
      "data": "Parabola"
    }
  },

  //====== Range  区域轮廓
  {
    "type": "Range",
    "polygon2D": {
      "coordinates": [
        [
          [121.47122131,31.24264779],
          [121.48769236,31.23035225],
          [121.50016626,31.22821735]
        ]
      ]
    },
    "rangeStyle": {
      "type": "loop_line",
      "fillAreaType": "block",
      "height": 200,
      "strokeWeight": 10,
      "color": "6fff46ff"
    },
    "bVisible": true,
    "entityName": "myName8",
    "customId": "myId8",
    "customData": {
      "data": "Range"
    }
  },

  //====== HeatMap  热力图
  {
    "type": "HeatMap",
    "heatMapStyle": {
      "type": "fit",
      "brushDiameter": 2000,
      "mappingValueRange": [1, 100],
      "gradientSetting": [
        "b4ff25ff", "a174ffff", "2e15feff", "d0ff30ff", "b3ffa4ff"
      ]
    },
    "bVisible": true,
    "entityName": "myName9",
    "customId": "myId9",
    "customData": {
      "data": "HeatMap"
    },
    "points": {
      "features": [
        {
          "point": [121.48783892,31.22955413,91],
          "value": 87
        },
        {
          "point": [121.49360144,31.23134998,41],
          "value": 80
        },
        {
          "point": [121.46524329,31.24312496,77],
          "value": 95
        },
        {
          "point": [121.48712254,31.24286490,34],
          "value": 70
        },
        {
          "point": [121.47944776,31.24252262,86],
          "value": 65
        }
      ]
    }
  },

  //====== ColumnarHeatMap  柱状热力图
  {
    "type": "ColumnarHeatMap",
    "columnarHeatMapStyle": {
      "type": "cube",
      "brushDiameter": 1000,
      "mappingValueRange": [1, 100],
      "columnarWidth": 20,
      "mappingHeightRange": [0, 500],
      "enableGap": false,
      "gradientSetting": [
        "f7ffbfff", "ff0083ff", "8991ffff", "a0a7feff", "ff2131ff"
      ]
    },
    "bVisible": true,
    "entityName": "myName10",
    "customId": "myId10",
    "customData": {
      "data": "ColumnarHeatMap"
    },
    "points": {
      "features": [
        {
          "point": [121.49140589,31.25237391,61],
          "value": 87
        },
        {
          "point": [121.48047463,31.22617967,38],
          "value": 80
        },
        {
          "point": [121.48477522,31.23823883,84],
          "value": 95
        },
        {
          "point": [121.48203408,31.25113752,16],
          "value": 70
        },
        {
          "point": [121.49542774,31.23945532,13],
          "value": 65
        }
      ]
    }
  },

  //====== RoadHeatMap  路径热力图
  {
    "type": "RoadHeatMap",
    "roadHeatMapStyle": {
      "width": 50,
      "mappingValueRange": [1, 100],
      "gradientSetting": [
        "ffee1aff", "ffb540ff", "f4ff4bff", "d961feff", "b456ffff"
      ],
      "type": "plane",
      "filter": []
    },
    "bVisible": true,
    "entityName": "myName11",
    "customId": "myId11",
    "customData": {
      "data": "RoadHeatMap"
    },
    "points": {
      "features": [
        {
          "point": [121.47799331,31.23097751,83],
          "value": 87
        },
        {
          "point": [121.49095564,31.22740179,57],
          "value": 80
        },
        {
          "point": [121.46961736,31.24484216,93],
          "value": 95
        },
        {
          "point": [121.49208500,31.25120664,52],
          "value": 70
        },
        {
          "point": [121.48651742,31.22413720,30],
          "value": 65
        }
      ]
    }
  },

  //====== SpaceHeatMap  点云热力图
  {
    "type": "SpaceHeatMap",
    "spaceHeatMapStyle": {
      "brushDiameter": 100,
      "mappingValueRange": [1, 100],
      "gradientSetting": [
        "0000ff", "ff5500", "00ff00", "ffff00", "00ffff"
      ]
    },
    "bVisible": true,
    "entityName": "myName12",
    "customId": "myId12",
    "customData": {
      "data": "SpaceHeatMap"
    },
    "points": {
      "features": [
          {
          "point": [121.48641573,31.23901035,87],
          "value": 87
        },
        {
          "point": [121.46117788,31.22258222,89],
          "value": 80
        },
        {
          "point": [121.47008568,31.22681936,13],
          "value": 95
        },
        {
          "point": [121.49895380,31.22317413,65],
          "value": 70
        },
        {
          "point": [121.47750177,31.22547035,94],
          "value": 65
        }
      ]
    }
  },

  //====== Range  圆形区域轮廓
  {
  "type": "Range",
    "circlePolygon2D": {
      "center": [121.49986350,31.24269398,49],
      "radius": 300
    },
    "rangeStyle": {
      "shape": "circle",
      "type": "grid",
      "fillAreaType": "radar",
      "height": 150,
      "strokeWeight": 10,
      "color": "2948feff"
    },
    "bVisible": true,
    "entityName": "myName13",
    "customId": "myId13",
    "customData": {
      "data": "CircleRange"
    }
  }，

  //======light  灯光
 {
    "type": "Light",
    "location": [121.49189794,31.24282414,0],
    "rotator": {
      "pitch": 0,
      "yaw": 0,
      "roll": 0
    },
    "scale3d": [100, 100, 100],
    "lightStyle": {
      "intensity": 40,
      "color": "ff00ff",
      "angle": 50,
      "attenuation": 200,
      "shadows": true,
      "haze": true,
      "haze_Intensity": 90
    }，
    "bVisible": true,
    "entityName": "myName14",
    "customId": "myId14",
    "customData": {
      "data": "CircleRange"
    }
 }
]

const res = await App.Scene.Creates(jsondata, { // 坐标类型
  "calculateCoordZ": {  //  [可选]；坐标类型及坐标高度; 最高优先级
    "coordZRef":"surface",// surface: 表面; ground: 地面; altitude: 海拔,
    "coordZOffset": 200 // 海拔高度(单位:米)
  }
});
console.log(res);
```
[批量]添加实例 (多对象)

```javascript
const objs = [poiObject, pathObject, particleObject...];
const res = await App.Scene.Add(objs, {
  calculateCoordZ: {   // 坐标类型及坐标高度; [可选] 最高优先级
    coordZRef: "surface", //surface:表面; ground:地面; altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
console.log(res);

```
[批量]设置实例缩放: 相同倍数

多个对象缩放相同倍数



```javascript
const obj = [ // 单体3D实体对象(场景特效 Particle, 3D文字 Text3D, 粒子特效 Effects, 灯光 Light, 模型)
  particleObj, text3dObj
];

const res = await App.Scene.SetScale3D(obj, {
  x: 400, //缩放比例
  y: 400,
  z: 400
});
console.log(res);

```
[批量]设置实例缩放: 不同倍数

多个对象缩放不同倍数



```javascript
const res = await App.Scene.SetScale3Ds([
    {
        object: cache.get('particle'),  // 单体3D实体对象(场景特效 Particle, 3D文字 Text3D, 可视域 Viewshed, 粒子特效 Effects, 灯光 Light, 模型)
        scale3d: { x: 200, y: 200, z: 200 }
    },
    {
        object: cache.get('text3d'),  // 单体3D实体对象(场景特效 Particle, 3D文字 Text3D, 可视域 Viewshed, 粒子特效 Effects, 灯光 Light, 模型)
        scale3d: { x: 400, y: 400, z: 400 }
    }
]);
console.log(res);

```
[批量]设置实例旋转: 同角度

多个对象旋转到同一角度



```javascript
const obj = [ // 单体3D实体对象(场景特效 Particle, 3D文字 Text3D, 可视域 Viewshed, 粒子特效 Effects, 灯光 Light, 模型)
  particleObj, text3dObj  
];

const res = await App.Scene.SetRotator(obj, {
  "pitch": 0, //俯仰角, 参考(-180~180)
  "yaw": 60, //偏航角, 参考(0正北, -180~180)
  "roll": 0 //翻滚角, 参考(-180~180)
});
console.log(res);

```
[批量]设置实例旋转: 不同角度

多个对象旋转到不同角度



```javascript
const res = await App.Scene.SetRotators([
    {
        object: cache.get('particle'),  // 单体3D实体对象(场景特效 Particle, 3D文字 Text3D, 可视域 Viewshed, 粒子特效 Effects, 灯光 Light, 模型)
        rotator: { "pitch": 0, "yaw": 60, "roll": 0 }
    },
    {
        object: cache.get('text3d'),  // 单体3D实体对象(场景特效 Particle, 3D文字 Text3D, 可视域 Viewshed, 粒子特效 Effects, 灯光 Light, 模型)
        rotator: { "pitch": 0, "yaw": 30, "roll": 0 }
    }
]);
console.log(res);
```
[批量]设置实例位置: 同位置

多个对象移动到同一个位置



```javascript
const obj = [ // 单体3D实体对象(场景特效 Particle, 3D文字 Text3D, 可视域 Viewshed, 粒子特效 Effects, 灯光 Light, 模型)
  particleObj, text3dObj  
];

const res = await App.Scene.SetLocation(obj, {
  x: 121.48701062,
  y: 31.23299679,
  z: 100
});
console.log(res);

```
[批量]设置实例位置: 不同位置

多个对象移动到不同位置



```javascript
const res = await App.Scene.SetLocations([
    {
        object: cache.get('particle'),  //单体3D实体对象(场景特效 Particle, 3D文字 Text3D, 可视域 Viewshed, 粒子特效 Effects, 灯光 Light, 模型)
        location: { x: 121.48814278, y: 31.22652611, z: 100 }
    },
    {
        object: cache.get('text3d'),   //单体3D实体对象(场景特效 Particle, 3D文字 Text3D, 可视域 Viewshed, 粒子特效 Effects, 灯光 Light, 模型)
        location: { x: 121.48814278, y: 31.24652611, z: 100 }
    }
]);
console.log(res);

```
[批量]设置实例显隐

```javascript
const obj = [ 
  particleObj, text3dObj, pathObj  // 实体对象
];

const res = await App.Scene.SetVisible(obj, false);
//true: 显示; false: 隐藏
console.log(res);

```
[批量]设置实例锁定/解锁

```javascript
const obj = [ 
  particleObj, text3dObj, pathObj  // 实体对象
];

await App.Scene.SetLocked(obj, false);
//true: 锁定; false: 解锁
console.log(res);

```
[批量]更新同类型实体

```javascript
// 此示例通过对象批量更新路径(path)样式
const jsondata = {
  "pathStyle": {
    "type": "solid",
    "width": 100,
    "color": "99ebffff",
    "passColor": "bdffedff"
  }
}

const obj = [ 
  path1Obj, path2Obj, path3Obj  // 同类型实体对象
];

const res = await App.Scene.Update(obj, jsondata, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
console.log(res);

```
[批量]更新多类型实体

```javascript
const particleJson = {  // particle jsondata
    "rotator": {
        "pitch": 0,
        "yaw": 10,
        "roll": 0
    },
    "scale3d": [50, 50, 50],
    "particleType": "vehicle_car_black"
}

const pathJson = {  // path jsondata
    "pathStyle": {
        "type": "solid",
        "width": 100,
        "color": "ff17e7ff",
        "passColor": "e241ffff"
    }
}

const res = await App.Scene.Updates([
    { object: cache.get('particle'), jsonData: particleJson },  // 数据结构 { object: object, jsonData: entityJson }
    { object: cache.get('path'), jsonData: pathJson },
], {  // [可选] 坐标类型及坐标高度; 最高优先级
    calculateCoordZ: {
        coordZRef: 'ground',  // surface: 表面; ground: 地面; altitude: 海拔
        coordZOffset: 10  // 高度(单位:米)
    }
});

// cache.get('particle'), cache.get('path') 创建此实体时缓存的对象
```
[批量]删除实例

```javascript
const obj = [ 
  particleObj, text3dObj, pathObj  // 实体对象
];

const res = await App.Scene.Delete(obj);
console.log(res);
```
---

### 实体移动
**Title:** 实体移动

实体移动 Bound

实体移动是创建一个实体与路径的bound，实体是与路径绑定的



```javascript
const path = new App.Path({
  "polyline": {
    "coordinates": [
      [121.45378835,31.11244461,69],
      [121.47707094,31.0923774,85],
      [121.45493835,31.11174904,94],
      [121.47697603,31.09265285,33],
      [121.46656664,31.11655328,41],
      [121.47577947,31.09422706,56],
    ],
  },
  "pathStyle": {
    "type": "arrow",
    "width": 20,
    "speedupFactor": 1,
    "opacity": 1,
    "color": "a54cffff",
    "passColor": "c9ff23ff"
  },
  "customId": "my-movePath-id",
  "bVisible": true //是否可见(true/false)
});
const { success } = await App.Scene.Add(path,{
  "calculateCoordZ": {  //[可选] 最高优先级
    "coordZRef": "surface",//Surface:表面;Ground:地面;Altitude:海拔
    "coordZOffset": 50 //高度(单位:米)
  }
});
if (success) {
  //tip::: 添加覆盖物(小车)
  const particle = new App.Particle({
    "location": [121.45378835,31.11244461,69],
    "rotator": {
      "pitch": 0, //俯仰角
      "yaw": 0, //偏航角(0北)
      "roll": 0 //翻滚角
    },
    "scale3d": [30, 30, 30],
    "particleType": "vehicle_taxi",
    "customId": "my-moveParticle-id",
    "bVisible": true //是否可见(true/false)
  });
  await App.Scene.Add(particle,{
    "calculateCoordZ": {  //[可选] 最高优先级
      "coordZRef": "surface",//Surface:表面;Ground:地面;Altitude:海拔
      "coordZOffset": 50 //高度(单位:米)
    }
  });
  //wide::: 覆盖物(小车) 沿路径移动
  const moveObj = new App.Bound({
    "moving": particle, //移动的覆盖物
    "path": path, //路径
    "boundStyle": {
      "time": 50, //总时长(单位:秒)
      "bLoop": true, //是否循环(true/false)
      "bReverse": false, //是否反向移动(true/false)
      "state":"play", //play:移动；pause:暂停；stop：停止
    },
    "customId": "my-moveObj-id",
    "rotator":{
      "pitch": 0, // 相对路径的俯仰角，上+，下-，参考(-180~180)
      "yaw": 0, // 相对路径的偏航角, 左+，右-，参考(0沿路径, -180~180)
      "roll": 0 // 相对路径的翻滚角,左+，右-， 参考(-180~180)
    },// 原始设置清空，使用自动匹配，相对角度调整用rotator
    "offset":{
      "left": 0, // 相对路径走向的左右调整，左+，右-，单位：米
      "forward": 0, // 沿着路径的前后调整，前+，后-，单位：米
      "up": 0 // 相对路径走向的垂直上下，上+，下-，单位：米
    }, // 原始设置清空，使用自动匹配，相对位置调整用offset
  });
  await App.Scene.Add(moveObj);
  const jsondata = {
    "rotation": {
      "pitch": -40, //俯仰角(-90~0)
      "yaw": 50, //偏航角(-180~180; 0:东; 90:南; -90:北)
    },
    "distanceFactor": 0.8, //聚焦倍率[0.1 ~ 1]
    "flyTime": 1, //过渡时长(单位:秒)
    "entity": [path] //覆盖物对象
  }
  await App.CameraControl.Focus(jsondata);
}
```
*bLoop为false时，实体移动到终点停止后，如果要再次从头移动，请先更新state为stop后，再play。



![](/profile/upload/2025/11/28/实体移动_20251128172023A049.webp)}]

更新实体移动

```javascript
const jsondata = {
  "moving":particle, //移动的覆盖物；particle为创建的对象
  "path": path, //路径；path为创建的对象
  "boundStyle": {
    "bLoop": true, //是否循环(true/false)
    "state":"play", //play:移动；pause:暂停；stop：停止
    "pathUpdatePoints": [[-154.29668951,483.69997297,34], [-154.32559641,483.7124225,2]] //路径更新点
  },
  "rotator":{
    "pitch": 10, // 相对路径的俯仰角，上+，下-，参考(-180~180)
    "yaw": 20, // 相对路径的偏航角, 左+，右-，参考(0沿路径, -180~180)
    "roll": 30 // 相对路径的翻滚角,左+，右-， 参考(-180~180)
  },// 原始设置清空，使用自动匹配，相对角度调整用rotator
  "offset":{
    "left": 50, // 相对路径走向的左右调整，左+，右-，单位：米
    "forward": 20, // 沿着路径的前后调整，前+，后-，单位：米
    "up": 10 // 相对路径走向的垂直上下，上+，下-，单位：米
  }, // 原始设置清空，使用自动匹配，相对位置调整用offset
}
const res = await cache.get('moveObj').Update(jsondata);
console.log(res);
```
注意：Bound中的哪些属性可以更新

属性 | 是否可以更新
--- | ---
moving |  | 是
path |  | 是
boundStyle | time | 否
 | bLoop | 是
 | bReverse | 否
 | state | 是
rotator | pitch | 是
 | yaw | 是
 | roll | 是
offset | left | 是
 | forward | 是
 | up | 是

成员函数

```javascript
// 示例
const obj = new App.Bound({ ...});
obj.Update(json); //同Add中的参数
obj.SetTime(50);
obj.SetReverse(false); //是否反向移动(true/false)；false为正向移动，true为反向移动
obj.SetLoop(true); //是否循环(true/false)；true为循环移动，false为到达终点后终止
obj.SetState('pause'); //play:移动; pause:暂停; stop:停止
obj.SetOffset({
  "left": 0, //实体相对路径走向的左右调整，左+，右-，单位：米
  "forward": 0, //实体沿着路径的前后调整，前+，后-，单位：米
  "up": 0 //实体相对路径走向的垂直上下，上+，下-，单位：米
});
obj.SetRotator({ 
  "pitch": 0, //相对路径的俯仰角，上+，下-，参考(-180~180)
  "yaw": 30, //相对路径的偏航角, 左+，右-，参考(0沿路径, -180~180)
  "roll": 0 //相对路径的翻滚角,左+，右-， 参考(-180~180)
});
obj.SetVisible(boolean);
obj.Get();
obj.Delete();
```
---

### 数据驱动实体移动
**Title:** 数据驱动实体移动

数据驱动实体移动

<ol><li data-list="bullet">数据驱动实体移动的移动过程实体不是与路径绑定的，可以实现多个实体同时通过一个目标点；</li><li data-list="bullet">为对象指定目标点和运动时间。对象会从当前位置按照规定的时间平移到目标点；</li><li data-list="bullet">当数组中包含多个不同对象的运动信息时，它们会近乎在同一时间开始第一次运动，对于其中的每一个对象，到达各自的目标点后，它会自动向下一个目标点运动。</li></ol>

```javascript
const poi = new App.Poi({
  "location": [121.37624691,31.15963937,37],
  "poiStyle": {
    "markerNormalUrl": "https://wdpapi.51aes.com/doc-static/images/static/markerNormal.png",
    "markerActivateUrl": "https://wdpapi.51aes.com/doc-static/images/static/markerActive.png",
    "markerSize": [50,114],
    "labelBgImageUrl": "https://wdpapi.51aes.com/doc-static/images/static/LabelBg.png",
    "labelBgSize": [115,22],
    "labelBgOffset": [25,100], //x>0,y>0 向右、上偏移(x,y 单位:像素)
    "labelContent": ["数据驱动移动","fcffb7ff","12"],
    "labelTop": false,
    "scrollSpeed": 5,
    "textBoxWidth": 200,
    "labelContentJustification": "Left",
    "labelContentAutoWrap": true,
    "scrollPolicy": "default"
  },
  "entityName": "myName1",
  "customId": "my-poi-id",
  "customData": {
    "data": "myCustomData"
  }
})
const res = await App.Scene.Add(poi);
const entityObj = [
  {
    objects: [poi],
    location: [121.40110354,31.15382552,3],
    time: 0 //实体移动到该位置所需时间
  },
  {
    objects: [poi],
    location: [121.3942475,31.14479155,98],
    time: 5
  },
  {
    objects: [poi],
    location: [121.40488661,31.17504119,29],
    time: 10
  },
  {
    objects: [poi],
    location: [121.38337962,31.17722974,65],
    time: 5
  },
  {
    objects: [poi],
    location: [121.38337962,31.17722974,65],
    time: 15
  },
]
await App.Tools.MoveLinear.Move(entityObj,{
  "calculateCoordZ": {  //坐标类型及坐标高度; [可选] 最高优先级
    "coordZRef": "surface",//Surface:表面;Ground:地面;Altitude:海拔
    "coordZOffset": 50 //海拔 高度(单位:米)
  }
});
```
**参数描述：**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
objects | array | 是 | 移动的对象
location | array | 是 | 路径坐标
time | number | 是 | 实体移动到该位置所需时间

---

### 实体点击事件
**Title:** 实体点击事件

实体点击事件

```javascript
await App.Renderer.RegisterSceneEvent([        // 点击事件一定要注册
  {
    name: 'OnEntityClicked',
    func: async (res) => {
      // 覆盖物被点击事件回调; 包含数据信息与实体对象
      console.log(res);
    }
  }
]);

let flag = true, __winObj = null;

//示例: 添加path实体
const entityObj = new App.Path({
    "polyline": {
        "coordinates": [
            [121.49921961, 31.23764884, 77],
            [121.46326121, 31.22644542, 31],
            [121.49408610, 31.24848319, 73]
        ]
    },
    "pathStyle": {
        "type": "arrow",
        "width": 100,
        "color": "ff2620ff",
        "passColor": "c117feff"
    }
});
await App.Scene.Add(entityObj).then(async res => {
    if (res.success) {
        // 聚焦
        const jsondata = {
            "rotation": {
                "pitch": -40,
                "yaw": 0,
            },
            "distanceFactor": 0.8,
            "flyTime": 1,
            "entity": [entityObj]
        }
        await App.CameraControl.Focus(jsondata);

        res.result.object.onClick(async ev => {
            // 点击path实体, 更新样式
            const upjsondata = {
                "pathStyle": {
                    "type": "solid",
                    "width": 120,
                    "color": "ffd8e5ff",
                    "passColor": "36fe7eff"
                }
            }
            ev.result.object.Update(upjsondata);


            // 点击path实体, toggle方式添加window
            if (flag) {
                flag = false;
                const entityObj = new App.Window({
                    "location": ev.result.position,
                    "windowStyle": {
                        "url": "http://wdpapi.51aes.com/doc-static/images/static/echarts.html",
                        "size": [500, 350],
                        "offset": [0, 0]
                    }
                })
                const res = await App.Scene.Add(entityObj);
                __winObj = res.result.object;
            } else {
                __winObj.Delete();
                flag = true;
            }
        })
    }
})
```
---

### 实体滑过事件
**Title:** 实体滑过事件

实体滑过事件

```javascript
// 鼠标滑过事件
App.Renderer.UnRegisterSceneEvents([
  "OnMouseEnterEntity", "OnMouseOutEntity"
])
App.Renderer.RegisterSceneEvents([
  { name: 'OnMouseEnterEntity', func: function (res) {} },
  { name: 'OnMouseOutEntity', func: function (res) {} }
])

// 示例: 添加path实体
const entityObj = new App.Path({
  "polyline": {
    "coordinates": [
      [121.47635644, 31.11820445, 25],
      [121.47139989, 31.11113569, 40],
      [121.50090474, 31.12182567, 80]
    ]
  },
  "pathStyle": {
    "type": "solid",
    "width": 50,
    "color": "0099ffff",
    "passColor": "e950ffff"
  }
});

await App.Scene.Add(entityObj).then(async res => {
  if (res.success) {

    // 鼠标滑入
    res.result.object.onMouseEnter(async ev => {
      console.error("onMouseEnter", ev);
    })

    // 鼠标滑出
    res.result.object.onMouseOut(async ev => {
      console.error("onMouseOut", ev);
    })

  }
})
```
---

## 实体覆盖物

### 实时视频
**Title:** 实时视频

实时视频 RealTimeVideo

```javascript
const realTimeVideo = new App.RealTimeVideo({
  "location": [121.50007292, 31.22579403, 30],
  "realTimeVideoStyle": {
    "url": "rtsp://admin:admin123456@121.63.247.105:20037/h264/ch1/sub/av_stream",
    "resolution": [400, 300], //窗口大小(单位:像素)
    "offset": [0, 0], //x>0,y>0 向右、上偏移(x,y 单位:像素)
    "state": "pause",  //play:播放; pause:暂停;
    "overlapOrder": 1, //重叠层级; 数值越大越浮在最上层;范围[1~10]
    "bokeh": 0.5, //边缘虚化(单位:比例); 范围[0,1]
    "conrnerShift": [
      [40, -40], [0, -40], [10, 0], [0, 0]
    ] //角点偏移(单位:像素); 点位固定顺序 [左上,右上,左下,右下]; 每个角点的原始位置为[0,0]; X>0 向右,Y>0 向上
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
})

const res = await App.Scene.Add(realTimeVideo, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
location | array | 是 |  | 坐标位置
realTimeVideoStyle | url | string | 是 |  | 实时视频流内容
 | resolution | array | 是 | 整数 | window大小(宽,高 单位:像素)
 | offset | array | 否 | 整数 | x&gt;0,y&gt;0 向右,上偏移(x,y 单位:像素)
 | state | string | 否 | play, pause | play:播放; pause:暂停
 | overlapOrder | number | 否 | [1~10] | 重叠层级; 数值越大越浮在最上层
 | bokeh | number | 否 | [0~1] | 边缘虚化(单位:比例)
 | conrnerShift | array | 否 | [[0,0], [0,0], [0,0], [0,0]] | 角点偏移(单位:像素); 点位固定顺序 [左上,右上,左下,右下]; 每个角点的原始位置为[0,0]; X&gt;0 向右,Y&gt;0 向上
 | bgUrl | string | 否 |  | 背景地址
 | bgPadding | array | 否 | [0, 0, 0, 0] | 内边距（上 右下左）
 | bgOverlap | string | 否 | hide | z轴显示关系'backward' | 'forward' | 'hide'
 | labelContent | array | 否 |  | ['xxxx', '000000ff', '24'] size:(字号*分辨率高/分辨率宽)得出值再取整；
 | labelOffset | array | 否 |  | label偏移量
 | labelSize | array | 否 |  | label宽高
 | labelContentJustification | string | 否 | Left | label水平对齐方式'Left' | 'Center' | 'Right'
 | labelContentAutoWrap | boolean | 否 | false | label内容是否自动换行
 | btnNormalUrl | string | 否 |  | close按钮图
 | btnActivateUrl | string | 否 |  | close按钮mouseEnter图
 | btnOffset | array | 否 |  | close按钮位置偏移量
 | btnSize | array | 否 |  | close按钮宽高大小
bVisible |  | boolean | 否 |  | 是否可见(true/false)
entityName |  | string | 否 |  | 实体名称
customId |  | string | 否 |  | 实体ID，便于后续操作索引
customData |  | object | 否 |  | 
data |  | string | 否 |  | 实体数据，可自行拓展

![](/profile/upload/2025/11/28/实时视频_20251128174024A050.jpeg)}]

成员函数

```javascript
// 示例
  const obj = new App.RealTimeVideo({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
```
<ol><li data-list="bullet">**Update(data)**</li></ol>         用途：更新RealTimeVideo 状态

         参数说明：



```javascript
const data = {
  "realTimeVideoStyle": {
    "state": "pause"  //play:播放; pause:暂停;
  }
}
```
<ol><li data-list="bullet">**SetVisible()**</li></ol>         用途：显隐RealTimeVideo实体

boolean() true:显示；false：隐藏

<ol><li data-list="bullet">**Get()**</li></ol>         用途：获取RealTimeVideo信息

<ol><li data-list="bullet">**Delete()**</li></ol>         用途：删除RealTimeVideo实体



---

### 视频 web行为
**Title:** 视频 web行为

添加视频 web

```javascript
/*
基于浏览器开发的video，相对于3D渲染POI，只能播放浏览器支持的MP4格式，且不支持daas
*/
const videoUI = new App.VideoUI({
  "videoUIContent": {
    "src": "mp4 video url",
    "autoplay": true,
    "controls": true,
    "loop": true,
    "muted": false,
    "preload": "auto"
  },
  "windowStyle": {
    "width": "400px",
    "height": "300px",
    "position": "absolute",
    "left": "500px",
    "top": "200px",
    "zIndex": "1000",
    "background": "none"
  }
});
const res = App.Component.VideoUI.Add([videoUI]);
console.log(res);
```
成员函数

```javascript
App.Component.VideoUI.Add([videoUI]);
// 和add创建一样，两种创建video的方式
// Add方式是添加的数组对象，Create添加的是json数据
App.Component.VideoUI.Create(jsonData);
// 批量创建video
App.Component.VideoUI.Creates(jsonData);
// 更新video
object.Update(jsonData)
// 删除video
object.Delete()
// 获取video
App.Component.VideoUI.Get();
```
---

### window
**Title:** window

Window

```javascript
const window = new App.Window({
  "location": [121.50007292, 31.22579403, 30],
  "windowStyle": {
    "url": "http://wdpapi.51aes.com/doc-static/images/static/echarts.html",
    "size": [500, 350], //window大小(单位:像素)
    "offset": [0, 0]
  },
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  },
  "bVisible": true,
  "visible2D": {
    "camera": {
      "hideDistance": 2000,  //定义实体隐藏的距离(单位:米),相机超过此距离时,实体会被隐藏
      "hideType": "default", //实体超出显示距离(none:不显示; default:圆圈显示)
      "scaleMode": "2D" //是否受相机的透视影响(2D:不影响; 3D:影响)
    },
    "interaction": { //被"交互"影响的可见性(POI有效)
      "hoverTop": true  //当发生滑过时，需要显示在最上层
    },
    "entity": {
      "overlapOrder": 1 //重叠层级; 数值越大越浮在最上层；范围[1~10]
    }
  }
})

const res = await App.Scene.Add(window, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
location | array | 是 |  | 坐标位置
windowStyle | url | string | 是 |  | window内容,支持2种地址形式:形式1：DaaS云盘地址，如"daas://977c1f70f13948788831b50ce845996f"【使用详述见附录1】形式2：在线地址,如“http://wdpapi.51aes.com/doc-static/images/static/echarts.html”形式3：本地地址,如“file:///D:/xxx/echarts.html”
size | array | 是 | 正整数 | window大小(宽,高 单位:像素)
offset | array | 否 | 整数 | window左上角相对于coord坐标中心的偏移(x,y 单位:像素), 注:x为任意数，包含负数, y为为任意数，包含负数
bVisible | boolean | 否 |  | 是否可见(true/false)
visible2D | camera | hideDistance | number | 否 | 正整数 | 定义实体隐藏的距离(单位:米),相机超过此距离时,实体会被隐藏
hideType | string | 否 | none, default | 实体超出显示距离(none:不显示; default:圆圈显示)
scaleMode | string | 否 | 2D, 3D | 是否受相机的透视影响(2D:不影响; 3D:影响)
interaction | hoverTop | boolean | 否 | true, false | 当发生滑过时,需要显示在最上层
entity | overlapOrder | number | 否 | [1~10] | 重叠层级; 数值越大越浮在最上层;范围[1~10]
entityName |  |  |  | 否 |  | 实体名称
customId |  |  |  | 否 |  | 实体ID,便于后续操作索引
customData |  | data | string | 否 |  | 实体数据,可自行拓展

【附录1】

window url使用DaaS云盘：

-优势：

在线地址需要部署服务器；DaaS云盘地址不需部署服务器，只需要把html文件上传云盘，就可读取。减少运维成本

本地地址云端/私有化不可用，最终交付需要迁移文件；DaaS云盘云端/私有化/LITE都适用，且最终交付无额外操作

-操作流程：

1）在云端/私有化/LITE右下角DaaS云盘上传html文件；

2）html中如果用到外链文件：如css、图片、js、字体库等，都分别上传在DaaS云盘，使其处于同目录下；

3）复制html文件的daas链接，如："daas://977c1f70f13948788831b50ce845996f"，在url中使用；

4）若需对window进行交互，支持二开时在daas链接后加"？"，如：

用户认证：通过URL传递认证令牌或会话ID，如  daas://977c1f70f13948788831b50ce845996f?token=123456789 

内容定制：根据用户的偏好设置，如语言或主题，如  daas://977c1f70f13948788831b50ce845996f?lang=zh-CN 

功能开关：控制页面上的某些功能是否启用，如  daas://977c1f70f13948788831b50ce845996f?darkMode=true 

数据过滤：根据用户的输入过滤数据，如  daas://977c1f70f13948788831b50ce845996f?category=electronics 

搜索查询：执行搜索操作，如  daas://977c1f70f13948788831b50ce845996f?query=smartphone 

分页：在分页的列表或结果集中，控制显示哪一页的数据，如  daas://977c1f70f13948788831b50ce845996f?page=2 

排序：控制数据的排序方式，如  daas://977c1f70f13948788831b50ce845996f?sort=price_asc

API请求：在API调用中传递必要的参数，如  daas://977c1f70f13948788831b50ce845996f?user_id=123&amp;fields=name,email 

动态内容加载：控制页面上哪些内容需要动态加载，如 daas://977c1f70f13948788831b50ce845996f?load_comments=true 

获取最新内容：而不是缓存的版本，如 daas://977c1f70f13948788831b50ce845996f?ts=202408091200

-注：动态数据，内网环境白名单须照常开启（和在线&amp;本地一样）



成员函数

```javascript
// 示例
  const obj = new App.Window({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
```
<ol><li data-list="bullet">**Update(data)**</li></ol>         用途：更新Window实体

         参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>        用途：显隐Window实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>        用途：获取Window信息

<ol><li data-list="bullet">**Delete()**</li></ol>        用途：删除Window实体



window与3D世界通信

```javascript
w51_event('EventKey', {...});
```
w51_event是一个原生JavaScript函数, 它属于UE内置事件委托方法, 通过此函数将window内嵌网页上的js事件信息发回UE引擎, 并通过事件注册函数返回此信息

w51_event接受两个参数 — 事件名称和事件消息

**window内嵌页面发送消息代码**



```javascript
const jsondata = {
        "squadName": "Super hero WdpApi",
        "active": true,
        "definitions": {
            "state": { "enum": ["CA", "NY", "... etc ..."] }
        },
        "properties": {
            "first_name": { "type": "string" },
            "shipping_address": { "$ref": "/schemas/address" },
        }
    }

    const button= document.getElementById("button");
    button.addEventListener('click', (ev) => {
        w51_event('EventKey', jsondata);
    })
```
接收widnow发送的事件及数据

```javascript
App.Renderer.RegisterSceneEvent([
    {
        name: 'OnWebJSEvent', func: function (data) {
            console.log(data)；
            // { "event_name": "OnWebJSEvent", "result": { "name": "自定义name", "args": "自定义数据" }}
        }
    }
])
```
① window窗口仅为chrome内核框架(chrome 80); 开发中请将window指向的html等网页禁止鼠标右键及alert事件

② 建议百分比开发window内的html等内容



---

### window web行为
**Title:** window web行为

添加Window web

```javascript
/*
基于浏览器渲染的窗口，相对于UE渲染窗口
优点：像素清晰
缺点：位置固定，不能跟随镜头动
基于浏览器渲染窗口，添加多少个Window点取决的web页面的DOM元素，不在依赖UE渲染
*/
const windowUI = new App.WindowUI({
  "windowUIContent": {
    "url": "http://wdpapi.51aes.com/doc-static/images/static/echarts.html"
  },
  "windowStyle": {
    "width": "500px",
    "height": "350px",
    "position": "absolute",
    "left": "300px",
    "top": "200px",
    "zIndex": "1000",
    "background": "#ffffff",
    "border": "solid 1px #cccccc",
    "borderRadius": "8px",
    "overflowX": "hidden",
    "overflowY": "hidden"
  }
});
const res = App.Component.WindowUI.Add([windowUI]);
```
成员函数

```javascript
App.Component.WindowUI.Add([object]);
// 和add创建一样，两种创建window的方式
// Add方式是添加的数组对象，Create添加的是json数据
App.Component.WindowUI.Create(jsonData);
// 批量创建Window
App.Component.WindowUI.Creates(jsonData);
// 更新Window
object.Update(jsonData)
// 删除Window
object.Delete()
// 获取Window
App.Component.WindowUI.Get();

```
---

### POI
**Title:** POI

POI

```javascript
const poi = new App.Poi({
  "location": [121.50007292, 31.22579403, 30],
  "poiStyle": {
    "markerNormalUrl": "https://wdp5-api-debug.51aes.com/static/newMarker.png",
    "markerActivateUrl": "https://wdp5-api-debug.51aes.com/static/newMarker_active.png",
    "markerSize": [100,159],
    "labelBgImageUrl": "https://wdp5-api-debug.51aes.com/static/newLabel.png",
    "labelBgSize": [177,66],
    "labelBgOffset": [10,168], //// label可以向上下左右偏移；当[0,0]时，label切图的左上角对齐location (x,y 单位:像素)
    "labelContent": [" 文本内容A","ffffff","18"],
    "labelContentOffset": [45, 23], // labeContent可以向上下左右偏移; 当[0,0]时，labelContent的左上角对齐label的左上角 (x,y 单位:像素)
    "labelTop": false, //label是否置于marker顶层
    "scrollSpeed": 5,// 文本滚动速度(0:不滚动)
    "textBoxWidth": 200, // 文本框宽度(默认100)
    "labelContentJustification": "Left", //文本内容对齐方式: Left, Center, Right
    "labelContentAutoWrap": true, //label内容是否自动换行
    "scrollPolicy": "default"  //文本长度超过文本框时滚动; always: 总是滚动
  },
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  },
  "bVisible": true,
  "visible2D": {
    "camera": {
      "hideDistance": 2000,  //定义实体隐藏的距离(单位:米),相机超过此距离时,实体会被隐藏
      "hideType": "default", //实体超出显示距离(none:不显示; default:圆圈显示)
      "scaleMode": "2D" //是否受相机的透视影响(2D:不影响; 3D:影响)；透视包括近大远小、overlapOrder生效
    },
    "interaction": { //被"交互"影响的可见性(POI有效)
      "clickTop": true, //当发生点击(优先级高于滑过)时,需要显示在最上层
      "hoverTop": true  //当发生滑过时，需要显示在最上层
    },
    "entity": {
      "overlapOrder": 1 // 跨2D覆盖物类型的层级设置，当scaleMode为2D时生效; 数值越大越在最上层；范围[1~10]
    }
  }
})

const res = await App.Scene.Add(poi, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)；
  }
});
/*
若想使用location中的z值，即如下操作；同理所有的覆盖物都是这样操作
const res = await App.Scene.Add(poi);
*/
```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
location |  | array | 是 |  | 坐标位置
poiStyle | markerVisible | boolean | 否 | true，false | marker是否显示
markerNormalUrl | string | 是 |  | 正常状态,图片url地址,支持2种形式:·在线地址:如"http://wdpapi.51aes.com/doc-static/images/static/markerNormal.png"·本地地址:如"file:///D:/xxx/markerNormal.png"; D: 在线席位所在盘符
markerActivateUrl | string | 是 |  | 激活状态,由鼠标划过或点击触发
markerSize | string | 是 |  | marker大小(宽,高 单位:像素)
labelVisible | boolean | 否 | true, false | 是否显示label
labelBgImageUrl | string | 否 |  | 图片url地址
labelBgSize | array | 否 | 正整数 | label图片大小(宽, 高 单位:像素)
labelBgOffset | array | 否 | 任意整数 | 整个label左上角相对于marker的中心点(坐标中心点)的偏移(x,y 单位:像素),；注: x为正向右, y为正向上
labelContent | array | 否 | ["文本内容", "ff0000ff", "50"] | 富文本; 格式: ["text", "color" ,"size"] color: HEXA格式；size:(字号*分辨率高/分辨率宽)得出值再取整；
scrollSpeed | int | 否 |  | 文本滚动速度(0:不滚动)
textBoxWidth | int | 否 |  | 文本框宽度(默认100)
labelContentOffset | array | 否 | [5,5] | label内容相对于label左上角偏移(x,y 单位:像素)；注: x为正向右, y为正向下
labelTop | boolean | 否 | true, false | label是否置于marker顶层
labelContentJustification | string | 否 | 默认Left | 水平对齐方式 Left ｜ Center ｜ Right
labelContentAutoWrap | boolean | 否 | true, false | 是否自动换行
scrollPolicy | string | 否 | 默认default | 滚动规则default：文本长度超过文本框时滚动always：总是滚动
bVisible | boolean | 否 |  | 是否可见(true/false)
visible2D | camera | hideDistance | number | 否 | 正整数 | 定义实体隐藏的距离(单位:米),相机超过此距离时,实体会被隐藏
hideType | string | 否 | none, default,url | 实体超出显示距离(none:不显示; default:圆圈显示,url:自定义图片)
url | string | 否 |  | hideType设置成url，当超过设定的hideDistance，缩略图为url
size | array | 否 | [10,10] | url的大小
scaleMode | string | 否 | 2D, 3D | 是否受相机的透视影响(2D:不影响; 3D:影响)
interaction | clickTop | boolean | 否 | true, false | 当发生点击(优先级高于滑过)时,需要显示在最上层
hoverTop | boolean | 否 | true, false | 当发生滑过时,需要显示在最上层
entity | overlapOrder | number | 否 | [1~10] | 重叠层级; 数值越大越浮在最上层;范围[1~10]
entityName |  |  | string | 否 |  | 实体名称
customId |  |  | string | 否 |  | 实体ID,便于后续操作索引
customData |  | data | string | 否 |  | 实体数据,可自行拓展

![](/profile/upload/2025/11/27/业务组合-POI_20251127173506A022.png)}]

成员函数

```javascript
// 示例
  const obj = new App.Poi({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Poi实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐Poi实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Poi属性

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Poi实体

<ol><li data-list="bullet">**onClick()**</li><li data-list="bullet">**onMouseEnter()**</li><li data-list="bullet">**onMouseOut()**</li></ol>

[demo]POI添加Window

```javascript
await App.Renderer.RegisterSceneEvent([
  {
    name: 'OnWebJSEvent',
    func: async (res) => {
      // 接收window内嵌页面发送的数据
      // { "event_name": "OnWebJSEvent", "result": { "name": "xxx", "args": {} }}
      console.log(res);
    }
  }
]);
const jsonData = [
  {
    "type": "Poi",
    "location": [-294.15355414,-346.31192099,77],
    "customId": "myPoi-id-1",
    "entityName": "myPoi",
    "customData": {"data": "myCustomData"},
    "poiStyle": {
      "markerNormalUrl": "http://wdpapi.51aes.com/doc-static/images/static/markerNormal.png",
      "markerActivateUrl": "http://wdpapi.51aes.com/doc-static/images/static/markerActive.png",
      "markerSize": [100,228],
      "labelVisible": false
    }
  },
  {
    "type": "Window",
    "location": [-294.15355414,-346.31192099,77],
    "customId": "myPoi-id-1_window",
    "entityName": "myPoi_window",
    "customData": {"data": "myCustomData"},
    "windowStyle": {
      "url": "https://wdpapi.51aes.com/doc-static/sample1.html",
      "size": [500, 320],
      "offset": [52, 176]
    }
  }
];
const res = await App.Scene.Creates(jsonData, { // 坐标类型
  "calculateCoordZ": {  // [可选] 最高优先级
    "coordZRef":"surface",// Surface:表面;Ground:地面;Altitude:海拔
    "coordZOffset": 200 // 高度(单位:米)
  }
});
console.log(res);
if (res.success) {
  const result = await App.CameraControl.Focus({
    "rotation": {
      "pitch": -40, //俯仰角(-90~0)
      "yaw": -90 //偏航角(-180~180; 0:东; 90:南; -90:北)
    },
    "distanceFactor": 0.15, //聚焦倍率[0.1 ~ 1]
    "flyTime": 1, //过渡时长(单位:秒)
    "entity": res.result.objects //覆盖物对象
  });
  console.log(result);
}
```
---

### POI web行为
**Title:** POI web行为

添加POI web

```javascript
/*
基于浏览器渲染的POI，相对于UE渲染POI
优点：像素清晰
确定：位置固定，不能跟随镜头动
基于浏览器渲染的poi，添加多少个poi点取决的web页面的DOM元素，不在依赖UE渲染
*/
const poiUI = new App.PoiUI({
  "poiUIContent": {
    "normalImage": "http://wdpapi.51aes.com/doc-static/images/static/markerNormal.png",
    "activeImage": "http://wdpapi.51aes.com/doc-static/images/static/markerActive.png",
    "content": ""
  },
  "windowStyle": {
    "width": "79px",
    "height": "180px",
    "position": "absolute",
    "left": "500px",
    "top": "200px",
    "zIndex": "1000",
    "background": "none"
  }
});
const res = App.Component.PoiUI.Add([poiUI]);
```
成员函数

```javascript
App.Component.PoiUI.Add([object]);
// 和add创建一样，两种创建window的方式
// Add方式是添加的数组对象，Create添加的是json数据
App.Component.PoiUI.Create(jsonData);
// 批量创建
App.Component.PoiUI.Creates(jsonData);
// 更新
object.Update(jsonData)
// 删除
object.Delete()
// 获取
object.Get()
```
---

### 场景特效
**Title:** 场景特效

场景特效 Particle

```javascript
const particle = new App.Particle({
  "location": [121.50007292, 31.22579403, 30],
  "rotator": {
    "pitch": 0, //俯仰角, 参考(-180~180)
    "yaw": 30, //偏航角, 参考(-180~180)
    "roll": 0 //翻滚角, 参考(-180~180)
  },
  "scale3d": [30, 30, 30],
  "particleType": "vehicle_taxi",
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
});

const res = await App.Scene.Add(particle, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
location | array | 是 |  | 坐标位置
rotator | object | 否 |  | 
-pitch | number | 否 | [-180,180] | 俯仰角,0为水平
-yaw | number | 否 | [-180,180] | 偏航角
-roll | number | 否 | [-180,180] | 翻滚角,0为垂直地面
scale3d | array | 否 | 正整数 | 大小
particleType | string | 否 | flame, 3dmark_build_loop, 3dmark_build, 3dmark_camera_loop, 3dmark_camera, 3dmark_sign, 3dmark_warning, title_only, vehicle_car, vehicle_car_black, vehicle_car_white, vehicle_taxi, shield, fire, arrow, alarm, circle, pyramid, marker_cube, marker_pyramid, marker_site, marker_cone, tool_wrench, weather_tornado, circle_glass, circle_compass, circle_outside, circle_inside, circle_scan, circle_diffuse, circle_area, circle_area2, circle_flash | 
bVisible | boolean | 否 |  | 是否可见
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展



成员函数

```javascript
// 示例
  const obj = new App.Particle({...});
  obj.Update(json);
  obj.SetRotator(json);
  obj.SetScale3d(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Particle实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetRotator(jsondata)**</li></ol>用途：旋转Particle实体

const jsondata = {    "pitch": 0, //俯仰角, 参考(-180~180)    "yaw": 30, //偏航角, 参考(-180~180)    "roll": 0 //翻滚角, 参考(-180~180)}<ol><li data-list="bullet">**SetScale3d(jsondata)**</li></ol>用途：缩放Particle实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Particle信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Particle实体



事件

<ol><li data-list="bullet">**onClick()**</li><li data-list="bullet">**onMouseEnter()**</li><li data-list="bullet">**onMouseOut()**</li></ol>

---

### 粒子特效
**Title:** 粒子特效

粒子特效 Effects

```javascript
const entityObj = new App.Effects({
  "location": [121.51132810, 31.23485399, 52],
  "rotator": {
    "pitch": 0, //俯仰角, 参考(-180~180)
    "yaw": 0, //偏航角, 参考(-180~180)
    "roll": 0 //翻滚角, 参考(-180~180)
  },
  "scale3d": [1, 1, 1],
  "bVisible": true, //是否可见(true/false)
  "speed": 1, //动画速率
  "seedId": "ac2a41915c7c7097be7dc64602e0e4fb", //模型编号，seedId来自平台粒子特效
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
});

const res = await App.Scene.Add(entityObj, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
location | array | 是 |  | 坐标位置
rotator | object | 否 |  | 
-pitch | number | 否 | [-180,180] | 俯仰角,0为水平
-yaw | number | 否 | [-180,180] | 偏航角
-roll | number | 否 | [-180,180] | 翻滚角,0为垂直地面
scale3d | array | 否 | 正整数 | 大小
speed | number | 否 |  | 粒子运动速度(米/秒)
seedId | string | 是 |  | 模型编号(从DaaS中获取)
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

![](/profile/upload/2025/12/01/粒子特效_20251201143426A083.webp)}]

成员函数

```javascript
// 示例
  const obj = new App.Effects({...});
  obj.Update(json);
  obj.SetRotator(json);
  obj.SetScale3d(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Effects实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetRotator(jsondata)**</li></ol>用途：旋转Effects实体

const jsondata = {    "pitch": 0, //俯仰角, 参考(-180~180)    "yaw": 30, //偏航角, 参考(-180~180)    "roll": 0 //翻滚角, 参考(-180~180)}<ol><li data-list="bullet">**SetScale3d(jsondata)**</li></ol>用途：缩放Effects实体

const jsondata = [10,10,10]; //缩放比例(x,y,z)坐标轴<ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐Effects实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Effects信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Effects实体

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 灯光特效
**Title:** 灯光特效

灯光特效Light

```javascript
const entityObj = new App.Light({
  "location": [121.47731869, 31.22435528, 61],
  "bVisible": true, //是否可见(true/false)
  "scale3d": [30, 30, 30],
  "lightStyle": {
    "intensity": 40, //灯光强度(0~100)
    "color": "968afeff", //灯光颜色(HEX颜色值)
    "angle": 50, //灯光张角(0~50)
    "attenuation": 200, //灯光衰减长度(单位:米)
    "shadows": true, //是否开启阴影(true/false)
    "haze": true, //是否开启烟雾(true/false)
    "haze_Intensity": 90 //烟雾强度(0~100)
  }
});

const res = await App.Scene.Add(entityObj, {
  "calculateCoordZ": {  //坐标类型及坐标高度; [可选] 最高优先级
    "coordZRef": "surface",//surface:表面;ground:地面;altitude:海拔
    "coordZOffset": 100 //高度(单位:米)
  }
});
```
**参数描述：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
location | array | 是 |  | 坐标位置
bVisible | boolean | 否 |  | 是否可见(true/false)
scale3d | array | 否 |  | 设置缩放值，只能按照等比例缩放，例如[10,10,10]，如果使用不等比放缩会导致haze（烟雾）导致超出灯光
lightStyle | intensity | int | 是 | [0, 100] | 灯光强度(0~100)
color | string | 是 | 十六进制HEXA | 灯光颜色(HEXA颜色值)
angle | int | 是 | [0, 50] | 灯光张角
attenuation | int | 是 | 任意整数 | 灯光衰减长度(单位:米)
shadows | boolean | 是 | true, false | 是否开启阴影
haze | boolean | 是 | true, false | 是否开启烟雾
haze_Intensity | boolean | 是 | [0, 100] | 烟雾强度
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 

![](/profile/upload/2025/12/01/light_20251201144444A084.png)}]

成员函数

```javascript
// 示例
  const obj = new App.Light({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Light实体

参数说明：

data() //同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐Light实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Light信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Light实体



---

### 3D文字
**Title:** 3D文字

3D文字 Text

```javascript
const text3d = new App.Text3D({
  "location": [121.46434372, 31.23499129, 60],
  "rotator": {
    "pitch": 0, //俯仰角, 参考(-180~180)
    "yaw": 30, //偏航角, 参考(-180~180)
    "roll": 0 //翻滚角, 参考(-180~180)
  },
  "scale3d": [100, 30, 30],
  "text3DStyle": {
    "text": "3D文字",
    "color": "ff00ff", //HEX或rgba(0,0,0)
    "type": "plain", //样式(plain; reflection; metal)
    "outline": 0.4, //轮廓(单位:百分比), 取值范围[0~1]
    "portrait": false, //纵向(true/false)
    "space": 0.1 //间距(单位:米)
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
});

const res = await App.Scene.Add(text3d, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述：**

参数 |  | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | --- | ---
location |  | array | 是 |  | 坐标位置
rotator | pitch |  | number | 否 | [-180,180] | 俯仰角，0为水平
 | yaw |  | number | 否 | [-180,180] | 偏航角
 | roll |  | number | 否 | [-180,180] | 翻滚角，0为垂直地面
scale3d |  | array | 否 | 正整数 | 特效的大小
text3DStyle | text |  | string | 否 |  | 文字内容
color |  | string | 否 | HEXA,RGBA | 文字颜色
type |  | string | 否 | plain; reflection; metal | 样式
outline |  | number | 否 | [0,1] | 轮廓勾边，单位百分比
portrait |  | boolean | 否 | true,false | 纵向
space |  | number | 否 | 正数 | 间距，单位米
faceToCamera |  | boolean | 否 | false | 是否朝向镜头
shape |  | string | 否 | square | circle | triangle | auto | 类型5种：① 默认是空，代表是3D文字，不发生换行② square: 方形③ circle: 圆形④ triangle: 三角形这三种形状3文字，仅与其发生碰撞⑤ auto: 与不规则盒子进行碰撞; (如果盒子中有其他模型，也会与其他模型发生碰撞)
radius |  | number | 否 | 100 | shape为空时，不生效
drawDebugBoundary |  | boolean | 否 | false | shape为空时，不生效
visible2D | camera | hideDistance | number | 否 |  | 定义实体隐藏的距离（单位：米），相机超过此距离时，实体会被隐藏
bVisible |  |  | boolean | 否 |  | 是否可见(true/false)
entityName |  |  | string | 否 |  | 实体名称
customId |  |  | string | 否 |  | 实体ID，便于后续操作索引
customData |  |  | object | 否 |  | 
data |  |  | string | 否 |  | 实体数据，可自行拓展


成员函数

```javascript
// 示例
  const obj = new App.Text3D({...});
  obj.Update(json);
  obj.SetRotator(json);
  obj.SetScale3d(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Text3D实体

参数说明：

data() //同Add中的参数 <ol><li data-list="bullet">**SetRotator(jsondata)**</li></ol>用途：旋转Text3D实体

const jsondata = {    "pitch": 0, //俯仰角, 参考(-180~180)    "yaw": 30, //偏航角, 参考(-180~180)    "roll": 0 //翻滚角, 参考(-180~180)}<ol><li data-list="bullet">**SetScale3d(jsondata)**</li></ol>用途：缩放Text3D实体

const jsondata = [200,200,200]; //缩放比例(x,y,z)坐标轴<ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐Text3D实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Text3D信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Text3D实体

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 可视域
**Title:** 可视域

可视域 Viewshed

```javascript
const viewshed = new App.Viewshed({
  "location": [121.47025042, 31.23065615, 90],
  "rotator": {
    "pitch": 0, //俯仰角, 参考(-180~180)
    "yaw": 30, //偏航角, 参考(-180~180)
    "roll": 0 //翻滚角, 参考(-180~180)
  },
  "viewshedStyle": {
    "fieldOfView": 70, //可视域水平视角范围(0~120)
    "radius": 600, //半径(单位:米)
    "outline": true, //轮廓
    "hiddenColor": "75fe97ff", //不可见区域颜色(HEXA颜色值)
    "visibleColor": "3cff71ff" //可见区域颜色(HEXA颜色值)
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
});

const res = await App.Scene.Add(viewshed, {
  calculateCoordZ: {
    coordZRef: "ground", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 10 //高度(单位:米)
  }
});
```
<h5>**参数描述:**</h5>参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
location | array | 是 |  | 坐标位置
rotator | object | 否 |  | 
-pitch | number | 否 | [-180,180] | 俯仰角，0为水平
-yaw | number | 否 | [-180,180] | 偏航角
-roll | number | 否 | [-180,180] | 翻滚角，0为垂直地面
viewshedStyle | object | 否 |  | 
-fieldOfView | number | 否 | [0,120] | 视角范围
-radius | number | 否 | true,false | 半径，单位”米“
-outline | boolean | 否 | true,false | 轮廓勾边
-hiddenColor | string | 否 | HEXA,RGBA | 不可见区域颜色
-visibleColor | string | 否 | HEXA,RGBA | 可见区域颜色
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

![](/profile/upload/2025/12/02/可视域_20251202165427A002.jpeg)}]

成员函数

```javascript
// 示例
  const obj = new App.Viewshed({...});
  obj.Update(json);
  obj.SetRotator(json);
  obj.SetScale3d(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Viewshed实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetRotator(jsondata)**</li></ol>用途：旋转Viewshed实体

const jsondata = {    "pitch": 0, //俯仰角, 参考(-180~180)    "yaw": 30, //偏航角, 参考(-180~180)    "roll": 0 //翻滚角, 参考(-180~180)}<ol><li data-list="bullet">**SetScale3d(jsondata)**</li></ol>用途：缩放Viewshed实体

const jsondata = [200,200,200]; //缩放比例(x,y,z)坐标轴<ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐Viewshed实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Viewshed信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Viewshed实体

#### 事件<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 路径
**Title:** 路径

路径 Path

```javascript
const path = new App.Path({
  "polyline": {
    "coordinates": [
      [121.49968476, 31.24861346, 44],
      [121.49956979, 31.25093239, 96],
      [121.47613890, 31.23725069, 39]
    ]
  },
  "pathStyle": {
    "type": "arrow",
    "width": 100,
    "color": "b4fed7", //HEX或rgb(0,0,0)
    "passColor": "ffb3deff"
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
});

const res = await App.Scene.Add(path, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
polyline | coordinates | array |  |  | 坐标位置,格式[[x,y,z],[x,y,z],....]
pathStyle | type | string | 否 | fit_solid(贴合地面), adaptive_solid(等宽路径), none, solid, arrow, arrow_dot, dashed_dot, arrow_dashed, flash, scan_line, brimless_arrow, railway, pipe_round, pipe_square, dashed_line | 样式类型
width | number | 否 | 正数 | 宽度,单位米(在"adaptive_solid"中,单位像素)
color | string | 否 | HEX,RGB | 颜色
passColor | string | 否 | HEXA,RGBA | 实体已移动的颜色,应用于"实体沿路径移动"
speedupFactor | number | 否 | 任意数值 | 加速比，相对于原速度的加成比例，支持正负数，正负表示方向仅对以下type生效：arrow round_pipe square_pipe railway brimless_arrow dashed_line arrow_dot arrow_dashed dashed_dot flash scan_line
opacity | number | 否 | [0,1] | 路径透明度，仅对一下type生效：scan_line
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID,便于后续操作索引
customData | data | string | 否 |  | 实体数据,可自行拓展



成员函数

```javascript
// 示例
  const obj = new App.Path({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Path实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐Path实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Path属性

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Path实体

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 迁徒图
**Title:** 迁徒图

迁徒图 Parabola

```javascript
const parabola = new App.Parabola({
  "polyline": {
    "coordinates": [
      [121.49968476, 31.24861346, 44],
      [121.47025042, 31.23065615, 90]
    ]
  },
  "parabolaStyle": {
    "topHeight": 800, //弧顶高度(单位:米)
    "topScale": 1, //弧顶位置比例(单位为%, 取值[0~1])
    "type": "scanline", //样式类型(arrow, solid, scanline)
    "width": 20, //线宽(单位:米)
    "color": "ff3fafff", //HEXA或rgba(0,0,0,0.8)
    "gather": true //true: 向内聚集, false: 向外扩展
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
});

const res = await App.Scene.Add(parabola, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
polyline | object | 是 |  | 
coordinates | array |  |  | 坐标位置，格式[[x,y,z],[x,y,z]]，需为2个坐标点
parabolaStyle | object | 否 |  | 
topHeight | number | 否 | 正数 | 弧顶高度，单位米
topScale | number | 否 | [0,1] | 弧顶位置比例，单位百分比
type | string | 否 | arrow,solid,scanline | 类型
width | number | 否 | 正数 | 宽度，单位米
color | string | 否 | HEXA,RGBA | 颜色
gather | boolean | 否 | true,false | 是否向内聚集
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

![](/profile/upload/2025/12/01/迁徙图_20251201154459A096.jpeg)}]

成员函数

```javascript
// 示例
  const obj = new App.Parabola({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Parabola实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐Parabola实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Parabola信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Parabola实体

事件

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 区域轮廓
**Title:** 区域轮廓

区域轮廓 Range

```javascript
const entityObj = new App.Range({
  "polygon2D": {
    "coordinates": [
      [  //外环坐标数据
        [121.44988564758069, 31.250519581243555],
        [121.44931229954645, 31.237062463089813],
        [121.47069915607464, 31.23800903013435],
        [121.46964214200186, 31.251854247249092]
      ],
      [  //内环坐标数据
        [121.45523929837454, 31.247795686070997],
        [121.45496451671893, 31.240059486959915],
        [121.46707798490596, 31.24170746459223]
      ]
    ]
  },
  "rangeStyle": {
    "shape": "polygon",
    "type": "loop_line", //类型
    "fillAreaType": "block", //底部区域填充类型
    "height": 200, //围栏高度(单位:米)
    "strokeWeight": 10, //底部轮廓线宽度(单位:米; 注: 区域中含有内环"innerLoops"时无效)
    "color": "ff3772ff", //HEXA或rgba(0,0,0,0.8)
    "fillAreaColor": "fa34008f", //HEXA或rgba(0,0,0,0.8)
    "bBlocked": false    //是否开启碰撞检测
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
})

// 向场景中添加实体
const res = await App.Scene.Add(entityObj, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 10 //高度(单位:米)
  }
});
```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
polygon2D | object | 是 |  | 
coordinates | array | 是 |  | 坐标，格式中第一个数组为外环，后续为内环：[ [[lng,lat],[lng,lat],....], [[lng,lat],[lng,lat],....], ....]
rangeStyle | object | 否 |  | 
-shape | string | 否 | circle，polygon：默认 | 轮廓类型:(polygon; circle:圆形,此类型详见"圆形区域轮廓添加方法")
-type | string | 否 | none, wave, loop_line, grid, stripe, bias，box_wave_line, box_wave, box_solid_line, box_solid | 围栏样式，注：效果见下个表格注意：当为box相关类型时，"strokeWeight"无效
-fillAreaType | string | 否 | none, solid, block, block2, dot, dot2, dot3, dash_line, radar | 封底样式，注：效果见下个表格
-height | number | 否 | 正数 | 围栏高度，单位米
-strokeWeight | number | 否 | 正数 | 封底轮廓线宽度，单位米
-color | string | 否 | HEXA,RGBA | 围栏颜色；前6位是颜色，后面2位是颜色透明度；
-fillAreaColor | string | 否 | HEXA,RGBA | 封底颜色；围栏颜色；前6位是颜色，后面2位是颜色透明度；
-bBlocked | boolean | 否 | 默认false，不开启碰撞检测 | 是否开启碰撞检测。开启后，当移动实体闯入该区域，会返回碰撞点坐标，同时实体停止移动
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

*注:以上示例图对应的type和fillAreaType参数的值为：

图片名 | block2 | dot3 | dot2 | block | bias | dot | box_solid | box_solid_line | box_wave | box_wave_line | dash_line | grid | loop_line | radar | strip | solid | wave | none
--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---
type值 | none | none | none | none | bias | none | box_solid | box_solid_line | box_wave | box_wave_line | none | grid | loop_line | none | strip | none | wave | none
fillAreaType值 | block2 | dot3 | dot2 | block | none | dot | none | none | none | none | dash_line | none | none | radar | none | solid | none | none

成员函数

```javascript
// 示例
const obj = new App.Range({ ...});
obj.Update(json);
obj.SetVisible(boolean);
obj.Get();
obj.GetRangeInfo()
obj.Delete();
obj.onClick(ev => {
  const newObj = ev.result.object;
  console.log(ev);
})
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Range实体

参数说明：

data() //同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐Range实体

boolean() //true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Range属性

<ol><li data-list="bullet">**GetRangeInfo()**</li></ol>用途：获取区域轮廓坐标点位

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Range实体

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

添加SHP轮廓

```javascript
const _shp = "http://wdpapi.51aes.com/doc-static/images/static/gis/polygon.shp"
const resultGeo = await App.DataModel.Geometry.CreateGeometryFromShapefile(_shp);
if (resultGeo.success) {
  //tip::: 创建覆盖物对象
  const range = new App.Range({
    "polygon2D": {
      "coordinates": resultGeo.result.polygon2D[0].polygon
    },
    "rangeStyle": {
      "type": "loop_line",
      "fillAreaType": "dot2",
      "height": 50,
      "strokeWeight": 20,
      "color": "8bffddff",
      "fillAreaColor": "8bffddff",
      "bBlocked": false
    }
  });
  //tip::: 向场景中添加实体
  const res = await App.Scene.Add(range,{
    calculateCoordZ: {
      coordZRef: "surface", //Surface:表面;Ground:地面;Altitude:海拔
      coordZOffset: 50 //[可选]高度(单位:米)
    }
  });
  console.log(res); //call::: 回调信息
  //tip::: 缓存全局对象, 用于后续操作
  cache.set('range',res.result.object);
  if (res.success) {
    const jsondata = {
      "rotation": {
        "pitch": -30, //俯仰角(-90~0)
        "yaw": 0, //偏航角(-180~180; 0:东; 90:南; -90:北)
      },
      "distanceFactor": 0.15, //聚焦倍率[0.1 ~ 1]
      "flyTime": 1, //过渡时长(单位:秒)
      "entity": [cache.get('range')] //覆盖物对象
    }
    await App.CameraControl.Focus(jsondata);
  }
}
```
![](/profile/upload/2025/12/01/range-shp_20251201161741A111.gif)}]

添加GeoJson轮廓

```javascript
const _geojson = "http://wdpapi.51aes.com/doc-static/images/static/gis/polygon.geojson"
const resultGeo = await App.DataModel.Geometry.CreateGeometryFromGeoJson(_geojson);
if (resultGeo.success) {
  //tip::: 创建覆盖物对象
  const range = new App.Range({
    "polygon2D": {
      "coordinates": resultGeo.result.polygon2D[0].polygon
    },
    "rangeStyle": {
      "type": "grid",
      "fillAreaType": "dot",
      "height": 50,
      "strokeWeight": 10,
      "color": "dd0606ff",
      "fillAreaColor": "8bffddff",
      "bBlocked": false
    }
  });
  //tip::: 向场景中添加实体
  const res = await App.Scene.Add(range,{
    calculateCoordZ: {
      coordZRef: "surface", //Surface:表面;Ground:地面;Altitude:海拔,
      coordZOffset: 50 //[可选]高度(单位:米)
    }
  });
  console.log(res); //call::: 回调信息
  //tip::: 缓存全局对象, 用于后续操作
  cache.set('range',res.result.object);
  if (res.success) {
    const jsondata = {
      "rotation": {
        "pitch": -30, //俯仰角(-90~0)
        "yaw": 150, //偏航角(-180~180; 0:东; 90:南; -90:北)
      },
      "distanceFactor": 0.15, //聚焦倍率[0.1 ~ 1]
      "flyTime": 1, //过渡时长(单位:秒)
      "entity": [cache.get('range')] //覆盖物对象
    }
    await App.CameraControl.Focus(jsondata);
  }
}
```
![](/profile/upload/2025/12/01/range-geojson_20251201161812A112.gif)}]

---

### 圆形区域轮廓
**Title:** 圆形区域轮廓

圆形区域轮廓 Range

```javascript
const entityObj = new App.Range({
  "circlePolygon2D": {
    "center": [121.49885272, 31.24683565, 46],
    "radius": 200
  },
  "rangeStyle": {
    "shape": "circle",
    "type": "loop_line", //类型
    "fillAreaType": "block", //底部区域填充类型
    "height": 200, //围栏高度(单位:米)
    "strokeWeight": 10, //底部轮廓线宽度(单位:米)
    "color": "ff3772ff" //HEXA或rgba(0,0,0,0.8)
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
})

// 向场景中添加实体
const res = await App.Scene.Add(entityObj, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 10 //高度(单位:米)
  }
});
```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
circlePolygon2D | object | 是 |  | 
center | array |  |  | 圆心坐标
radius | number |  |  | 半径(单位:米)
rangeStyle | object | 否 |  | 
shape | string | 是 | circle | 轮廓类型:(circle; polygon:多边形,此类型详见"区域轮廓添加方法")
type | string | 否 | none, wave, loop_line, grid, stripe, bias,box_wave_line, box_wave, box_solid_line, box_solid | 围栏样式，注：效果示例见下个表格
fillAreaType | string | 否 | none, solid, block, block2, dot, dot2, dot3, dash_line, radar | 封底样式 注：效果示例见下个表格
height | number | 否 | 正数 | 围栏高度(单位:米)
strokeWeight | number | 否 | 正数 | 封底轮廓线宽度(单位:米)
color | string | 否 | HEXA,RGBA | 整体颜色
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID,便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据,可自行拓展

*注：以上示例图对应的type和fillAreaType参数的值为：

图片名 | block2 | dot3 | dot2 | block | bias | dot | box_solid | box_solid_line | box_wave | box_wave_line | dash_line | grid | loop_line | radar | strip | solid | wave | none
--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---
type值 | none | none | none | none | bias | none | box_solid | box_solid_line | box_wave | box_wave_line | none | grid | loop_line | none | strip | none | wave | none
fillAreaType值 | block2 | dot3 | dot2 | block | none | dot | none | none | none | none | dash_line | none | none | radar | none | solid | none | none

成员函数

```javascript
// 示例
const obj = new App.Range({ ...});
obj.Update(json);
obj.SetVisible(boolean);
obj.Get();
obj.Delete();
obj.onClick(ev => {
  const newObj = ev.result.object;
  console.log(ev);
})
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途:更新圆形区域轮廓Range实体

参数说明:

data() //同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途:显隐圆形区域轮廓Range实体

boolean() //true:显示;false:隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途:获取圆形区域轮廓Range属性

<ol><li data-list="bullet">**Delete()**</li></ol>用途:删除圆形区域轮廓Range实体

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 区域热力图
**Title:** 区域热力图

区域热力图 HeatMap

```javascript
const mapdata = [],
  points = [
    [121.49656333, 31.22702479, 49],
    [121.46434372, 31.23499129, 60],
    [121.49099537, 31.23099794, 22],
    [121.47780699, 31.23877183, 79]
  ];
for (let i = 0; i < points.length; i++) {
  mapdata.push({
    "point": points[i],
    "value": Math.floor(Math.random() * 100)
  })
}
const heatmap = new App.HeatMap({
  "heatMapStyle": {
    "type": "fit", //样式类型(fit: 投影型 plane: 平面型)
    "brushDiameter": 2000, //热力点笔刷直径(单位:米, 单个热力点覆盖直径)
    "mappingValueRange": [1, 100], //热力点热力值范围(1:绿色接近透明, 100:最红, 线性计算)
    "gradientSetting": [
      //自定义热力点渐变颜色(HEX颜色值)
      "c9ff6f", "d153fe", "01edff", "feb539", "ffd30f"
    ]
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  },
  "points": {
    features: mapdata
  }
});

const res = await App.Scene.Add(heatmap, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔,
    coordZOffset: 10 //高度(单位:米)
  }
});
```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
points | object | 是 |  | 热力数据点，包含坐标和点位数值
features | object | 是 |  | 数据点集合
point | array | 是 |  | 坐标
value | number | 是 | 需要在“mappingValueRange”定义的区间内 | 点位数值
heatMapStyle | object | 否 |  | 
type | string | 否 | fit(投影型)，plane(平面型) | 样式类型
brushDiameter | number | 否 | 正数 | 单个点位的直径，单位米
mappingValueRange | array | 是 |  | 定义点位数值的区间
mappingHeightRange | array | 否 |  | 热力图贴花高度限制（仅作用于type为fit时有效）
gradientSetting | array | 否 | HEX | 定义热力点的表现色阶，需要为5个值，对应点位数值的从小到大
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

![](/profile/upload/2025/12/01/区域热力图_20251201154154A095.webp)}]

成员函数

```javascript
// 示例
  const obj = new App.HeatMap({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.GetHeatValue([121.49579361,31.23447654,81]);
  obj.Filter();
  obj.UnFilter();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新HeatMap实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐HeatMap实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取HeatMap信息

<ol><li data-list="bullet">**GetHeatValue()**</li></ol>用途：获取指定点位热力值

obj.GetHeatValue([121.49579361,31.23447654,81]);<ol><li data-list="bullet">**Filter()**</li></ol>用途：显示指定热力值范围区域

obj.Filter([10,40]);<ol><li data-list="bullet">**UnFilter()**</li></ol>用途：取消指定范围

obj.UnFilter();<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除HeatMap实体

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 柱状热力图
**Title:** 柱状热力图

柱状热力图

```javascript
const mapdata = [],
  points = [
    [121.48766129, 31.23586660, 35],
    [121.49968476, 31.24861346, 44],
    [121.49956979, 31.25093239, 96],
    [121.47613890, 31.23725069, 39]
  ];
for (let i = 0; i < points.length; i++) {
  mapdata.push({
    "point": points[i],
    "value": Math.floor(Math.random() * 100)
  })
}
const columnarheatmap = new App.ColumnarHeatMap({
  "columnarHeatMapStyle": {
    "type": "cube", //柱状热力图柱体外观类型; (cube:方柱, cylinder:圆柱, needle:针状, frame:线框)
    "brushDiameter": 550, //热力点笔刷直径(单位:米, 单个热力点覆盖直径)
    "mappingValueRange": [1, 100], //热力点热力值范围(1:绿色接近透明, 100:最红, 线性计算)
    "columnarWidth": 5, //(单位:米), 柱状热力图单体宽度(此宽度同时受整个热力图范围大小影响;柱状热力图最多500x500个柱子,如果热力图整体范围长度,宽度/单体柱子宽度 <= 500,则采用单体柱子宽度;否则单体柱子宽度会自动反算一个合适的值)
    "mappingHeightRange": [0, 500], //单体柱表达最小值,最大的实际高度(单位:米)
    "enableGap": false, //true 开启柱间隙; false 柱子之间紧贴无间隙
    "gradientSetting": [
      //自定义热力点渐变颜色(HEX颜色值)
      "ffae12", "8f62ff", "60ff4b", "a207ff", "ff15c8"
    ]
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  },
  "points": {
    "features": mapdata
  }
});

const res = await App.Scene.Add(columnarheatmap, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 10 //高度(单位:米)
  }
});
```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
points | object | 是 |  | 热力数据点，包含坐标和点位数值
features | object | 是 |  | 数据点集合
point | array | 是 |  | 坐标
value | number | 是 | 需要在“mappingValueRange”定义的区间内 | 点位数值
columnarheatStyle | object | 否 |  | 
type | string | 否 | cube(方柱), cylinder(圆柱), needle(针状), frame(线框) | 单个柱子的样式
brushDiameter | number | 否 | 正数 | 单个点位的直径，单位米；1个点位的范围，会由n个柱子构成
columnarWidth | number | 否 | 正数 | 单个柱子的直径，单位米；若单个柱子直径较小，表现上过渡平滑，但会让单个点位包含更多柱子，效率降低
mappingValueRange | array | 否 |  | 定义点位数值的区间
mappingHeightRange | array | 否 | 正数 | 定义单个柱子高度的区间
enableGap | boolean | 否 | true,false | 柱子间是否有间隙
gradientSetting | array | 否 | HEX | 定义热力点的表现色阶，需要为5个值，对应点位数值的从小到大
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

成员函数

```javascript
// 示例
  const obj = new App.ColumnarHeatMap({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.GetHeatValue([121.49579361,31.23447654,81]);
  obj.Filter();
  obj.UnFilter();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新ColumnarHeatMap实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐ColumnarHeatMap实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取ColumnarHeatMap信息

<ol><li data-list="bullet">**GetHeatValue()**</li></ol>用途：获取指定点位热力值

obj.GetHeatValue([121.49579361,31.23447654,81]);<ol><li data-list="bullet">**Filter()**</li></ol>用途：重建指定热力值范围

obj.Filter([10,40]);<ol><li data-list="bullet">**UnFilter()**</li></ol>用途：取消指定范围

obj.UnFilter();<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除ColumnarHeatMap实体

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 点云热力图
**Title:** 点云热力图

点云热力图 SpaceHeatMap

```javascript
const mapdata = [],
  points = [
    [121.46434372, 31.23499129, 60],
    [121.49099537, 31.23099794, 22],
    [121.47780699, 31.23877183, 79]
  ];
for (let i = 0; i < points.length; i++) {
  mapdata.push({
    "point": points[i],
    "value": Math.floor(Math.random() * 100)
  })
}
const spaceheatmap = new App.SpaceHeatMap({
  "spaceHeatMapStyle": {
    "brushDiameter": 100, //热力点笔刷直径(单位:米, 单个热力点覆盖直径)
    "mappingValueRange": [1, 100], //热力值范围(1:绿色接近透明, 100:最红, 线性计算)
    "gradientSetting": [
      //自定义渐变颜色(HEX颜色值)
      "0000ff", "ff5500", "00ff00", "ffff00", "00ffff"
    ]
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  },
  "points": {
    "features": mapdata
  }
});

const res = await App.Scene.Add(spaceheatmap, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
points | object | 是 |  | 热力数据点，包含坐标和点位数值
features | object | 是 |  | 数据点集合
point | array | 是 |  | 坐标
value | number | 是 | 需要在“mappingValueRange”定义的区间内 | 点位数值
spaceHeatMapStyle | object | 否 |  | 
brushDiameter | number | 否 | 正数 | 单个点位的直径，单位米
mappingValueRange | array | 是 |  | 定义点位数值的区间
gradientSetting | array | 否 | HEX | 定义热力点的表现色阶，需要为5个值，对应点位数值的从小到大
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

![](/profile/upload/2025/12/01/点云热力图_20251201153343A090.webp)}]

成员函数

```javascript
// 示例
  const obj = new App.SpaceHeatMap({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途: 更新SpaceHeatMap实体

参数说明:

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途: 显隐SpaceHeatMap实体

boolean() true:显示; false:隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途: 获取SpaceHeatMap信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途: 删除SpaceHeatMap实体

#### **事件**<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 路径热力图
**Title:** 路径热力图

路径热力图 RoadHeatMap

```javascript
const mapdata = [],
  points = [
    [121.46434372, 31.23499129, 60],
    [121.49099537, 31.23099794, 22],
    [121.47780699, 31.23877183, 79]
  ];
for (let i = 0; i < points.length; i++) {
  mapdata.push({
    "point": points[i],
    "value": Math.floor(Math.random() * 100)
  })
}
const roadheatmap = new App.RoadHeatMap({
  "roadHeatMapStyle": {
    "width": 50, //宽度
    "mappingValueRange": [1, 100], //热力值范围(1:绿色接近透明, 100:最红, 线性计算)
    "gradientSetting": [
      //自定义渐变颜色(HEX颜色值)
      "ff91fd", "cdff75", "ff9e79", "ff07a2", "fea587"
    ],
    "type": "plane", //类型(fit: 投影型 plane: 平面型)
    "filter": ["water"] //fit类型时, 生效的图层; 值为空则作用所有图层
    //常用的filter: "building","terrain","water","road","tree"
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  },
  "points": {
    "features": mapdata
  }
});

const res = await App.Scene.Add(roadheatmap, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
points | object | 是 |  | 热力数据点，包含坐标和点位数值
features | object | 是 |  | 数据点集合
point | array | 是 |  | 坐标
value | number | 是 | 需要在“mappingValueRange”定义的区间内 | 点位数值
roadHeatMapStyle | object | 否 |  | 
width | number | 否 | 正数 | 宽度
type | string | 否 | fit(投影型)，plane(平面型) | 样式类型
brushDiameter | number | 否 | 正数 | 单个点位的直径，单位米
mappingValueRange | array | 是 |  | 定义点位数值的区间
gradientSetting | array | 否 | HEX | 定义热力点的表现色阶，需要为5个值，对应点位数值的从小到大
filter | array | 否 |  | 作用区域，需在“fit(投影型)”时生效
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

![](/profile/upload/2025/12/02/路径热力图_20251202171242A003.png)}]

成员函数

```javascript
// 示例
  const obj = new App.RoadHeatMap({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新RoadHeatMap实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐RoadHeatMap实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取RoadHeatMap信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除RoadHeatMap实体

#### **事件**<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 3D网格热力图
**Title:** 3D网格热力图

3D网格热力图 MeshHeatMap

```javascript
const mapdata = [],
points = [
  [121.50646076,31.05227214],
  [121.53648849,31.05375943],
  [121.52800827,31.05715536],
  [121.51782879,31.06306783],
  [121.51136453,31.05309944],
];
for (let i = 0; i < points.length; i++) {
  mapdata.push({
    "point": points[i],
    "value": Math.floor(Math.random() * 100)
  })
}
//tip::: Create covering
const meshHeatMap = new App.MeshHeatMap({
  "meshHeatMapStyle": {
    "pointData": mapdata, // 用于生成mesh的点数据数组
    "meshBoundary": points, // 用于限制Mesh边界的多边形，至少三个点，为空时默认生成矩形范围的Mesh
    "pointCoordZ": 0, // 点的高度值
    "meshGridSpace": 100, // 网格单元大小，用于控制生成的Mesh密度，值越小密度越大越光滑，但是相应性能消耗较大
    "mappingValueRange": [ 0, 50 ], // 点业务值有效范围，用于截取业务值，Range为空时默认不截取
    "mappingHeightRange": [ 0, 50 ], // 点业务值映射的Mesh高度变化范围，范围越大Mesh起伏越大
    "gradientSetting": [ // 业务值映射颜色渐变设置，基于给定的颜色数组线性插值颜色，至少要有两个颜色
      "00ffff",
      "fdff00",
      "009fff",
      "f300ff",
      "ff0000"
    ],
    "opacity": 0.5 // 热力图茎体透明度，范围0-1
  },
  "entityName": "my-meshheatmap-id",
  "customId": "my-meshheatmap-id",
  "customData": {
    "data": "myCustomData"
  }
});
//tip::: 向场景中添加实体
const res = await App.Scene.Add(meshHeatMap,{
  "calculateCoordZ": {  //[可选] 最高优先级
    "coordZRef": "surface",//Surface:表面;Ground:地面;Altitude:海拔
    "coordZOffset": 50 //高度(单位:米)
  }
});
console.log(res); 
```
**参数描述：**

使用说明：

1.coordzoffset的优先级高于pointCoordZ，且coorszodffset是按照用户输入的点位算出中心点进行抬升的

2.meshGridSpace代表的是Mesh网格单元大小，网格单元越小（值越小），密度越大，越平滑，效果越好

3.mappingValueRange用户控制用户传入的值value

const value = [300,80,10,0]

当用户输入的范围为[ 70,89 ]，此时表示value=[89,80,70,70] 是：70&lt;=value&lt;=89

4.mappingHeightRange 代表mesh高度范围变化，当用户输入[50,90]时，此时点位的高度是50到90之间，

表现的形式可能更平滑一点；当用户输出的是[0,90],此时表现得形式幅度更大，效果更明显

5.所有热力图没有gizmo

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
points | object | 是 |  | 热力数据点，包含坐标和点位数值
point | array | 是 |  | 坐标
value | number | 是 | 需要在“mappingValueRange”定义的区间内 | 点位数值
meshHeatMapStyle | object | 否 |  | 
pointData | array | 是 |  | 用于生成mesh的点数据数组
meshBoundary | array | 否 |  | 用于限制Mesh边界的多边形，至少三个点，为空时默认生成矩形范围的Mesh
pointCoordZ | number | 否 |  | 点的高度值
meshGridSpace | number | 否 |  | 网格单元大小，用于控制生成的Mesh密度，值越小密度越大越光滑，但是相应性能消耗较大
mappingValueRange | array | 否 |  | 点业务值有效范围，用于截取业务值，Range为空时默认不截取。为空时取值为[0,0]
mappingHeightRange | array | 否 |  | 点业务值映射的Mesh高度变化范围，范围越大Mesh起伏越大
gradientSetting | array | 否 | HEX | 业务值映射颜色渐变设置，基于给定的颜色数组线性插值颜色，至少要有两个颜色
opacity | number | 否 | 0-1 | 热力图茎体透明度，范围0-1
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

成员函数

```javascript
// 示例
  const obj = new App.MeshHeatMap({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })

```
<ol><li data-list="bullet">**Updata(data)**</li></ol>用途：更新MeshHeatMap实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐MeshHeatMap实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取MeshHeatMap实体

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除MeshHeatMap实体

 

**事件**

<ol><li data-list="bullet">**onclick()**</li><li data-list="bullet">**onMouseEnter()**</li><li data-list="bullet">**onMouseOut()**</li></ol>

---

### 栅格图
**Title:** 栅格图

栅格图 Raster

```javascript
const raster = new App.Raster({
  "rasterStyle": {
    "path": "http://wdpapi.51aes.com/doc-static/images/static/raster/raster.tif", //目前仅支持TIF格式
    "type": "fit", //样式类型(fit: 投影型 plane: 平面型)
    "gradientSetting": [
      //自定义渐变颜色(HEXA颜色值)
      "91ffd5", "ff1af5", "ff0455", "ff71d3", "fed500"
    ]
  },
  "bVisible": true,
  "entityName": "myName",
  "customId": "myId1",
  "customData": {
    "data": "myCustomData"
  }
});

const res = await App.Scene.Add(raster, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 10 //高度(单位:米)
  }
});
```
<h5>**参数描述:**</h5>参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
rasterStyle | object | 否 |  | 
-path | string | 否 |  | tif格式支持：Float32 - Thirty two bit floating pointtif文件地址，支持2种形式：·在线地址：如"http://wdpapi.51aes.com/doc-static/images/static/raster/raster.tif"·本地地址：如"D:/xxx/raster.tif"； D: 在线席位所在盘符
-type | string | 否 | fit(投影型)，plane(平面型) | 样式类型
-gradientSetting | array | 否 | HEX | 定义热力点的表现色阶，需要为5个值，对应点位数值的从小到大
bVisible | boolean | 否 |  | 是否可见(true/false)
entityName | string | 否 |  | 实体名称
customId | string | 否 |  | 实体ID，便于后续操作索引
customData | object | 否 |  | 
data | string | 否 |  | 实体数据，可自行拓展

![](/profile/upload/2025/12/01/栅格图_20251201152529A089.jpg)}]

成员函数

```javascript
// 示例
  const obj = new App.Raster({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新Raster实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐Raster实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取Raster信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除Raster实体

#### 事件<ol><li data-list="bullet">**onClick()**</li></ol>

---

### 高亮区域
**Title:** 高亮区域

高亮区域 HighlightArea

```javascript
const highlightarea = new App.HighlightArea({
  "polygon2D": {
    "coordinates": [
      [
        [121.44988564758069, 31.250519581243555],
        [121.44931229954645, 31.237062463089813],
        [121.47069915607464, 31.23800903013435],
        [121.46964214200186, 31.251854247249092]
      ]
    ]
  },
  "highlightAreaStyle": {
    "interiorColor": "cbba89ff", //内部颜色
    "exteriorColor": "00ffffff", //外部颜色
    "exteriorOutlineColor": "ff00ffff", //外部勾边颜色
    "exteriorSaturation": 10, //饱和度(-100, 100)
    "exteriorBrightness": 15, //亮度(-100, 100)
    "exteriorContrast": 10 //对比度(-100, 100)
  },
  "bVisible": true
});

const res = await App.Scene.Add(highlightarea, {
  calculateCoordZ: {
    coordZRef: "surface", //surface:表面;ground:地面;altitude:海拔
    coordZOffset: 50 //高度(单位:米)
  }
});
```
**参数描述:**

使用说明：

1.当设置一个高亮轮廓时，customColors的优先级高于interiorColor

2.当exteriorColor和exteriorOutlineColor的颜色透明度设置成ff，exteriorSaturation，exteriorBrightness，exteriorContrast不生效，

3.其他当exteriorColor和exteriorOutlineColor的颜色透明度设置成不透明，exteriorSaturation，exteriorBrightness，exteriorContrast都生效，且效果叠加

4.高亮区域是一个色块，不是一个模型或者box，所以没有交互能力（即鼠标点击、鼠标滑入滑出等能力）

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
polygon2D | object | 是 |  | 
coordinates | array |  |  | 
highlightAreaStyle | object | 否 |  | 
interiorColor | string | 否 | HEXA | 内部颜色
exteriorColor | string | 否 | HEXA | 外部颜色
exteriorOutlineColor | string | 否 | HEXA | 外部勾边颜色
exteriorSaturation | number | 否 | (-100, 100) | 饱和度(-100, 100)
exteriorBrightness | number | 否 | (-100, 100) | 亮度(-100, 100)
exteriorContrast | number | 否 | (-100, 100) | 对比度(-100, 100)
customColors | object | 否 |  | {"0":"ff0000"}设置每个高亮区域的颜色
bVisible | boolean | 否 |  | 是否可见(true/false)

![](/profile/upload/2025/12/01/高亮区域_20251201152101A088.png)}]

成员函数

```javascript
// 示例
  const obj = new App.HighlightArea({...});
  obj.Update(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();

```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途：更新HighlightArea实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">**SetVisible()**</li></ol>用途：显隐HighlightArea实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途：获取HighlightArea信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途：删除HighlightArea实体



---

## 图层/模型

### 图层/单体控制器
**Title:** 图层/单体控制器

获取AES底板图层

```javascript
// AES5获取底板 
// 方法一：
const res = await App.Scene.GetTiles();
console.log(res.result[0]);
const tilesObj = res.result[0].Tiles[0];
console.log("tilesObj", tilesObj);
// 方法二：
const result = await App.Scene.Tiles.GetLayers(tilesObj);
console.log("layer=", result); 
// layers:Terrain; Building; Road; Water;

// AES6 获取底板
// 方法一：
const res = await App.Scene.GetTiles();
console.log(res.result[2]);
const tilesObj = res.result[2].EarthTiles[0];
console.log("tilesObj", tilesObj);
方法二：
const result = await App.Scene.EarthTiles.GetLayers(tilesObj);
console.log("layer=", result);
 // layers:Terrain; Vegetation; Building; Road; Water;
```
设置图层[轮廓]

```javascript
// AES5:
const res = await App.Scene.Tiles.SetLayersOutline({
  layers: ["Building"],
  bOutline: true,
  styleName: "SpringGreen",
});
conole.log(res);

//AES6: UE5.1 暂时不支持图层描边

// styleName
/*
   0: Default            32: Silver
   1: Black              33: IndianRed
   2: DarkBlue           34: Chocolate
   3: MediumBlue         35: LightGray
   4: Blue               36: Thistle
   5: DarkGreen          37: Orchid
   6: Green              38: GoldenRod
   7: SpringGreen        39: Plum
   8: MidnightBlue       40: LightCyan
   9: ForestGreen        41: DarkSalmon
   10: SeaGreen          42: Violet
   11: LimeGreen         43: LightCoral
   12: RoyalBlue         44: Wheat
   13: SteelBlue         45: Salmon
   14: Maroon            46: Linen
   15: Purple            47: DeepPink
   16: Olive             48: OrangeRed
   17: Gray              49: Tomato
   18: SkyBlue           50: HotPink
   19: BlueViolet        51: Coral
   20: DarkRed           52: DarkOrange
   21: LightGreen        53: LightSalmon
   22: MediumPurple      54: Orange
   23: DarkViolet        55: LightPink
   24: PaleGreen         56: Pink
   25: YellowGreen       57: Gold
   26: Sienna            58: FloralWhite
   27: Brown             59: Snow
   28: DarkGray          60: Yellow
   29: LightBlue         61: LightYellow
   30: GreenYellow       62: Ivory
   31: PowderBlue        63: White
*/
```
![](/profile/upload/2025/12/01/设置图层轮廓_20251201165444A149.gif)}]

设置图层[高亮]

```javascript
// AES5:
const res = await App.Scene.Tiles.SetLayersHighlight({
  layers: ['Building'],
  bHighlight: true,
  styleName: "SpringGreen"
});
console.log(res);

//AES6:
const res = await App.Scene.EarthTiles.SetLayersHighlight({
      layers: ["Terrain"],
      bHighlight: false,
      styleName: "Tomato",
    });
console.log(res);

// styleName
/*
   0: Default            32: Silver
   1: Black              33: IndianRed
   2: DarkBlue           34: Chocolate
   3: MediumBlue         35: LightGray
   4: Blue               36: Thistle
   5: DarkGreen          37: Orchid
   6: Green              38: GoldenRod
   7: SpringGreen        39: Plum
   8: MidnightBlue       40: LightCyan
   9: ForestGreen        41: DarkSalmon
   10: SeaGreen          42: Violet
   11: LimeGreen         43: LightCoral
   12: RoyalBlue         44: Wheat
   13: SteelBlue         45: Salmon
   14: Maroon            46: Linen
   15: Purple            47: DeepPink
   16: Olive             48: OrangeRed
   17: Gray              49: Tomato
   18: SkyBlue           50: HotPink
   19: BlueViolet        51: Coral
   20: DarkRed           52: DarkOrange
   21: LightGreen        53: LightSalmon
   22: MediumPurple      54: Orange
   23: DarkViolet        55: LightPink
   24: PaleGreen         56: Pink
   25: YellowGreen       57: Gold
   26: Sienna            58: FloralWhite
   27: Brown             59: Snow
   28: DarkGray          60: Yellow
   29: LightBlue         61: LightYellow
   30: GreenYellow       62: Ivory
   31: PowderBlue        63: White
*/
```
![](/profile/upload/2025/12/01/设置图层高亮_20251201165617A150.gif)}]

设置图层显隐

```javascript
// AES5:
const res = await App.Scene.Tiles.SetLayersVisibility({
  layers: ['Building'],
  bVisible: false
});
console.log(res);

// AES6:
const res = await App.Scene.EarthTiles.SetLayersVisibility({
  layers: ["Water"],
  bVisible: false,
});
console.log(res);
```
![](/profile/upload/2025/12/01/设置图层显隐_20251201165904A154.gif)}]

设置单体[轮廓]

```javascript
const res = await App.Scene.GetTiles();

if (res.success && res.result.length > 0) {
  // AES5底板获取方式：
  const tilesObj = res.result[0].Tiles[0];
  // Project底板获取方式：
  const tilesObj = res.result[1].Project[0];
  // AES6底板获取方式：
  const tilesObj = res.result[2].EarthTiles[0];
  // 方式一： 通过工厂类型设置单体轮廓
  const resNode = await App.Scene.Node.SetNodesOutline(
    {
      entity: tilesObj,
      nodeIds: ["895874688", "901061836", "898315368"],
      bOutline: true,
      styleName: "SpringGreen",
    },
    // AES5使用：Tiles; Project使用：Project;  AES6使用：EarthTiles
    "Tiles"
  );
console.log(resNode);


  // 方式二：通过对象设置单体轮廓
  /*
   // AES5底板获取方式：
  const tilesObj = res.result[0].Tiles[0];
  // Project底板获取方式：
  const tilesObj = res.result[1].Project[0];
  // AES6底板获取方式：
  const tilesObj = res.result[2].EarthTiles[0];

  tilesObj.SetNodesOutline({
      "nodeIds": ['895874688', '898315368'],
      "bOutline": true,
      "styleName": "SpringGreen"
    });
  */
}
```
![](/profile/upload/2025/12/01/设置单体轮廓_20251201170120A156.webp)}]

设置单体[高亮]

```javascript
const res = await App.Scene.GetTiles();

if (res.success && res.result.length > 0) {
   // AES5底板获取方式：
  const tilesObj = res.result[0].Tiles[0];
  // Project底板获取方式：
  const tilesObj = res.result[1].Project[0];
  // AES6底板获取方式：
  const tilesObj = res.result[2].EarthTiles[0];
  // 方式一： 通过工厂类型设置单体高亮
  const res = await App.Scene.Node.SetNodesHighlight(
    {
      entity: tilesObj,
      nodeIds: ["895874688", "901061836", "898315368"],
      bHighlight: true,
      styleName: "SpringGreen",
    },
     // AES5使用：Tiles; Project使用：Project;  AES6使用：EarthTiles
    "Tiles"
  );

  console.log(res);

  // 方式二：通过对象设置单体高亮
  /*
 // AES5底板获取方式：
  const tilesObj = res.result[0].Tiles[0];
  // Project底板获取方式：
  const tilesObj = res.result[1].Project[0];
  // AES6底板获取方式：
  const tilesObj = res.result[2].EarthTiles[0];

  tilesObj.SetNodesHighlight({
      "nodeIds": ['895874688', '898315368'],
      "bHighlight": true,
      "styleName": "SpringGreen"
    });
  */
}
```
![](/profile/upload/2025/12/01/设置单体高亮_20251201170120A155.webp)}]

设置单体显隐

```javascript
// 方式一： 通过工厂类型设置单体显隐
const res = await App.Scene.GetTiles();

if (res.success && res.result.length > 0) {
   // AES5底板获取方式：
  const tilesObj = res.result[0].Tiles[0];
  // Project底板获取方式：
  const tilesObj = res.result[1].Project[0];
  // AES6底板获取方式：
  const tilesObj = res.result[2].EarthTiles[0];
  // 方式一： 通过工厂类型设置单体高亮

const res = await App.Scene.Node.SetNodesVisibility(
  {
    entity: tilesObj ,
    nodeIds: ["895874688"],
    bVisible: false,
  },
  // AES5使用：Tiles; Project使用：Project;  AES6使用：EarthTiles
  "Tiles"
);
}
console.log(res);

// 方式二：通过对象设置单体显隐
/*
 // AES5底板获取方式：
  const tilesObj = res.result[0].Tiles[0];
  // Project底板获取方式：
  const tilesObj = res.result[1].Project[0];
  // AES6底板获取方式：
  const tilesObj = res.result[2].EarthTiles[0];

  tilesObj .SetNodesVisibility({
    "nodeIds": ['895874688', '898315368'],
    "bVisible": false
  })
*/
```
![](/profile/upload/2025/12/01/设置单体显隐_20251201165815A151.webp)}]

---

### 静态模型
**Title:** 静态模型

AES静态模型Static

```javascript
const Static = new App.Static({
  "location": [121.49992450, 31.10650030, 66],
  "rotator": {
    "pitch": 0, //俯仰角, 参考(-180~180)
    "yaw": 30, //偏航角, 参考(-180~180)
    "roll": 0 //翻滚角, 参考(-180~180)
  },
  "scale3d": [30, 30, 30],
  "bVisible": true, //是否可见
  "seedId": "9ab0dfa9cc0d811dd04e5f8f688d7080", //从DaaS中获取
});

const res = await App.Scene.Add(Static);
console.log(res);
```
**参数描述：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
location | array | 是 |  | 坐标位置
rotator | object | 否 |  | 
pitch | number | 否 | [-180,180] | 俯仰角，0为水平
yaw | number | 否 | [-180,180] | 偏航角
roll | number | 否 | [-180,180] | 翻滚角，0为垂直地面
scale3d | array | 否 | 正整数 | 大小
bVisible | boolean | 否 |  | 是否可见（true/false）
seedId | string | 是 |  | 模型编号（从DaaS中获取）
bReceivesDecals | boolean | 否 | true/false | 模型是否受工程定制场景的贴花影响

![](/profile/upload/2025/12/01/静态模型_20251201170330A157.jpg)}]

成员函数

```javascript
// 示例
const obj = new App.Static({ ...});
obj.Update(json);
obj.SetRotator(json);
obj.SetScale3d(json);
obj.SetVisible(boolean);
obj.Get();
obj.Delete();
obj.onClick(ev => {
  const newObj = ev.result.object;
  console.log(ev);
})
```
<ol><li data-list="bullet">**Update(data)**</li></ol>用途:更新静态模型Static实体

参数说明:

data() 同Add中的参数 <ol><li data-list="bullet">**SetRotator(jsondata)**</li></ol>用途:旋转静态模型Static实体

const jsondata = {  "pitch": 0, //俯仰角, 参考(-180~180)  "yaw": 30, //偏航角, 参考(-180~180)  "roll": 0 //翻滚角, 参考(-180~180)}<ol><li data-list="bullet">**SetScale3d(jsondata)**</li></ol>用途:缩放静态模型Static实体

const jsondata = [50,50,50]; //缩放比例(x,y,z)坐标轴<ol><li data-list="bullet">**SetVisible()**</li></ol>用途:显隐静态模型Static实体

boolean() true:显示;false:隐藏<ol><li data-list="bullet">**Get()**</li></ol>用途:获取静态模型Static信息

<ol><li data-list="bullet">**Delete()**</li></ol>用途:删除静态模型Static实体

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 骨骼模型
**Title:** 骨骼模型

AES骨骼模型 Skeletal

```javascript
const skeletal = new App.Skeletal({
  "location": [121.49992450, 31.10650030, 66],
  "rotator": {
    "pitch": 0, //俯仰角, 参考(-180~180)
    "yaw": 30, //偏航角, 参考(-180~180)
    "roll": 0 //翻滚角, 参考(-180~180)
  },
  "scale3d": [30, 30, 30],
  "bVisible": true, //是否可见(true/false)
  "seedId": "11cf4fabacb485caaa58ec8b1362047d", //从DaaS中获取
  "animSequenceIndex": 0,
  "bPause": false,
  "bLoop": true,
  "playRate": 1,
  "playInterval": {
    "min": 0,
    "max": 100
  }
});

const res = await App.Scene.Add(skeletal);
console.log(res);
```
**参数描述：**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
location | array | 是 |  | 坐标位置
rotator | object | 否 |  | 
pitch | number | 否 | [-180,180] | 俯仰角，0为水平
yaw | number | 否 | [-180,180] | 偏航角
roll | number | 否 | [-180,180] | 翻滚角，0为垂直水平
scale3d | array | 否 | 正整数 | 大小
bVisible | boolean | 否 |  | 是否可见（true/false）
seedld | string | 是 |  | 模型编号（从DaaS中获取）
animSequenceIndex | string | 否 |  | 需要播放的动画的index（存在多个动画片段时）
bPause | boolean | 否 |  | 是否播放false：表示播放，true：表示停止
bLoop | boolean | 否 |  | 是否循环
playRate | number | 否 |  | 播放进度（速率）支持任意浮点数
min | number | 否 |  | 
max | number | 否 |  | 
bReceivesDecals | boolean |  |  | 模型是否受工程定制场景的贴花影响

![](/profile/upload/2025/12/01/骨骼模型_20251201171318A158.jpg)}]

成员函数

```javascript
// 示例
  const obj = new App.Skeletal({...});
  obj.Update(json);
  obj.SetRotator(json);
  obj.SetScale3d(json);
  obj.SetVisible(boolean);
  obj.Get();
  obj.Delete();
  obj.onClick(ev => {
    const newObj = ev.result.object;
    console.log(ev);
  })
```
<ol><li data-list="bullet">Update(data)</li></ol>用途：更新骨格模型Skeletal实体

参数说明：

data() 同Add中的参数 <ol><li data-list="bullet">SetRotator(jsondata)</li></ol>用途：旋转骨格模型Skeletal实体

const jsondata = {    "pitch": 0, //俯仰角, 参考(-180~180)    "yaw": 30, //偏航角, 参考(-180~180)    "roll": 0 //翻滚角, 参考(-180~180)}<ol><li data-list="bullet">SetVisible()</li></ol>用途：显隐骨格模型Skeletal实体

boolean() true:显示；false：隐藏<ol><li data-list="bullet">Get()</li></ol>用途：获取骨格模型Skeletal信息

<ol><li data-list="bullet">Delete()</li></ol>用途：删除骨格模型Skeletal实体

#### 事件<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 工程摆放模型
**Title:** 工程摆放模型

成员函数

```javascript
//示例
const eids = ["xxx","xxx"]; // 获取并输入场景中的一个或多个EID
const res = await App.Scene.GetByEids(eids);
const obj = res.result[0]
obj.Update(jsondata);
obj.SetRotator(jsondata);
obj.SetScale3d(jsondata);
obj.SetVisible(jsondata);
obj.Get();
```
<ol><li data-list="bullet">Update(jsondata )</li></ol>用途:更新模型信息



```javascript
const jsondata = {
  "location": [121.54710461,31.19603704,27],
  "rotator": {
    "pitch": 0, //俯仰角
    "yaw": 10, //偏航角(0北)
    "roll": 0 //翻滚角
  },
  "scale3d": [20, 20, 20],
  "bVisible": true, //是否可见(true/false)
  "entityName": "Project model test",
  "customData": {
    "data": "myCustomData"
  }
}
```
<ol><li data-list="bullet">SetRotator(json)</li></ol>用途:旋转模型实体

const jsondata= {  "pitch": 0, // 俯仰角  "yaw": 60, // 偏航角(0北)  "roll": 0 // 翻滚角}<ol><li data-list="bullet">SetScale3d(json)</li></ol>用途:缩放模型实体

const jsondata = [50,50,50]; //缩放比例(x,y,z)坐标轴<ol><li data-list="bullet">SetVisible()</li></ol>用途:显隐模型实体

boolean() true:显示;false:隐藏<ol><li data-list="bullet">Get()</li></ol>用途:获取模型信息

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

---

### 工程摆放Instance
**Title:** 工程摆放Instance

成员函数

```javascript
//示例
const eids = ["xxx","xxx"]; // 获取并输入场景中的一个或多个EID
const res = await App.Scene.GetByEids(eids);
const obj = res.result[0]
obj.Update(jsondata);
obj.SetRotator(jsondata);
obj.SetScale3d(jsondata);
obj.SetVisible(jsondata);
obj.Get();
```
<ol><li data-list="bullet">Update(jsondata )</li></ol>用途:更新模型信息



```javascript
const jsondata = {
  "location": [121.55041213,31.1902032,64],
  "rotator": {
    "pitch": 0, //俯仰角
    "yaw": 10, //偏航角(0北)
    "roll": 0 //翻滚角
  },
  "scale3d": [20, 20, 20],
  "bVisible": true, //是否可见(true/false)
  "entityName": "Project model test",
  "customData": {
    "data": "myCustomData"
  },
  "hiddenNodes": [] //隐藏nodeId单体
}
```
<ol><li data-list="bullet">SetRotator(jsondata)</li></ol>用途:旋转模型实体

const jsondata= {  "pitch": 0, // 俯仰角  "yaw": 60, // 偏航角(0北)  "roll": 0 // 翻滚角}<ol><li data-list="bullet">SetScale3d(jsondata)</li></ol>用途:缩放模型实体

const jsondata = [50,50,50]; //缩放比例(x,y,z)坐标轴<ol><li data-list="bullet">SetVisible()</li></ol>用途:显隐模型实体

boolean() true:显示;false:隐藏<ol><li data-list="bullet">Get()</li></ol>用途:获取模型信息

**事件**

<ol><li data-list="bullet">onClick()</li><li data-list="bullet">onMouseEnter()</li><li data-list="bullet">onMouseOut()</li></ol>

设置单体轮廓

```javascript
async function SetNodesOutline() {
  const res = await obj.SetNodesOutline({
    "nodeIds": ['895874688', '898315368'], // 实体nodeIds,点击实体获取
    "bOutline": true,
    "styleName": "SpringGreen"
  });
  console.log(res);
}
```
![](/profile/upload/2025/12/01/工程-设置单体轮廓_20251201172105A159.gif)}]

设置单体高亮

```javascript
async function SetNodesHighlight() {
  const res = await obj.SetNodesHighlight({
    "nodeIds": ['895874688', '898315368'], // 实体nodeIds,点击实体获取
    "bHighlight": true,
    "styleName": "SpringGreen"
  });
  console.log(res);
}
```
![](/profile/upload/2025/12/01/工程-设置单体高亮_20251201172106A160.gif)}]

设置单体隐藏

```javascript
async function SetNodesVisibility() {
  const res = await obj.SetNodesVisibility({
    "nodeIds": ['895874688', '898315368'], // 实体nodeIds,点击实体获取
    "bVisible": false
  });
  console.log(res);
}

```
![](/profile/upload/2025/12/01/工程-设置单体隐藏_20251201172106A161.gif)}]

---

## 材质设置

### 模型材质替换
**Title:** 模型材质替换

创建材质实例

从编辑器中的官方材质库中获取SeedId，创建属于本案例的材质实例

创建后，获取该实例的唯一MaterialEid，用于后续该材质的使用



```javascript
const material = new App.Material({
  "seedId": "xxx" // 从编辑器官方材质列表获取的相应材质SeedId
});
const res = await App.Scene.Add(material);
console.log(res);
if (res.success) {
  cache.set('material', res.result.object);
  console.log('materialEid: ', res.result.object.materialEid); // 推荐使用: material.materialEid 获取该材质实例的materialEid
}
```
开启获取材质工具

对静态官方模型、骨骼动画模型、层级模型生效，可跨模型连续使用

开启工具后，鼠标悬停时，鼠标所指模型中的同种材质高亮

点击获取所指模型材质的唯一代号（包含eid+mashName+materialIndex）



```javascript
const res = await App.Tools.PickerMaterial.Start({
  "bContinuous": true, // true: 连续获取, false: 单次获取
  "func": (res) => {console.log(res)}
});
console.log(res);  
```
获取目标材质

获取刚才点击到的多种现存模型的材质代号（包含eid+mashName+materialIndex）JSON数组，可直接复制进材质替换参数中



```javascript
const res = await App.Tools.PickerMaterial.GetMaterials();
console.log(res);
if (res.success) {
  console.log(res.result);
}
```
关闭获取材质工具

关闭鼠标悬停高亮特效，停止获取现存模型材质代号。



```javascript
const res = await App.Tools.PickerMaterial.End();
console.log(res);
```
同类材质替换

用案例中创建的材质实例，替换多种场景中现存的模型材质



```javascript
const res = await App.DataModel.Material.SetModelMaterial({
  "TargetMaterials": [
      {
        "eid": "xxx", // 对应的静态，骨骼， 层级的模型eid
        "meshName": "xxx",
        "materialIndex": x
      },
  ], // 多种场景中准备替换的目标现存模型材质，可将获取到的目标材质结果数组粘贴到此处
  "MaterialEid": cache.get('material').materialEid // 自己创建的某一材质实例
});
console.log(res);
```
批量赋予材质

```javascript
// eid, meshName, materialIndex 数据可通过下面api获取:
// App.Tools.PickerMaterial.Start;
// App.Tools.PickerMaterial.GetMaterials

const { result: [ { meshName, materialIndex } = {} ] = [] } = await App.Tools.PickerMaterial.GetMaterials();

const jsondata = [
    {
        "obj": modelObj, // 模型实例
        "newMaterialsInfo": [
            {
                "MeshName": meshName,
                "MaterialIndex": materialIndex,
                "MIEid": cache.get('material').materialEid
            }
        ]
    }
]

const res = await App.DataModel.Material.Apply(jsondata);
```
设置模型mesh slot高亮

```javascript
// eid, meshName, materialIndex 数据可通过下面api获取:
const { result } = await App.DataModel.Material.GetList([modelObj]);

const jsondata = [
  {
    entity: modelObj,
    meshName: "Root_Mesh",
    MaterialIndex: 2,
    bHighlight: true
  }
]

const res = await App.DataModel.Material.SetEntitySlotsHighlight(jsondata);
```
获取实体应用的材质对象

```javascript
const { result } = await modelObj.GetMaterial();
```
---

### 模型材质高亮
**Title:** 模型材质高亮

模型材质高亮

对某个模型（用户模型、DTA静态模型、DTA骨骼模型）中同材质进行高亮。高亮样式采用通用样式。



```javascript
await App.DataModel.Material.SetEntitySlotsHighlight([
  {
  	entity: obj,
    meshName: 'xxx',
    MaterialIndex: -1,
    bHighlight: true
  }
]);
```
---

## 点聚合【私有化环境/lite】

### 数据部署
**Title:** 数据部署

创建数据

创建数据表并向数据表中添加数据，如果数据表已存在，则会向数据表中补充新数据，若新注入的数据ID和该表中已有的数据ID重复，则会略过该条数据。



```javascript
await App.DataModel.Cluster.Create({
	gather: 'test_db_1',
    mode:'cloud',
  	data: [
      {
      	id: 'xxxx1',
        coord: '123.23133,23.231311',
        name: 'custom name',
        width: 100
      },
      {
      	id: 'xxxx2',
        coord: '123.23133,23.231311',
        name: 'custom name2',
        width: 102
      }
    ]
});
```
<h5>参数描述:</h5>参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
gather | string | 是 | 数据库名
mode | string | 否 | cloud（代表私有化） ｜ local （代表lite）
data | id | string | 是 | id
coord | string | 是 | 坐标
name | string | 否 | 用户自定义数据，支持string, number, boolean
width | number | 否 | 用户自定义数据，支持string, number, boolean

更新数据

在指定数据表中更新已有数据。



```javascript
await App.DataModel.Cluster.Update({
	gather: 'test_db_1',
    mode:'cloud',
  	data: [
      {
      	id: 'xxxx1',
        coord: '123.23133,23.231311',
        name: 'custom name',
        width: 100
      },
      {
      	id: 'xxxx2',
        coord: '123.23133,23.231311',
        name: 'custom name2',
        width: 102
      }
    ]
});
```
<h5>参数描述:</h5>参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
gather | string | 是 | 数据库名
mode | string | 否 | cloud ｜ local
data | id | string | 是 | id
coord | string | 是 | 坐标
name | string | 否 | 用户自定义数据，支持string, number, boolean
width | number | 否 | 用户自定义数据，支持string, number, boolean

删除数据

在指定数据表中，根据id删除指定数据条目。



```javascript
await App.DataModel.Cluster.Delete({
	gather: 'test_db_1',
  	condition: {
    	ids: ['111', '222']
    },
    mode:'cloud'
});
```
**参数描述:**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
gather | string | 是 | 数据库名
mode | string | 否 | cloud ｜ local
condition | ids | array | 是 | 删除的条件

重建数据表

清空指定数据表，并更新数据表中的key值。



```javascript
await App.DataModel.Cluster.Reset({
	gather: 'test_db_1',
    mode:'cloud'
});
```
**参数描述:**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
gather | string | 是 | 数据库名
mode | string | 否 | cloud ｜ local

删除数据表

根据数据表的id（gather），删除指定数据表，支持同时删除多个。



```javascript
await App.DataModel.Cluster.DeleteGather({
  	condition: {
    	gathers: ['test_db_1', 'test_db_2']
    },
    mode:'cloud'
});
```
**参数描述:**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
condition | gathers | array | 是 | 数据库名
mode |  | string | 否 | cloud ｜ local

查询数据信息

在指定数据表中，根据id查询指定数据条目详细信息。



```javascript
await App.DataModel.Cluster.GetList({
	gather: 'test_db_1',
  	condition: {
    	ids: ['111', '222']
    },
    mode:'cloud'
});
```
**参数描述:**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
gather |  | string | 是 | 数据库名
condition | ids | array | 是 | 删除的条件
mode |  | string | 否 | cloud ｜ local

查询数据量

查询指定数据表中已有的数据量。



```javascript
await App.DataModel.Cluster.Count({
	gather: 'test_db_1',
    mode:'cloud'
});
```
**参数描述:**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
gather | string | 是 | 数据库名
mode | string | 否 | cloud ｜ local

获取数据表列表

获取数据表id，支持模糊匹配，关键字为空时返回全部数据表id。



```javascript
await App.DataModel.Cluster.GetGatherList({
  	condition: {
    	gather: 'test_db_1', 
    },
    mode:'cloud'
});
```
参数描述:

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
condition | gather | string | 否 | 查询的条件
mode |  | string | 否 | cloud ｜ local

---

### 点聚合效果配置
**Title:** 点聚合效果配置

启动点聚合效果

定义点聚合的聚合策略、外观样式以及调用点聚合。支持同时设置多组筛选条件，使多组筛选结果分别进行聚合，并可利用POI、场景特效以及3D文字等覆盖物对每组筛选结果分别设置不同的聚合簇样式以及聚合点样式。并且覆盖物样式参数可设置为自动读取所选择的数据表中指定的字段参数。



```javascript
const opt = {
  openonclick: true,
  algorithm: {
    type: 'squareD',
    parameters: {
      squareD: {
        length: '30'
      }
    }
  },
  filters: {
    attr: [
      {
        queryId: 'AAA',
        gather: 'guangzhou_poi',
        condition: {
          adname: ['白云区']
        },
        calculateCoordZ: {
          coordZRef: 'surface',
          coordZOffset: 40
        },
        aggicon: {
          type: 'Poi',
          poiStyle: {
            markerNormalUrl: 'http://superapi.51hitech.com/doc-static/images/static/range_normal2.png',
            markerActivateUrl: 'http://superapi.51hitech.com/doc-static/images/static/range_normal3.png',
            markerSize: [50, 50],
            labelContent: ['{count}', 'ff0000ff', '16'],
            labelContentOffset: [0, 12],
            labelTop: true
          }
        },
        covering: {
          type: 'Poi',
          poiStyle: {
            markerNormalUrl: 'http://superapi.51aes.com/doc-static/images/static/markerNormal2.png',
            markerActivateUrl: 'http://superapi.51aes.com/doc-static/images/static/markerActive2.png',
            markerSize: [25, 57],
            labelBgImageUrl: 'http://superapi.51aes.com/doc-static/images/static/LabelBg.png',
            labelBgSize: [80, 40],
            labelBgOffset: [12, 50],
            labelContent: ['{name}', '00ff00ff', '12']
          }
        }
      }
    ]
  }
}

await App.DataModel.Cluster.Start(opt);
```
**参数描述:**

参数 | 类型 | 必填 | 默认值 | 备注
--- | --- | --- | --- | ---
openonclick | boolean | 否 | false | 是否开启点击散点
mode | string | 否 | cloud | cloud | local 如果使用的是lite，请使用local
algorithm | type | string | 是 | 无 | 算法选择，squareD 或 grid 或 gridC
parameters | string | 是 | 无 | "squareD": { "length": "50"}, // 方格距离算法，length 方格像素边长(px)或"grid": { "count": "50"}, // grid: 网格算法, count 网格个数或"gridC": {"count": "50"}, // gridC: 网格质心算法, count 网格个数
filters | attr | queryId | string | 是 | 无 | 搜索索引ID（唯一）
gather | string | 是 | 无 | 数据库名
condition | adname | string | 是 | 无 | 索引条件
calculateCoordZ | coordZRef | string | 是 | 无 | CoordZRefType
coordZOffset | number | 是 | 无 | 高度
aggicon | Record&lt;string, any&gt; | 是 | 无 | 聚合点的样式
covering | Record&lt;string, any&gt; | 是 | 无 | 散点的样式返回：

{    success: true, // true or false    message: '',    result: .. // 结果数据}

更新点聚合数据

更新目前仅支持poi中poiStyle样式更新，不支持其他字段更新包括检索条件和高度更新



```javascript
const opt = {
  attr: [
    {
      queryId: 'BBB', //搜索索引ID（唯一）
      //散点样式
      covering: {
        type: 'poi',
         poiStyle: {
            markerNormalUrl: 'http://localhost:8890/apidebug/static/newMarker.png',
            markerActivateUrl: 'http://localhost:8890/apidebug/static/newMarker_active.png',
            markerSize: [100, 150],
            labelBgImageUrl: 'http://superapi.51aes.com/doc-static/images/static/LabelBg.png',
            labelBgSize: [80, 40],
            labelBgOffset: [10, 130],
            labelContent: ['{name}', '00ff00ff', '12'],
            scrollSpeed: 5,
            textBoxWidth: 200
          }
      }
    }
  ]
};

const res = await App.DataModel.Cluster.Modify(opt); // 更新（更新时参数均为Optional）
console.log(res);
```
关闭点聚合效果

```javascript
await App.DataModel.Cluster.End();
```
---

### 周边搜索
**Title:** 周边搜索

点周围的点搜索

自定义数据筛选服务；指定coord、半径范围查询数据信息。



```javascript
await App.DataModel.Cluster.SearchByPoint({
  	filters: {
    	attr: [
           {
              queryId: 'AAA', 
              gather: 'test_deb_1', 
              condition: {
                 grade: ['xxx'] 
              }
          }
        ],
      	selector: {
        	coord: '123.213131,22.2323454',
          	distance: 100
        }
    }
});
```
**参数描述:**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
attr | queryId | string | 是 | 区分查询的唯一ID
gather | string | 是 | 数据库名
condition | Record&lt;string, any&gt; | 否 | 过滤条件
selector | coord | string | 是 | 坐标
distance | number | 是 | 半径

路径周围的点搜索

自定义数据筛选服务；指定coord、距离范围查询数据信息;



```javascript
await App.DataModel.Cluster.SearchByLine({
  	filters: {
    	attr: [
          {queryId: 'AAA', gather: 'test_deb_1', condition: {grade: ['xxx']}}
        ],
      	selector: {
        	coord: ['123.213131,22.2323454', '123.678567, 25.22233333'],
          	distance: 100
        }
    }
});
```
**参数描述:**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
attr | queryId | string | 是 | 区分查询的唯一ID
gather | string | 是 | 数据库名
condition | Record&lt;string, any&gt; | 否 | 过滤条件
selector | coord | Array | 是 | 坐标
distance | number | 是 | 半径

多边形区域内的点搜索

自定义数据筛选服务；指定coord、范围查询数据信息;



```javascript
await App.DataModel.Cluster.SearchByArea({
  	filters: {
    	attr: [
          {queryId: 'AAA', gather: 'test_deb_1', condition: {grade: ['xxx']}}
        ],
      	selector: {
        	coord: ['123.213131,22.2323454', '123.678567, 25.22233333']
        }
    }
});
```
**参数描述:**

参数 | 类型 | 必填 | 备注
--- | --- | --- | ---
attr | queryId | string | 是 | 区分查询的唯一ID
gather | string | 是 | 数据库名
condition | Record&lt;string, any&gt; | 否 | 过滤条件
selector | coord | array | 是 | 坐标

---

## 功能组件

### 环境
**Title:** 环境

场景光照

```javascript
// 获取时间
await App.Environment.GetSkylightTime();

// 设置时间
// 参数1：切换到的时间点；参数2：切换效果的持续时间；参数3：应用实时时间
await App.Environment.SetSkylightTime('12:30', 3, false); 

```
场景天气

```javascript
// 获取天气
await App.Environment.GetSceneWeather();

// 设置天气
// 参数1：切换到的天气；参数2：切换效果的持续时间；参数3：应用实时天气（目前不支持实时天气）
// 参数3设置成true即实时时间，需要有外网才能访问
await App.Environment.SetSceneWeather('Sunny', 3, false);  

```
**参数描述:**

参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
参数1 | String | 是 | Sunny | 晴天
String | 是 | Cloudy | 多云
String | 是 | PartlyCloudy | 少云
String | 是 | Overcast | 阴天
String | 是 | LightRain | 小雨
String | 是 | ModerateRain | 中雨
String | 是 | HeavyRain | 大雨
String | 是 | LightSnow | 小雪
String | 是 | ModerateSnow | 中雪
String | 是 | HeavySnow | 大雪
String | 是 | Foggy | 雾天
String | 是 | Sand | 扬尘
String | 是 | Haze | 雾霾
String | 是 | auto | 实时天气
String | 是 | 自定义 | 自定义天气, 需UE预先定义好天气

场景风格化

```javascript
const style = "comic"; //comic, sketch, dark, ashy, false(关闭)
const res = await App.Scene.SetSceneStyle(style);
```
参数 | 类型 | 必填 | 取值范围 | 备注
--- | --- | --- | --- | ---
style | string | 是 | comic, sketch, dark, ashy, false | comic, sketch, dark, ashy, false(正常模式)



---

### 控件
**Title:** 控件

获取API信息

```javascript
// 获取WdpApi信息
await App.System.GetInfomation();

// 获取行业插件信息
await App.Plugin.Get();

/*
  {
    "success": true,
    "message": "",
    "result": [
      {
        "name": "GisApi",
        "des": "GIS API Plugins",
        "version": "1.1.0"
      },
      {
        "name": "CimApi",
        "des": "CIM API Plugins",
        "version": "1.1.0"
      },
      {
        "name": "IseApi",
        "des": "ISE API Plugins",
        "version": "1.1.0"
      },
      {
        "des": "",
        "name": "BIM/DCP-API",
        "version": "1.6.0"
      }
    ]
  }
*/
```
RTC信息

```javascript
await App.Renderer.GetStats();
```
获取对象的bounding box数据

```javascript
await App.Scene.GetBoundingBox([obj, obj, obj]);
```
小地图

```javascript
const _url = "http://wdpapi.51aes.com/doc-static/images/static/MiniMap/"
const jsondata = {
    "type": "manual",
    "source": {
        "bg": _url + "Minimap.png",  //背景平面图(注: 大小4096x4096 必需)
        "needle": _url + "Minimap_needle.png", //中心指针
        "mask": _url + "Minimap_mask.jpg", //遮罩图(黑白色 必需)
        "frame": _url + "Minimap_outline.png" //外框图
    },
    "mappingAnchors": [ 
       //图片左上角、右下角映射到场景坐标(注: 平面图上方为正北)
        [121.54900666925667, 31.175366234862334],
        [121.42595948541654, 31.068307985569852]
    ],
    "display": {
        "position": [300, 100], //位置(单位:像素; 注:以屏幕分辨率1920 * 1080的左上角为基准点，基准点可按anchors参数调整)
        "size": 300, //大小(单位:像素; 注:以屏幕分辨率1920 * 1080为基准)
        "anchors": "leftTop" // 同时影响位置参考点&屏幕拉伸参考点
        // 拉伸：不同分辨率下，小地图位置会按1920*1080进行短边自适应。在开发和展示的屏幕比例不同时，可选择相应的缩放锚点
        // leftTop, leftMiddle, leftDown
        // middleTop, middleCenter, middleDown
        // rightTop, rightMiddle, rightDown
    }
}

const res = await App.Tools.MiniMap.Start(jsondata);
console.log(res)



//关闭小地图
const res = await App.Tools.MiniMap.End();
console.log(res)

```
![](/profile/upload/2025/12/01/小地图_20251201174003A166.jpg)}]

指南针

```javascript
const jsondata = {
    "source": {
        "bg": "http://wdpapi.51aes.com/doc-static/images/static/compass_bg.png", //指南针背景图
        "needle": "http://wdpapi.51aes.com/doc-static/images/static/compass_needle.png" //中心指针
    },
    "display": {
        "position": [300,100], //位置(单位:像素; 注:以屏幕分辨率1920 * 1080的左上角为基准点，基准点可按anchors参数调整))
        "size": 300, //大小(单位:像素; 注:以屏幕分辨率1920 * 1080为基准)
        "anchors": "leftTop" // 同时影响位置参考点&屏幕拉伸参考点
        // 拉伸：不同分辨率下，指南针位置会按1920*1080进行短边自适应。在开发和展示的屏幕比例不同时，可选择相应的缩放锚点
        // leftTop, leftMiddle, leftDown
        // middleTop, middleCenter, middleDown
        // rightTop, rightMiddle, rightDown
    }
}

const res = await App.Tools.Compass.Start(jsondata);
console.log(res)



//关闭指南针
const res = await App.Tools.Compass.End();
console.log(res)

```
![](/profile/upload/2025/12/01/指南针_20251201174005A167.jpg)}]

---

### 工具
**Title:** 工具

GIS转笛卡尔

```javascript
const coord = [
    [121.478818,31.24251593,94],
    [121.47274158,31.22456944,95],
    [121.48836526,31.22625219,68],
    [121.49542527,31.2341436,58]
  ]

const res = await App.Tools.Coordinate.GISToCartesian(coord);
console.log(res.result.to)
```
笛卡尔转GIS

```javascript
const cartesian = [
    [5000, 5000, 20],
    [50000, 10000, 20],
    [70000, 70000, 20],
    [10000, 70000, 20]
  ]

const res = await App.Tools.Coordinate.CartesianToGIS(cartesian);
console.log(res.result.to)
```
GIS转屏幕坐标

```javascript
const coord = [  //注意: 坐标必须在屏幕区域内
    [121.47274158,31.22456944,95],
    [121.48836526,31.22625219,68],
    [121.49542527,31.2341436,58]
  ]

const res = await App.Tools.Coordinate.GISToScreenPos(coord);
console.log(res.result.to)
```
CAD转换成经纬度

```javascript
// 创建CAD局部坐标
const { result } = await App.Tools.Coordinate.CreateCADGeoRef({
  cadPoints: [
    [1363051.25,1183997.5,0],
    [-258250.23,-495587.8,0]
  ],
  worldPoints: [
    [121.46803088,31.23803171,80],
    [121.49125594,31.22895244,16]
  ]
});
// CAD转经纬度
const geoObj = result.object;
const res = await App.Tools.Coordinate.LocalToGlobalGeoRef(geoObj,
  [
    [1532640.320,1752786.25,0],
    [1363051.225,1183997.35,0],
    [1231995.625,493529.375,0],
    [173426.875,-244088.125,0],
    [-294465.375,-21562.235,0],
    [-1984983.125,-733952.5,0],
    [-1143592.5,-114504.375,0],
    [-5587255.34,747446.875,0],
    [-258250.43,-495587.355,0]
  ]
);
console.log(res.result.to);
```
屏幕坐标转GIS坐标

```javascript
const res = await App.Tools.Picker.PickWorldPointByScreenPos([480, 573]);
console.log(res);
```
坐标几何辅助

```javascript
// 添加坐标点辅助
const coords = [
    [121.48874015,31.23789002,66],
    [121.48598707,31.24150321,1],
    [121.503394,31.24398916,49],
    [121.49355523,31.23633749,38],
    [121.51654214,31.23608135,29],
    [121.4942991,31.23271274,70]
  ]
 // surface:表面; ground:地面; altitude:海拔
  await App.DataModel.Geometry.StartShowCoord(coords, 'surface');

  // 关闭坐标点辅助
  App.DataModel.Geometry.EndShowCoord();
```
转置工具

```javascript
/**
 * @param fromProjection: string (required) 来源坐标系
 * @param toProjection: string (required) 目标坐标系
 * @param coordinates: Array (required) 坐标数组
 */
const res = await App.Tools.Coordinate.Exchange('+proj=longlat +datum=WGS84 +no_defs', '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs', [[120.433311998519, 5.73111656594612, 10], [120.433311998519, 5.73111656594612, 5]]);
console.log(res);
  
```
取点工具

```javascript
// 开启取点工具
// 参数一: true:显示坐标信息; false:隐藏坐标信息
// 参数二: true:显示取点标记; false:隐藏取点标记
// 参数三: surface:表面; ground:地面; altitude:海拔
await App.Tools.PickerPoint.StartPickPoint(true, true, "surface");

// 获取坐标点
// 参数: surface:表面; ground:地面; altitude:海拔
await App.Tools.PickerPoint.GetPickedPoints("surface");

// 关闭取点工具
await App.Tools.PickerPoint.EndPickPoint();

```
测量工具

```javascript
// 开启测量工具
await App.Tools.Measure.Start();

// 关闭测量工具
await App.Tools.Measure.End();

```
剖切体工具

```javascript
// 开启剖切体  
const res = await App.Scene.Section.Start({
      "coordZRef": "surface", //surface:表面;ground:地面;altitude:海拔
      "strokeColor": "56a8ff",//被切物体描边颜色(HEX颜色值)
      "strokeWeight": 0.8, //被切物体描边宽度[0~1]
      "invert": false, //被切物体(true:内部可见; false:外部可见)
      "transform": {
        "location": [121.51117039,31.2503413,30], //剖切体底部中心对应的位置
        "rotator": {
          "pitch": 0, //俯仰角, 参考(-180~180)
          "yaw": 30, //偏航角, 参考(0正北, -180~180)
          "roll": 0 //翻滚角, 参考(-180~180)
        },
        "scale3d": [1, 1, 1]
      }
  })
```
```javascript
//关闭剖切体
const res = await App.Scene.Section.End();
```
![](/profile/upload/2025/12/01/剖切体工具_20251201174253A168.webp)}]

工程定制API调用

```javascript
const jsondata = {
  "apiClassName": "WdpCameraControlAPI",
  "apiFuncName": "GetCameraInfo",
  "args": {
      // json数据
   }
}
const res = await App.Customize.RunCustomizeApi(jsondata);
console.log(res);
```
获取场景快照

```javascript
/**
* @param {number[]} resolution - 图像的分辨率,以 [宽度, 高度] 的形式表示.
* @param {number} quality - 快照的画质,取值范围为 [0, 1], 0 表示最低质量, 1 表示最高质量.
*/
await App.Renderer.GetSnapshot([1920, 1080], 0.8);
```
RGBA转HEXA

```javascript
/**
* RGBA对象转16进制颜色字符串
* @param {string} decimal - RGBA: A的取值范围0~1
* @param {string} integer - RGBA: A的取值范围0~255
*/

const color = {
  r: 100,
  g: 50,
  b: 200,
  a: 1
}

const res = await App.Tools.Color.RgbaToHexa(color, 'decimal');
```
HEXA转RGBA

```javascript
/**
* 16进制颜色字符串转RGBA对象
* @param {string} decimal - RGBA: A的取值范围0~1
* @param {string} integer - RGBA: A的取值范围0~255
*/

const res = await App.Tools.Color.HexaToRgba('f38929ff', 'decimal');
```
可显示中国地图

```javascript
// 切换中国地图
/**
 * @param bChinaMap: boolean 是否切换中国地图
 */
const res = await App.Tools.ChinaMap.Switch({bChinaMap: true});
console.log(res);
```
```javascript
// 高亮省份
/**
 * @param provinceCode: string 省份代号（SH, BJ, ...）
 * @param bHighlight: boolean 是否高亮
 * @param color: string 高亮颜色
 */
const res = await App.Tools.ChinaMap.HighlightProvince({
  provinceCode: "SH",
  bHighlight: true,
  color: 'FF0000'
});
console.log(res);

// province
/*
BJ—北京市；SH—上海市；TJ—天津市 ；CQ—重庆市；HE—河北省；SX—山西省；NM—内蒙古自治区；LN—辽宁省；JL—吉林省；HL—黑龙江省；
JS—江苏省；ZJ—浙江省；AH—安徽省；FJ—福建省；JX—江西省；SD—山东省；HA—河南省；HB—湖北省；HN—湖南省；GD—广东省；GX—广西壮族自治区；
HI—海南省；SC—四川省；GZ—贵州省；YN—云南省；XZ—西藏自治区；SN—陕西省；GS—甘肃省；QH—青海省；NX—宁夏回族自治区；XJ—新疆维吾尔族自治区；
TW—台湾省；HK-香港；MO-澳门
*/
```
```javascript
// 显隐省份名字
/**
 * @param provinceCode: string 省份代号（SH, BJ, ...）
 * @param bVisible: boolean 是否显示
 * @param bVisible: boolean 是否显示
 */
const res = await App.Tools.ChinaMap.SetProvinceNameVisibility({
  provinceCode: "SH",
  bVisible: true,
  color: 'FF0000'
});
console.log(res);
```
```javascript
// 创建迁徙图
const res = await App.Tools.ChinaMap.CreateMigration({
  migrationId: "test-id", // 迁徙图ID
  type: 1, // 1 ~ 5表示迁徙类型，也即抛物线类型
  hubProvinceCode: "BJ", // 迁徙中心，省份代号
  bGathered: false, // 中心聚集，true表示周围向中心迁徙，false表示从中心迁徙到周围
  peripheralProvincesInfo: [ // 周围省份迁移信息
    {
      provinceCode:"SH", // 省份代号（SH, BJ, ...）
      markSize:5, // 迁徙目标点的粒子效果大小
      markColor:"FF0000", // 迁徙目标点的粒子效果颜色
      lineWidth:250, // 迁徙线路的大小
      lineColor:"00FF00", // 迁徙线路的颜色
      curvature:-1 // 曲率：-1~1， 越小抛物线越水平
      
    },
    {
      provinceCode:"HL",
      markSize:5,
      markColor:"FF0000",
      lineWidth:250,
      lineColor:"00FF00",
      curvature:-1
      
    },				
    {
      provinceCode:"MO",
      markSize:5,
      markColor:"FF0000",
      lineWidth:250,
      lineColor:"00FF00",
      curvature:-1
      
    },
    {
      provinceCode:"XZ",
      markSize:5,
      markColor:"FF0000",
      lineWidth:250,
      lineColor:"00FF00",
      curvature:-1
      
    }		
  ]
});
console.log(res);
```
矢量工具

```javascript
// 开启矢量工具
  await App.Scene.RunAction('EditShapeAction', {
    Eid: entity.eid
  });
  await App.Renderer.RegisterSceneEvent([
    {
      name: 'EditShapeEvent',
      func: async (res) => {
        console.log("EditShapeEvent", res);
        cache.set('EditShapeEventCache', res.result.editPoints?.filter(v => v.state === 'Edit'));
      }
    }
  ]);
  /**
  {
  "editPoints":
  [
  {"pointIndex":0,"point":[25046.149130655285,-8652.5433520855458,-2.6794229764726483],"state":"Edit","attribute":{}},
  {"pointIndex":1,"point":[25048.429555139999,-8661.3853958300006,-3.7411248399999999],"state":"None","attribute":{}},
  {"pointIndex":2,"point":[25047.033014739998,-8660.5509877599998,-3.7646360600000004],"state":"None","attribute":{}}],
  "bClosed":false,
  "EntityType":"BP_PathEntity_C"
  }
  */

// 增删矢量点位
await App.Setting.SetEditShapeActionSetting({
  lineWidth: 1,
  editMode: 'InsertOrDelete'
});

// 移除矢量点位
await App.Tools.Shape.UpdateShapePoints(Obj, "Remove");   // Obj为定义的矢量点位对象

// 关闭矢量工具
await App.Scene.EndAction();
```
---

### 设置
**Title:** 设置

设置日志级别

```javascript
App.Debug.SetLogMode("high");  // none, normal, high,none:不打印日志
```
设置键盘

```javascript
// 键盘事件是否开启（默认关闭）
App.System.SetDefaultKeyboard(false);  // true, false
```
```javascript
// 当键盘事件被启用时，是否开启浏览器的 F1 - F12 功能键（默认关闭）
App.System.SetDefaultBrowserFunctionKeyboard(false);  // true, false
```
设置渲染模式

```javascript
await App.Renderer.SetRendererMode('fixed', [1920, 1080]);
```
参数 | 类型 | 是否必填 | 默认值 | 备注
--- | --- | --- | --- | ---
mode | string | 是 | 无 | fixed:固定full:自动适配
resolution | string | 否 | 无 | 最大[8192,8192],具体还要根据机器的分辨率

设置帧率

```javascript
await App.Renderer.SetFrameRateLimit(40); //范围 [30~60]
```
设置码率

```javascript
await App.Renderer.SetBitrate(10); //范围 [5~15]
```
设置接口请求超时时长

```javascript
// 用于大数据api接口调用
await App.System.SetTimeoutTime(30000); //30s; 默认: 10s
```
设置场景音效

```javascript
await App.Setting.SetAudioVolume(50); //范围 [0~100]
```
设置场景精度

```javascript
//场景精度默认100
const res = await App.Setting.SetScreenPercentage(100);
console.log(res);
```
获取场景精度

```javascript
const res = await App.Setting.GetScreenPercentage();
console.log(res);
```
---

## Summary

This document contains 66 API interface descriptions across 10 categories.

> Generated at: 2026-02-27 19:27:51

