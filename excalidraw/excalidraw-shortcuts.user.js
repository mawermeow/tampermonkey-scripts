// ==UserScript==
// @name:zh-TW   Excalidraw 自訂快捷鍵
// @name         Excalidraw Custom Shortcuts
// @version      1.0
// @description:zh-TW  增加 Excalidraw 支援中文輸入法按鍵的自訂快捷鍵功能，例如使用「ㄅㄉˇˋㄓˊ˙ㄚㄞㄢ」來快速切換繪圖工具。
// @description  Adds custom shortcuts for Excalidraw to support Chinese input method keys, such as ㄅㄉˇˋㄓˊ˙ㄚㄞㄢ, for quick tool switching.
// @author       Mawer
// @namespace    https://github.com/mawermeow/tampermonkey-scripts
// @match        https://excalidraw.com/
// @run-at       document-end
// @grant        none
// ==/UserScript==

/*
 * 作者: Mawer
 * 專案: https://github.com/mawermeow/tampermonkey-scripts
 * 網站: https://mawer.cc
 *
 * [功能簡介]
 * 1. 支援將中文輸入法的按鍵（如「ㄅㄉˇˋㄓˊ˙ㄚㄞㄢ」）映射為 Excalidraw 的工具快捷鍵。
 * 2. 例如：
 *    - ㄅ → 工具 1
 *    - ㄉ → 工具 2
 *    - ˇ → 工具 3
 *    - 依此類推。
 *
 * [優點]
 * - 解決中文輸入法用戶無法使用數字鍵切換工具的問題。
 * - 提升使用 Excalidraw 時的效率，特別適合中文用戶。
 * - 自動偵測畫布範圍並應用快捷鍵，無需額外設置。
 *
 * [使用方式]
 * 1. 安裝 Tampermonkey 或類似的瀏覽器插件。
 * 2. 將此腳本添加到插件中並啟用。
 * 3. 在 Excalidraw 繪圖畫布中，使用「ㄅㄉˇˋㄓˊ˙ㄚㄞㄢ」快速切換工具。
 *
 * [測試環境]
 * - macOS Sonoma 14.0
 * - Chrome 版本 118.0.xxxx.xx
 * - Tampermonkey v4.18
 * - 不保證其他瀏覽器完全兼容，建議使用主流瀏覽器測試。
 *
 * [已知問題]
 * - 如果 Excalidraw 網站進行大規模更新，腳本可能需要修正。
 * - 如果輸入法有衝突（如非中文輸入法），快捷鍵可能無法觸發。
 *
 * [實現原理]
 * - 使用 `keydown` 事件攔截中文按鍵，將其映射到 Excalidraw 的數字鍵工具。
 * - 自動偵測 Excalidraw 畫布，確保僅在畫布內觸發快捷鍵行為。
 * - 提供清晰的快捷鍵映射表，便於用戶理解和自定義。
 */
(function() {
    'use strict';

    // 建立按鍵映射表
    const keyMap = {
        'ㄅ': '1', // 選擇工具 1
        'ㄉ': '2', // 選擇工具 2
        'ˇ': '3', // 選擇工具 3
        'ˋ': '4', // 選擇工具 4
        'ㄓ': '5', // 選擇工具 5
        'ㄗ': '6', // 選擇工具 6
        '˙': '7', // 選擇工具 7
        'ㄚ': '8', // 選擇工具 8
        'ㄞ': '9', // 選擇工具 9
        'ㄢ': '0', // 選擇工具 0
    };

    // 添加鍵盤事件監聽器
    document.addEventListener('keydown', (event) => {
        const inputMethodKey = event.key; // 獲取當前按鍵
        const mappedKey = keyMap[inputMethodKey]; // 查找映射表中對應的數字
        if (mappedKey) {
            event.preventDefault(); // 阻止默認行為
            const excalidrawCanvas = document.querySelector('canvas');
            if (excalidrawCanvas) {
                // 模擬對應數字鍵的按鍵事件
                const simulatedEvent = new KeyboardEvent('keydown', { key: mappedKey, code: `Digit${mappedKey}`, bubbles: true });
                excalidrawCanvas.dispatchEvent(simulatedEvent);
            }
        }
    });

    console.log('Excalidraw 自定義快捷鍵已啟用，按「ㄅㄉˇˋㄓˊ˙ㄚㄞㄢ」對應工具切換');
})();