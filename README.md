# Tampermonkey Scripts 使用者腳本集合

這是一個包含多個實用 Tampermonkey 使用者腳本的集合，旨在提升各種網站的使用體驗。這些腳本適合希望透過自動化腳本來提升效率的使用者。

## 專案介紹

本專案由 [Mawer](https://mawer.cc) 開發和維護，所有腳本均在 [GitHub 專案](https://github.com/mawermeow/tampermonkey-scripts) 中開源，歡迎其他開發者參與改進。

## 目前腳本列表

### 1. **Excalidraw Custom Shortcuts**
- **名稱**: Excalidraw 自訂快捷鍵
- **說明**: 為 [Excalidraw](https://excalidraw.com/) 提供中文輸入法支持的自訂快捷鍵，讓使用「ㄅㄉˇˋㄓˊ˙ㄚㄞㄢ」的中文用戶能更方便地切換工具。
- **主要功能**:
    - 支援中文按鍵快速切換工具。
    - 提升中文用戶使用 Excalidraw 的流暢度。
- **安裝方法**: 點擊 [Excalidraw Custom Shortcuts 腳本](https://github.com/mawermeow/tampermonkey-scripts/blob/main/excalidraw-custom-shortcuts.user.js) 進入腳本頁面，複製代碼到 Tampermonkey 中。
- **測試環境**:
    - macOS Sequoia 15.2
    - Brave v1.73.104
    - Tampermonkey v5.3.3
- [詳細說明](https://github.com/mawermeow/tampermonkey-scripts/blob/main/excalidraw/README.md)

---

### 2. **Download Udemy Subtitle as .md File**
- **名稱**: 下載 Udemy 字幕為 Markdown 文件
- **說明**: 支援下載 Udemy 課程字幕為 `.md` 文件，並可選擇下載課程影片。
- **主要功能**:
    - 下載整門課程的字幕為多個 `.md` 文件。
    - 下載當前課程影片為 `.mp4` 文件。
- **安裝方法**: 點擊 [Download Udemy Subtitle 腳本](https://github.com/mawermeow/tampermonkey-scripts/blob/main/udemy-download-subtitles.user.js) 進入腳本頁面，複製代碼到 Tampermonkey 中。
- **測試環境**:
    - macOS Sequoia 15.2
    - Brave v1.73.104
    - Tampermonkey v5.3.3
- [詳細說明](https://github.com/mawermeow/tampermonkey-scripts/blob/main/udemy/README.md)

---

## 安裝指引

### 前置需求
1. 瀏覽器插件：
    - [Tampermonkey](https://www.tampermonkey.net/)（推薦）
    - 或其他類似的 UserScript 管理工具。
2. 支援瀏覽器：
    - Google Chrome（推薦）
    - Microsoft Edge
    - Firefox

### 安裝腳本
1. 點擊腳本對應的連結進入腳本頁面。
2. 複製腳本代碼並貼入 Tampermonkey。
3. 保存腳本並啟用，進入對應網站測試功能。

---

## 開發者指南

### 專案結構

~~~
tampermonkey-scripts/
│
├── README.md                # 專案主說明文件
├── LICENSE                  # 開源授權
├── excalidraw/              # Excalidraw 相關腳本目錄
│   ├── excalidraw-custom-shortcuts.user.js    # Excalidraw 自訂快捷鍵腳本
│   └── README.md            # Excalidraw 腳本說明
├── udemy/                   # Udemy 相關腳本目錄
│   ├── udemy-download-subtitles.user.js      # Udemy 字幕下載腳本
│   └── README.md            # Udemy 腳本說明
└── .gitignore               # Git 忽略文件
~~~


### 開發與貢獻
歡迎貢獻更多實用的腳本到此專案！如果你有興趣貢獻，請按照以下步驟進行：
1. Fork 本專案。
2. 創建新的分支並添加腳本。
3. 提交 Pull Request，並附上功能說明和測試結果。

---

## 聯繫作者

- **作者**: Mawer
- **網站**: [mawer.cc](https://mawer.cc)
- **GitHub**: [@mawermeow](https://github.com/mawermeow)
- **電子郵件**: mawermeow@protonmail.com

---

## 授權協議

本專案採用 MIT License 授權。你可以自由使用、修改和分發本專案中的代碼，但請保留原始版權信息。