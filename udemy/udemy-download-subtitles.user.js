// ==UserScript==
// @name:zh-TW   下載 Udemy 字幕為 .md 文件
// @name         Download Udemy Subtitle as .md file
// @version      1.0
// @description:zh-TW  下載字幕為 .md 文件，支援下載整門課程的字幕（多個 .md 文件）與影片（.mp4）
// @description  Download subtitles as .md files. Supports downloading subtitles for the entire course (multiple .md files) and videos (.mp4).
// @author       Mawer
// @namespace    https://github.com/mawermeow/tampermonkey-scripts
// @match        https://www.udemy.com/course/*
// @run-at       document-end
// @grant        unsafeWindow
// ==/UserScript==

/*
 * 寫於 2024-12-23
 * 作者: Mawer
 * 專案: https://github.com/mawermeow/tampermonkey-scripts
 * 電子郵件: mawermeow@protonmail.com
 * 網站: https://mawer.cc
 *
 * [功能簡介]
 * 1. 支援下載 Udemy 的字幕為 Markdown (.md) 文件
 * 2. 支援下載當前講座的影片 (.mp4)
 * 3. 可選擇下載整門課程的字幕，會自動生成每個講座的 .md 文件
 *
 * [優點]
 * - 不需要使用命令行，使用門檻低
 * - 點擊按鈕即可下載，方便直觀
 *
 * [備註]
 * - 本腳本依賴於 Udemy 的 API，如果 API 發生改動，腳本可能需要修復。
 * - 測試環境：
 *   - macOS Big Sur 11.2.1
 *   - Chrome 版本 88.0.4324.192 (正式版本) (x86_64)
 *   - Tampermonkey v4.11
 * - 不保證其他瀏覽器或系統完全兼容。
 *
 * [實現原理]
 * - 從 Udemy 的 API 獲取課程數據，並通過訪問 Cookie 獲取 access_token。
 * - 使用這些數據下載字幕 (vtt 格式) 並轉換為 Markdown (.md)。
 * - 影片則直接通過資源 URL 下載為 .mp4 文件。
 */

(function () {
    'use strict';

    // 全局變量
    var div = document.createElement('div');
    var buttonCourseMd = document.createElement('button'); // 下載整門課程字幕 (md 文件)
    var buttonCurrentMd = document.createElement('button'); // 下載當前課程字幕 (md 文件)
    var buttonCurrentVideo = document.createElement('button'); // 下載當前課程影片
    var title_element = null;
    var locale_id = 'en_US'; // 要下載的字幕語言
    var course_title = null; // 課程名稱

    // 獲取 cookie
    function getCookie(name) {
        return (document.cookie.match('(?:^|;)\\s*' + name.trim() + '\\s*([^;]*?)\\s*(?:;|$)') || [])[1];
    }

    // 安全文件名轉換
    function safe_filename(string) {
        // return string.replace(/[:'"]/g, '').replace(/\s+/g, '_');
        return string.replace(/[:'"]/g, '');
    }

    // 獲取參數
    function get_args() {
        var ud_app_loader = document.querySelector('.ud-app-loader');
        var args = ud_app_loader.dataset.moduleArgs;
        return JSON.parse(args);
    }

    // 獲取課程 ID
    function get_args_course_id() {
        return get_args().courseId;
    }

    // 獲取當前章節 ID
    function get_args_lecture_id() {
        return get_args().initialCurriculumItemId;
    }

    // 轉換 VTT 到 Markdown
    function vttToMarkdown(vtt, title) {
        const lines = vtt.split('\n');
        const mdLines = [`### ${title}`];
        let contentBuffer = '';

        lines.forEach(line => {
            // 跳過行數標記或時間標記
            if (line.match(/^\d+\s*$/) ||
                line.match(/^\d{2}:\d{2}:\d{2,3}/) ||
                line.match(/^\d{2}:\d{2}\.\d{3}\s-->\s\d{2}:\d{2}\.\d{3}/) ||
                line.trim() === '' ||
                line.trim() === 'WEBVTT'
            ) {
                return;
            }

            const cleanedLine = line
                .replace(/<[^>]+>/g, '') // 去除可能的 HTML 標籤
                .replace(/^- /, '') // 去除可能的破折號
                .replaceAll(/\[(.*?)\]/g, '') // 去除系統自動加入的的中括號內容
                .trim();

            if (cleanedLine) {
                // 將行內容連接成一段文字
                contentBuffer += cleanedLine + ' ';
            }
        });

        mdLines.push(contentBuffer.trim());
        return mdLines.join('\n');
    }

    // 下載文件
    function downloadString(text, fileType, fileName) {
        var blob = new Blob([text], { type: fileType });
        var a = document.createElement('a');
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => {
            URL.revokeObjectURL(a.href);
        }, 10000);
    }

    // 自動重試的 fetch
    async function fetch_with_retry(url, options, retries = 3, delay = 1000, isJson = true) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) {
                    return isJson ? await response.json() : await response.text();
                } else if (response.status === 503) {
                    console.warn(`Attempt ${attempt}: Server unavailable. Retrying after ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // 每次重試增加延遲
                } else {
                    console.error(`Request failed: ${response.status} ${response.statusText}`);
                    throw new Error(`Failed request with status ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed with error: ${error.message}`);
                if (attempt === retries) {
                    console.error("Max retries reached.");
                    throw new Error("Max retries reached.");
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // 獲取章節數據
    async function get_lecture_data(course_id, lecture_id) {
        var access_token = getCookie("access_token");
        var bearer_token = `Bearer ${access_token}`;
        var url = `https://www.udemy.com/api-2.0/users/me/subscribed-courses/${course_id}/lectures/${lecture_id}/?fields[lecture]=asset,description,download_url,is_free,last_watched_second&fields[asset]=asset_type,length,media_license_token,media_sources,captions,thumbnail_sprite,slides,slide_urls,download_urls`;
        return await fetch_with_retry(url, {
            headers: {
                'authorization': bearer_token,
                'x-udemy-authorization': bearer_token,
            },
        });
    }

    // 下載當前章節字幕為 Markdown
    async function download_current_md() {
        console.log("正在下載目前講座字幕...");
        var course_id = get_args_course_id();
        var lecture_id = get_args_lecture_id();
        var lecture_data = await get_lecture_data(course_id, lecture_id);

        if (!lecture_data.asset || !lecture_data.asset.captions) {
            console.error("本講座沒有可用的字幕。");
            return;
        }
        var mdContents = [];
        var item_title = lecture_data.title || "Untitled";
        var asset_type = lecture_data.asset.asset_type || "Unknown";
        console.log(`[${asset_type}] ${item_title}`);

        if (asset_type === 'Video' && lecture_data.asset && lecture_data.asset.captions) {
            for (let caption of lecture_data.asset.captions) {
                if (caption.locale_id === locale_id) {
                    var vtt = await fetch_with_retry(caption.url, {}, 3, 1000, false); // 將 isJson 設置為 false
                    mdContents.push(vttToMarkdown(vtt, item_title));
                }
            }
        } else if (asset_type === 'Article') {
            const articlePath = generateArticleUrlFromCurrentUrl(lecture_data.download_url);
            mdContents.push(`### ${item_title}\n${articlePath}`);
        }

        downloadString(mdContents.join('\n\n'), 'text/markdown', `${safe_filename(course_title)}_${safe_filename(item_title)}.md`);
    }

    // 下載當前章節影片
    async function download_current_video() {
        console.log("正在下載目前講座影片...");
        var course_id = get_args_course_id();
        var lecture_id = get_args_lecture_id();
        var lecture_data = await get_lecture_data(course_id, lecture_id);

        if (!lecture_data.asset || !lecture_data.asset.media_sources) {
            console.error("本講座沒有可用的影片。");
            return;
        }

        var item_title = lecture_data.title || "Untitled";
        var media_source = lecture_data.asset.media_sources[0];
        var video_url = media_source.src;
        var resolution = media_source.label;
        var filename = `${safe_filename(course_title)}_${safe_filename(item_title)}_${resolution}p.mp4`;

        fetch(video_url)
            .then(res => res.blob())
            .then(blob => {
                downloadString(blob, media_source.type, filename);
                console.log("影片下載完成");
            })
            .catch(err => console.error("下載影片失敗", err));
    }


    // 取得文章 URL
    function generateArticleUrlFromCurrentUrl(path) {
        // 取得當前的完整網址
        const currentUrl = new URL(window.location.href);

        // 將當前 URL 的路徑作為模板
        const pathSegments = currentUrl.pathname.split('/'); // 分割當前 URL 的路徑
        const segments = path.split('/').filter(segment => segment); // 分割輸入的 API 路徑，並過濾掉空字串

        // 取得輸入路徑的最後一段 ID
        const lastId = segments[segments.length - 1];

        // 替換當前 URL 路徑的最後一段為新 ID
        if (pathSegments.length > 0) {
            pathSegments[pathSegments.length - 1] = lastId; // 更新最後一段為新的 ID
            currentUrl.pathname = pathSegments.join('/'); // 更新當前 URL 的路徑
        }

        return currentUrl.toString(); // 返回更新後的完整 URL
    }

    // 下載整門課程字幕為 Markdown
    async function download_course_md() {
        console.log("正在下載課程字幕...");
        var course_id = get_args_course_id();
        var access_token = getCookie("access_token");
        var bearer_token = `Bearer ${access_token}`;
        var url = `https://www.udemy.com/api-2.0/courses/${course_id}/subscriber-curriculum-items/?page_size=1400&fields[lecture]=title,object_index,asset`;
        var course_data = await fetch_with_retry(url, {
            headers: {
                'authorization': bearer_token,
                'x-udemy-authorization': bearer_token,
            },
        });
        var mdContents = [`# ${safe_filename(course_title) ?? "Course"}`];
        let index = 1; // 初始化單元計數器
        let processedCount = 0; // 初始化處理計數器

        console.log(`共有 ${course_data.results.length} 個章節`, course_data);
        for (let item of course_data.results) {
            if (item._class === 'chapter') {
                mdContents.push(`---\n## ${item.title}${item.description ? `\n${item.description}` : '\n'}`);

                console.log(`[Chapter] ${item.title}`);
            }else if (item._class === 'lecture') {
                var item_title = `${item.object_index}. ${item.title}` || "Untitled";
                var asset_type = item.asset.asset_type || "Unknown";
                console.log(`[${asset_type}] ${item_title}`);

                var lecture_data = await get_lecture_data(course_id, item.id);

                if (asset_type === 'Video' && lecture_data.asset && lecture_data.asset.captions) {
                    for (let caption of lecture_data.asset.captions) {
                        if (caption.locale_id === locale_id) {
                            var vtt = await fetch_with_retry(caption.url, {}, 3, 1000, false); // 將 isJson 設置為 false
                            mdContents.push(vttToMarkdown(vtt, item_title));
                        }
                    }
                }else if(asset_type === 'Article') {
                    const articlePath = generateArticleUrlFromCurrentUrl(lecture_data.download_url);
                    mdContents.push(`### ${item_title}\n${articlePath}`);
                }
                index++; // 計數器加1
                processedCount++; // 處理計數器加1

                // 如果處理計數器達到4，則跳出循環
                // if (processedCount >= 10) {
                //     break;
                // }
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // 每章節延遲 1 秒
        }

        downloadString(mdContents.join('\n\n'), 'text/markdown', `Course - ${safe_filename(course_title)}.md`);
    }

    // 注入腳本按鈕
    async function inject_our_script() {
        title_element = document.querySelector('h1[data-purpose="course-header-title"]');
        course_title = title_element.innerText || "Course";
        if (!title_element) {
            console.error("[ERROR] 找不到課程標題元素");
            return;
        }

        var button_style = `
      font-size: 14px;
      padding: 5px 12px;
      margin: 5px;
      border-radius: 4px;
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
    `;

        buttonCourseMd.setAttribute('style', button_style);
        buttonCourseMd.textContent = "所有字幕.md";
        buttonCourseMd.addEventListener('click', download_course_md);

        buttonCurrentMd.setAttribute('style', button_style);
        buttonCurrentMd.textContent = "字幕.md";
        buttonCurrentMd.addEventListener('click', download_current_md);

        buttonCurrentVideo.setAttribute('style', button_style);
        buttonCurrentVideo.textContent = "影片.mp4";
        buttonCurrentVideo.addEventListener('click', download_current_video);

        div.appendChild(buttonCourseMd);
        div.appendChild(buttonCurrentMd);
        div.appendChild(buttonCurrentVideo);
        title_element.parentNode.insertBefore(div, title_element.nextSibling);
    }

    // 主入口
    async function main() {
        setTimeout(inject_our_script, 2000);
    }

    main();
})();