// ==UserScript==
// @name:zh-TW   HyRead 註記整理與複製工具
// @name         HyRead Book Notes Organizer & Copier
// @version      1.0
// @description:zh-TW  提取書本標題、作者、章節與筆記，並新增按鈕功能，快速複製格式化內容。
// @description  Extracts book title, author, chapters, and notes, and adds a button to copy formatted content.
// @author       Mawer
// @namespace    https://github.com/mawermeow/tampermonkey-scripts
// @match        https://ebook.hyread.com.tw/Template/store/member/epubNotePage.jsp?brn=*
// @run-at       document-end
// @grant        none
// ==/UserScript==

/*
 * 作者: Mawer
 * 專案: https://github.com/mawermeow/tampermonkey-scripts
 * 網站: https://mawer.cc
 *
 * [功能簡介]
 * 本腳本從指定網頁中提取書本資訊（包括標題、作者）、章節與筆記，並新增一個按鈕用於快速複製格式化的 Markdown 筆記。
 *
 * [功能特色]
 * - 自動從頁面提取書本標題與作者名稱。
 * - 提取章節標題、內容和更新時間。
 * - 按章節和時間排序，生成 Markdown 格式的筆記內容。
 * - 新增一個按鈕，用於將格式化的筆記內容快速複製到剪貼板。
 *
 * [使用方式]
 * 1. 安裝 Tampermonkey 或其他用戶腳本管理工具。
 * 2. 將此腳本新增至 Tampermonkey 並啟用。
 * 3. 在目標網頁上，點擊新增的「複製筆記」按鈕，即可複製格式化的筆記內容。
 *
 * [技術實現]
 * - 動態載入 Lodash 用於排序與分組。
 * - 使用 JavaScript 查找特定 CSS 選擇器，提取目標元素的內容。
 * - 動態創建 HTML 按鈕，並插入到指定的容器中。
 * - 利用 `navigator.clipboard` 實現剪貼板操作。
 */

(() => {
    'use strict';

    // 引用 lodash cdn
    const loadLodash = () => {
        if (!window._) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js';
            script.onload = () => {
                console.log('Lodash 已加載');
            };
            document.head.appendChild(script);
        }
    };

    // 提取書本名稱和作者名稱
    function extractBookInfo() {
        const bookTitle = document.querySelector('div[style*="font-size: 22px; font-weight: 500;"]')?.textContent.trim() || '未命名書籍';
        const author = document.querySelector('div[style*="font-size: inherit;"]:nth-child(2)')?.textContent.trim() || '未知作者';
        return { bookTitle, author };
    }

    // 提取章節標題和內容
    function extractNotes() {
        const elements = document.querySelectorAll('div[style="line-height: 1.65; padding-bottom: 40px;"]');
        const notes = Array.from(elements).map(element => {
            const chapterTitle = element.querySelector('div[style*="font-weight: 500;"]')?.textContent.trim() || '未分類';
            const text = element.querySelector('div[class*="textbg-annotation-color-2"]')?.textContent.trim() || '';
            const updateTime = element.querySelector('div[style*="text-align: right;"]')?.textContent.trim() || '未知時間';
            return { chapterTitle, text, updateTime };
        });
        return notes;
    }

    // 格式化筆記，根據 chapterTitle 和時間排序
    function formatNotes(notes) {
        const { bookTitle, author } = extractBookInfo();

        // 將 notes 按 updateTime 排序（舊的在上面）
        const sortedNotes = _.sortBy(notes, note => new Date(note.updateTime).getTime() || 0);

        // 根據 chapterTitle 分組
        const groupedNotes = _.groupBy(sortedNotes, 'chapterTitle');

        // 根據分組後每個分類的第一筆 note 的 updateTime 排序 chapterTitle
        const sortedChapters = _.sortBy(Object.entries(groupedNotes), ([chapterTitle, notes]) => {
            const firstNoteTime = new Date(notes[0].updateTime).getTime() || 0;
            return firstNoteTime;
        });

        // 組合成需要的格式
        const formattedText = sortedChapters
            .map(([chapterTitle, notes]) => {
                const items = notes.map(note => `* ${note.text}`).join('\n');
                return `### ${chapterTitle}\n${items}`;
            })
            .join('\n\n');

        return `# 《${bookTitle}》\n作者: ${author}\n\n${formattedText}`;
    }

    // 創建並插入複製按鈕
    function createButton() {
        const saveButton = document.querySelector('#save');

        if (saveButton) {
            const copyButton = document.createElement('button');
            copyButton.id = 'copy';
            copyButton.className = 'btn btn-primary custom_blue_style mb-4 ml-2';
            copyButton.textContent = '複製註記';

            copyButton.addEventListener('click', () => {
                const notes = extractNotes();
                if (notes.length > 0) {
                    const textToCopy = formatNotes(notes);
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        alert('筆記已複製到剪貼板！');
                    }).catch(err => {
                        console.error('複製筆記失敗:', err);
                    });
                } else {
                    alert('未找到任何筆記可供複製！');
                }
            });

            saveButton.insertAdjacentElement('afterend', copyButton);
        } else {
            console.log('下載按鈕未找到，重試中...');
            setTimeout(createButton, 1000);
        }
    }

    // 初始化腳本
    loadLodash();
    createButton();
})();