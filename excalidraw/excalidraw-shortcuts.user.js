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
 * 1. 本腳本為 Excalidraw 提供中文輸入法下的快捷鍵支持，通過「ㄅㄉˇˋㄓˊ˙ㄚㄞㄢ」等鍵快速切換工具。
 * 2. 按鍵映射如下：
 *    - ㄅ → 工具 1
 *    - ㄉ → 工具 2
 *    - ˇ → 工具 3
 *    - ˋ → 工具 4
 *    - ㄓ → 工具 5
 *    - ㄗ → 工具 6
 *    - ˙ → 工具 7
 *    - ㄚ → 工具 8
 *    - ㄞ → 工具 9
 *    - ㄢ → 工具 0
 *
 * [功能特色]
 * - 解決中文輸入法用戶無法直接使用數字鍵快捷切換工具的問題。
 * - 僅在非輸入狀態下啟用，避免與輸入框或可編輯元素發生衝突。
 * - 支持動態偵測 Excalidraw 畫布範圍，自動綁定快捷鍵行為。
 *
 * [使用方式]
 * 1. 安裝 Tampermonkey 或其他用戶腳本管理工具。
 * 2. 將此腳本新增至 Tampermonkey 並啟用。
 * 3. 開啟 https://excalidraw.com，進入畫布後即可使用快捷鍵功能。
 *
 * [兼容性]
 * - 測試環境：
 *   - macOS Sonoma 14.0
 *   - Google Chrome 118.0.xxxx.xx
 *   - Tampermonkey v4.18
 * - 不保證所有瀏覽器與操作系統完全兼容，建議在主流瀏覽器中測試。
 *
 * [注意事項]
 * - 若 Excalidraw 網站進行大規模更新，此腳本可能需要重新調整。
 * - 非中文輸入法下，按鍵映射可能無效。
 * - 當前未支持自定義按鍵映射功能。
 *
 * [技術實現]
 * - 使用 JavaScript 的 `keydown` 事件攔截中文按鍵輸入，將其映射為對應的數字鍵行為。
 * - 通過 `document.querySelector('canvas')` 動態綁定畫布按鍵事件，確保功能僅在 Excalidraw 畫布上有效。
 * - 避免干擾其他輸入框操作，增加對 `document.activeElement` 的檢查機制。
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

    // 檢查當前焦點是否在輸入元素上
    function isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );
    }

    // 添加鍵盤事件監聽器
    document.addEventListener('keydown', (event) => {
        if (isInputFocused()) {
            return; // 如果焦點在輸入元素上，直接返回
        }

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

    console.log('Excalidraw 自定義快捷鍵已啟用，按「ㄅㄉˇˋㄓˊ˙ㄚㄞㄢ」對應工具切換（僅在非輸入狀態下生效）');
})();