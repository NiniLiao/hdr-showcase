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
npm test             # Vitest 一次性執行
npm run test:watch   # Vitest watch 模式
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
    types.ts       共用型別、語系判斷（前端透過 src/types 再匯出）
    data.ts        雙語種子資料（en / zh-TW）
    localize.ts    把雙語來源攤平成單一語系的回應
    handlers.ts    純函式 handler（回傳 { status, body }）
    *.spec.ts      handler 與語系判斷的單元測試
  services/
    index.ts       GET  /api/services?q=
    [slug].ts      GET  /api/services/:slug
  stats.ts         GET  /api/stats
  contact.ts       POST /api/contact
src/
  api/client.ts            typed fetch wrapper（自動帶入 ?lang=）
  i18n/index.ts            vue-i18n 設定與 en / zh-TW 介面字串
  stores/services.ts       Pinia：篩選、詳情快取、prefetch、語系切換
  test/helpers.ts          測試用 fixture、fetch stub、掛載工具
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
    *.spec.ts              元件測試
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

所有 GET endpoint 都接受 `?lang=en|zh-TW`；沒帶參數時改看 `Accept-Language`，再沒有就回退英文。回應一律加上 `Vary: Accept-Language`，避免 CDN 把某個語系的結果快取給另一個語系。

`POST /api/contact` 的驗證規則：姓名必填、email 需符合格式、訊息長度英文至少 12 字元、中文至少 6 字元。錯誤回 `400`，`error` 字串會依 body 裡的 `locale` 回對應語言，前端拿到就能直接顯示。

## i18n

介面字串走 `vue-i18n`（Composition API 模式，`legacy: false`），內容資料則由後端依語系回傳——`api/_lib/data.ts` 的每個文字欄位都是 `{ en, 'zh-TW' }`，`localize.ts` 在回應前攤平成純字串。回應 shape 不變，前端型別不用為了多語系加分支。

語系判斷順序：`localStorage` → `navigator.language` → 英文。切換時 `applyLocale()` 會同步更新 `<html lang>` 與 `localStorage`，`App.vue` 監聽 locale 變化並呼叫 `store.switchLocale()`——詳情快取是語系相關的，切語系時會整批清掉重抓。

新增語系的步驟：在 `api/_lib/types.ts` 的 `LOCALES` 加上代碼，TypeScript 會把 `data.ts` 裡每一個缺少翻譯的欄位標成錯誤，照著補完即可。

## 測試

```bash
npm test
```

69 個測試，7 個檔案：

| 檔案 | 覆蓋範圍 |
| ---- | -------- |
| `api/_lib/types.spec.ts` | `resolveLocale` 的優先序：query > Accept-Language > 預設，含 `zh-Hant-TW` 這類區域標籤的收斂 |
| `api/_lib/handlers.spec.ts` | 列表過濾、summary 不外洩重欄位、404 訊息、表單驗證與辦公室路由，兩種語系都驗 |
| `src/stores/services.spec.ts` | 載入狀態機、篩選不重抓、詳情快取只打一次 API、切語系清快取、prefetch 失敗要安靜 |
| `src/components/ServiceCard.spec.ts` | 渲染、`aria-label`、`open` / `prefetch` 事件 payload |
| `src/components/ServiceFilter.spec.ts` | chip 數量、`aria-pressed` 只有一個、`change` 事件、中英切換 |
| `src/components/ServiceDetail.spec.ts` | 桌機 modal 與手機 bottom sheet 兩種型態，含下拉手勢的四種結果 |
| `src/components/ContactPortal.spec.ts` | 表單提交全流程：payload、送出中、成功回執、錯誤、重送、重置 |

`src/test/helpers.ts` 提供 fixture 與 fetch stub。stub 會記錄每一次請求的 URL 與 request body，所以快取、`?lang=`、表單送出的內容都是直接對 call list 斷言，而不是靠 mock 呼叫次數猜。

`src/test/setup.ts` 補上 jsdom 缺的三樣東西：`<dialog>` 的 `showModal` / `close`、pointer capture、`window.scrollTo`，另外提供 `setNarrowViewport()` 讓測試決定 `useMediaQuery` 看到的是手機還是桌機。

### bottom sheet 拖曳測試

`ServiceDetail.spec.ts` 的手勢測試有三個細節值得記著：

1. **不能用 `wrapper.trigger('pointerdown', { clientY })`** — test-utils 會合成 `MouseEvent`，而 `clientY` 是唯讀的，指定值會被丟掉。要自己 `dispatchEvent(new PointerEvent(...))`。
2. **jsdom 不做排版**，`panel.offsetHeight` 永遠是 0，28% 的門檻會變成 0，任何一點位移都會關閉面板。測試裡用 `Object.defineProperty` 給它一個高度。
3. **`performance.now` 要用 `mockImplementation` 而不是 `mockReturnValueOnce`** — 中間會有其他程式碼消耗掉 mock 值，用計數式的假回傳會讓速度計算悄悄落回真實時鐘，測試就會因為錯的理由而通過。

四種結果都各有一個案例：跟著手指移動、位移不足彈回、超過門檻關閉、短距離但快速的甩動也關閉。

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
- 語言切換在桌機是導覽列上的 `EN / 中文` 按鈕，手機則收進漢堡選單最後一列。

## 換成真實資料

`api/_lib/data.ts` 是唯一的資料來源。接資料庫時只要把 `findService` / `services` / `stats` 換成 DB 查詢並維持 `SourceService` 的形狀，`localize.ts`、`handlers.ts` 與前端都不用動，測試也還會繼續跑。
