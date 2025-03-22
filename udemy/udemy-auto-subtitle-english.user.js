// ==UserScript==
// @name         Udemy Auto Subtitle English
// @namespace    http://mawer.cc/
// @version      2025-03-22
// @description  自動開啟並選擇 Udemy 課程字幕為 English（適用 Shaka Player）
// @author       Mawer
// @match        https://*.udemy.com/*
// @icon         https://www.udemy.com/staticx/udemy/images/v7/favicon-32x32.png
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // 點擊字幕主按鈕
  const waitAndClickCaptionButton = () => {
    const btn = document.querySelector(
      'button.shaka-overflow-button.shaka-caption-button[aria-label="字幕"]'
    );
    if (btn) {
      console.log('[字幕] 找到字幕按鈕，準備點擊...');
      btn.click();
      waitAndSelectEnglish();
    } else {
      setTimeout(waitAndClickCaptionButton, 500);
    }
  };

  // 點擊 English 選項
  const waitAndSelectEnglish = () => {
    const menu = document.querySelector(
      '.shaka-settings-menu.shaka-text-languages'
    );
    if (menu) {
      const englishBtn = Array.from(menu.querySelectorAll('button')).find(btn =>
        btn.textContent.trim() === 'English'
      );
      if (englishBtn) {
        console.log('[字幕] 找到 English 選項，點擊中...');
        englishBtn.click();
      } else {
        console.log('[字幕] 尚未找到 English 按鈕，稍後再試...');
        setTimeout(waitAndSelectEnglish, 300);
      }
    } else {
      console.log('[字幕] 尚未展開字幕選單，稍後再試...');
      setTimeout(waitAndSelectEnglish, 500);
    }
  };

  // 延遲初始化，確保 Udemy Player 載入完成
  const init = () => {
    const playerReady = document.querySelector('video');
    if (playerReady) {
      waitAndClickCaptionButton();
    } else {
      setTimeout(init, 1000);
    }
  };

  init();
})();