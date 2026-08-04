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
    HeroCarousel.vue       作品輪播（自動播放、可暫停、鍵盤操作）
    ProjectPlate.vue       四種領域各自的線稿底圖
    CredentialBand.vue     信任數據帶
    ServiceFilter.vue      依專業領域篩選的 chip 列
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

前端會從 `api/_lib` 匯入共用型別與常數，所以開發時 Vite 也會向同一個伺服器索取 `/api/_lib/types.ts` 這類原始碼模組。`isApiEndpoint()` 負責區分：帶副檔名的路徑交還給 Vite，其餘才當作端點處理。

## API

| Method | Path                   | 說明                                       |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/api/services`        | 服務摘要列表，可用 `?q=` 做關鍵字過濾      |
| GET    | `/api/services/:slug`  | 單一服務完整資料，含 specs 與 case studies |
| GET    | `/api/stats`           | 信任帶的三個數字（ENR 排名、員工數、據點數）|
| GET    | `/api/highlights`      | 首頁輪播的三則專案敘事                     |
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

168 個測試，10 個檔案：

| 檔案 | 覆蓋範圍 |
| ---- | -------- |
| `api/_lib/routing.spec.ts` | 開發伺服器要能分辨 `/api/services`（端點）與 `/api/_lib/types.ts`（原始碼模組） |
| `api/_lib/types.spec.ts` | `resolveLocale` 的優先序：query > Accept-Language > 預設，含 `zh-Hant-TW` 這類區域標籤的收斂 |
| `api/_lib/handlers.spec.ts` | 列表過濾、summary 保留 market 標籤、輪播資料指向存在的服務、404 訊息、表單驗證，兩種語系都驗 |
| `src/stores/services.spec.ts` | 載入狀態機、篩選不重抓、詳情快取只打一次 API、切語系清快取、prefetch 失敗要安靜 |
| `src/components/ServiceCard.spec.ts` | 渲染、`aria-label`、`open` / `prefetch` 事件 payload |
| `src/components/ServiceFilter.spec.ts` | 單一軸的 group label、只有一個 `aria-pressed`、事件 payload、不再有產業 chip |
| `src/components/ServiceDirectory.spec.ts` | 載入骨架、卡片數量、篩選收斂與清除、空狀態、錯誤重試、卡片點擊開啟詳情，並在手機寬度下重跑一次 |
| `src/components/HeroCarousel.spec.ts` | 軌道位移量、頭尾 clone 的無縫循環、拖曳跟手與吸附、方向判定、拖曳後不誤觸連結、自動輪播與暫停、鍵盤操作、照片 srcset 與線稿退路、說明面板從專案連結開合、`aria-expanded` 狀態、拖曳後不誤開，並在手機寬度下重跑一次 |
| `src/components/ServiceDetail.spec.ts` | 桌機 modal 與手機 bottom sheet 兩種型態，含下拉手勢的四種結果 |
| `src/components/ContactPortal.spec.ts` | 表單提交全流程：payload、送出中、成功回執、錯誤、重送、重置、單欄版面、送出後把回執捲回視野並交出焦點，並在手機寬度下重跑成功／失敗／再送三條路徑 |

`src/test/helpers.ts` 提供 fixture 與 fetch stub。stub 會記錄每一次請求的 URL 與 request body，所以快取、`?lang=`、表單送出的內容都是直接對 call list 斷言，而不是靠 mock 呼叫次數猜。

`src/test/setup.ts` 補上 jsdom 缺的三樣東西：`<dialog>` 的 `showModal` / `close`、pointer capture、`window.scrollTo`，另外提供 `setNarrowViewport()` 讓測試決定 `useMediaQuery` 看到的是手機還是桌機。

### bottom sheet 拖曳測試

`ServiceDetail.spec.ts` 的手勢測試有三個細節值得記著：

1. **不能用 `wrapper.trigger('pointerdown', { clientY })`** — test-utils 會合成 `MouseEvent`，而 `clientY` 是唯讀的，指定值會被丟掉。要自己 `dispatchEvent(new PointerEvent(...))`。
2. **jsdom 不做排版**，`panel.offsetHeight` 永遠是 0，28% 的門檻會變成 0，任何一點位移都會關閉面板。測試裡用 `Object.defineProperty` 給它一個高度。
3. **`performance.now` 要用 `mockImplementation` 而不是 `mockReturnValueOnce`** — 中間會有其他程式碼消耗掉 mock 值，用計數式的假回傳會讓速度計算悄悄落回真實時鐘，測試就會因為錯的理由而通過。

四種結果都各有一個案例：跟著手指移動、位移不足彈回、超過門檻關閉、短距離但快速的甩動也關閉。

## 首頁結構

首頁刻意讓作品走在文字前面：hero 是三則專案的輪播，每則只有一句標題、一句說明和一個很短的連結詞，點下去直接開對應服務的詳情。輪播底圖優先使用照片：資料裡的 `image` 欄位給的是 `public/hero/` 底下的檔名前綴，元件會組出 `<picture>` 搭配 800/1600/2400 三種寬度的 WebP 與 JPEG，第一張帶 `fetchpriority="high"`、其餘 `loading="lazy"`。若某一則沒有 `image`，就退回該領域的 inline SVG 線稿（`ProjectPlate.vue`），兩條路徑都有測試覆蓋。

點擊每張投影片的專案名稱（例如 `Kosciuszko Bridge →`）會展開說明面板：先是照片的 alt 描述，接著是該領域的背景說明，最後是「查看這項服務」按鈕與 hdrinc.com 對應服務頁的外部連結。連結本身帶 `aria-expanded` / `aria-controls`，箭頭會從 `→` 變成 `↓`；展開時暫停輪播（正在閱讀就不該被換頁），換頁時自動收起。面板會蓋住連結所在的位置，所以有三種收起方式：右上角的關閉鈕、Escape 鍵、以及點擊面板以外的任何地方。點擊面板內部（含來源連結）不會誤關。

開啟面板的那一次點擊會繼續往 document 冒泡，而瀏覽器在每個 listener 之間都會清空微任務佇列，所以用 `nextTick` 之類的延遲**無法可靠地閃過它**（在 jsdom 裡看起來會過，真實瀏覽器則是面板一閃即逝）。正確做法是記住那個 event 物件本身，document listener 收到同一個 event 時跳過一次。

另外，切換投影片時若焦點還停在即將變成 `inert` 的投影片內，Chrome 會警告 `Blocked aria-hidden on an element because its descendant retained focus`，所以換頁時會主動 blur 那個元素。拖曳結束若落在這個連結上，那次 click 會被吞掉，面板不會誤開。

**pointer capture 的時機**：`setPointerCapture` 只在確認為水平拖曳之後才呼叫，放開時歸還。若在 `pointerdown` 就claim，Chrome 會把後續的 click 重新導向到 capture 的元素上，導致投影片裡所有按鈕都點不動——而且開著 DevTools 的觸控模擬時症狀不同，很容易誤判成別的問題。

說明文字是依照片檔名對應到 HDR 官網的服務頁面後改寫的，中英文各一份，資料放在 `api/_lib/data.ts` 的 `caption` 與 `sourceUrl` 欄位，跟其他內容一樣由後端依語系回傳。

換照片的方式：把新圖放進 `public/hero/`，命名成 `<名稱>-800.jpg`、`-1600.jpg`、`-2400.jpg`（以及對應的 `.webp`），再把 `api/_lib/data.ts` 裡該則的 `image`、`imageAlt`、`caption`、`sourceUrl` 改掉即可。

輪播是一條真正的橫向軌道：所有張並排在 `.hero__track` 上，`transform: translateX(calc(-N% + Xpx))` 同時吃「第幾張」與「拖曳位移」。拖曳時整條軌道跟著游標移動，旁邊那張會從邊緣露出來，放開才以 520ms 吸附定位——這是「翻頁感」的來源。

無縫循環用頭尾 clone：軌道實際渲染 `[最後一張, ...全部, 第一張]`，落到 clone 上時把 transition 關掉、跳回它的雙胞胎，再於下一個 frame 開回來，肉眼看不到接縫。

回捲有三個觸發點，不能只靠 `transitionend`——拖曳會把 transition 設成 `none`，正在跑的動畫被取消，那個事件就永遠不會來。實機上連續向右滑三次就會讓軌道走出 strip 範圍、只剩背景色。所以除了 `transitionend`，還有 700ms 的 timer 後援，以及新手勢開始（`pointerdown`）與下一次 `step()` 前的自我修正。子元素的 transition 會冒泡到軌道上，所以 `onTransitionEnd` 會檢查 `event.target` 與 `propertyName === 'transform'` 才動作。

滑鼠與觸控走同一套 Pointer Events：前 6px 判定方向，水平才接管、垂直讓給頁面捲動；放開時位移超過視窗寬度 12%（下限 48px）換頁、否則彈回原位；拖曳結束若剛好落在專案連結上，那次 click 會被吞掉。`touch-action: pan-y` 確保手機上下捲動不被攔截。

輪播的無障礙處理：`prefers-reduced-motion` 下不自動播放、滑鼠移入或聚焦時暫停、使用者一旦點過任何控制項就永久停止輪播（不再是背景動態）、左右方向鍵可切換、有獨立的播放／暫停按鈕、切換內容的容器是 `aria-live="polite"`。

## 服務目錄的篩選

目錄只有一條篩選軸：依專業領域（Transportation / Water / Buildings / Energy）收斂卡片，沒有結果時出現虛線的空狀態。

卡片等高的做法是讓 grid item 預設的 stretch 一路傳下去：`.grid > li` 設 `display: flex`、`.card` 設 `height: 100%` 與 flex 直排，再讓 `.card__foot` 吃 `margin-top: auto`。所以無論描述文字幾行，底部那條「N case studies →」都會對齊在同一水平線上。

卡片本身仍然標示所服務的產業（Health、Civic、Urban 等），那是資訊而非篩選控制項——資料層的 `markets` 欄位保留著，未來若要恢復第二條軸，只需要在 store 加回一個 `activeMarket` 即可。

## 送出後的捲動位置

回執比它取代的表單矮很多，頁面總高度驟減，捲動位置就落到回執下方——手機上使用者會看到頁尾，得自己往上滑才找得到「已送出」。所以成功之後會把回執 `scrollIntoView({ block: 'center' })` 拉回視野，同時 `focus()` 它（`tabindex="-1"` + `role="status"`），讓螢幕閱讀器也會播報。`prefers-reduced-motion` 下改用瞬間捲動。

## 一個容易重演的版面陷阱

`.row__track`（篩選 chip 那排）是 flex item 且內含五顆 chip。flex item 的 `min-width` 預設是 `auto`，也就是由內容決定，所以那排會把整個頁面撐得比視窗寬——結果不只篩選列跑掉，**下面每一區都跟著左右偏移**，看起來像好幾個地方同時壞掉。

修法是 `min-width: 0`，讓它能縮小並在自己的框內橫向捲動。表單欄位也補了同樣的保護。以後在 flex 或 grid 裡放會溢出的內容，記得先想這一行。

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

## 聯絡表單目前不會寄出任何東西

`POST /api/contact` 會驗證欄位、依領域決定回覆的辦公室、產生一組 reference 並回傳，但**沒有接任何郵件服務**——資料驗證完就被丟掉了。這是刻意的：展示用的專案不該把陌生人的聯絡資訊送到任何地方。

要讓它真的送出，在 `api/contact.ts` 的 `submitContact` 回傳 201 之後補上寄信，例如 Resend：

```ts
if (status === 201) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'HDR demo <noreply@your-domain.com>',
      to: 'you@your-domain.com',
      subject: `[${body.reference}] ${payload.name}`,
      text: payload.message,
    }),
  })
}
```

`RESEND_API_KEY` 放在 Vercel 的 Settings → Environment Variables，不要進 repo。另外記得加上速率限制——公開的表單端點一定會被機器人打。

## 換成真實資料

`api/_lib/data.ts` 是唯一的資料來源。接資料庫時只要把 `findService` / `services` / `stats` 換成 DB 查詢並維持 `SourceService` 的形狀，`localize.ts`、`handlers.ts` 與前端都不用動，測試也還會繼續跑。
