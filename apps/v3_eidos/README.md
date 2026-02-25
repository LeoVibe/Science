# ScienceQuest V3 (Eidos Project Edition)

這是一個基於 Lovable (eidosedu) 進行精煉與本地化整合的版本。

## 🛠️ 本地開發與題庫對接說明

本專案已打通與根目錄 `question/platform` 的連結，開發時請注意：

1. **靜態資源對接**：`public/questions` 是一個符號連結 (Symbolic Link)，指向專案根目錄的題庫資料。圖片等靜態資產請放置於 `public/images/`，程式中以 `/images/檔名` 引用。
2. **開發伺服器**：使用 `npm run dev` 啟動，預設通訊埠為 `5001`。
3. **題庫格式**：本版本使用新版 `manifest.json` (含 `units` 陣列項)。若要新增題庫，請使用 `shared/instruments/eidos-parser.js` 進行轉換。
4. **管理員後台**：路徑為 `/admin`，可在「題庫驗證」頁籤執行 **實體掃描**，驗證本地題庫的健康狀態。

## 📂 目錄關係說明

- `apps/v3_eidos`: **目前開發的主目錄**。所有邏輯已修復且與本地題庫接通。
- `apps/v3_eidos_lovable`: **Lovable 原始設計稿 (Raw Source)**。僅供參考、對齊 UI 元件與複製原生代碼，不建議直接在此目錄執行。

---

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
