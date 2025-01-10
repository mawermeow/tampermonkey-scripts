// ==UserScript==
// @name:zh-TW   Tactiq 內容複製按鈕
// @name         Tactiq Message Extractor
// @version      1.0
// @description:zh-TW  提取 Tactiq 訊息並新增按鈕功能，將訊息複製為 Markdown 格式。
// @description  Extracts Tactiq messages and adds a button to copy them in Markdown format.
// @author       Mawer
// @namespace    https://github.com/mawermeow/tampermonkey-scripts
// @match        https://app.tactiq.io/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

/*
 * 作者: Mawer
 * 專案: https://github.com/mawermeow/tampermonkey-scripts
 * 網站: https://mawer.cc
 *
 * [功能簡介]
 * 本腳本從 Tactiq 訊息容器中提取訊息，並新增一個按鈕來快速複製為 Markdown 格式。
 *
 * [功能特色]
 * - 提取訊息容器中用戶名稱、時間和訊息內容。
 * - 自動生成 Markdown 格式的內容，供複製到剪貼板使用。
 * - 在指定的容器中新增一個按鈕，簡化使用流程。
 *
 * [使用方式]
 * 1. 安裝 Tampermonkey 或其他用戶腳本管理工具。
 * 2. 將此腳本新增至 Tampermonkey 並啟用。
 * 3. 在包含 Tactiq 訊息的頁面上運行此腳本，並點擊新增的按鈕即可複製內容。
 *
 * [技術實現]
 * - 使用 JavaScript 查找特定 CSS 選擇器的訊息容器，提取相關資訊。
 * - 動態創建 HTML 按鈕並插入到目標容器中。
 * - 按鈕點擊事件中調用 `navigator.clipboard` 進行剪貼板操作。
 */

(() => {
    function extractMessages() {
        // 選取所有的 message 容器
        const messageContainers = document.querySelectorAll('.tactiq-block');

        // 存放提取結果的陣列
        const messages = [];

        // 遍歷每個容器提取數據
        messageContainers.forEach((container) => {
            // 提取 name
            const nameElement = container.querySelector('[aria-label]');
            const name = nameElement ? nameElement.getAttribute('aria-label') : null;

            // 提取 time
            const timeElement = container.querySelector('.text-slate-400, .group-hover\\:text-slate-600');
            const time = timeElement ? timeElement.textContent.trim() : null;

            // 提取 text
            const textElement = container.querySelector('[data-tactiq-message-id]');
            const text = textElement ? textElement.textContent.trim() : null;

            // 將結果加入陣列
            messages.push({ name, time, text });
        });

        return messages;
    }

    const createButton = () => {
        // 找到目標的按鈕容器
        const menuContainer = document.querySelector('.gap-1.hidden.md\\:flex.items-center.flex-wrap.justify-center.md\\:justify-end.min-w-\\[200px\\]');

        // 確保容器存在
        if (menuContainer) {
            // 創建新按鈕
            const copyButton = document.createElement('button');
            copyButton.className = 'inline-flex h-fit w-fit items-center whitespace-nowrap rounded-button focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 bg-transparent font-semibold hover:bg-slate-100 gap-x-1.5 px-2.5 py-1.5 text-xs text-slate-700';
            copyButton.type = 'button';
            copyButton.setAttribute('role', 'menuitem');
            copyButton.setAttribute('tabindex', '0');

            // 按鈕內的圖標部分
            const iconSpan = document.createElement('span');
            iconSpan.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy h-4 w-4">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>`;

            // 按鈕內的文字部分
            const textSpan = document.createElement('span');
            textSpan.innerHTML = '<span>Copy to MD</span>';

            // 組合按鈕
            copyButton.appendChild(iconSpan);
            copyButton.appendChild(textSpan);

            // 按鈕功能：複製內容到剪貼板
            copyButton.addEventListener('click', () => {
                const result = extractMessages();
                let textToCopy = '';
                result.forEach((message) => {
                    textToCopy += `* ${message.name}：${message.text}\n`;
                });
                if (textToCopy) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        alert('已複製為 Markdown 格式！');
                    }).catch((err) => {
                        console.error('複製失敗：', err);
                    });
                } else {
                    alert('沒有內容可以複製！');
                }
            });

            // 將按鈕加入到菜單中
            menuContainer.insertBefore(copyButton, menuContainer.firstChild);

        } else {
            console.log('目標容器尚未找到，將重試...');
            setTimeout(createButton, 1000); // 每秒嘗試重新呼叫
        }
    }

    // 初始化函數
    createButton();

})();