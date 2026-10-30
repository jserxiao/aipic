# AI 图片生成小程序 — 项目设计文档

## 一、项目概述

### 1.1 项目名称
**AIPic** — AI 图片生成工具小程序

### 1.2 项目简介
一款基于 Taro + React 开发的跨平台小程序，用户输入文字描述，自定义图片比例与分辨率，通过 AI 模型生成图片。采用黑白简约设计风格，界面干净、交互简洁。

### 1.3 技术栈
| 类别 | 技术选型 |
|------|---------|
| 框架 | Taro 4.x + React 18 |
| 语言 | TypeScript |
| 样式 | SCSS + CSS 变量（主题色：黑白） |
| 状态管理 | Zustand |
| 网络 | Taro.request（当前 Mock，后续对接真实 API） |
| 构建工具 | Webpack5（Taro 内置） |
| 目标平台 | 微信小程序（主），H5（兼容） |

---

## 二、功能需求

### 2.1 页面结构

```
小程序
├── 生成页面 (pages/generate/index)  — TabBar 页
└── 我的页面 (pages/mine/index)      — TabBar 页
```

### 2.2 生成页面 (Generate)

| 区域 | 内容 |
|------|------|
| **顶部信息栏** | 消耗积分提示（如「生成一张消耗 10 积分」）、今日累计生成张数 / 最大生成张数（30 张/天） |
| **中部表单区** | 文字描述输入框（Textarea，支持多行）、图片比例选择（1:1 / 3:4 / 4:3 / 16:9 / 9:16）、分辨率选择（512×512 / 768×768 / 1024×1024 / 自定义）、参考图上传（可选，最多 1 张） |
| **底部操作区** | 生成按钮（固定底部，黑色背景白色文字） |

**交互逻辑：**
1. 用户输入文字描述（必填，最少 2 字）
2. 选择图片比例（默认 1:1）
3. 选择分辨率（默认 1024×1024）
4. 可选：上传参考图片
5. 点击「生成」→ 校验今日剩余次数 → 扣除积分 → 调用生成接口 → 展示生成结果
6. 生成中显示 Loading 动画
7. 生成完成后展示图片，支持保存到相册 / 分享

### 2.3 我的页面 (Mine)

| 区域 | 内容 |
|------|------|
| **顶部用户信息** | 头像、随机生成的 ID（如 `AP_8xK2m9`）、VIP 信息（普通会员 / VIP 会员 + 到期时间） |
| **中部功能列表** | 分享小程序、历史记录（跳转历史页面） |
| **底部信息** | 小程序版本号（如 v1.0.0）、Copyright 信息 |

**交互逻辑：**
- 点击头像可更换头像
- 点击「分享小程序」调起微信分享
- 点击「历史记录」跳转到历史记录页面（展示已生成图片列表）

---

## 三、页面设计稿（线框图）

### 3.1 生成页面

```
┌─────────────────────────────┐
│  ⬡ 消耗 10 积分/张           │  ← 顶部信息栏
│  今日已生成 5/30 张           │
├─────────────────────────────┤
│                             │
│  📝 描述你想生成的图片...     │  ← 文字描述输入框
│  ┌─────────────────────┐   │
│  │                     │   │
│  │  (Textarea 多行)    │   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  📐 图片比例                 │
│  ┌────┐ ┌────┐ ┌────┐      │  ← 比例选择按钮组
│  │1:1 │ │3:4 │ │4:3 │      │
│  └────┘ └────┘ └────┘      │
│  ┌────┐ ┌────┐              │
│  │16:9│ │9:16│              │
│  └────┘ └────┘              │
│                             │
│  📏 分辨率                   │
│  ┌────────────────────────┐│
│  │ 1024 × 1024        ▼  ││  ← 分辨率下拉/选择
│  └────────────────────────┘│
│                             │
│  🖼 参考图（可选）            │
│  ┌──────┐                  │
│  │  +   │  上传参考图        │  ← 图片上传
│  └──────┘                  │
│                             │
├─────────────────────────────┤
│  ████████  生 成  ████████  │  ← 底部生成按钮（黑底白字）
└─────────────────────────────┘
```

### 3.2 我的页面

```
┌─────────────────────────────┐
│                             │
│       ┌──────────┐          │
│       │          │          │  ← 用户头像
│       │  Avatar  │          │
│       │          │          │
│       └──────────┘          │
│                             │
│       ID: AP_8xK2m9         │  ← 随机 ID
│       🏅 VIP 会员            │  ← VIP 信息
│       到期：2027-01-01       │
│                             │
├─────────────────────────────┤
│                             │
│  📤  分享小程序          >   │  ← 功能列表项
│  ├─────────────────────────┤
│  🕐  历史记录            >   │  ← 功能列表项
│                             │
├─────────────────────────────┤
│                             │
│                             │
│       v1.0.0                │  ← 版本号
│   © 2026 AIPic.             │  ← Copyright
│   All rights reserved.       │
│                             │
└─────────────────────────────┘
```

---

## 四、设计规范

### 4.1 色彩系统（黑白简约风格）

| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--color-primary` | `#000000` | 主色调：按钮、选中态、强调文字 |
| `--color-primary-light` | `#1A1A1A` | 悬浮态 |
| `--color-bg` | `#FFFFFF` | 页面背景 |
| `--color-bg-secondary` | `#F5F5F5` | 卡片背景、输入框背景 |
| `--color-text-primary` | `#000000` | 主文字 |
| `--color-text-secondary` | `#666666` | 辅助文字 |
| `--color-text-placeholder` | `#999999` | 占位符文字 |
| `--color-border` | `#E5E5E5` | 分割线、边框 |
| `--color-danger` | `#FF3B30` | 错误提示（仅用于错误状态） |

### 4.2 字体规范

| 场景 | 字号 | 字重 |
|------|------|------|
| 页面标题 | 36rpx | 600 |
| 卡片标题 | 32rpx | 500 |
| 正文 | 28rpx | 400 |
| 辅助文字 | 24rpx | 400 |
| 按钮文字 | 32rpx | 600 |

### 4.3 间距规范

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--spacing-xs` | 8rpx | 极小间距 |
| `--spacing-sm` | 16rpx | 小间距 |
| `--spacing-md` | 24rpx | 中等间距 |
| `--spacing-lg` | 32rpx | 大间距 |
| `--spacing-xl` | 48rpx | 超大间距 |

### 4.4 圆角规范

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--radius-sm` | 8rpx | 小圆角（标签等） |
| `--radius-md` | 16rpx | 中圆角（按钮、卡片） |
| `--radius-lg` | 24rpx | 大圆角（弹窗等） |
| `--radius-full` | 999rpx | 全圆角（头像等） |

---

## 五、项目目录结构

```
aipic/
├── project.config.json         # Taro 项目配置
├── tsconfig.json               # TypeScript 配置
├── package.json
├── PROJECT.md                  # 本文档
│
├── config/                     # Taro 构建配置
│   ├── index.ts
│   ├── dev.ts
│   └── prod.ts
│
├── src/
│   ├── app.ts                  # 应用入口
│   ├── app.scss                # 全局样式
│   ├── app.config.ts           # 应用配置（TabBar 等）
│   ├── index.html              # H5 模板
│   │
│   ├── pages/
│   │   ├── generate/           # 生成页面
│   │   │   ├── index.tsx
│   │   │   ├── index.config.ts
│   │   │   └── index.scss
│   │   │
│   │   ├── mine/               # 我的页面
│   │   │   ├── index.tsx
│   │   │   ├── index.config.ts
│   │   │   └── index.scss
│   │   │
│   │   └── history/            # 历史记录页面
│   │       ├── index.tsx
│   │       ├── index.config.ts
│   │       └── index.scss
│   │
│   ├── components/             # 公共组件
│   │   ├── InfoBar/            # 顶部信息栏组件
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   ├── RatioSelector/      # 比例选择器
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   ├── ResolutionPicker/   # 分辨率选择器
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   ├── ImageUploader/      # 图片上传组件
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   ├── ResultModal/        # 生成结果弹窗
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   └── LoadingButton/       # 加载状态按钮
│   │       ├── index.tsx
│   │       └── index.scss
│   │
│   ├── store/                  # Zustand 状态管理
│   │   ├── userStore.ts        # 用户信息 & 积分
│   │   └── generateStore.ts    # 生成配置 & 历史记录
│   │
│   ├── services/               # API 服务层
│   │   ├── request.ts          # 网络请求封装
│   │   ├── generate.ts         # 生成相关接口（当前 Mock）
│   │   └── user.ts             # 用户相关接口（当前 Mock）
│   │
│   ├── constants/              # 常量定义
│   │   ├── config.ts           # 全局配置（最大生成张数等）
│   │   └── theme.scss          # 主题变量（色彩/间距/圆角）
│   │
│   ├── utils/                  # 工具函数
│   │   ├── id.ts               # 随机 ID 生成
│   │   ├── storage.ts          # 本地存储封装
│   │   └── format.ts           # 格式化工具
│   │
│   ├── types/                  # TypeScript 类型
│   │   ├── generate.ts         # 生成相关类型
│   │   └── user.ts             # 用户相关类型
│   │
│   └── assets/                 # 静态资源
│       └── icons/              # 图标资源（SVG）
│
└── mock/                       # Mock 数据
    ├── generate.ts             # 生成结果 Mock
    └── user.ts                 # 用户信息 Mock
```

---

## 六、数据模型

### 6.1 用户信息 (User)

```typescript
interface User {
  userId: string;              // 用户唯一标识
  randomId: string;            // 随机展示 ID，如 "AP_8xK2m9"
  avatar: string;              // 头像 URL
  isVip: boolean;              // 是否为 VIP
  vipLevel: 'normal' | 'vip';  // 会员等级
  vipExpireAt: string | null;  // VIP 到期时间（ISO 字符串）
  credits: number;             // 剩余积分
}
```

### 6.2 生成配置 (GenerateConfig)

```typescript
type RatioType = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
type ResolutionType = '512x512' | '768x768' | '1024x1024' | 'custom';

interface GenerateConfig {
  prompt: string;              // 文字描述
  ratio: RatioType;            // 图片比例
  resolution: ResolutionType;  // 分辨率
  customWidth?: number;        // 自定义宽（resolution 为 custom 时）
  customHeight?: number;       // 自定义高
  referenceImage?: string;     // 参考图 URL（可选）
}
```

### 6.3 生成记录 (GenerateRecord)

```typescript
interface GenerateRecord {
  id: string;                  // 记录 ID
  prompt: string;               // 描述文字
  ratio: RatioType;             // 比例
  resolution: string;            // 分辨率
  imageUrl: string;             // 生成图片 URL
  status: 'pending' | 'success' | 'failed'; // 生成状态
  createdAt: string;            // 生成时间（ISO 字符串）
  creditsCost: number;          // 消耗积分
}
```

### 6.4 全局常量

```typescript
const APP_CONFIG = {
  MAX_DAILY_GENERATE: 30,      // 每日最大生成张数
  CREDITS_PER_GENERATE: 10,    // 每次生成消耗积分
  APP_VERSION: '1.0.0',       // 小程序版本
  MAX_PROMPT_LENGTH: 500,     // 描述最大长度
  MAX_REFERENCE_IMAGES: 1,    // 最大参考图数量
};
```

---

## 七、实现计划

### 第一阶段：项目初始化（预计 0.5 天）

1. **初始化 Taro 项目**
   - 使用 `taro init` 创建 TypeScript + React 模板
   - 配置 `config/` 下的开发与生产环境
   - 配置 TabBar（生成 / 我的）

2. **全局样式与主题**
   - 创建 `constants/theme.scss`，定义色彩、间距、圆角变量
   - 编写 `app.scss` 全局基础样式
   - 配置 TabBar 黑白简约图标

3. **状态管理初始化**
   - 安装 Zustand
   - 创建 `userStore`（用户信息、积分）和 `generateStore`（生成配置、今日次数、历史记录）

### 第二阶段：生成页面（预计 1.5 天）

1. **顶部信息栏组件 `InfoBar`**
   - 显示消耗积分提示
   - 显示今日已生成张数 / 最大 30 张
   - 从 `generateStore` 获取今日次数数据

2. **文字描述输入区**
   - Textarea 组件，支持多行
   - 字符计数（最大 500 字）
   - 实时校验最少 2 字

3. **图片比例选择器 `RatioSelector`**
   - 5 种比例按钮：1:1 / 3:4 / 4:3 / 16:9 / 9:16
   - 选中态：黑色边框 + 深色背景
   - 未选中态：浅灰边框 + 白色背景
   - 点击切换，写入 `generateStore`

4. **分辨率选择器 `ResolutionPicker`**
   - 预设：512×512 / 768×768 / 1024×1024
   - 支持自定义输入宽高
   - 与比例联动（选择比例后自动推荐分辨率）

5. **图片上传组件 `ImageUploader`**
   - 调用 `Taro.chooseImage` 选图
   - 显示已上传图片预览
   - 支持删除已选图片
   - 限制最多 1 张参考图

6. **生成按钮**
   - 固定底部，黑色背景白色文字
   - 点击时表单校验 → 次数校验 → 积分校验 → 调用接口
   - 生成中显示 Loading 状态，禁止重复点击

7. **生成结果展示 `ResultModal`**
   - 全屏 / 半屏弹窗展示生成图片
   - 支持保存到相册（`Taro.saveImageToPhotosAlbum`）
   - 支持分享
   - 失败时展示错误信息与重试按钮

### 第三阶段：我的页面（预计 1 天）

1. **用户信息卡片**
   - 头像展示（点击可更换）
   - 随机 ID 展示（`utils/id.ts` 生成，格式 `AP_` + 6 位随机字符）
   - VIP 信息展示：
     - 非VIP：显示「普通会员」
     - VIP：显示「VIP 会员」+ 到期时间

2. **功能列表**
   - 「分享小程序」：配置 `onShareAppMessage`
   - 「历史记录」：跳转到 `pages/history/`

3. **历史记录页面**
   - 列表展示已生成图片（缩略图 + 描述 + 时间）
   - 点击查看大图
   - 支持长按删除

4. **底部信息**
   - 版本号 `v1.0.0`
   - Copyright `© 2026 AIPic. All rights reserved.`

### 第四阶段：Mock 数据与 API 层（预计 0.5 天）

1. **用户 Mock 数据**
   ```typescript
   // mock/user.ts
   export const mockUser: User = {
     userId: 'u_001',
     randomId: generateRandomId(),
     avatar: '/assets/icons/default-avatar.png',
     isVip: true,
     vipLevel: 'vip',
     vipExpireAt: '2027-01-01T00:00:00.000Z',
     credits: 1000,
   };
   ```

2. **生成接口 Mock**
   ```typescript
   // mock/generate.ts
   export function mockGenerate(config: GenerateConfig): Promise<GenerateRecord> {
     return new Promise((resolve) => {
       setTimeout(() => {
         resolve({
           id: Date.now().toString(),
           prompt: config.prompt,
           ratio: config.ratio,
           resolution: config.resolution,
           imageUrl: 'https://placehold.co/1024x1024?text=AI+Generated',
           status: 'success',
           createdAt: new Date().toISOString(),
           creditsCost: 10,
         });
       }, 2000); // 模拟 2 秒生成时间
     });
   }
   ```

3. **请求层封装**
   - `services/request.ts` 统一封装 `Taro.request`
   - `services/generate.ts` 调用 Mock，后续切换为真实 API 仅改此文件
   - `services/user.ts` 同理

### 第五阶段：优化与测试（预计 1 天）

1. **本地存储**
   - 用户信息持久化（`Taro.setStorageSync`）
   - 今日生成次数按日期记录（跨天重置）
   - 历史记录本地缓存

2. **交互优化**
   - 生成按钮防抖
   - 页面过渡动画
   - 空状态展示（无历史记录时的占位图）

3. **权限处理**
   - 保存到相册的权限申请与拒绝处理
   - 图片上传的权限处理

4. **测试验证**
   - 各比例/分辨率组合测试
   - 网络异常处理
   - 积分不足、次数用尽的提示

---

## 八、TabBar 配置

```typescript
// src/app.config.ts
export default {
  pages: [
    'pages/generate/index',
    'pages/mine/index',
    'pages/history/index',
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#000000',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/generate/index',
        text: '生成',
        iconPath: 'assets/icons/generate.png',
        selectedIconPath: 'assets/icons/generate-active.png',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/icons/mine.png',
        selectedIconPath: 'assets/icons/mine-active.png',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: 'AIPic',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
};
```

> **TabBar 图标说明：** 生成页面使用「闪电/魔法棒」图标，我的页面使用「用户」图标。未选中为灰色 (#999)，选中为黑色 (#000)，均为 81×81px PNG。

---

## 九、关键交互流程

### 9.1 图片生成流程

```
用户点击「生成」
    │
    ▼
校验文字描述（≥2字）──失败──→ 提示「请输入至少2个字的描述」
    │
    ▼ (通过)
校验今日生成次数 < 30 ──失败──→ 提示「今日生成次数已达上限，明天再试」
    │
    ▼ (通过)
校验积分 ≥ 10 ──失败──→ 提示「积分不足」
    │
    ▼ (通过)
按钮进入 Loading 状态，禁用点击
    │
    ▼
调用 generate API (Mock / 真实)
    │
    ├──成功──→ 扣除积分、今日次数 +1、存入历史记录 → 展示结果弹窗
    │
    └──失败──→ 提示错误信息，按钮恢复可点击，积分不扣除
```

### 9.2 页面间数据流

```
                    ┌──────────────┐
                    │  userStore   │  (全局用户信息 + 积分)
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        生成页面        我的页面      历史记录页面
              │            │            │
              ▼            │            │
    ┌──────────────────┐  │            │
    │ generateStore    │  │            │
    │ - config         │  │            │
    │ - todayCount     │  │            │
    │ - history[]      │←─┴────────────┘
    └──────────────────┘
```

---

## 十、后续扩展计划

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 对接真实 AI 生成 API | 替换 Mock，接入文生图模型 |
| P0 | 用户登录体系 | 微信授权登录 |
| P1 | 积分充值系统 | 微信支付接入 |
| P1 | VIP 订阅系统 | 月卡/季卡/年卡 |
| P2 | 多图生成 | 支持一次生成 4 张图片 |
| P2 | 图生图模式 | 参考图 + 文字描述生成 |
| P2 | 社区分享 | 生成结果分享到社区 |
| P3 | 更多风格选择 | 油画、水彩、动漫等风格预设 |
| P3 | 历史记录云同步 | 登录后同步本地记录到云端 |

---

## 十一、开发环境与工具

| 工具 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | ≥ 18.x | 运行环境 |
| Taro CLI | 4.x | 项目构建 |
| 微信开发者工具 | 最新稳定版 | 小程序预览调试 |
| VS Code | 最新版 | 代码编辑器 |

### 环境搭建步骤

```bash
# 1. 安装 Taro CLI
npm install -g @tarojs/cli

# 2. 初始化项目
taro init aipic --template react-ts

# 3. 安装依赖
cd aipic
npm install

# 4. 安装状态管理
npm install zustand

# 5. 运行开发（微信小程序）
npm run dev:weapp

# 6. 运行开发（H5）
npm run dev:h5
```

---

*文档版本：v1.0.0 | 最后更新：2026-10-30*
