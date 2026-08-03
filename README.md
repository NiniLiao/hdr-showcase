# HDR Inc. — Infrastructure & Engineering Showcase

Vue 3 + TypeScript + Vite 前端，搭配 Vercel Serverless Functions 後端。桌機與手機共用同一套元件，差異由斷點與 `matchMedia` 控制。

## 快速開始

```bash
npm install
npm run dev          # http://localhost:5173，API 由 Vite middleware 提供
```

若要跑真正的 Serverless runtime：

```bash
npm i -g vercel
vercel dev
```

其他指令：

```bash
npm run build        # vue-tsc 型別檢查 + vite build → dist/
npm run preview      # 預覽 build 產物（不含 API）
npm run typecheck
```

## 部署到 Vercel

```bash
vercel            # 預覽環境
vercel --prod     # 正式環境
```

或直接把 repo 連到 Vercel — `vercel.json` 已指定 framework、build command、outputDirectory 與 `api/**/*.ts` 的 runtime，不需要額外設定。沒有任何環境變數是必填的。

## 專案結構

```
api/
  _lib/
    types.ts       共用型別（前端透過 src/types 再匯出）
    data.ts        服務、案例、統計的種子資料
    handlers.ts    純函式 handler（回傳 { status, body }）
  services/
    index.ts       GET  /api/services?q=
    [slug].ts      GET  /api/services/:slug
  stats.ts         GET  /api/stats
  contact.ts       POST /api/contact
src/
  api/client.ts            typed fetch wrapper
  stores/services.ts       Pinia：篩選、詳情快取、prefetch
  composables/
    useMediaQuery.ts       斷點偵測（含 onScopeDispose 清理）
    useScrollLock.ts       iOS Safari 相容的背景鎖捲
  utils/discipline.ts      四個領域的色彩對應
  components/
    TheHeader.vue          導覽 + 手機選單
    HeroSection.vue        英雄區與橋樑立面線稿
    ServiceFilter.vue      橫向 scroll-snap 篩選列
    ServiceCard.vue        服務卡
    ServiceDirectory.vue   服務目錄（TransitionGroup FLIP）
    FeaturedProjects.vue   代表案例列表
    ServiceDetail.vue      桌機 modal / 手機 bottom sheet
    ContactPortal.vue      聯絡表單與回執
    TheFooter.vue
  styles/
    tokens.css     設計 token
    base.css       reset 與共用 primitive
```

`api/_lib/handlers.ts` 是純函式，同時被兩邊使用：正式環境由 `api/**` 的 Vercel function 呼叫，本機 `npm run dev` 則由 `vite.config.ts` 裡的 `devApi()` middleware 呼叫。兩邊行為一致，不需要 mock server。

## API

| Method | Path                   | 說明                                       |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/api/services`        | 服務摘要列表，可用 `?q=` 做關鍵字過濾      |
| GET    | `/api/services/:slug`  | 單一服務完整資料，含 specs 與 case studies |
| GET    | `/api/stats`           | 首頁 title block 的統計數字                |
| POST   | `/api/contact`         | 送出聯絡表單，回傳 reference / office / respondBy |

`POST /api/contact` 的驗證規則：姓名必填、email 需符合格式、訊息至少 12 字元。錯誤回 `400` 與可直接顯示的 `error` 字串。

## RWD 策略

| 斷點          | 服務目錄 | 詳情          | 導覽       |
| ------------- | -------- | ------------- | ---------- |
| `< 40rem`     | 單欄     | bottom sheet  | 漢堡選單   |
| `40–64rem`    | 兩欄     | bottom sheet（`< 48rem`）/ modal | 依 `48rem` 切換 |
| `≥ 64rem`     | 四欄     | 置中 modal    | 水平導覽   |

## 實作細節

- 詳情用原生 `<dialog>` + `showModal()`，focus trap、ESC 關閉、`::backdrop` 都由瀏覽器處理。
- 手機 bottom sheet 的下拉關閉走 Pointer Events，`touch-action: none` 只加在 grabber 上，內容區仍可正常捲動；下拉超過面板高度 28% 或速度超過閾值即關閉。
- `useScrollLock` 以 `position: fixed` + 還原 `scrollY` 處理 iOS Safari 忽略 `overflow: hidden` 的問題。
- 卡片 hover / focus / touchstart 會 prefetch 詳情，開啟時多半不會看到 loading。
- 篩選切換用 `TransitionGroup` 的 FLIP，`.cards-leave-active` 設 `position: absolute` 讓離場元素不佔位。
- 英雄區的橋樑立面是 inline SVG，用 `stroke-dashoffset` 依序描繪；`prefers-reduced-motion` 下直接顯示完成狀態。
- 底部固定元素都帶 `env(safe-area-inset-bottom)`。
- 所有互動元素保留可見的 `:focus-visible` 樣式。

## 換成真實資料

`api/_lib/data.ts` 是唯一的資料來源。接資料庫時只要把 `findService` / `services` / `stats` 換成 DB 查詢，`handlers.ts` 與前端都不用動。
