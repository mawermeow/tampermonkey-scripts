// ==UserScript==
// @name         Udemy Playback for iPad Control
// @namespace    http://mawer.cc/
// @version      2025-03-22
// @description  在 Udemy 上新增影片播放速度控制按鈕（支援 iPad 操作），提升學習效率與使用者體驗。
// @author       Mawer
// @match        https://*.udemy.com/*
// @icon         https://www.udemy.com/staticx/udemy/images/v7/favicon-32x32.png
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const playbackRates = [2, 1.5, 1];
  let currentRate = 1;

  // 建立樣式
  const style = document.createElement('style');
  style.textContent = `
    .udemy-playback-btn {
      padding: 4px 8px;
      margin-left: 6px;
      border: 1px solid white;
      border-radius: 4px;
      background: transparent;
      color: white;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s, color 0.2s;
    }

    .udemy-playback-btn:hover {
      background: white;
      color: black;
    }

    .udemy-playback-btn.active {
      background: #ffffffcc;
      color: #000;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);

  // 建立按鈕群組
  const createButtons = () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '4px';
    container.style.marginLeft = '12px';

    const buttons = [];

    playbackRates.forEach(rate => {
      const btn = document.createElement('button');
      btn.textContent = `${rate}x`;
      btn.className = 'udemy-playback-btn';

      btn.addEventListener('click', () => {
        currentRate = rate;
        document.querySelectorAll('video').forEach(video => {
          video.playbackRate = rate;
          video.addEventListener('loadedmetadata', () => {
            video.playbackRate = rate;
          });
        });

        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        console.log(`[Udemy] 播放速度設定為 ${rate}x`);
      });

      buttons.push(btn);
      container.appendChild(btn);
    });

    // 預設 active 在 1x
    buttons.find(b => b.textContent === '1x')?.classList.add('active');

    return container;
  };

  const injectButtons = () => {
    const controlBar = document.querySelector('.shaka-controls-button-panel');
    if (!controlBar || controlBar.querySelector('.udemy-playback-btn')) return;

    const btns = createButtons();
    controlBar.appendChild(btns);
  };

  // 初次嘗試插入按鈕
  const tryInit = () => {
    injectButtons();

    // 監聽影片新增時自動設定速率
    const observer = new MutationObserver(mutations => {
      injectButtons();
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'VIDEO') {
            node.playbackRate = currentRate;
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  // 延遲初始化（等待 Udemy 載入完 UI）
  const waitForControls = setInterval(() => {
    if (document.querySelector('.shaka-controls-button-panel')) {
      clearInterval(waitForControls);
      tryInit();
    }
  }, 1000);
})();