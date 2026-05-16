// ==UserScript==
// @name         Tieba Remix Dev
// @namespace    https://github.com/naseaoi/Tieba-Remix
// @version      0.4.9
// @author       naseaoi
// @description  贴吧网页端重塑
// @license      MIT
// @icon         https://raw.githubusercontent.com/naseaoi/Tieba-Remix/master/assets/images/main/icon16.png
// @icon64       https://raw.githubusercontent.com/naseaoi/Tieba-Remix/master/assets/images/main/icon64.png
// @downloadURL  https://raw.githubusercontent.com/naseaoi/Tieba-Remix/master/build/tieba-remix.user.js
// @updateURL    https://raw.githubusercontent.com/naseaoi/Tieba-Remix/master/build/tieba-remix.user.js
// @match        *://tieba.baidu.com/
// @match        *://tieba.baidu.com/index.*
// @match        *://tieba.baidu.com/?*
// @match        *://tieba.baidu.com/p/*
// @match        *://tieba.baidu.com/f?*
// @match        *://jump.bdimg.com/safecheck/*
// @match        *://jump2.bdimg.com/safecheck/*
// @require      https://fastly.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js
// @require      data:application/javascript,%3Bwindow.Vue%3DVue%3B
// @require      https://fastly.jsdelivr.net/npm/marked@9.1.6/lib/marked.umd.min.js
// @require      https://fastly.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
// @require      https://fastly.jsdelivr.net/npm/libelemental@1.0.7/build/index.min.js
// @require      https://fastly.jsdelivr.net/npm/user-view@0.0.11/build/index.min.js
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_listValues
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

(n=>{if(typeof GM_addStyle=="function"){GM_addStyle(n);return}const e=document.createElement("style");e.textContent=n,document.head.append(e)})(` @charset "UTF-8";@keyframes kf-fade-in{0%{opacity:0}to{opacity:1}}@keyframes kf-fade-out{0%{opacity:1}to{opacity:0}}@keyframes kf-slide-in{0%{opacity:0;transform:translateY(20%)}}@keyframes kf-slide-out{to{opacity:0;transform:translateY(20%)}}@keyframes kf-slide-zoom-in{0%{opacity:0;transform:translateY(20%) scale(.85)}}@keyframes kf-slide-zoom-out{to{opacity:0;transform:translateY(20%) scale(.85)}}@keyframes kf-dialog-in{0%{opacity:0;transform:scale(1.2)}to{opacity:1;transform:scale(1)}}@keyframes kf-dialog-out{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.2)}}@keyframes kf-zoom-in{0%{transform:scale(.72)}to{transform:scale(1)}}@keyframes kf-fade-zoom-in{0%{opacity:0;transform:scale(.72)}to{opacity:1;transform:scale(1)}}.user-icon,.user-icon-outline{font-family:Material Symbols,monospace!important}.user-icon,.user-icon-outline{font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 40;font-weight:400;-webkit-user-select:none;-moz-user-select:none;user-select:none}.user-icon-filled{font-family:Material Symbols,monospace!important}.user-icon-filled{font-variation-settings:"FILL" 1,"wght" 400,"GRAD" 0,"opsz" 40;font-weight:400;-webkit-user-select:none;-moz-user-select:none;user-select:none}.user-view-common{font-family:sans-serif;font-family:var(--user-font);font-size:16px;line-height:normal}body[no-scrollbar]{overflow:hidden}@font-face{font-family:Material Symbols;font-style:normal;font-weight:200 400;src:url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v110/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2) format("woff2")}.material-symbols-outlined{display:inline-block;direction:ltr;font-family:Material Symbols;font-size:24px;-webkit-font-smoothing:antialiased;font-style:normal;font-weight:400;letter-spacing:normal;line-height:1;text-transform:none;white-space:nowrap;word-wrap:normal}.dark-theme{--user-back: rgb(32, 32, 32);--user-hover: rgb(42, 42, 42);--user-active: rgb(54, 54, 54);--user-back-transp: rgba(32, 32, 32, .6);--user-back-deep: rgb(26, 26, 26);--user-back-deep-transp: rgba(20, 20, 20, .6);--user-back-light: rgb(60, 60, 60);--user-back-light-transp: rgba(60, 60, 60, .6);--user-fore: rgb(230, 230, 230);--user-fore-light: rgb(180, 180, 180);--user-fore-minimal: rgb(144, 144, 144);--user-fore-highlight: rgb(255, 255, 255);--user-border: rgba(96, 96, 96, .6);--user-border-light: rgba(96, 96, 96, .2);--user-theme: rgb(113, 97, 193);--user-theme-transp: rgba(113, 97, 193, .6);--user-theme-hover: rgb(149, 128, 254);--user-theme-active: rgb(172, 156, 253);--user-theme-back: rgba(113, 97, 193, .2);--user-theme-fore: rgb(150, 128, 255);--user-check-color: rgb(124, 252, 0);--user-error-color: rgb(255, 99, 71);--user-warn-color: rgb(255, 165, 0)}:root{--user-back: rgb(255, 255, 255);--user-hover: rgb(240, 240, 240);--user-active: rgb(224, 224, 224);--user-back-transp: rgba(255, 255, 255, .6);--user-back-deep: rgb(228, 228, 228);--user-back-deep-transp: rgba(200, 200, 200, .6);--user-back-light: rgb(235, 235, 235);--user-back-light-transp: rgba(228, 228, 228, .6);--user-fore: rgb(16, 16, 16);--user-fore-light: rgb(86, 86, 86);--user-fore-minimal: rgb(118, 118, 118);--user-fore-highlight: rgb(0, 0, 0);--user-border: rgba(185, 185, 185, .6);--user-border-light: rgba(185, 185, 185, .2);--user-theme: rgb(97, 78, 194);--user-theme-transp: rgba(97, 78, 194, .6);--user-theme-hover: rgb(119, 105, 194);--user-theme-active: rgb(150, 134, 232);--user-theme-back: rgba(97, 78, 194, .2);--user-theme-fore: rgb(58, 46, 116);--user-check-color: rgb(0, 128, 0);--user-error-color: rgb(139, 0, 0);--user-warn-color: rgb(255, 140, 0)}:root{--user-font: sans-serif;--user-font-mono: monospace;--xfast-duration: .1s;--fast-duration: .2s;--default-duration: .4s;--slow-duration: .6s;--xslow-duration: .8s}.user-anchor.underline[data-v-eda7432d],.user-anchor.default[data-v-eda7432d]{color:rgb(58, 46, 116);color:var(--user-theme-fore);cursor:pointer;-webkit-text-decoration:none;-webkit-text-decoration:none;text-decoration:none;transition:.4s;transition:var(--default-duration)}.user-anchor.underline[data-v-eda7432d]{-webkit-text-decoration:underline;text-decoration:underline;-webkit-text-decoration:underline solid currentColor;text-decoration:underline;text-decoration:underline solid currentColor;text-decoration-thickness:1.2px;-webkit-text-decoration:underline 1.2px;text-decoration:underline;text-decoration:underline solid currentColor;text-decoration-thickness:1.2px;text-decoration:underline 1.2px}.user-anchor.hover-type[data-v-eda7432d]{cursor:pointer;-webkit-text-decoration:none;-webkit-text-decoration:none;text-decoration:none;transition:.4s;transition:var(--default-duration)}.user-anchor.default[data-v-eda7432d]:hover,.user-anchor.underline[data-v-eda7432d]:hover{background-color:rgb(240, 240, 240);background-color:var(--user-hover)}.user-anchor.underline[data-v-eda7432d]:hover{-webkit-text-decoration:underline;text-decoration:underline;-webkit-text-decoration:underline solid rgba(0,0,0,0);text-decoration:underline;text-decoration:underline solid rgba(0,0,0,0);text-decoration-thickness:1.2px;-webkit-text-decoration:underline 1.2px rgba(0,0,0,0);text-decoration:underline;text-decoration:underline solid rgba(0,0,0,0);text-decoration-thickness:1.2px;text-decoration:underline 1.2px rgba(0,0,0,0)}.user-anchor.hover-type[data-v-eda7432d]:hover{color:rgb(58, 46, 116);color:var(--user-theme-fore)}.user-anchor.default[data-v-eda7432d]:active,.user-anchor.underline[data-v-eda7432d]:active{background-color:rgb(224, 224, 224);background-color:var(--user-active)}.user-anchor.hover-type[data-v-eda7432d]:active{color:rgb(150, 134, 232);color:var(--user-theme-active)}.user-button{box-sizing:border-box;padding:4px 12px;border:none;border-radius:6px;background:none;background-color:rgb(255, 255, 255);background-color:var(--user-back);box-shadow:0 0 0 1px rgba(185, 185, 185, .6);box-shadow:0 0 0 1px var(--user-border);color:rgb(16, 16, 16);color:var(--user-fore);cursor:pointer;transition:.4s;transition:var(--default-duration)}.user-button:hover:not([disabled]){background-color:rgb(240, 240, 240);background-color:var(--user-hover)}.user-button:active:not([disabled]){background-color:rgb(224, 224, 224);background-color:var(--user-active)}.user-button:focus:not([disabled]){border-color:rgb(97, 78, 194);border-color:var(--user-theme);box-shadow:0 0 0 2px rgb(97, 78, 194);box-shadow:0 0 0 2px var(--user-theme)}.theme-style.user-button{color:rgb(255, 255, 255)!important;color:var(--user-back)!important}.theme-style.user-button{background-color:rgb(97, 78, 194);background-color:var(--user-theme)}.theme-style.user-button:hover{background-color:rgb(119, 105, 194);background-color:var(--user-theme-hover)}.theme-style.user-button:active{background-color:rgb(150, 134, 232);background-color:var(--user-theme-active)}.unset-background.user-button{background-color:transparent;background-color:initial}.no-border.user-button,.no-border-all.user-button{box-shadow:none}.no-border-all.user-button:hover,.no-border-all.user-button:focus{box-shadow:none}.toggle-button[data-v-d9ec2dab]{color:rgb(16, 16, 16);color:var(--user-fore)}.toggle-button .user-icon[data-v-d9ec2dab],.toggle-button .user-icon-outline[data-v-d9ec2dab]{color:rgb(118, 118, 118);color:var(--user-fore-minimal)}.toggle-button.toggle-on[data-v-d9ec2dab]{background-color:rgb(97, 78, 194);background-color:var(--user-theme);color:rgb(255, 255, 255);color:var(--user-back)}.user-check[data-v-0c59d2d9]{display:flex;align-items:center}.user-check .check-button[data-v-0c59d2d9]{width:16px;min-width:16px;height:16px;min-height:16px;padding:0;border-radius:4px;color:rgb(97, 78, 194);color:var(--user-theme);font-size:14px;font-weight:700}.user-check .check-label[data-v-0c59d2d9]{display:flex;align-items:center;color:rgb(86, 86, 86);color:var(--user-fore-light);cursor:pointer;font-size:16px}.user-check .label-text[data-v-0c59d2d9]{padding-left:6px}.user-color-picker[data-v-d3a455db]{display:flex;align-items:center;gap:8px}.user-color-picker .color-input[data-v-d3a455db]{width:24px;height:24px}.user-dialog-modal[data-v-b6f65c55]{position:fixed;z-index:var(--6be7c052);display:flex;width:100%;height:100%;flex-direction:column;align-items:center;justify-content:center;background-color:rgba(0,0,0,0.50196);top:0;right:0;bottom:0;left:0}.user-dialog-modal.no-modal[data-v-b6f65c55]{width:0;height:0;background:none}.user-dialog-modal.no-modal .user-dialog.shadow[data-v-b6f65c55]{width:0;height:0}.user-dialog-modal.no-modal .user-dialog.shadow .dialog-content[data-v-b6f65c55]{padding:0}.user-dialog-modal .user-dialog.default[data-v-b6f65c55]{box-shadow:0 0 10px rgba(0,0,0,0.2);display:flex;max-height:calc(100% - 32px);box-sizing:border-box;flex-direction:column;border:1px solid rgba(185, 185, 185, .2);border:1px solid var(--user-border-light);border-radius:12px;margin:16px;background-color:rgb(255, 255, 255);background-color:var(--user-back);font-size:16px;outline:none;transition:.4s;transition:var(--default-duration)}html.dark-theme .user-dialog-modal .user-dialog.default[data-v-b6f65c55]{box-shadow:0 0 16px rgba(0,0,0,0.4)}.user-dialog-modal .user-dialog.animation.dialog-enter-active[data-v-b6f65c55]{animation:var(--4221cbf4)}.user-dialog-modal .user-dialog.animation.dialog-leave-active[data-v-b6f65c55]{animation:var(--088534ab)}.user-dialog-modal .user-dialog.default.force-alert[data-v-b6f65c55]{outline:3px solid rgb(139, 0, 0);outline:3px solid var(--user-error-color)}.user-dialog-modal .user-dialog .dialog-title[data-v-b6f65c55]{padding:16px 16px 0;color:rgb(0, 0, 0);color:var(--user-fore-highlight);font-size:22px;font-weight:var(--font-weight-bold)}.user-dialog-modal .user-dialog .dialog-content[data-v-b6f65c55]{flex-grow:1;padding:16px;overflow-y:auto}.user-dialog-modal .user-dialog .dialog-button-panel[data-v-b6f65c55]{display:flex;padding:16px;border-radius:0 0 12px 12px;background-color:rgb(228, 228, 228);background-color:var(--user-back-deep);gap:8px}.user-dialog-modal .user-dialog .dialog-button-panel .dialog-button[data-v-b6f65c55]{flex-grow:1;padding:6px 16px;font-size:14px}.user-image[data-v-325b901c]{-o-object-fit:cover;object-fit:cover}.user-textbox[data-v-94e658f6]{box-sizing:border-box;padding:4px;border:2px solid rgba(185, 185, 185, .6);border:2px solid var(--user-border);border-radius:6px;background-color:rgb(255, 255, 255);background-color:var(--user-back);outline:none;transition:all .4s, width 0s, height 0s;transition:all var(--default-duration), width 0s, height 0s}.user-textbox[data-v-94e658f6]:hover{border-color:rgb(235, 235, 235);border-color:var(--user-back-light)}.user-textbox[data-v-94e658f6]:focus{border-color:rgb(97, 78, 194);border-color:var(--user-theme)}.lodash-style.user-textbox[data-v-94e658f6]{padding:0;border:none;border-radius:0;border-bottom:2px solid rgba(185, 185, 185, .6);border-bottom:2px solid var(--user-border)}.pager-wrapper .pager-button-container .pager-button.user-icon[data-v-34c5d5c5]{font-family:Material Symbols,monospace!important}.pager-wrapper .pager-button-container .pager-button.user-icon[data-v-34c5d5c5]{font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 40;font-weight:400;-webkit-user-select:none;-moz-user-select:none;user-select:none}.pager-wrapper[data-v-34c5d5c5]{display:flex;width:-moz-fit-content;width:fit-content;box-sizing:border-box;align-items:center;padding:4px;font-size:16px;gap:6px}.pager-wrapper .pager-button-container[data-v-34c5d5c5]{display:flex;align-items:center}.pager-wrapper .pager-button-container .pager-button[data-v-34c5d5c5]{padding:4px 10px;color:rgb(16, 16, 16);color:var(--user-fore);font-family:sans-serif;font-family:var(--user-font)}.pager-wrapper .pager-button-container .pager-button[data-v-34c5d5c5]:not(:hover):not(:active):not(:focus){background-color:transparent}.pager-wrapper .pager-button-container .pager-button.fill[data-v-34c5d5c5]:not(:hover):not(:active):not(:focus){background-color:rgb(255, 255, 255);background-color:var(--user-back)}.pager-wrapper .pager-button-container .pager-button.curr-pager-button[data-v-34c5d5c5]{border-radius:0;box-shadow:0 3px 0 rgb(97, 78, 194);box-shadow:0 3px 0 var(--user-theme);color:rgb(97, 78, 194);color:var(--user-theme)}.pager-wrapper .pager-separactor[data-v-34c5d5c5]{color:rgb(118, 118, 118);color:var(--user-fore-minimal);font-family:monospace;font-family:var(--user-font-mono)}.pager-wrapper .jumper-container[data-v-34c5d5c5]{display:flex;align-items:center;color:rgb(86, 86, 86);color:var(--user-fore-light);gap:6px}.pager-wrapper .jumper-container .jumper[data-v-34c5d5c5]{width:36px;width:3em;padding:2px 4px;color:rgb(16, 16, 16);color:var(--user-fore);font-family:monospace;font-family:var(--user-font-mono)}.pager-wrapper .tail-slot[data-v-34c5d5c5]{margin-left:auto;color:rgb(118, 118, 118);color:var(--user-fore-minimal)}@keyframes select-arrow-down-e636ff80{0%{transform:translateY(0)}70%{transform:translateY(10%)}to{transform:translateY(0)}}.user-select[data-v-e636ff80]{position:relative}.user-select .select-toggle[data-v-e636ff80]{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;text-align:justify}.user-select .select-toggle.toggle-on[data-v-e636ff80]{background-color:rgb(255, 255, 255);background-color:var(--user-back);box-shadow:0 0 0 1px rgb(97, 78, 194);box-shadow:0 0 0 1px var(--user-theme);color:rgb(16, 16, 16);color:var(--user-fore)}.user-select .select-toggle.toggle-on .user-icon[data-v-e636ff80]{animation:select-arrow-down-e636ff80 .2s cubic-bezier(.18,.89,.32,1.6);animation:select-arrow-down-e636ff80 var(--fast-duration) cubic-bezier(.18,.89,.32,1.6);color:rgb(97, 78, 194);color:var(--user-theme);font-weight:var(--font-weight-bold)}.user-select .select-toggle.toggle-off[data-v-e636ff80]{box-shadow:0 0 0 1px rgba(185, 185, 185, .6);box-shadow:0 0 0 1px var(--user-border)}.user-select .select-container[data-v-e636ff80]{position:absolute;z-index:2025;top:calc(100% + 4px);left:0;display:flex;overflow:hidden;width:100%;flex-direction:column;border:1px solid rgba(185, 185, 185, .6);border:1px solid var(--user-border);border-radius:6px;background-color:rgb(255, 255, 255);background-color:var(--user-back);box-shadow:0 0 10px rgba(0,0,0,0.2);transform-origin:top}.user-select .select-container.select-enter-active[data-v-e636ff80],.user-select .select-container.select-leave-active[data-v-e636ff80]{transition:transform .2s, opacity .2s;transition:transform var(--fast-duration), opacity var(--fast-duration)}.user-select .select-container.select-enter-from[data-v-e636ff80],.user-select .select-container.select-leave-to[data-v-e636ff80]{opacity:0;transform:scale(.95) translateY(-4px)}.user-select .select-container .select-button[data-v-e636ff80]{border-radius:0;box-shadow:none;text-align:justify}.user-select .select-container .select-desc[data-v-e636ff80]{padding:4px 14px;border-top:1px solid rgba(185, 185, 185, .6);border-top:1px solid var(--user-border);color:rgb(86, 86, 86);color:var(--user-fore-light);font-size:14px}.float-message{box-shadow:0 0 10px rgba(0,0,0,0.2);position:absolute;z-index:99999;overflow:hidden;box-sizing:border-box;padding:4px 6px;border:1px solid rgba(185, 185, 185, .6);border:1px solid var(--user-border);border-radius:6px;background-color:rgb(255, 255, 255);background-color:var(--user-back);font-size:14px}html.dark-theme .float-message{box-shadow:0 0 16px rgba(0,0,0,0.4)}.float-message.float-message-enter-active{animation:kf-fade-in .2s;animation:kf-fade-in var(--fast-duration)}.float-message.float-message-leave-active{animation:kf-fade-out .2s;animation:kf-fade-out var(--fast-duration)}#user-header-progress[data-v-1ffe8ff6]{position:fixed;z-index:99999;top:0;max-width:100vw;height:4px;background-color:rgb(97, 78, 194);background-color:var(--user-theme);transition:.4s}#user-header-progress.complete[data-v-1ffe8ff6]{animation:kf-fade-out .8s forwards;animation:kf-fade-out var(--xslow-duration) forwards}.message-wrapper[data-v-edcaf171]{display:flex;overflow-x:hidden;overflow-y:auto;overflow-x:hidden;overflow-y:auto;overflow:hidden auto;flex-direction:column}@keyframes toast-render-896ce94b{0%{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}@keyframes toast-unload-896ce94b{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.9)}}.check[data-v-896ce94b]{color:rgb(0, 128, 0);color:var(--user-check-color)}.warning[data-v-896ce94b]{color:rgb(255, 140, 0);color:var(--user-warn-color)}.error[data-v-896ce94b]{color:rgb(139, 0, 0);color:var(--user-error-color)}.toast-wrapper[data-v-896ce94b]{position:fixed;z-index:999;bottom:64px;left:50%;transform:translate(-50%)}.toast-wrapper .toast-container[data-v-896ce94b]{display:flex;max-height:60vh;align-items:center;padding:8px 12px;border:1px solid rgba(185, 185, 185, .6);border:1px solid var(--user-border);border-radius:16px;animation:toast-render-896ce94b .4s;animation:toast-render-896ce94b var(--default-duration);background-color:rgb(255, 255, 255);background-color:var(--user-back);box-shadow:0 10px 16px rgba(0,0,0,0.16078);gap:6px;text-overflow:ellipsis;transition:.4s;transition:var(--default-duration)}.toast-wrapper .toast-container.unloading[data-v-896ce94b]{animation:toast-unload-896ce94b .4s forwards;animation:toast-unload-896ce94b var(--default-duration) forwards}.toast-wrapper .toast-container .toast-icon[data-v-896ce94b]{font-size:18px}.toast-wrapper .toast-container .toast-content[data-v-896ce94b]{overflow:hidden;max-width:80vw;max-height:60vh;padding:0 6px;text-align:left;text-overflow:ellipsis;white-space:pre-wrap}.toast-wrapper .toast-container span[data-v-896ce94b]{color:rgb(118, 118, 118);color:var(--user-fore-minimal);font-size:12px}.toast-wrapper .toast-container .toast-controls .close-button[data-v-896ce94b]{padding:6px;color:rgb(139, 0, 0);color:var(--user-error-color);font-weight:var(--font-weight-bold);line-height:100%}.toast-wrapper .toast-container .toast-controls .close-button[data-v-896ce94b]:not(:active):not(:focus){box-shadow:none}.blur-effect[data-v-896ce94b]{background-color:rgba(255, 255, 255, .6);background-color:var(--user-back-transp)}html:not([perf-saver]) .blur-effect[data-v-896ce94b]{-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px)}html.dark-theme .blur-effect[data-v-896ce94b]{-webkit-backdrop-filter:blur(24px) brightness(.8);backdrop-filter:blur(24px) brightness(.8)}.blur-effect .close-button[data-v-896ce94b]:not(:hover):not(:active):not(:focus){background-color:transparent}.user-toggle-panel .toggle-container .panel-button.toggle-off[data-v-8d3c6357]{font-family:Material Symbols,monospace!important}.user-toggle-panel .toggle-container .panel-button.toggle-off[data-v-8d3c6357]{font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 40;font-weight:400;-webkit-user-select:none;-moz-user-select:none;user-select:none}.user-toggle-panel .toggle-container .panel-button.toggle-on[data-v-8d3c6357]{font-family:Material Symbols,monospace!important}.user-toggle-panel .toggle-container .panel-button.toggle-on[data-v-8d3c6357]{font-variation-settings:"FILL" 1,"wght" 400,"GRAD" 0,"opsz" 40;font-weight:400;-webkit-user-select:none;-moz-user-select:none;user-select:none}.user-toggle-panel[data-v-8d3c6357]{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}.user-toggle-panel .toggle-container[data-v-8d3c6357]{display:flex;flex-direction:column;align-items:center;gap:4px}.user-toggle-panel .toggle-container .panel-button[data-v-8d3c6357]{width:58px;height:58px;border-radius:12px;font-size:24px}.user-toggle-panel .toggle-container .panel-button.toggle-off[data-v-8d3c6357]{color:rgb(118, 118, 118);color:var(--user-fore-minimal)}.user-toggle-panel .toggle-container .panel-button.toggle-on[data-v-8d3c6357]:focus{box-shadow:0 0 0 1px rgb(97, 78, 194);box-shadow:0 0 0 1px var(--user-theme)}.user-toggle-panel .toggle-container .toggle-name[data-v-8d3c6357]{color:rgb(86, 86, 86);color:var(--user-fore-light);font-size:12px}
.setting-select[data-v-4901a01f] {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 240px;
  font-size: 13px;
}
.select-trigger[data-v-4901a01f] {
  border: 1px solid var(--border-color) !important;
  background-color: var(--default-background) !important;
  color: var(--default-fore) !important;
}
.select-trigger[data-v-4901a01f] {
  display: inline-flex;
  box-sizing: border-box;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 8px;
}
.select-trigger .trigger-text[data-v-4901a01f] {
  overflow: hidden;
  flex: 1;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.select-trigger .trigger-icon[data-v-4901a01f] {
  flex-shrink: 0;
  color: var(--minimal-fore);
  font-size: 18px;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.select-trigger[data-v-4901a01f]:hover {
  border-color: var(--minimal-fore);
}
.select-trigger.active[data-v-4901a01f] {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
}
.select-trigger.active .trigger-icon[data-v-4901a01f] {
  transform: rotate(180deg);
}
.select-popover[data-v-4901a01f] {
  position: absolute;
  z-index: 2025;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  display: flex;
  overflow: hidden;
  padding: 4px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--default-background);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transform-origin: top center;
}
.select-list[data-v-4901a01f] {
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 0;
  margin: 0;
  list-style: none;
}
.select-item[data-v-4901a01f] {
  display: flex;
  align-items: center;
  padding: 7px 10px;
  border-radius: 5px;
  color: var(--default-fore);
  cursor: pointer;
  line-height: 1.4;
  transition: background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}
.select-item .item-text[data-v-4901a01f] {
  overflow: hidden;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.select-item[data-v-4901a01f]:hover {
  background-color: var(--default-hover);
}
.select-item.selected[data-v-4901a01f] {
  background-color: var(--default-hover);
  color: var(--highlight-fore);
  font-weight: var(--font-weight-bold);
}
.select-item.selected[data-v-4901a01f]:hover {
  background-color: var(--default-active);
}
.setting-select-pop-enter-active[data-v-4901a01f],
.setting-select-pop-leave-active[data-v-4901a01f] {
  transition: opacity 0.14s cubic-bezier(0.4, 0, 0.2, 1), transform 0.14s cubic-bezier(0.4, 0, 0.2, 1);
}
.setting-select-pop-enter-from[data-v-4901a01f],
.setting-select-pop-leave-to[data-v-4901a01f] {
  opacity: 0;
  transform: scale(0.98) translateY(-4px);
}.setting-switch[data-v-6d7081fc] {
  position: relative;
  box-sizing: border-box;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: var(--border-color);
  cursor: pointer;
  outline: none;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.setting-switch .switch-thumb[data-v-6d7081fc] {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease;
}
.setting-switch[data-v-6d7081fc]:hover:not(:disabled):not(.on) {
  background: var(--minimal-fore);
}
.setting-switch.on .switch-thumb[data-v-6d7081fc] {
  transform: translateX(16px);
}
.setting-switch.on[data-v-6d7081fc]:hover:not(:disabled) {
  background: var(--tieba-theme-hover) !important;
}
.setting-switch[data-v-6d7081fc]:focus-visible {
  box-shadow: 0 0 0 2px var(--default-background), 0 0 0 4px var(--tieba-theme-color);
}
.setting-switch[data-v-6d7081fc]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}@keyframes kf-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes kf-fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@keyframes kf-slide-in {
  0% {
    opacity: 0;
    transform: translateY(20%);
  }
}
@keyframes kf-slide-out {
  100% {
    opacity: 0;
    transform: translateY(20%);
  }
}
@keyframes kf-slide-zoom-in {
  0% {
    opacity: 0;
    transform: translateY(20%) scale(0.85);
  }
}
@keyframes kf-slide-zoom-out {
  100% {
    opacity: 0;
    transform: translateY(20%) scale(0.85);
  }
}
@keyframes kf-dialog-in {
  0% {
    opacity: 0;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes kf-dialog-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}
@keyframes kf-zoom-in {
  0% {
    transform: scale(0.72);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes kf-fade-zoom-in {
  0% {
    opacity: 0;
    transform: scale(0.72);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}/* stylelint-disable font-family-no-missing-generic-family-keyword */\r
/* https: //fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,200..400,0..1,-50..100 */\r
\r
/* fallback */\r
@font-face {\r
    font-family: "Material Symbols";\r
    font-style: normal;\r
    font-weight: 200 400;\r
    src: url("https://fonts.gstatic.com/s/materialsymbolsoutlined/v110/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2") format("woff2");\r
}\r
\r
.material-symbols-outlined {\r
    display: inline-block;\r
    direction: ltr;\r
    font-family: "Material Symbols";\r
    font-size: 24px;\r
    -webkit-font-smoothing: antialiased;\r
    font-style: normal;\r
    font-weight: normal;\r
    letter-spacing: normal;\r
    line-height: 1;\r
    text-transform: none;\r
    white-space: nowrap;\r
    word-wrap: normal;\r
}\r
:root {
  --img-tieba-icon: url("https://gitee.com/HacksawBlade/Tieba-Remix/raw/master/assets/images/main/icon.png");
}

.dark-theme {
  --default-background: rgb(32, 32, 32);
  --default-hover: rgb(42, 42, 42);
  --default-active: rgb(54, 54, 54);
  --page-background: rgb(26, 26, 26);
  --trans-page-background: rgba(26, 26, 26, 0.6);
  --trans-default-background: rgba(32, 32, 32, 0.6);
  --deep-background: rgb(26, 26, 26);
  --trans-deep-background: rgba(20, 20, 20, 0.6);
  --light-background: rgb(60, 60, 60);
  --trans-light-background: rgba(60, 60, 60, 0.6);
  --very-light-background: rgb(60, 60, 60);
  --elem-color: rgb(26, 26, 26);
  --default-fore: rgb(230, 230, 230);
  --light-fore: rgb(180, 180, 180);
  --minimal-fore: rgb(144, 144, 144);
  --highlight-fore: rgb(255, 255, 255);
  --border-color: rgba(96, 96, 96, 0.6);
  --light-border-color: rgba(96, 96, 96, 0.2);
  --level-green-background: rgba(96, 153, 59, 0.1);
  --level-green-fore: rgb(133, 206, 84);
  --level-blue-background: rgba(0, 165, 227, 0.1);
  --level-blue-fore: rgb(0, 169, 255);
  --level-yellow-background: rgba(229, 193, 90, 0.1);
  --level-yellow-fore: rgb(242, 205, 96);
  --level-orange-background: rgba(204, 122, 0, 0.1);
  --level-orange-fore: rgb(255, 170, 0);
  --check-color: lawngreen;
  --error-color: tomato;
  --warning-color: orange;
  color-scheme: dark;
}

.light-theme {
  --default-background: rgb(255, 255, 255);
  --default-hover: rgb(240, 240, 240);
  --default-active: rgb(224, 224, 224);
  --page-background: rgb(245, 245, 245);
  --trans-page-background: rgba(245, 245, 245, 0.6);
  --trans-default-background: rgba(255, 255, 255, 0.6);
  --deep-background: rgb(228, 228, 228);
  --trans-deep-background: rgba(200, 200, 200, 0.6);
  --light-background: rgb(235, 235, 235);
  --trans-light-background: rgba(228, 228, 228, 0.6);
  --very-light-background: rgb(245, 245, 245);
  --elem-color: rgb(240, 240, 240);
  --default-fore: rgb(16, 16, 16);
  --light-fore: rgb(86, 86, 86);
  --minimal-fore: rgb(118, 118, 118);
  --highlight-fore: rgb(0, 0, 0);
  --border-color: rgba(185, 185, 185, 0.6);
  --light-border-color: rgba(185, 185, 185, 0.2);
  --level-green-background: rgba(84, 130, 53, 0.1);
  --level-green-fore: rgb(51, 78, 32);
  --level-blue-background: rgba(0, 153, 213, 0.1);
  --level-blue-fore: rgb(0, 81, 111);
  --level-yellow-background: rgba(164, 139, 63, 0.1);
  --level-yellow-fore: rgb(124, 105, 46);
  --level-orange-background: rgba(255, 153, 0, 0.1);
  --level-orange-fore: rgb(178, 104, 0);
  --check-color: green;
  --error-color: darkred;
  --warning-color: darkorange;
  color-scheme: "light";
}html.style-vercel.light-theme {
  --default-background: rgb(255, 255, 255);
  --page-background: rgb(250, 250, 250);
  --trans-page-background: rgba(250, 250, 250, 0.8);
  --trans-default-background: rgba(255, 255, 255, 0.8);
  --deep-background: rgb(244, 244, 245);
  --trans-deep-background: rgba(244, 244, 245, 0.8);
  --light-background: rgb(244, 244, 245);
  --trans-light-background: rgba(244, 244, 245, 0.6);
  --very-light-background: rgb(250, 250, 250);
  --elem-color: rgb(255, 255, 255);
  --default-hover: rgb(244, 244, 245);
  --default-active: rgb(234, 234, 234);
  --default-fore: rgb(0, 0, 0);
  --highlight-fore: rgb(0, 0, 0);
  --light-fore: rgb(102, 102, 102);
  --minimal-fore: rgb(136, 136, 136);
  --border-color: rgb(234, 234, 234);
  --light-border-color: rgb(244, 244, 245);
  --level-green-background: rgba(95, 191, 87, 0.08);
  --level-green-fore: rgb(80, 145, 75);
  --level-blue-background: rgba(78, 158, 235, 0.16);
  --level-blue-fore: rgb(20, 91, 167);
  --level-yellow-background: rgba(247, 178, 26, 0.11);
  --level-yellow-fore: rgb(160, 125, 50);
  --level-orange-background: rgba(247, 110, 50, 0.09);
  --level-orange-fore: rgb(195, 110, 65);
  --check-color: rgb(0, 112, 74);
  --error-color: rgb(204, 0, 0);
  --warning-color: rgb(204, 88, 0);
  color-scheme: light;
}

html.style-vercel.dark-theme {
  --default-background: rgb(0, 0, 0);
  --page-background: rgb(0, 0, 0);
  --trans-page-background: rgba(0, 0, 0, 0.8);
  --trans-default-background: rgba(10, 10, 10, 0.8);
  --deep-background: rgb(10, 10, 10);
  --trans-deep-background: rgba(10, 10, 10, 0.8);
  --light-background: rgb(17, 17, 17);
  --trans-light-background: rgba(17, 17, 17, 0.6);
  --very-light-background: rgb(10, 10, 10);
  --elem-color: rgb(10, 10, 10);
  --default-hover: rgb(26, 26, 26);
  --default-active: rgb(42, 42, 42);
  --default-fore: rgb(237, 237, 237);
  --highlight-fore: rgb(255, 255, 255);
  --light-fore: rgb(161, 161, 161);
  --minimal-fore: rgb(102, 102, 102);
  --border-color: rgb(31, 31, 31);
  --light-border-color: rgb(22, 22, 22);
  --level-green-background: rgba(89, 191, 75, 0.09);
  --level-green-fore: rgb(155, 195, 145);
  --level-blue-background: rgba(74, 144, 226, 0.18);
  --level-blue-fore: rgb(110, 175, 250);
  --level-yellow-background: rgba(247, 178, 26, 0.09);
  --level-yellow-fore: rgb(220, 195, 140);
  --level-orange-background: rgba(247, 110, 50, 0.09);
  --level-orange-fore: rgb(225, 175, 145);
  --check-color: rgb(0, 200, 130);
  --error-color: rgb(255, 80, 80);
  --warning-color: rgb(247, 178, 26);
  color-scheme: dark;
}:root {
  --xfast-duration: 0.1s;
  --fast-duration: 0.2s;
  --default-duration: 0.4s;
  --slow-duration: 0.6s;
  --xslow-duration: 0.8s;
}.about-wrapper[data-v-4060d874] {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 8px;
  margin: auto;
  gap: 16px;
}
.about-wrapper .main-title[data-v-4060d874] {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  line-height: 1;
}
.about-wrapper .main-title .title[data-v-4060d874] {
  display: flex;
  align-items: center;
  color: var(--highlight-fore);
  font-size: 26px;
  font-style: normal;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
  line-height: 1;
}
.about-wrapper .script-info[data-v-4060d874] {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--minimal-fore);
  gap: 6px;
}
.about-wrapper .script-info .author-info[data-v-4060d874] {
  display: flex;
  align-items: baseline;
  font-family: var(--code-monospace);
  font-size: 12px;
  gap: 8px;
}
.about-wrapper .script-info .about-desc[data-v-4060d874] {
  font-size: 12px;
}
.about-wrapper .about-controls[data-v-4060d874] {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  gap: 8px;
}
.about-wrapper .about-controls .about-button[data-v-4060d874] {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
}.update-wrapper[data-v-8b81bea5] {
  display: flex;
  max-width: 100%;
  flex-direction: column;
  gap: 8px;
}
.update-wrapper .latest-info[data-v-8b81bea5] {
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 16px;
  margin: auto;
  margin-bottom: 12px;
  background-color: var(--level-blue-background);
  color: var(--level-blue-fore);
  gap: 6px;
}
.update-wrapper .latest-info.is-latest[data-v-8b81bea5] {
  background-color: var(--level-green-background);
  color: var(--level-green-fore);
}
.update-wrapper .title-container[data-v-8b81bea5] {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.update-wrapper .title-container .title[data-v-8b81bea5] {
  flex-shrink: 1;
  font-size: 20px;
  font-weight: var(--font-weight-bold);
}
.update-wrapper .title-container .is-pre-release[data-v-8b81bea5] {
  min-width: -moz-max-content;
  min-width: max-content;
  padding: 2px 8px;
  border-radius: 16px;
  background-color: var(--level-orange-background);
  color: var(--level-orange-fore);
  font-size: 14px;
}
.update-wrapper .update-controls[data-v-8b81bea5] {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  gap: 8px;
}
.update-wrapper .update-controls .up-button[data-v-8b81bea5] {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: var(--font-weight-bold);
}
.status-wrapper[data-v-8b81bea5] {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: 24px 12px;
  gap: 10px;
  color: var(--light-fore);
  text-align: center;
}
.status-wrapper .icon[data-v-8b81bea5] {
  font-family: "Material Symbols Outlined";
  font-family: var(--symbol-font, "Material Symbols Outlined");
  font-size: 56px;
  color: var(--minimal-fore);
  line-height: 1;
}
.status-wrapper .status-text[data-v-8b81bea5] {
  font-size: 13px;
  line-height: 1.5;
  max-width: 360px;
}
.status-wrapper .retry-button[data-v-8b81bea5] {
  margin-top: 4px;
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 6px;
}.layout-custom-back[data-v-bc28201e] {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--default-background);
  gap: 12px;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.layout-custom-back[data-v-bc28201e]:hover {
  border-color: var(--minimal-fore);
}
.layout-custom-back .head-row[data-v-bc28201e] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.layout-custom-back .head-row .head-text[data-v-bc28201e] {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}
.layout-custom-back .head-row .head-text .head-title[data-v-bc28201e] {
  color: var(--highlight-fore);
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
}
.layout-custom-back .head-row .head-text .head-desc[data-v-bc28201e] {
  color: var(--light-fore);
  font-size: 12.5px;
  line-height: 1.5;
}
.layout-custom-back .head-row .head-actions[data-v-bc28201e] {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}
.layout-custom-back .head-row .head-actions .back-button[data-v-bc28201e] {
  padding: 6px 12px;
  font-size: 13px;
}
.layout-custom-back .preview-row[data-v-bc28201e] {
  display: flex;
  justify-content: center;
}
.layout-custom-back .preview-row .custom-image[data-v-bc28201e] {
  max-width: 100%;
  max-height: 280px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  -o-object-fit: contain;
     object-fit: contain;
}.color-picker[data-v-d258c23f] {
  display: flex;
  align-items: center;
  gap: 10px;
}
.color-picker .color-input[data-v-d258c23f] {
  width: 32px;
  height: 32px;
  padding: 2px;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  background: none;
  cursor: pointer;
}
.color-picker .color-input[data-v-d258c23f]::-webkit-color-swatch-wrapper {
  padding: 0;
}
.color-picker .color-input[data-v-d258c23f]::-webkit-color-swatch {
  border: none;
  border-radius: 5px;
}
.color-picker .color-input[data-v-d258c23f]::-moz-color-swatch {
  border: none;
  border-radius: 5px;
}
.color-picker p[data-v-d258c23f] {
  font-size: 13px;
  color: var(--minimal-fore);
}.theme-color-component[data-v-b4e9e941] {
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}.theme-picker {
  z-index: 9999 !important;
}.settings-wrapper[data-v-343efbfc] {
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: var(--default-background);
  font-size: 14px;
}
.settings-sidebar[data-v-343efbfc] {
  display: flex;
  overflow: hidden;
  width: 240px;
  min-width: 240px;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}
.settings-sidebar .sidebar-header[data-v-343efbfc] {
  display: flex;
  flex-direction: column;
  padding: 16px 16px 12px;
  gap: 10px;
}
.settings-sidebar .sidebar-header .sidebar-title[data-v-343efbfc] {
  margin: 0;
  color: var(--highlight-fore);
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}
.settings-sidebar .sidebar-header .sidebar-search[data-v-343efbfc] {
  box-sizing: border-box;
  width: 100%;
  padding: 6px 10px;
  font-size: 13px;
}
.settings-sidebar .sidebar-nav[data-v-343efbfc] {
  display: flex;
  overflow-y: auto;
  flex: 1;
  flex-direction: column;
  padding: 4px 8px 16px;
  gap: 4px;
  scrollbar-width: none;
}
.settings-sidebar .sidebar-nav[data-v-343efbfc]::-webkit-scrollbar {
  display: none;
}
.settings-sidebar .sidebar-nav .nav-group[data-v-343efbfc] {
  display: flex;
  flex-direction: column;
  padding: 8px 0 4px;
}
.settings-sidebar .sidebar-nav .nav-group-label[data-v-343efbfc] {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  color: var(--minimal-fore);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  gap: 6px;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
.settings-sidebar .sidebar-nav .nav-group-label .nav-group-icon[data-v-343efbfc] {
  font-size: 14px;
  font-variation-settings: "FILL" 0, "wght" 400;
}
.settings-sidebar .sidebar-nav .nav-list[data-v-343efbfc] {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 2px 0 0;
  list-style: none;
  gap: 1px;
}
.settings-sidebar .sidebar-nav .nav-item[data-v-343efbfc] {
  padding: 7px 10px 7px 28px;
  border-radius: 6px;
  color: var(--default-fore);
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.settings-sidebar .sidebar-nav .nav-item[data-v-343efbfc]:hover:not(.active) {
  background-color: var(--default-hover);
}
.settings-sidebar .sidebar-nav .nav-item.active[data-v-343efbfc] {
  background-color: var(--default-hover);
  color: var(--highlight-fore);
  font-weight: var(--font-weight-bold);
}
.settings-main[data-v-343efbfc] {
  position: relative;
  display: flex;
  overflow: hidden;
  flex: 1;
  flex-direction: column;
  background-color: var(--default-background);
}
.settings-main .main-header[data-v-343efbfc] {
  display: flex;
  flex-direction: column;
  padding: 18px 24px 14px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--default-background);
  gap: 6px;
}
.settings-main .main-header .breadcrumb[data-v-343efbfc] {
  display: flex;
  align-items: center;
  color: var(--minimal-fore);
  font-size: 12px;
  gap: 4px;
}
.settings-main .main-header .breadcrumb .crumb-sep[data-v-343efbfc] {
  font-size: 14px;
}
.settings-main .main-header .breadcrumb .crumb.current[data-v-343efbfc] {
  color: var(--default-fore);
}
.settings-main .main-header .main-title[data-v-343efbfc] {
  margin: 0;
  color: var(--highlight-fore);
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
}
.settings-main .main-header .main-desc[data-v-343efbfc] {
  margin: 0;
  color: var(--light-fore);
  font-size: 13px;
}
.settings-main .main-body[data-v-343efbfc] {
  display: flex;
  overflow-y: auto;
  flex: 1;
  flex-direction: column;
  padding: 16px 24px 24px;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}
.settings-main .main-body[data-v-343efbfc]::-webkit-scrollbar {
  width: 6px;
}
.settings-main .main-body[data-v-343efbfc]::-webkit-scrollbar-track {
  background: transparent;
}
.settings-main .main-body[data-v-343efbfc]::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: var(--border-color);
  -webkit-transition: background-color 0.2s ease;
  transition: background-color 0.2s ease;
}
.settings-main .main-body[data-v-343efbfc]::-webkit-scrollbar-thumb:hover {
  background-color: var(--minimal-fore);
}
.settings-main .main-empty[data-v-343efbfc] {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--minimal-fore);
  gap: 12px;
}
.settings-main .main-empty .empty-icon[data-v-343efbfc] {
  font-size: 56px;
  font-variation-settings: "FILL" 0, "wght" 300;
}
.settings-main .main-empty .empty-tip[data-v-343efbfc] {
  margin: 0;
  font-size: 13px;
}
.settings-main .main-desc-floater[data-v-343efbfc] {
  position: absolute;
  z-index: 30;
  right: 16px;
  bottom: 14px;
  left: 16px;
  max-width: 720px;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin: 0 auto;
  background-color: var(--default-background);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  color: var(--light-fore);
  font-size: 12.5px;
  line-height: 1.5;
  pointer-events: none;
}
.desc-pop-enter-active[data-v-343efbfc],
.desc-pop-leave-active[data-v-343efbfc] {
  transition: opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1), transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.desc-pop-enter-from[data-v-343efbfc],
.desc-pop-leave-to[data-v-343efbfc] {
  opacity: 0;
  transform: translateY(8px);
}
.setting-row[data-v-343efbfc] {
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--default-background);
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.setting-row[data-v-343efbfc]:hover {
  border-color: var(--minimal-fore);
}
.setting-row.simple[data-v-343efbfc] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  gap: 16px;
}
.setting-row.simple .row-text[data-v-343efbfc] {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}
.setting-row.simple .row-control[data-v-343efbfc] {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}
.setting-row.composite[data-v-343efbfc] {
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  gap: 12px;
}
.setting-row.composite .row-head[data-v-343efbfc] {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.setting-row.composite .row-body[data-v-343efbfc] {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.setting-row .row-title[data-v-343efbfc] {
  color: var(--highlight-fore);
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
}
.setting-row .row-desc[data-v-343efbfc] {
  margin: 0;
  color: var(--light-fore);
  font-size: 12.5px;
  line-height: 1.5;
}
.row-button[data-v-343efbfc],
.widget-button[data-v-343efbfc] {
  min-width: 72px;
  padding: 6px 14px;
  font-size: 13px;
}
.row-select[data-v-343efbfc],
.widget-select[data-v-343efbfc] {
  width: min(100%, 240px);
}
.widget-subtitle[data-v-343efbfc] {
  margin: 6px 0 0;
  color: var(--default-fore);
  font-size: 13px;
  font-weight: var(--font-weight-bold);
}
.widget-desc[data-v-343efbfc] {
  color: var(--light-fore);
  font-size: 12.5px;
  line-height: 1.5;
}
.widget-desc p[data-v-343efbfc] {
  margin: 0;
}
.widget-toggle[data-v-343efbfc] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid var(--light-border-color);
  gap: 16px;
}
.widget-toggle[data-v-343efbfc]:first-child {
  padding-top: 0;
  border-top: none;
}
.widget-toggle .toggle-label[data-v-343efbfc] {
  flex: 1;
  color: var(--default-fore);
  font-size: 13px;
  line-height: 1.5;
}
.widget-textbox[data-v-343efbfc] {
  box-sizing: border-box;
  width: 100%;
  padding: 6px 10px;
  font-size: 13px;
}
.widget-textbox.is-textarea[data-v-343efbfc] {
  min-height: 7em;
  font-family: var(--code-monospace);
  resize: vertical;
}
.widget-icon[data-v-343efbfc] {
  margin: 4px auto;
  color: var(--minimal-fore);
  font-size: 52px;
  font-variation-settings: "FILL" 1;
  text-align: center;
}
.widget-image[data-v-343efbfc] {
  max-width: 100%;
  max-height: 280px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin: 0 auto;
  -o-object-fit: contain;
     object-fit: contain;
}
.setting-component-wrap[data-v-343efbfc] {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}.block-panel {
  display: flex;
  min-width: 30px;
  height: 26px;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 8px;
  background-color: var(--trans-light-background);
  font-size: 14px;
  text-align: center;
}
.block-panel .icon {
  color: var(--light-fore);
  font-size: 18px;
}
.block-panel .panel-button,
.block-panel .panel-btn {
  border: none !important;
}
.block-panel .panel-button,
.block-panel .panel-btn {
  width: 30px;
  height: 30px;
  padding: 4px;
  border-radius: 6px;
  transition: background-color 0.15s, color 0.15s;
  transition: background-color var(--fast-duration, 0.15s), color var(--fast-duration, 0.15s);
}
.block-panel .panel-button:hover,
.block-panel .panel-btn:hover {
  background-color: var(--default-hover);
  color: var(--default-fore);
}
.block-panel.left-align {
  margin-left: 0;
}
.block-panel.actions {
  padding: 0;
  background-color: transparent;
  gap: 10px;
}#header-progress[data-v-782eb887] {
  position: fixed;
  z-index: 99999;
  top: 0;
  max-width: 100vw;
  height: 4px;
  background-color: var(--tieba-theme-color);
  transition: 0.4s;
}
#header-progress.complete[data-v-782eb887] {
  animation: kf-fade-out var(--xslow-duration) forwards;
}#shield-editor[data-v-bf172916] {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
#shield-editor #shield-editor-rule-control[data-v-bf172916] {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
#shield-editor #shield-editor-rule-control #shield-editor-rule[data-v-bf172916] {
  flex: 1;
  font-size: 13px;
}
#shield-editor #shield-editor-rule-control label[data-v-bf172916] {
  color: var(--light-fore);
}
#shield-editor #shield-editor-toggle-control[data-v-bf172916] {
  display: flex;
  align-items: center;
  gap: 16px;
}
#shield-editor #shield-editor-delete[data-v-bf172916] {
  padding: 6px 8px;
  background-color: var(--error-color);
  color: var(--default-background);
}.shield-container[data-v-5a687904] {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
}
.shield-container .words-container[data-v-5a687904] {
  display: flex;
  flex-wrap: wrap;
  padding: 12px;
  border-radius: 12px;
  background-color: var(--trans-light-background);
  gap: 4px;
}
.shield-container .words-container .shield-elem[data-v-5a687904] {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  gap: 4px;
}
.shield-container .words-container .shield-elem.disabled[data-v-5a687904] {
  opacity: 0.5;
}
.shield-container .words-container .shield-elem.disabled .content[data-v-5a687904] {
  -webkit-text-decoration: line-through;
  text-decoration: line-through;
}
.shield-container .words-container .shield-elem .icon[data-v-5a687904] {
  color: var(--light-fore);
}
.shield-container .words-container .remove-all[data-v-5a687904] {
  background-color: var(--error-color);
  color: var(--default-background);
  font-variation-settings: "FILL" 0;
}
.shield-container .empty-list-container[data-v-5a687904] {
  color: var(--minimal-fore);
}
.shield-container .shield-controls[data-v-5a687904] {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.shield-container .shield-controls .shield-input[data-v-5a687904] {
  width: 100%;
  height: auto;
  max-height: 6em;
  box-sizing: border-box;
  padding: 6px;
  font-size: 13px;
  resize: none;
}
.shield-container .shield-controls .submit-controls[data-v-5a687904] {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.shield-container .shield-controls .submit-controls .submit-button[data-v-5a687904] {
  padding: 4px 12px;
  font-size: 14px;
  font-weight: var(--font-weight-bold);
}@keyframes kf-viewer-mask-fade {
from {
    background-color: transparent;
}
}.images-viewer[data-v-a7d6dda9] {
  position: fixed;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transition: var(--default-duration);
}
.images-viewer .icon[data-v-a7d6dda9] {
  color: var(--light-fore);
}
.images-viewer .control-panel[data-v-a7d6dda9] {
  position: absolute;
  display: flex;
  align-items: center;
  padding: 6px;
  border: 1px solid var(--light-border-color);
  border-radius: 14px;
  background-color: var(--trans-default-background);
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.35);
}
html[glass-effect] .images-viewer .control-panel[data-v-a7d6dda9] {
  -webkit-backdrop-filter: blur(24px);
          backdrop-filter: blur(24px);
}
html[glass-effect].dark-theme .images-viewer .control-panel[data-v-a7d6dda9] {
  -webkit-backdrop-filter: blur(24px) brightness(0.8);
          backdrop-filter: blur(24px) brightness(0.8);
}
.images-viewer .head-controls[data-v-a7d6dda9] {
  top: 12px;
  margin-bottom: auto;
  transition: var(--default-duration);
}
.images-viewer .head-controls.hide[data-v-a7d6dda9] {
  box-shadow: none;
  transform: translateY(calc(-100% - 12px)) scale(0.85);
}
.images-viewer .head-controls .head-btn[data-v-a7d6dda9] {
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 8px;
  background-color: transparent;
  background-color: initial;
  box-shadow: none;
  font-size: 15px;
}
.images-viewer .head-controls .head-btn[data-v-a7d6dda9]:hover {
  background-color: var(--default-background);
  color: var(--tieba-theme-color);
}
.images-viewer .head-controls .close[data-v-a7d6dda9]:hover {
  color: var(--error-color);
}
.images-viewer .head-controls .head-sep[data-v-a7d6dda9] {
  color: var(--minimal-fore);
  font-family: var(--code-monospace);
  margin: 0 2px;
}
.images-viewer .head-controls .zoom-size[data-v-a7d6dda9] {
  padding: 0 8px;
  color: var(--light-fore);
  font-family: var(--code-monospace);
  font-size: 13px;
}
.images-viewer .back[data-v-a7d6dda9],
.images-viewer .forward[data-v-a7d6dda9] {
  width: -moz-min-content;
  width: min-content;
  height: 56px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  font-size: large;
}
.images-viewer .back[data-v-a7d6dda9] {
  left: 24px;
}
.images-viewer .back.hide[data-v-a7d6dda9] {
  box-shadow: none;
  transform: translateX(calc(-100% - 24px)) scale(0.85);
}
.images-viewer .forward[data-v-a7d6dda9] {
  right: 24px;
}
.images-viewer .forward.hide[data-v-a7d6dda9] {
  box-shadow: none;
  transform: translateX(calc(100% + 24px)) scale(0.85);
}
.images-viewer .back[data-v-a7d6dda9]:hover,
.images-viewer .forward[data-v-a7d6dda9]:hover {
  background-color: var(--default-background);
}
.images-viewer .back[data-v-a7d6dda9]:focus,
.images-viewer .forward[data-v-a7d6dda9]:focus {
  box-shadow: 0 0 0 2px var(--tieba-theme-color);
}
.images-viewer .image-container[data-v-a7d6dda9] {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}
.images-viewer .image-container .curr-image[data-v-a7d6dda9] {
  position: absolute;
  -o-object-fit: contain;
     object-fit: contain;
  transition: opacity 0.2s ease;
}
.images-viewer .image-container .curr-image.loading-img[data-v-a7d6dda9] {
  opacity: 0;
}
.images-viewer .image-container .curr-image.changing[data-v-a7d6dda9] {
  transition: none !important;
}
.images-viewer .image-container .image-loading-spinner[data-v-a7d6dda9] {
  position: absolute;
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: kf-spin-a7d6dda9 0.8s linear infinite;
  pointer-events: none;
}
@keyframes kf-spin-a7d6dda9 {
to {
    transform: rotate(360deg);
}
}
.images-viewer .bottom-controls-wrapper[data-v-a7d6dda9] {
  bottom: 12px;
  max-width: calc(100% - 36px);
  padding: 0;
  margin-top: auto;
  overflow-x: hidden;
  transition: var(--default-duration);
}
.images-viewer .bottom-controls-wrapper.hide[data-v-a7d6dda9] {
  box-shadow: none;
  transform: translateY(calc(100% + 12px)) scale(0.85);
}
.images-viewer .bottom-controls-wrapper:hover .bottom-panel-scroll-bar[data-v-a7d6dda9], .images-viewer .bottom-controls-wrapper:focus-within .bottom-panel-scroll-bar[data-v-a7d6dda9] {
  opacity: 0.9;
}
.images-viewer .bottom-controls-wrapper .bottom-controls-container[data-v-a7d6dda9] {
  display: flex;
  overflow: hidden;
  padding: 6px 6px 14px;
}
.images-viewer .bottom-controls-wrapper .bottom-controls-container img[src=""][data-v-a7d6dda9],
.images-viewer .bottom-controls-wrapper .bottom-controls-container img[data-v-a7d6dda9]:not([src]) {
  opacity: 0;
}
.images-viewer .bottom-controls-wrapper .bottom-controls-container .thumb-container[data-v-a7d6dda9] {
  display: flex;
  gap: 4px;
}
.images-viewer .bottom-controls-wrapper .bottom-controls-container .thumb-container .bottom-btn[data-v-a7d6dda9] {
  overflow: hidden;
  width: 64px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: var(--trans-default-background);
  transition: linear var(--xfast-duration);
}
.images-viewer .bottom-controls-wrapper .bottom-controls-container .thumb-container .bottom-btn .image-list[data-v-a7d6dda9] {
  width: 100%;
  height: 100%;
  -o-object-fit: cover;
     object-fit: cover;
}
.images-viewer .bottom-controls-wrapper .bottom-controls-container .thumb-container .bottom-btn.selected[data-v-a7d6dda9] {
  outline: 2px solid var(--tieba-theme-color);
  outline-offset: -2px;
}
.images-viewer .bottom-controls-wrapper .bottom-panel-scroll-bar[data-v-a7d6dda9] {
  position: absolute;
  bottom: 3px;
  left: 0;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background-color: var(--light-fore);
  opacity: 0.35;
  cursor: grab;
  transition: opacity var(--default-duration);
}
.images-viewer .bottom-controls-wrapper .bottom-panel-scroll-bar[data-v-a7d6dda9]:hover {
  opacity: 0.9;
}
.images-viewer .bottom-controls-wrapper .bottom-panel-scroll-bar.dragging[data-v-a7d6dda9] {
  cursor: grabbing;
  opacity: 1;
}
html.style-vercel .images-viewer[data-v-a7d6dda9] {
  --viewer-bg: #0A0A0A;
  --viewer-bg-hover: #1F1F1F;
  --viewer-border: #2A2A2A;
  --viewer-fore: #EDEDED;
  --viewer-light-fore: #A1A1A1;
  --viewer-accent: #FFFFFF;
}
html.style-vercel .images-viewer .icon[data-v-a7d6dda9] {
  color: var(--viewer-light-fore);
}
html.style-vercel .images-viewer .control-panel[data-v-a7d6dda9] {
  -webkit-backdrop-filter: none;
          backdrop-filter: none;
  border: 1px solid var(--viewer-border);
  background-color: var(--viewer-bg);
  box-shadow: none;
}
html.style-vercel .images-viewer .head-controls[data-v-a7d6dda9] {
  border-radius: 8px;
}
html.style-vercel .images-viewer .head-controls.hide[data-v-a7d6dda9] {
  box-shadow: none;
}
html.style-vercel .images-viewer .head-controls .head-sep[data-v-a7d6dda9],
html.style-vercel .images-viewer .head-controls .zoom-size[data-v-a7d6dda9] {
  color: var(--viewer-light-fore);
}
html.style-vercel .images-viewer .head-controls .head-btn[data-v-a7d6dda9] {
  border-radius: 6px;
  color: var(--viewer-light-fore);
}
html.style-vercel .images-viewer .head-controls .head-btn[data-v-a7d6dda9]:hover {
  background-color: var(--viewer-bg-hover);
  color: var(--viewer-fore);
}
html.style-vercel .images-viewer .head-controls .close[data-v-a7d6dda9]:hover {
  color: var(--error-color);
}
html.style-vercel .images-viewer .back[data-v-a7d6dda9],
html.style-vercel .images-viewer .forward[data-v-a7d6dda9] {
  border-radius: 8px;
  box-shadow: none;
  color: var(--viewer-light-fore);
}
html.style-vercel .images-viewer .back[data-v-a7d6dda9]:hover,
html.style-vercel .images-viewer .forward[data-v-a7d6dda9]:hover {
  background-color: var(--viewer-bg-hover);
  color: var(--viewer-fore);
}
html.style-vercel .images-viewer .back[data-v-a7d6dda9]:focus,
html.style-vercel .images-viewer .forward[data-v-a7d6dda9]:focus {
  box-shadow: 0 0 0 1px var(--viewer-accent);
}
html.style-vercel .images-viewer .bottom-controls-wrapper[data-v-a7d6dda9] {
  border-radius: 8px;
}
html.style-vercel .images-viewer .bottom-controls-wrapper .bottom-controls-container .thumb-container .bottom-btn[data-v-a7d6dda9] {
  border-radius: 4px;
  background-color: var(--viewer-bg-hover);
}
html.style-vercel .images-viewer .bottom-controls-wrapper .bottom-controls-container .thumb-container .bottom-btn.selected[data-v-a7d6dda9] {
  outline: 2px solid var(--viewer-accent);
}
html.style-vercel .images-viewer .bottom-controls-wrapper .bottom-panel-scroll-bar[data-v-a7d6dda9] {
  background-color: var(--viewer-light-fore);
}.post-container .bottom-controls .replies[data-v-8fa74492]::before {
  font-family: "Material Symbols", monospace !important;
}
.post-container .bottom-controls .replies[data-v-8fa74492]::before {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;
  font-weight: normal;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
a[data-v-8fa74492] {
  color: inherit;
  -webkit-text-decoration: none;
  text-decoration: none;
}
p[data-v-8fa74492] {
  margin: 0;
}
img[data-v-8fa74492]::before {
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--light-background);
  content: "";
}
.dynamic .img-button[data-v-8fa74492] {
  min-width: 30% !important;
  flex: initial !important;
  flex-grow: 1 !important;
}
.post-container[data-v-8fa74492] {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  padding: 16px;
  border-radius: 16px;
  background-color: var(--default-background);
  cursor: pointer;
  gap: 20px;
  text-align: justify;
}
.post-container .forum-btn[data-v-8fa74492] {
  border-radius: 24px;
  font-size: 14px;
}
.post-container .forum-btn[data-v-8fa74492]:not(:hover):not(:active):not(:focus) {
  background-color: var(--light-background);
  box-shadow: none;
}
.post-container .main-content[data-v-8fa74492] {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.post-container .main-content .title[data-v-8fa74492] {
  margin: 0;
  color: var(--highlight-fore);
  font-weight: var(--font-weight-bold);
}
.post-container .main-content .content[data-v-8fa74492] {
  overflow: hidden;
  color: var(--light-fore);
  font-size: 14px;
  text-overflow: ellipsis;
}
.post-container .img-container[data-v-8fa74492] {
  display: flex;
  overflow: hidden;
  flex-wrap: wrap;
  border-radius: 16px;
  gap: 6px;
}
.post-container .img-container .img-button[data-v-8fa74492] {
  overflow: hidden;
  min-width: 40%;
  height: 144px;
  flex: 1;
  padding: 0;
  border: none;
  border-radius: 0;
}
.post-container .img-container .img-button .post-img[data-v-8fa74492] {
  width: 100%;
  height: 100%;
  -o-object-fit: cover;
     object-fit: cover;
  transition: 0.4s cubic-bezier(0, 0, 0.2, 1);
}
.post-container .img-container .img-button .post-img[data-v-8fa74492]:hover {
  scale: 1.2;
}
.post-container .bottom-controls[data-v-8fa74492] {
  display: flex;
  align-items: center;
  gap: 12px;
}
.post-container .bottom-controls .author[data-v-8fa74492] {
  display: flex;
  align-items: center;
  padding: 0;
  border-radius: 24px;
  background-color: transparent;
  background-color: initial;
}
.post-container .bottom-controls .author .author-portrait[data-v-8fa74492] {
  width: 32px;
  height: 32px;
  border-radius: 24px;
  -o-object-fit: cover;
     object-fit: cover;
}
.post-container .bottom-controls .author .author-info[data-v-8fa74492] {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  text-align: left;
}
.post-container .bottom-controls .author .author-info .author-name[data-v-8fa74492] {
  font-size: 14px;
  font-weight: var(--font-weight-bold);
}
.post-container .bottom-controls .author .author-info .post-time[data-v-8fa74492] {
  color: var(--minimal-fore);
  font-size: 12px;
}
.post-container .bottom-controls .author[data-v-8fa74492]:not(:hover):not(:active):not(:focus) {
  box-shadow: none;
}
.post-container .bottom-controls .replies[data-v-8fa74492] {
  display: flex;
  min-width: 16px;
  align-items: center;
  border-radius: 24px;
  margin-left: auto;
  color: var(--light-fore);
  font-family: var(--code-zh);
  font-size: 13px;
  font-weight: var(--font-weight-bold);
}
.post-container .bottom-controls .replies[data-v-8fa74492]::before {
  margin-right: 6px;
  content: "forum";
  font-size: 16px;
  font-weight: var(--font-weight-normal);
}.masonry-wrapper[data-v-d3bb286a] {
  display: flex;
  width: 100%;
  max-width: var(--content-max);
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.masonry-wrapper .masonry-container[data-v-d3bb286a] {
  width: 100%;
  margin: auto;
}
@keyframes feeds-in-d3bb286a {
0% {
    transform: scale(0.72);
}
100% {
    transform: scale(1);
}
}
.masonry-wrapper .masonry-container .post-elem[data-v-d3bb286a] {
  animation: feeds-in-d3bb286a 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.2);
}
.masonry-wrapper .masonry-container .post-elem[data-v-d3bb286a]:not(:hover):not(:active):not(:focus) {
  box-shadow: none;
}
.masonry-wrapper > .post-elem[data-v-d3bb286a] {
  position: absolute !important;
  visibility: hidden !important;
}.confirm-dialog[data-v-efc98705] {
  display: flex;
  width: 440px;
  max-width: calc(100vw - 32px);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--default-background);
  color: var(--default-fore);
  font-family: sans-serif;
  font-family: var(--user-font, sans-serif);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
}
.confirm-header[data-v-efc98705] {
  display: flex;
  align-items: center;
  padding: 20px 24px 0;
  gap: 12px;
}
.confirm-header .confirm-icon[data-v-efc98705] {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--default-fore);
}
.confirm-header .confirm-icon[data-v-efc98705] svg {
  width: 18px;
  height: 18px;
}
.confirm-header .confirm-title[data-v-efc98705] {
  margin: 0;
  color: var(--default-fore);
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
}
.confirm-dialog.variant-danger .confirm-icon[data-v-efc98705],
.confirm-dialog.is-danger .confirm-icon[data-v-efc98705] {
  border-color: var(--error-color);
  color: var(--error-color);
}
.confirm-dialog.variant-warning .confirm-icon[data-v-efc98705] {
  border-color: var(--warning-color);
  color: var(--warning-color);
}
.confirm-dialog.variant-success .confirm-icon[data-v-efc98705] {
  border-color: var(--check-color);
  color: var(--check-color);
}
.confirm-body[data-v-efc98705] {
  padding: 16px 24px 20px;
  color: var(--light-fore);
  font-size: 14px;
  line-height: 1.55;
}
.confirm-body .confirm-content[data-v-efc98705] {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.confirm-actions[data-v-efc98705] {
  display: flex;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background-color: var(--deep-background);
  gap: 8px;
  justify-content: flex-end;
}
.confirm-btn[data-v-efc98705] {
  display: inline-flex;
  min-width: 88px;
  height: 32px;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  color: var(--default-fore);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  outline: none;
  transition: background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}
.confirm-btn[data-v-efc98705]:hover {
  background-color: var(--default-hover);
}
.confirm-btn[data-v-efc98705]:focus-visible {
  box-shadow: 0 0 0 2px var(--tieba-theme-color, var(--default-fore));
}
.confirm-btn.positive[data-v-efc98705] {
  border-color: var(--default-fore);
  background-color: var(--default-fore);
  color: var(--default-background);
}
.confirm-btn.positive[data-v-efc98705]:hover {
  opacity: 0.88;
  background-color: var(--default-fore);
}
.confirm-btn.positive.is-danger[data-v-efc98705] {
  border-color: var(--error-color);
  background-color: var(--error-color);
  color: #fff;
}
.confirm-btn.positive.is-danger[data-v-efc98705]:hover {
  background-color: var(--error-color);
}
.confirm-btn.negative[data-v-efc98705]:hover {
  border-color: var(--light-fore);
}
html:not(.style-vercel) .confirm-dialog[data-v-efc98705] {
  border-radius: 16px;
}
html:not(.style-vercel) .confirm-btn[data-v-efc98705] {
  border-radius: 10px;
}
html:not(.style-vercel) .confirm-btn.positive[data-v-efc98705] {
  border-color: var(--tieba-theme-color);
  background-color: var(--tieba-theme-color);
  color: var(--default-background);
}
html:not(.style-vercel) .confirm-btn.positive[data-v-efc98705]:hover {
  background-color: var(--tieba-theme-color);
  opacity: 0.92;
}.index-wrapper .grid-container .profile-menu-container .curr-user .user-profile[data-v-ceeadbd6] {
  -o-object-fit: contain;
     object-fit: contain;
}
a[data-v-ceeadbd6] {
  color: inherit;
  -webkit-text-decoration: none;
  text-decoration: none;
}
.block-wrapper[data-v-ceeadbd6] {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.block-controls[data-v-ceeadbd6] {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}
.block-controls .block-title[data-v-ceeadbd6] {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  gap: 8px;
}
.block-controls .block-title .block-title-icon[data-v-ceeadbd6] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}
.block-controls .block-title .block-title-icon[data-v-ceeadbd6] svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}
.block-controls .block-title .block-title-icon.icon-followed[data-v-ceeadbd6] {
  color: #ef4444;
}
.block-controls .block-title .block-title-icon.icon-followed[data-v-ceeadbd6] svg {
  fill: rgba(239, 68, 68, 0.18);
}
.block-controls .block-title .block-title-icon.icon-topic[data-v-ceeadbd6] {
  color: #f97316;
}
.block-controls .block-title .block-title-icon.icon-topic[data-v-ceeadbd6] svg {
  fill: rgba(249, 115, 22, 0.16);
}
.block-controls .block-title .block-title-icon.icon-feeds[data-v-ceeadbd6] {
  color: var(--tieba-theme-color);
}
.block-container[data-v-ceeadbd6] {
  padding: 8px;
  border-radius: 12px;
  background-color: var(--trans-light-background);
}
html[glass-effect] body.custom-background .block-container[data-v-ceeadbd6] {
  -webkit-backdrop-filter: blur(24px);
          backdrop-filter: blur(24px);
}
html[glass-effect].dark-theme body.custom-background .block-container[data-v-ceeadbd6] {
  -webkit-backdrop-filter: blur(24px) brightness(0.8);
          backdrop-filter: blur(24px) brightness(0.8);
}
.block-panel[data-v-ceeadbd6] {
  margin-left: auto;
}
.block-panel.left-align[data-v-ceeadbd6] {
  margin-left: 0;
}
.index-wrapper[data-v-ceeadbd6] {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.index-wrapper .sticky-header[data-v-ceeadbd6] {
  position: sticky;
  top: 0px;
  top: var(--sticky-top, 0px);
  z-index: 5;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 12px;
  transition: background-color var(--default-duration), box-shadow var(--default-duration), -webkit-backdrop-filter var(--default-duration);
  transition: background-color var(--default-duration), box-shadow var(--default-duration), backdrop-filter var(--default-duration);
  transition: background-color var(--default-duration), box-shadow var(--default-duration), backdrop-filter var(--default-duration), -webkit-backdrop-filter var(--default-duration);
}
.index-wrapper .sticky-header.stuck[data-v-ceeadbd6] {
  background-color: var(--surface-glass);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
html[glass-effect] .index-wrapper .sticky-header.stuck[data-v-ceeadbd6] {
  -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
}
html[glass-effect].dark-theme .index-wrapper .sticky-header.stuck[data-v-ceeadbd6] {
  -webkit-backdrop-filter: blur(12px) brightness(0.8);
          backdrop-filter: blur(12px) brightness(0.8);
}
html.dark-theme .index-wrapper .sticky-header.stuck[data-v-ceeadbd6] {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.index-wrapper .grid-container[data-v-ceeadbd6] {
  display: grid;
  max-width: var(--content-max);
  margin: 16px;
  grid-gap: 36px;
  gap: 36px;
  grid-template-rows: repeat(1, 1fr);
}
.index-wrapper .grid-container .head-controls[data-v-ceeadbd6] {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  margin-top: 24px;
  gap: 24px;
}
.index-wrapper .grid-container .head-controls .main-title[data-v-ceeadbd6] {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.index-wrapper .grid-container .head-controls .main-title .main-icon[data-v-ceeadbd6] {
  height: 64px;
}
.index-wrapper .grid-container .head-controls .main-title .title[data-v-ceeadbd6] {
  font-size: 36px;
  font-style: italic;
  font-weight: var(--font-weight-bold);
}
.index-wrapper .grid-container .head-controls .search-controls[data-v-ceeadbd6] {
  position: relative;
  display: grid;
  width: 100%;
  max-width: 420px;
  justify-content: center;
  grid-template-columns: 1fr 72px;
}
.index-wrapper .grid-container .head-controls .search-controls .search-box[data-v-ceeadbd6] {
  width: 100%;
  padding: 8px;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
  font-size: 16px;
}
.index-wrapper .grid-container .head-controls .search-controls .search-button.search-button[data-v-ceeadbd6] {
  color: var(--default-background) !important;
}
.index-wrapper .grid-container .head-controls .search-controls .search-button.search-button[data-v-ceeadbd6] {
  border: none;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  background-color: var(--tieba-theme-color);
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  transition: background-color var(--default-duration);
}
.index-wrapper .grid-container .head-controls .search-controls .search-button.search-button[data-v-ceeadbd6]:hover {
  background-color: var(--tieba-theme-hover, var(--tieba-theme-color));
}
.index-wrapper .grid-container .head-controls .search-controls .search-button.search-button[data-v-ceeadbd6]:active {
  background-color: var(--tieba-theme-active, var(--tieba-theme-color));
}
.index-wrapper .grid-container .head-controls .search-controls .search-suggestions[data-v-ceeadbd6] {
  position: absolute;
  z-index: 1;
  top: 100%;
  display: flex;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-top: 4px;
  background-color: var(--default-background);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  animation: kf-fade-in 0.2s;
}
.index-wrapper .grid-container .head-controls .search-controls .search-suggestions .search-elem[data-v-ceeadbd6] {
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0;
  padding: 8px;
  border: none;
  border-radius: 0;
  animation: stretch-ceeadbd6 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  gap: 8px;
  text-align: justify;
}
@keyframes stretch-ceeadbd6 {
0% {
    padding: 4px 8px;
}
100% {
    padding: 8px;
}
}
.index-wrapper .grid-container .head-controls .search-controls .search-suggestions .search-elem .sugg-img[data-v-ceeadbd6] {
  width: 42px;
  height: 42px;
  border-radius: 8px;
}
.index-wrapper .grid-container .head-controls .search-controls .search-suggestions .search-elem .sugg-content[data-v-ceeadbd6] {
  position: relative;
  display: flex;
  width: calc(100% - 42px - 8px);
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.index-wrapper .grid-container .head-controls .search-controls .search-suggestions .search-elem .sugg-content .sugg-title[data-v-ceeadbd6] {
  overflow: hidden;
  margin: 0;
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.index-wrapper .grid-container .head-controls .search-controls .search-suggestions .search-elem .sugg-content .sugg-desc[data-v-ceeadbd6] {
  overflow: hidden;
  margin: 0;
  color: var(--light-fore);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.index-wrapper .grid-container .profile-menu-container[data-v-ceeadbd6] {
  position: absolute;
  z-index: 1;
}
.index-wrapper .grid-container .profile-menu-container .curr-user[data-v-ceeadbd6] {
  position: fixed;
  top: 24px;
  left: 24px;
  overflow: hidden;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 3px solid var(--border-color);
  border-radius: 36px;
}
.index-wrapper .grid-container .profile-menu-container .curr-user .user-profile[data-v-ceeadbd6] {
  width: 100%;
}
.index-wrapper .grid-container .profile-menu-container .profile-menu[data-v-ceeadbd6] {
  top: 64px;
  left: 24px;
}
.index-wrapper .grid-container .config-menu-container[data-v-ceeadbd6] {
  position: absolute;
  z-index: 1;
  display: flex;
}
.index-wrapper .grid-container .config-menu-container .config-menu-btn[data-v-ceeadbd6] {
  position: fixed;
  top: 24px;
  right: 24px;
  height: 32px;
  border: none;
  border-radius: 36px;
  background-color: var(--page-background);
  font-size: 24px;
}
.index-wrapper .grid-container .config-menu-container .config-menu-btn[data-v-ceeadbd6]:hover {
  background-color: var(--default-background);
}
.index-wrapper .grid-container .config-menu-container .config-menu-btn[data-v-ceeadbd6]:active {
  background-color: var(--default-hover);
}
.index-wrapper .grid-container .config-menu-container .config-menu[data-v-ceeadbd6] {
  top: 64px;
  right: 24px;
  opacity: 1;
}
.index-wrapper .grid-container .signed-count[data-v-ceeadbd6] {
  font-weight: var(--font-weight-bold);
}
.index-wrapper .grid-container .block-panel.followed[data-v-ceeadbd6] {
  margin-left: auto;
}
.index-wrapper .grid-container .followed-container[data-v-ceeadbd6] {
  margin-top: -16px;
}
.index-wrapper .grid-container .followed-container .followed-list[data-v-ceeadbd6] {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.index-wrapper .grid-container .followed-container .followed-list .followed-btn[data-v-ceeadbd6] {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 12px;
  font-size: 14px;
  gap: 6px;
}
.index-wrapper .grid-container .followed-container .followed-list .followed-btn .signed[data-v-ceeadbd6] {
  color: green;
  font-weight: var(--font-weight-bold);
}
.index-wrapper .grid-container .followed-container .followed-list .followed-btn .forum-level[data-v-ceeadbd6] {
  min-width: 24px;
  padding: 0 2px;
  border-radius: 24px;
  font-weight: var(--font-weight-bold);
  text-align: center;
}
.index-wrapper .grid-container .topic-list[data-v-ceeadbd6] {
  display: grid;
  grid-gap: 4px;
  gap: 4px;
  grid-auto-rows: max-content;
  grid-template-columns: repeat(2, 1fr);
}
.index-wrapper .grid-container .topic-list .topic-btn[data-v-ceeadbd6] {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  gap: 8px;
}
.index-wrapper .grid-container .topic-list .topic-btn .topic-img[data-v-ceeadbd6] {
  width: 72px;
  border-radius: 12px;
}
.index-wrapper .grid-container .topic-list .topic-btn .topic-content[data-v-ceeadbd6] {
  display: flex;
  flex-flow: column wrap;
  gap: 4px;
  text-align: justify;
}
.index-wrapper .grid-container .topic-list .topic-btn .topic-content .topic-title[data-v-ceeadbd6] {
  display: flex;
  align-items: center;
  gap: 6px;
}
.index-wrapper .grid-container .topic-list .topic-btn .topic-content .topic-title [class^=topic-rank][data-v-ceeadbd6] {
  padding: 0 4px;
  border-radius: 4px;
  background-color: orange;
  color: var(--default-background);
  font-weight: var(--font-weight-bold);
  text-align: center;
}
.index-wrapper .grid-container .topic-list .topic-btn .topic-content .topic-title .topic-name[data-v-ceeadbd6] {
  font-size: 16px;
  font-weight: var(--font-weight-bold);
}
.index-wrapper .grid-container .topic-list .topic-btn .topic-content .topic-desc[data-v-ceeadbd6] {
  color: var(--light-fore);
  font-size: 14px;
}
.index-wrapper .masonry-container[data-v-ceeadbd6] {
  display: flex;
  width: calc(100% - 32px);
  max-width: var(--content-max);
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.index-wrapper .masonry-container .feeds-container[data-v-ceeadbd6] {
  width: 100%;
  margin: auto;
}
@keyframes feeds-in-ceeadbd6 {
0% {
    transform: scale(0.72);
}
100% {
    transform: scale(1);
}
}
@keyframes refresh-btn-in-ceeadbd6 {
0% {
    padding: 0 18px;
    opacity: 0;
}
100% {
    padding: 8px 18px;
    opacity: 1;
}
}
.index-wrapper .masonry-container .feeds-container .feeds-refresh-btn[data-v-ceeadbd6] {
  position: fixed;
  z-index: 1;
  bottom: 24px;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border-width: 2px;
  border-radius: 16px;
  animation: refresh-btn-in-ceeadbd6 0.4s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  gap: 6px;
  transform: translateX(-50%);
}
.index-wrapper .masonry-container .feeds-container .feeds-refresh-btn .icon[data-v-ceeadbd6] {
  font-size: 18px;
}
.index-wrapper .masonry-container .post-elem[data-v-ceeadbd6] {
  animation: feeds-in-ceeadbd6 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.2);
}
.index-wrapper .masonry-container .post-elem[data-v-ceeadbd6]:not(:hover):not(:active):not(:focus) {
  box-shadow: none;
}
.index-wrapper .masonry-container .empty-container .no-feed-content[data-v-ceeadbd6] {
  color: var(--minimal-fore);
  font-size: small;
  text-align: center;
}
.index-wrapper .back-to-top-btn[data-v-ceeadbd6] {
  position: fixed;
  z-index: 1100;
  right: max(20px, (100% - var(--content-max)) / 2 - 56px);
  bottom: 32px;
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--surface-glass);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  color: var(--default-fore);
}
html[glass-effect] .index-wrapper .back-to-top-btn[data-v-ceeadbd6] {
  -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
}
html[glass-effect].dark-theme .index-wrapper .back-to-top-btn[data-v-ceeadbd6] {
  -webkit-backdrop-filter: blur(12px) brightness(0.8);
          backdrop-filter: blur(12px) brightness(0.8);
}
.index-wrapper .back-to-top-btn .icon[data-v-ceeadbd6] {
  font-size: 22px;
}
.index-wrapper .back-to-top-btn[data-v-ceeadbd6]:hover {
  background-color: var(--default-hover);
}
.index-wrapper .back-to-top-btn[data-v-ceeadbd6]:active {
  background-color: var(--default-active);
}
html.dark-theme .index-wrapper .back-to-top-btn[data-v-ceeadbd6] {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
.index-wrapper .back-to-top-enter-active[data-v-ceeadbd6],
.index-wrapper .back-to-top-leave-active[data-v-ceeadbd6] {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.index-wrapper .back-to-top-enter-from[data-v-ceeadbd6],
.index-wrapper .back-to-top-leave-to[data-v-ceeadbd6] {
  opacity: 0;
  transform: translateY(12px);
}.pager-wrapper .pager-button-container .pager-button.icon[data-v-706b517f] {
  font-family: "Material Symbols", monospace !important;
}
.pager-wrapper .pager-button-container .pager-button.icon[data-v-706b517f] {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;
  font-weight: normal;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
.pager-wrapper[data-v-706b517f] {
  display: flex;
  width: -moz-fit-content;
  width: fit-content;
  box-sizing: border-box;
  align-items: center;
  padding: 4px;
  font-size: 16px;
  gap: 6px;
}
.pager-wrapper .pager-button-container[data-v-706b517f] {
  display: flex;
  align-items: center;
}
.pager-wrapper .pager-button-container .pager-button[data-v-706b517f] {
  padding: 4px 10px;
  color: var(--default-fore);
  font-family: var(--code-zh);
}
.pager-wrapper .pager-button-container .pager-button[data-v-706b517f]:not(:hover):not(:active):not(:focus) {
  background-color: transparent;
}
.pager-wrapper .pager-button-container .pager-button.fill[data-v-706b517f]:not(:hover):not(:active):not(:focus) {
  background-color: var(--default-background);
}
.pager-wrapper .pager-button-container .pager-button.curr-pager-button[data-v-706b517f] {
  border-radius: 0;
  box-shadow: 0 3px 0 var(--tieba-theme-color);
  color: var(--tieba-theme-color);
}
.pager-wrapper .pager-separactor[data-v-706b517f] {
  color: var(--minimal-fore);
  font-family: var(--code-monospace);
}
.pager-wrapper .jumper-container[data-v-706b517f] {
  display: flex;
  align-items: center;
  color: var(--light-fore);
  gap: 6px;
}
.pager-wrapper .jumper-container .jumper[data-v-706b517f] {
  width: 36px;
  width: 3em;
  padding: 2px 4px;
  color: var(--default-fore);
  font-family: var(--code-monospace);
}
.pager-wrapper .tail-slot[data-v-706b517f] {
  margin-left: auto;
  color: var(--minimal-fore);
}#thread-editor[data-v-4e79c05d] {
  display: flex;
  width: 100%;
  max-width: var(--content-max);
  max-height: 100vh;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  margin: auto auto 0;
  background-color: var(--default-background);
  font-size: 12px;
  gap: 8px;
  transition: 0.4s;
}
#thread-editor #thread-editor-exit[data-v-4e79c05d] {
  margin-left: auto;
  font-size: 18px;
}
#thread-editor #thread-editor-exit[data-v-4e79c05d]:not(:hover):not(:active):not(:focus) {
  box-shadow: none;
}
#thread-editor .title-editor[data-v-4e79c05d] {
  width: 100%;
  flex-grow: 1;
  border-width: 3px;
  background-color: transparent;
  font-size: 24px;
  font-weight: var(--font-weight-bold);
}
#thread-editor h1[data-v-4e79c05d] {
  margin-right: auto;
}
#thread-editor #thread-editor-slot[data-v-4e79c05d] {
  width: 100%;
  flex-shrink: 2;
}
#thread-editor #thread-editor-toolbar[data-v-4e79c05d] {
  display: flex;
  width: 100%;
  align-items: center;
}
#thread-editor #thread-editor-toolbar #thread-editor-submit[data-v-4e79c05d] {
  padding: 4px 12px;
  margin-left: auto;
  font-size: 16px;
  font-weight: var(--font-weight-bold);
}#thread-editor .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn .edui-icon::before {
  font-family: "Material Symbols", monospace !important;
}
#thread-editor .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn .edui-icon::before {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;
  font-weight: normal;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
@keyframes kf-editor-in {
from {
    transform: translateY(100%);
}
to {
    transform: translateY(0);
}
}
@keyframes kf-editor-out {
from {
    transform: translateY(0);
}
to {
    transform: translateY(100%);
}
}
#thread-editor #ueditor_replace {
  font-size: 16px;
}
#thread-editor .edui-container {
  width: 100% !important;
}
#thread-editor .edui-container .edui-toolbar {
  height: auto;
  align-items: center;
  background-color: transparent;
}
#thread-editor .edui-container .edui-toolbar .edui-btn-toolbar {
  display: flex;
  background-color: transparent;
  gap: 8px;
}
#thread-editor .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn {
  padding: 1px;
  border-radius: 4px;
  margin-right: 0;
  background: none;
  background-color: var(--light-background);
  box-shadow: 0 0 0 1px var(--border-color);
  cursor: pointer;
  transition: 0.4s;
}
#thread-editor .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn .edui-icon {
  display: flex;
  width: -moz-max-content;
  width: max-content;
  align-items: center;
  padding: 2px 4px;
  background: none;
  gap: 4px;
}
#thread-editor .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn .edui-icon::before {
  font-size: 16px;
}
#thread-editor .edui-container .edui-toolbar .edui-dialog-container .edui-dropdown-menu {
  overflow: hidden;
  width: -moz-max-content;
  width: max-content;
  padding: 0;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: none;
}
#thread-editor .edui-container .edui-toolbar .edui-dialog-container .edui-dropdown-menu .edui-popup-body {
  padding: 0;
  border: none;
  background-color: var(--default-background);
}
#thread-editor .edui-container .edui-toolbar .edui-dialog-container .edui-dropdown-menu .edui-popup-caret {
  display: none;
}
#thread-editor .edui-container .edui-editor-body {
  border: none;
  border-radius: 0;
  border-bottom: 3px solid var(--tieba-theme-color);
  transition: 0.4s;
}
#thread-editor .edui-container .edui-editor-body:hover {
  border-color: var(--light-background);
}
#thread-editor .edui-container .edui-editor-body:focus {
  border-color: var(--tieba-theme-color);
}
#thread-editor .edui-container .edui-body-container {
  min-height: 18px !important;
}
#thread-editor .edui-container .edui-body-container {
  max-height: 50vh;
  padding: 0;
  border-radius: 0;
  background-color: transparent;
}
.edui-btn-topic {
  display: none !important;
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-medal::before {
  content: "diamond";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-medal::after {
  content: "\u7279\u6743";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-image::before {
  content: "photo";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-image::after {
  content: "\u63D2\u5165\u56FE\u7247";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-video::before {
  content: "video_file";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-video::after {
  content: "\u63D2\u5165\u89C6\u9891";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-emotion::before {
  content: "face";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-emotion::after {
  content: "\u63D2\u5165\u8868\u60C5";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-scrawl::before {
  content: "format_paint";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-scrawl::after {
  content: "\u6D82\u9E26";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-topic::before {
  content: "grid_3x3";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-topic::after {
  content: "\u8BDD\u9898";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-quick-reply::before {
  content: "rocket_launch";
}
#thread-editor .edui-btn-toolbar .edui-icon.edui-icon-quick-reply::after {
  content: "\u5FEB\u901F\u56DE\u5E16";
}
.edui-popup-body .layer_medal_list li a::before,
.edui-popup-body .layer_btn_list li a::before {
  font-family: "Material Symbols", monospace !important;
}
.edui-popup-body .layer_medal_list li a::before,
.edui-popup-body .layer_btn_list li a::before {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;
  font-weight: normal;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
.edui-dialog-container .upload_container .next_step, .edui-popup-body .layer_medal_list li a,
.edui-popup-body .layer_btn_list li a {
  box-sizing: border-box;
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: none;
  background-color: var(--default-background);
  box-shadow: 0 0 0 1px var(--border-color);
  color: var(--default-fore);
  cursor: pointer;
  transition: var(--default-duration);
}
.edui-dialog-container .upload_container .next_step:hover:not([disabled]), .edui-popup-body .layer_medal_list li a:hover:not([disabled]),
.edui-popup-body .layer_btn_list li a:hover:not([disabled]) {
  background-color: var(--default-hover);
}
.edui-dialog-container .upload_container .next_step:active:not([disabled]), .edui-popup-body .layer_medal_list li a:active:not([disabled]),
.edui-popup-body .layer_btn_list li a:active:not([disabled]) {
  background-color: var(--default-active);
}
.edui-dialog-container .upload_container .next_step:focus:not([disabled]), .edui-popup-body .layer_medal_list li a:focus:not([disabled]),
.edui-popup-body .layer_btn_list li a:focus:not([disabled]) {
  border-color: var(--tieba-theme-color);
  box-shadow: 0 0 0 2px var(--tieba-theme-color);
}
.edui-dialog-container .upload_container .theme-style.next_step, .edui-popup-body .layer_medal_list li a.theme-style,
.edui-popup-body .layer_btn_list li a.theme-style {
  color: var(--default-background) !important;
}
.edui-dialog-container .upload_container .theme-style.next_step, .edui-popup-body .layer_medal_list li a.theme-style,
.edui-popup-body .layer_btn_list li a.theme-style {
  background-color: var(--tieba-theme-color);
}
.edui-dialog-container .upload_container .theme-style.next_step:hover, .edui-popup-body .layer_medal_list li a.theme-style:hover,
.edui-popup-body .layer_btn_list li a.theme-style:hover {
  background-color: var(--tieba-theme-hover);
}
.edui-dialog-container .upload_container .theme-style.next_step:active, .edui-popup-body .layer_medal_list li a.theme-style:active,
.edui-popup-body .layer_btn_list li a.theme-style:active {
  background-color: var(--tieba-theme-active);
}
.edui-dialog-container .upload_container .unset-background.next_step, .edui-popup-body .layer_medal_list li a.unset-background,
.edui-popup-body .layer_btn_list li a.unset-background {
  background-color: transparent;
  background-color: initial;
}
.edui-dialog-container .upload_container .no-border.next_step, .edui-popup-body .layer_medal_list li a.no-border,
.edui-popup-body .layer_btn_list li a.no-border {
  box-shadow: none;
}
.edui-dialog-container .upload_container .no-border-all.next_step, .edui-popup-body .layer_medal_list li a.no-border-all,
.edui-popup-body .layer_btn_list li a.no-border-all {
  box-shadow: none;
}
.edui-dialog-container .upload_container .no-border-all.next_step:hover, .edui-popup-body .layer_medal_list li a.no-border-all:hover,
.edui-popup-body .layer_btn_list li a.no-border-all:hover, .edui-dialog-container .upload_container .no-border-all.next_step:focus, .edui-popup-body .layer_medal_list li a.no-border-all:focus,
.edui-popup-body .layer_btn_list li a.no-border-all:focus {
  box-shadow: none;
}
.edui-dialog-container .edui-popup {
  position: static !important;
}
.edui-dialog-container .upload_container {
  padding: 0 20px 20px 0;
}
.edui-dialog-container .upload_container .slide_item_img {
  border-color: var(--tieba-theme-color) !important;
}
.edui-dialog-container .upload_container .slide_item_img {
  overflow: hidden;
}
.edui-dialog-container .upload_container .watermark_options {
  position: static;
  margin-left: 20px;
}
.edui-dialog-container .upload_container .next_step {
  position: static;
  width: -moz-max-content;
  width: max-content;
  height: -moz-max-content;
  height: max-content;
  padding: 4px 8px;
  margin-left: auto;
  line-height: normal;
}
.edui-popup-body {
  position: static;
}
.edui-popup-body .layer_medal_list,
.edui-popup-body .layer_btn_list {
  width: -moz-max-content;
  width: max-content;
  height: -moz-max-content;
  height: max-content;
}
.edui-popup-body .layer_medal_list li,
.edui-popup-body .layer_btn_list li {
  display: flex;
  overflow: hidden;
  align-items: center;
  padding: 0;
  background: none;
}
.edui-popup-body .layer_medal_list li a,
.edui-popup-body .layer_btn_list li a {
  display: flex;
  width: -moz-max-content;
  width: max-content;
  height: -moz-max-content;
  height: max-content;
  align-items: center;
  padding: 4px 8px;
  border-radius: 0;
  box-shadow: none;
  gap: 4px;
}
.edui-popup-body .layer_medal_list li a::before,
.edui-popup-body .layer_btn_list li a::before {
  font-size: 16px;
}
.layer_medal_list li.post_bubble a::before {
  content: "bubble_chart";
}
.layer_medal_list li.post_bubble a::after {
  content: "\u53D1\u5E16\u6C14\u6CE1";
}
.layer_medal_list li.colorful_font a::before {
  content: "format_color_text";
}
.layer_medal_list li.colorful_font a::after {
  content: "\u5F69\u8272\u5B57\u4F53";
}
.layer_btn_list {
  padding: 0 !important;
}
.layer_btn_list li {
  border: none !important;
}
.layer_btn_list li.from_upload a::before {
  content: "upload_file";
}
.layer_btn_list li.from_upload a::after {
  content: "\u4E0A\u4F20\u6587\u4EF6";
}
.layer_btn_list li.from_web a::before {
  content: "web";
}
.layer_btn_list li.from_web a::after {
  content: "\u7F51\u7EDC\u56FE\u7247";
}#thread-editor .emotion_container .ueditor_emotion_tab .s_prev::before,
#thread-editor .emotion_container .ueditor_emotion_tab .s_next::before {
  font-family: "Material Symbols", monospace !important;
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_prev::before,
#thread-editor .emotion_container .ueditor_emotion_tab .s_next::before {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;
  font-weight: normal;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_prev,
#thread-editor .emotion_container .ueditor_emotion_tab .s_next {
  box-sizing: border-box;
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: none;
  background-color: var(--default-background);
  box-shadow: 0 0 0 1px var(--border-color);
  color: var(--default-fore);
  cursor: pointer;
  transition: var(--default-duration);
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_prev:hover:not([disabled]),
#thread-editor .emotion_container .ueditor_emotion_tab .s_next:hover:not([disabled]) {
  background-color: var(--default-hover);
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_prev:active:not([disabled]),
#thread-editor .emotion_container .ueditor_emotion_tab .s_next:active:not([disabled]) {
  background-color: var(--default-active);
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_prev:focus:not([disabled]),
#thread-editor .emotion_container .ueditor_emotion_tab .s_next:focus:not([disabled]) {
  border-color: var(--tieba-theme-color);
  box-shadow: 0 0 0 2px var(--tieba-theme-color);
}
#thread-editor .emotion_container .ueditor_emotion_tab .theme-style.s_prev,
#thread-editor .emotion_container .ueditor_emotion_tab .theme-style.s_next {
  color: var(--default-background) !important;
}
#thread-editor .emotion_container .ueditor_emotion_tab .theme-style.s_prev,
#thread-editor .emotion_container .ueditor_emotion_tab .theme-style.s_next {
  background-color: var(--tieba-theme-color);
}
#thread-editor .emotion_container .ueditor_emotion_tab .theme-style.s_prev:hover,
#thread-editor .emotion_container .ueditor_emotion_tab .theme-style.s_next:hover {
  background-color: var(--tieba-theme-hover);
}
#thread-editor .emotion_container .ueditor_emotion_tab .theme-style.s_prev:active,
#thread-editor .emotion_container .ueditor_emotion_tab .theme-style.s_next:active {
  background-color: var(--tieba-theme-active);
}
#thread-editor .emotion_container .ueditor_emotion_tab .unset-background.s_prev,
#thread-editor .emotion_container .ueditor_emotion_tab .unset-background.s_next {
  background-color: transparent;
  background-color: initial;
}
#thread-editor .emotion_container .ueditor_emotion_tab .no-border.s_prev,
#thread-editor .emotion_container .ueditor_emotion_tab .no-border.s_next {
  box-shadow: none;
}
#thread-editor .emotion_container .ueditor_emotion_tab .no-border-all.s_prev,
#thread-editor .emotion_container .ueditor_emotion_tab .no-border-all.s_next {
  box-shadow: none;
}
#thread-editor .emotion_container .ueditor_emotion_tab .no-border-all.s_prev:hover,
#thread-editor .emotion_container .ueditor_emotion_tab .no-border-all.s_next:hover, #thread-editor .emotion_container .ueditor_emotion_tab .no-border-all.s_prev:focus,
#thread-editor .emotion_container .ueditor_emotion_tab .no-border-all.s_next:focus {
  box-shadow: none;
}
#thread-editor .emotion_container .tbui_scroll_panel {
  overflow: hidden;
  border-radius: 4px 4px 0 0;
}
html.dark-theme #thread-editor .emotion_container td, html.dark-theme #thread-editor .emotion_container .emotion_preview {
  filter: brightness(0.8);
}
#thread-editor .emotion_container .emotion_preview {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
html.dark-theme #thread-editor .emotion_container .emotion_preview {
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.4);
}
#thread-editor .emotion_container .ueditor_emotion_tab {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border-top: 2px solid var(--border-color);
  background: none;
  background-color: var(--default-background);
  color: var(--default-fore);
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_prev,
#thread-editor .emotion_container .ueditor_emotion_tab .s_next {
  width: -moz-max-content !important;
  width: max-content !important;
  height: -moz-max-content !important;
  height: max-content !important;
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_prev,
#thread-editor .emotion_container .ueditor_emotion_tab .s_next {
  position: static;
  padding: 0 2px;
  background: none;
  box-shadow: none;
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_prev::before,
#thread-editor .emotion_container .ueditor_emotion_tab .s_next::before {
  font-size: 10px;
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_prev::before {
  content: "arrow_back_ios";
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_next::before {
  content: "arrow_forward_ios";
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_tab_con_wrapper {
  position: static;
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_tab_con_wrapper .s_tab_btn {
  border-radius: 4px;
  background: none;
  background-color: var(--default-background);
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_tab_con_wrapper .s_tab_btn .s_tab_btnbg {
  border-radius: 4px;
  background: none;
  transition: var(--default-duration);
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_tab_con_wrapper .s_hover {
  filter: brightness(1.2);
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_tab_con_wrapper .s_hover .s_tab_btnbg {
  filter: brightness(1.4);
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_tab_con_wrapper .selected {
  background: none;
}
#thread-editor .emotion_container .ueditor_emotion_tab .s_tab_con_wrapper .selected .s_tab_btnbg {
  background-color: var(--tieba-theme-color);
  color: var(--default-background);
  font-weight: var(--font-weight-bold);
}.toggle-panel .toggle-container .panel-button {
  font-family: "Material Symbols", monospace !important;
}
.toggle-panel .toggle-container .panel-button {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;
  font-weight: normal;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
.toggle-panel .toggle-container .panel-button.toggle-on {
  font-family: "Material Symbols", monospace !important;
}
.toggle-panel .toggle-container .panel-button.toggle-on {
  font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 40;
  font-weight: normal;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}
.user-dialog-modal .user-dialog.default:not(.does-not-exist):has(.toggle-panel) {
  overflow: visible !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.user-dialog-modal .user-dialog.default .dialog-content:has(.toggle-panel) {
  overflow: visible !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.toggle-panel {
  --float-button-size: 40px;
  --float-button-radius: 12px;
  --float-button-border: rgba(0, 0, 0, 0.1);
  --float-button-border-hover: rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  overflow: visible;
}
.toggle-panel .toggle-container {
  display: flex;
  width: var(--float-button-size);
  height: var(--float-button-size);
}
.toggle-panel .toggle-container .panel-button {
  border: 1px solid var(--float-button-border) !important;
  border-radius: var(--float-button-radius) !important;
  background-color: var(--default-background) !important;
  background-image: none !important;
  box-shadow: none !important;
  outline: none !important;
}
.toggle-panel .toggle-container .panel-button {
  box-sizing: border-box;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  min-width: var(--float-button-size);
  min-height: var(--float-button-size);
  max-width: var(--float-button-size);
  max-height: var(--float-button-size);
  padding: 0;
  margin: 0;
  width: var(--float-button-size);
  height: var(--float-button-size);
  font-size: 24px;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 var(--float-button-size);
  line-height: 1;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  color: var(--minimal-fore);
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.toggle-panel .toggle-container .panel-button:hover {
  border-color: var(--float-button-border-hover) !important;
  background-color: var(--default-background) !important;
  color: var(--tieba-theme-color) !important;
}
.toggle-panel .toggle-container .panel-button:hover {
  transform: translateY(-1px);
}
.toggle-panel .toggle-container .panel-button:active {
  background-color: var(--default-background) !important;
}
.toggle-panel .toggle-container .panel-button:active {
  transform: translateY(0);
}
.toggle-panel .toggle-container .panel-button:focus {
  box-shadow: 0 0 0 2px var(--tieba-theme-color) !important;
}
.toggle-panel .toggle-container .panel-button::before, .toggle-panel .toggle-container .panel-button::after {
  box-shadow: none !important;
}
.toggle-panel .toggle-container .panel-button.toggle-off {
  color: var(--minimal-fore) !important;
}
.toggle-panel .toggle-container .panel-button.toggle-on {
  border-color: var(--tieba-theme-color) !important;
  background-color: var(--tieba-theme-background) !important;
  color: var(--tieba-theme-color) !important;
}
.toggle-panel .toggle-container .panel-button.toggle-on:hover {
  background-color: var(--tieba-theme-background) !important;
  color: var(--tieba-theme-hover) !important;
}
.toggle-panel .toggle-container .panel-button.toggle-on:active {
  background-color: var(--tieba-theme-background) !important;
  color: var(--tieba-theme-active) !important;
}
.toggle-panel .toggle-container .panel-button.toggle-on:focus {
  box-shadow: 0 0 0 1px var(--tieba-theme-color);
}@keyframes stretch-caa2e6ca {
0% {
    padding: 2px 14px;
}
100% {
    padding: 4px 14px;
}
}
a[data-v-caa2e6ca] {
  color: inherit;
}
.dropdown-menu[data-v-caa2e6ca] {
  position: fixed;
  z-index: 1;
  display: flex;
  overflow: hidden;
  width: -moz-max-content;
  width: max-content;
  flex-direction: column;
  padding: 4px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--default-background);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
  animation: kf-fade-in var(--fast-duration);
  font-size: 14px;
}
.dropdown-menu .menu-item[data-v-caa2e6ca] {
  display: flex;
  width: 100%;
  align-items: center;
  padding: 4px 14px;
  border: none;
  border-radius: 6px;
  animation: stretch-caa2e6ca var(--fast-duration) cubic-bezier(0.22, 0.61, 0.36, 1);
  background: none;
  color: var(--default-fore);
  font-size: 14px;
  gap: 6px;
  transition: 0.2s;
}
.dropdown-menu .menu-item .menu-title[data-v-caa2e6ca] {
  display: flex;
  width: 100%;
  gap: 12px;
  text-align: justify;
}
.dropdown-menu .menu-item .menu-title .menu-inner[data-v-caa2e6ca] {
  margin-left: auto;
  color: var(--minimal-fore);
}
.dropdown-menu .menu-item[data-v-caa2e6ca]:hover {
  background-color: var(--default-hover);
}
.dropdown-menu .menu-item[data-v-caa2e6ca]:active {
  background-color: var(--default-active);
}
.dropdown-menu .menu-separator[data-v-caa2e6ca] {
  width: calc(100% + 8px);
  height: 1px;
  margin: 6px 0 6px -4px;
  background-color: var(--border-color);
}
.blur-effect[data-v-caa2e6ca] {
  background-color: var(--trans-default-background);
}
html[glass-effect] .blur-effect[data-v-caa2e6ca] {
  -webkit-backdrop-filter: blur(24px);
          backdrop-filter: blur(24px);
}
html[glass-effect].dark-theme .blur-effect[data-v-caa2e6ca] {
  -webkit-backdrop-filter: blur(24px) brightness(0.8);
          backdrop-filter: blur(24px) brightness(0.8);
}.nav-reveal-zone[data-v-fd59fd7f] {
  position: fixed;
  z-index: 1199;
  top: 0;
  right: 0;
  left: 0;
  height: 16px;
}
#nav-bar[data-v-fd59fd7f] {
  position: fixed;
  z-index: 1200;
  top: 8px;
  right: 0;
  left: 0;
  display: flex;
  width: calc(100% - 44px);
  max-width: 840px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin: 0 auto;
  background-color: var(--surface-glass);
  will-change: transform;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform var(--default-duration), opacity var(--default-duration);
}
html[glass-effect] #nav-bar[data-v-fd59fd7f] {
  -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
}
html[glass-effect].dark-theme #nav-bar[data-v-fd59fd7f] {
  -webkit-backdrop-filter: blur(12px) brightness(0.8);
          backdrop-filter: blur(12px) brightness(0.8);
}
html.dark-theme #nav-bar[data-v-fd59fd7f] {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
@supports not (scrollbar-gutter: stable) {
body[no-scrollbar] #nav-bar[data-v-fd59fd7f] {
    right: var(--scrollbar-width);
}
}
#nav-bar.fold[data-v-fd59fd7f] {
  transform: translateY(calc(-100% - 16px));
  opacity: 0;
}
#nav-bar.fold.revealed[data-v-fd59fd7f] {
  transform: translateY(0);
  opacity: 1;
}
#nav-bar #nav-container[data-v-fd59fd7f] {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
#nav-bar #nav-container .left-container .nav-brand[data-v-fd59fd7f] {
  color: var(--default-fore);
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  opacity: 0.5;
  -webkit-text-decoration: none;
  text-decoration: none;
}
#nav-bar #nav-container .right-container[data-v-fd59fd7f] {
  display: flex;
  align-items: center;
  gap: 4px;
}
#nav-bar #nav-container .right-container .avatar-button .nav-avatar[data-v-fd59fd7f] {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  -o-object-fit: cover;
     object-fit: cover;
}
#nav-bar #nav-container .right-container .avatar-button:hover > .nav-avatar[data-v-fd59fd7f] {
  box-shadow: 0 0 0 2px var(--tieba-theme-color);
}
.nav-icon-button[data-v-fd59fd7f] {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--light-fore);
}
.nav-icon-button .nav-svg[data-v-fd59fd7f] {
  width: 18px;
  height: 18px;
}
.nav-icon-button[data-v-fd59fd7f]:hover {
  background-color: var(--default-hover);
  color: var(--default-fore);
}
.menu-trigger[data-v-fd59fd7f] {
  position: relative;
  background-color: transparent;
}
.menu-trigger[data-v-fd59fd7f]::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 0;
  height: var(--trigger-extend-height, 0);
}
.nav-menu[data-v-fd59fd7f] {
  position: fixed;
  z-index: 1201;
  visibility: hidden;
  cursor: default;
  font-weight: var(--font-weight-normal);
  opacity: 0;
  pointer-events: none;
}
.nav-menu.visible[data-v-fd59fd7f] {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
}:root {\r
    --myself-theme-background: rgba(25, 110, 153, 0.2);\r
    --myself-theme-fore: rgb(16, 73, 101);\r
    --cengzhu-theme-background: rgba(255, 89, 107, 0.2);\r
    --cengzhu-theme-fore: rgb(178, 62, 90);\r
}\r
\r
@media (prefers-color-scheme: dark) {\r
    :root {\r
        --myself-theme-background: rgba(34, 135, 204, 0.2);\r
        --myself-theme-fore: rgb(40, 160, 242);\r
        --cengzhu-theme-background: rgba(204, 71, 103, 0.2);\r
        --cengzhu-theme-fore: rgb(255, 89, 118);\r
    }\r
}\r
\r
.tag-elem {\r
    display: inline-block;\r
}\r
\r
.tag-elem::after {\r
    padding: 2px 6px;\r
    border-radius: 4px;\r
    margin: 0 4px;\r
    background-color: var(--trans-light-background);\r
    color: var(--light-fore);\r
    font-size: 12px;\r
    font-weight: var(--font-weight-normal);\r
}\r
\r
.tieba-tags-me::after {\r
    /* background-color: var(--myself-theme-background);\r
    color: var(--myself-theme-fore); */\r
    content: "\u6211";\r
}\r
\r
.tieba-tags-lz::after {\r
    background-color: var(--tieba-theme-background);\r
    color: var(--tieba-theme-fore);\r
    content: "\u697C\u4E3B";\r
}\r
\r
.tieba-tags-cz::after {\r
    background-color: rgba(255, 89, 107, 0.2);\r
    background-color: var(--cengzhu-theme-background);\r
    color: rgb(178, 62, 90);\r
    color: var(--cengzhu-theme-fore);\r
    content: "\u5C42\u4E3B";\r
} `);

(function () {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  (function(_2, vue, userView, libelemental2, marked2) {
    var _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != "undefined" ? GM_addStyle : undefined)();
    var _GM_deleteValue = /* @__PURE__ */ (() => typeof GM_deleteValue != "undefined" ? GM_deleteValue : undefined)();
    var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : undefined)();
    var _GM_info = /* @__PURE__ */ (() => typeof GM_info != "undefined" ? GM_info : undefined)();
    var _GM_listValues = /* @__PURE__ */ (() => typeof GM_listValues != "undefined" ? GM_listValues : undefined)();
    var _GM_openInTab = /* @__PURE__ */ (() => typeof GM_openInTab != "undefined" ? GM_openInTab : undefined)();
    var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : undefined)();
    var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : undefined)();
    const _hoisted_1$j = { class: "trigger-text" };
    const _hoisted_2$g = {
      key: 0,
      class: "select-popover"
    };
    const _hoisted_3$d = { class: "select-list" };
    const _hoisted_4$b = ["onClick", "onMouseenter", "onMouseleave"];
    const _hoisted_5$9 = { class: "item-text" };
    const _sfc_main$l = /* @__PURE__ */ vue.defineComponent({
      __name: "setting-select",
      props: {
        data: {},
        defaultValue: {}
      },
      emits: ["change"],
      setup(__props, { emit: __emit }) {
        const props = __props;
        const emit = __emit;
        const hoverDescApi = vue.inject("settingHoverDesc", {
          set: () => {
          },
          clear: () => {
          }
        });
        const rootRef = vue.ref();
        const open = vue.ref(false);
        const currentValue = vue.ref(props.defaultValue);
        const hoverIdx = vue.ref(-1);
        vue.watch(() => props.defaultValue, (v) => {
          currentValue.value = v;
        });
        const currentText = vue.computed(() => {
          const found = props.data.find((d) => d.value === currentValue.value);
          return (found == null ? undefined : found.text) ?? "";
        });
        function toggleOpen() {
          open.value = !open.value;
          if (!open.value) hoverDescApi.clear();
        }
        function choose(item) {
          currentValue.value = item.value;
          open.value = false;
          hoverDescApi.clear();
          emit("change", item.value);
        }
        function onEnter(idx) {
          var _a;
          hoverIdx.value = idx;
          const desc = (_a = props.data[idx]) == null ? undefined : _a.desc;
          if (desc) hoverDescApi.set(desc);
          else hoverDescApi.clear();
        }
        function onLeave(idx) {
          if (hoverIdx.value === idx) {
            hoverIdx.value = -1;
            hoverDescApi.clear();
          }
        }
        function handleDocClick(e) {
          if (!rootRef.value) return;
          if (!rootRef.value.contains(e.target)) {
            open.value = false;
            hoverDescApi.clear();
          }
        }
        function handleEsc(e) {
          if (e.key === "Escape") {
            open.value = false;
            hoverDescApi.clear();
          }
        }
        vue.onMounted(() => {
          document.addEventListener("click", handleDocClick, true);
          document.addEventListener("keydown", handleEsc);
        });
        vue.onBeforeUnmount(() => {
          document.removeEventListener("click", handleDocClick, true);
          document.removeEventListener("keydown", handleEsc);
          hoverDescApi.clear();
        });
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", {
            ref_key: "rootRef",
            ref: rootRef,
            class: vue.normalizeClass(["setting-select", { open: open.value }])
          }, [
            vue.createElementVNode("button", {
              type: "button",
              class: vue.normalizeClass(["select-trigger", { active: open.value }]),
              onClick: toggleOpen
            }, [
              vue.createElementVNode("span", _hoisted_1$j, vue.toDisplayString(currentText.value), 1),
              _cache[0] || (_cache[0] = vue.createElementVNode("span", { class: "material-symbols-outlined trigger-icon" }, "expand_more", -1))
            ], 2),
            vue.createVNode(vue.Transition, { name: "setting-select-pop" }, {
              default: vue.withCtx(() => [
                open.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$g, [
                  vue.createElementVNode("ul", _hoisted_3$d, [
                    (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.data, (item, idx) => {
                      return vue.openBlock(), vue.createElementBlock("li", {
                        key: idx,
                        class: vue.normalizeClass(["select-item", { selected: item.value === currentValue.value }]),
                        onClick: ($event) => choose(item),
                        onMouseenter: ($event) => onEnter(idx),
                        onMouseleave: ($event) => onLeave(idx)
                      }, [
                        vue.createElementVNode("span", _hoisted_5$9, vue.toDisplayString(item.text), 1)
                      ], 42, _hoisted_4$b);
                    }), 128))
                  ])
                ])) : vue.createCommentVNode("", true)
              ]),
              _: 1
            })
          ], 2);
        };
      }
    });
    const _export_sfc = (sfc, props) => {
      const target = sfc.__vccOpts || sfc;
      for (const [key, val] of props) {
        target[key] = val;
      }
      return target;
    };
    const SettingSelect = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["__scopeId", "data-v-4901a01f"]]);
    const _hoisted_1$i = ["aria-checked", "disabled"];
    const _sfc_main$k = /* @__PURE__ */ vue.defineComponent({
      __name: "setting-switch",
      props: {
        modelValue: { type: Boolean },
        disabled: { type: Boolean }
      },
      emits: ["update:modelValue", "change"],
      setup(__props, { emit: __emit }) {
        const props = __props;
        const emit = __emit;
        const innerValue = vue.ref(!!props.modelValue);
        vue.watch(() => props.modelValue, (v) => {
          innerValue.value = !!v;
        });
        const switchStyle = vue.computed(() => {
          if (innerValue.value) {
            return { background: "var(--tieba-theme-color)" };
          }
          return {};
        });
        function toggle() {
          if (props.disabled) return;
          innerValue.value = !innerValue.value;
          emit("update:modelValue", innerValue.value);
          emit("change", innerValue.value);
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("button", {
            type: "button",
            class: vue.normalizeClass(["setting-switch", { on: innerValue.value }]),
            role: "switch",
            "aria-checked": innerValue.value,
            disabled: _ctx.disabled,
            style: vue.normalizeStyle(switchStyle.value),
            onClick: toggle
          }, _cache[0] || (_cache[0] = [
            vue.createElementVNode("span", { class: "switch-thumb" }, null, -1)
          ]), 14, _hoisted_1$i);
        };
      }
    });
    const SettingSwitch = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["__scopeId", "data-v-6d7081fc"]]);
    const baseStyle = "html {\n  padding: 0;\n  margin: 0;\n  text-align: justify;\n  overflow-x: hidden;\n  overflow-y: scroll;\n  scrollbar-gutter: stable;\n}\n\nhtml:has(body[no-scrollbar]) {\n  overflow: hidden;\n}\n\nbody {\n  padding: 0;\n  margin: 0;\n  font-family: var(--code-zh);\n  font-weight: var(--font-weight-normal);\n}\nbody[no-scrollbar] {\n  padding-right: 0 !important;\n}\nbody *:not(.user-icon):not(.user-icon-outline):not(.user-icon-filled):not(.material-symbols-outlined):not(code):not(pre) {\n  font-family: inherit;\n}\n\ndiv,\np {\n  margin: 0;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-weight: var(--font-weight-bold);\n}\n\nselect {\n  padding: 1px 8px;\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  cursor: pointer;\n}\n\noption {\n  cursor: pointer;\n}\n\noption:checked {\n  background-color: var(--tieba-theme-color);\n  color: var(--default-background);\n}\n\na {\n  color: inherit;\n  -webkit-text-decoration: none;\n  text-decoration: none;\n  word-break: break-all;\n}\n\n.dialogJ {\n  position: fixed !important;\n  top: 50% !important;\n  left: 50% !important;\n}\n\n.dialogJ {\n  transform: translate(-50%, -50%);\n}\n\n:root {\n  --surface-glass: var(--default-background);\n}\n\nhtml[glass-effect] {\n  --surface-glass: var(--trans-default-background);\n}";
    const universalStyle = '.icon,\n.outline-icon {\n  font-family: "Material Symbols", monospace !important;\n}\n\n.icon,\n.outline-icon {\n  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;\n  font-weight: normal;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n\n.filled-icon {\n  font-family: "Material Symbols", monospace !important;\n}\n\n.filled-icon {\n  font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 40;\n  font-weight: normal;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n\n.anchor, .anchor-underline {\n  color: var(--tieba-theme-fore);\n  cursor: pointer;\n  -webkit-text-decoration: none;\n  text-decoration: none;\n  transition: var(--default-duration);\n}\n\n.anchor-underline {\n  text-decoration: underline;\n  -webkit-text-decoration: underline solid currentColor;\n          text-decoration: underline solid currentColor;\n  text-decoration-thickness: 1.2px;\n  -webkit-text-decoration: underline 1.2px;\n          text-decoration: underline 1.2px;\n}\n\n.anchor-noback {\n  cursor: pointer;\n  -webkit-text-decoration: none;\n  text-decoration: none;\n  transition: var(--default-duration);\n}\n\n.anchor:hover, .anchor-underline:hover {\n  background-color: var(--default-hover);\n}\n\n.anchor-underline:hover {\n  text-decoration: underline;\n  -webkit-text-decoration: underline solid rgba(0, 0, 0, 0);\n          text-decoration: underline solid rgba(0, 0, 0, 0);\n  text-decoration-thickness: 1.2px;\n  -webkit-text-decoration: underline 1.2px rgba(0, 0, 0, 0);\n          text-decoration: underline 1.2px rgba(0, 0, 0, 0);\n}\n\n.anchor-noback:hover {\n  color: var(--tieba-theme-fore);\n}\n\n.anchor:active, .anchor-underline:active {\n  background-color: var(--default-active);\n}\n\n.anchor-noback:active {\n  color: var(--tieba-theme-active);\n}\n\n.markdown {\n  font-family: var(--code-zh);\n  font-size: 16px;\n}\n.markdown code {\n  padding: 2px 6px;\n  border-radius: 8px;\n  background-color: var(--light-border-color);\n  font-family: var(--code-monospace);\n  word-wrap: break-word;\n}\n.markdown a {\n  color: var(--tieba-theme-fore);\n}\n.markdown a:hover {\n  -webkit-text-decoration: underline;\n  text-decoration: underline;\n}\n.markdown h2 {\n  margin: 20px 0 8px;\n  font-size: 24px;\n}\n.markdown h3 {\n  margin: 16px 0 6px;\n  font-size: 18px;\n}\n.markdown ul {\n  padding: 0;\n  margin: 6px 0;\n}\n.markdown li {\n  margin: 6px 0 6px 22px;\n  list-style: disc;\n}\n.markdown li::marker {\n  color: var(--minimal-fore);\n}\n.markdown blockquote {\n  margin: 20px 16px;\n  color: var(--minimal-fore);\n}\n.markdown hr {\n  border: 2px solid var(--border-color);\n  margin: 10px 0;\n}\n\n.settings-toggle-button {\n  border: none !important;\n  background-color: transparent !important;\n  background-color: initial !important;\n}\n\n.settings-toggle-button {\n  border-radius: 36px;\n}\n\n.settings-toggle-button.toggle-off {\n  color: var(--minimal-fore);\n  font-variation-settings: "FILL" 0;\n}\n\n.settings-toggle-button.toggle-off::after {\n  content: "toggle_off";\n}\n\n.settings-toggle-button.toggle-on::after {\n  content: "toggle_on";\n}\n\n.settings-toggle-button.toggle-on {\n  color: var(--tieba-theme-color);\n  font-variation-settings: "FILL" 1;\n}\n\n.settings-toggle-button.toggle-off:hover {\n  color: var(--default-hover);\n}\n\n.settings-toggle-button.toggle-off:active {\n  color: var(--default-active);\n}\n\n.settings-toggle-button.toggle-on:hover {\n  color: var(tieba-theme-hover);\n}\n\n.settings-toggle-button.toggle-on:active {\n  color: var(--tieba-theme-active);\n}\n\n.level-green {\n  background-color: var(--level-green-background) !important;\n  color: var(--level-green-fore) !important;\n}\n\n.level-blue {\n  background-color: var(--level-blue-background) !important;\n  color: var(--level-blue-fore) !important;\n}\n\n.level-yellow {\n  background-color: var(--level-yellow-background) !important;\n  color: var(--level-yellow-fore) !important;\n}\n\n.level-orange {\n  background-color: var(--level-orange-background) !important;\n  color: var(--level-orange-fore) !important;\n}\n\n.remove-default {\n  line-height: normal !important;\n}\n\n.remove-default {\n  font-size: 14px;\n}\n.remove-default button,\n.remove-default input,\n.remove-default optgroup,\n.remove-default select,\n.remove-default textarea {\n  font-family: var(--code-zh);\n  font-size: 14px;\n}\n.remove-default .content {\n  min-height: 0;\n  min-height: initial;\n  background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;\n  background: initial;\n}\n.remove-default code {\n  display: inline;\n  display: initial;\n  width: auto;\n  width: initial;\n  height: auto;\n  height: initial;\n}\n.remove-default .content,\n.remove-default .foot {\n  width: auto;\n  width: initial;\n}\n.remove-default button {\n  background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;\n  background: initial;\n  color: inherit;\n}\n.remove-default h4 {\n  font-family: var(--code-zh);\n}\n\n.user-check .check-button {\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  width: 16px !important;\n  min-width: 16px !important;\n  height: 16px !important;\n  min-height: 16px !important;\n  padding: 0 !important;\n  box-sizing: border-box !important;\n  line-height: 1 !important;\n  font-size: 14px !important;\n}\n\n.user-check .check-label {\n  line-height: 1.4 !important;\n  font-size: 13px !important;\n}\n\nhtml[glass-effect] body.custom-background .blur-if-custom-background {\n  -webkit-backdrop-filter: blur(24px);\n          backdrop-filter: blur(24px);\n}\nhtml[glass-effect].dark-theme body.custom-background .blur-if-custom-background {\n  -webkit-backdrop-filter: blur(24px) brightness(0.8);\n          backdrop-filter: blur(24px) brightness(0.8);\n}\n\nhtml[glass-effect] .blur-effect {\n  -webkit-backdrop-filter: blur(24px);\n          backdrop-filter: blur(24px);\n}\nhtml[glass-effect].dark-theme .blur-effect {\n  -webkit-backdrop-filter: blur(24px) brightness(0.8);\n          backdrop-filter: blur(24px) brightness(0.8);\n}\n\n.raster-effect {\n  background-color: var(--trans-page-background);\n  background-image: radial-gradient(transparent 1px, var(--page-background) 1px);\n  background-size: 4px 4px;\n}\nhtml[glass-effect] .raster-effect {\n  -webkit-backdrop-filter: saturate(0.8) blur(4px);\n          backdrop-filter: saturate(0.8) blur(4px);\n}\n\n.user-dialog-modal {\n  width: 100vw !important;\n  left: 0 !important;\n  right: auto !important;\n}';
    const tiebaErrorStyle = '@charset "UTF-8";\n/* 搜索栏 */\n.search-form {\n  background-color: var(--default-background);\n}\n\n.search-form p {\n  display: none;\n}\n\n.page404 {\n  background-color: var(--default-background);\n}\n\n.main-title {\n  color: var(--default-fore);\n}\n\n.main-title a {\n  color: var(--tieba-theme-fore);\n}\n\n.app_download_box {\n  display: none;\n}\n\n#error_404_iframe {\n  display: none;\n}';
    const tiebaForumStyle = '@charset "UTF-8";\n.search_internal_btn::after, .icon_author::after, .icon_replyer::after {\n  font-family: "Material Symbols", monospace !important;\n}\n.search_internal_btn::after, .icon_author::after, .icon_replyer::after {\n  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;\n  font-weight: normal;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n\n.search_bright .search_btn_enter_ba {\n  box-sizing: border-box;\n  padding: 4px 12px;\n  border: none;\n  border-radius: 6px;\n  background: none;\n  background-color: var(--default-background);\n  box-shadow: 0 0 0 1px var(--border-color);\n  color: var(--default-fore);\n  cursor: pointer;\n  transition: var(--default-duration);\n}\n.search_bright .search_btn_enter_ba:hover:not([disabled]) {\n  background-color: var(--default-hover);\n}\n.search_bright .search_btn_enter_ba:active:not([disabled]) {\n  background-color: var(--default-active);\n}\n.search_bright .search_btn_enter_ba:focus:not([disabled]) {\n  border-color: var(--tieba-theme-color);\n  box-shadow: 0 0 0 2px var(--tieba-theme-color);\n}\n.search_bright .theme-style.search_btn_enter_ba {\n  color: var(--default-background) !important;\n}\n.search_bright .theme-style.search_btn_enter_ba {\n  background-color: var(--tieba-theme-color);\n}\n.search_bright .theme-style.search_btn_enter_ba:hover {\n  background-color: var(--tieba-theme-hover);\n}\n.search_bright .theme-style.search_btn_enter_ba:active {\n  background-color: var(--tieba-theme-active);\n}\n.search_bright .unset-background.search_btn_enter_ba {\n  background-color: transparent;\n  background-color: initial;\n}\n.search_bright .no-border.search_btn_enter_ba {\n  box-shadow: none;\n}\n.search_bright .no-border-all.search_btn_enter_ba {\n  box-shadow: none;\n}\n.search_bright .no-border-all.search_btn_enter_ba:hover, .search_bright .no-border-all.search_btn_enter_ba:focus {\n  box-shadow: none;\n}\n\nbody[hide-bottom-editor] .editor_wrap_bright {\n  display: none !important;\n}\n\n#head {\n  background: transparent none repeat 0 0 / auto auto padding-box border-box scroll !important;\n  background: initial !important;\n  background-color: var(--page-background) !important;\n}\n#head .head_inner {\n  background-color: var(--page-background);\n}\n\n.threadlist_title a,\n.threadlist_title a:hover,\n.threadlist_title a:visited {\n  color: var(--tieba-theme-fore) !important;\n  -webkit-text-decoration: none !important;\n  text-decoration: none !important;\n}\n\n.u_menu_item a {\n  color: inherit !important;\n}\n\n.u_menu_item a {\n  /* 顶部菜单 */\n}\n\n.card_banner,\n.plat_recom_carousel {\n  display: none !important;\n}\n\n.card_banner,\n.plat_recom_carousel {\n  /* 大卡 */\n}\n\n.search_main {\n  /* 固定搜索栏 */\n  padding-bottom: 0;\n  padding-bottom: initial;\n}\n\n.search_bright .search_logo_fixed {\n  width: 36px !important;\n  height: 36px !important;\n  margin-left: 56px !important;\n  background-color: rgba(0, 0, 0, 0) !important;\n  background-image: var(--img-tieba-icon) !important;\n  background-repeat: no-repeat !important;\n}\n\n.search_bright .search_logo_fixed {\n  /* 固定搜索栏 icon */\n}\n\n.head_inner .search_logo {\n  display: none !important;\n}\n\n.search_form {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.search_form form {\n  margin-left: 0 !important;\n}\n\n.search_bright .search_inp_border,\n.search_bright .search_ipt {\n  height: 40px !important;\n  border: 2px solid var(--border-color) !important;\n  background-color: var(--default-background) !important;\n  color: var(--default-fore) !important;\n}\n\n.search_bright .search_inp_border,\n.search_bright .search_ipt {\n  box-sizing: border-box;\n  transition: var(--default-duration);\n}\n.search_bright .search_inp_border:hover,\n.search_bright .search_ipt:hover {\n  border-color: var(--light-background) !important;\n}\n.search_bright .search_inp_border:focus,\n.search_bright .search_ipt:focus {\n  border-color: var(--tieba-theme-color) !important;\n}\n\n.search_bright .search_btn {\n  height: 40px !important;\n  border: 1px solid var(--border-color) !important;\n  background-color: var(--default-background) !important;\n  box-shadow: none !important;\n  color: var(--default-fore) !important;\n  line-height: 40px !important;\n}\n\n.search_bright .search_btn {\n  box-sizing: border-box;\n  transition: var(--default-duration);\n}\n.search_bright .search_btn:hover {\n  filter: brightness(1.1);\n}\n.search_bright .search_btn:active {\n  filter: brightness(1.2);\n}\n\n.search_bright .search_btn_enter_ba {\n  border: none !important;\n  background-color: var(--tieba-theme-color) !important;\n  color: var(--default-background) !important;\n}\n\n.search_bright .search_btn_enter_ba {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n\n.search_main_fixed {\n  display: none !important;\n}\n\n.search_main_fixed {\n  border-color: var(--border-color);\n  -webkit-backdrop-filter: blur(24px);\n          backdrop-filter: blur(24px);\n  background-color: var(--trans-default-background);\n  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);\n}\n\n.card_top_theme {\n  border: none !important;\n}\n\n#content {\n  /* 容器 */\n  width: 982px;\n}\n\n.card_top_theme .card_top {\n  padding-left: 120px !important;\n}\n\n.card_top_theme .card_top {\n  /* 吧标题容器 */\n}\n\n.card_title_fname {\n  color: var(--tieba-theme-fore) !important;\n}\n\n.card_title_fname {\n  /* 吧标题 */\n  font-weight: var(--font-weight-bold);\n}\n\n.card_slogan {\n  color: var(--light-fore) !important;\n}\n\n.card_slogan {\n  /* 吧 slogan */\n}\n\n.islike_focus {\n  background-color: var(--tieba-theme-color) !important;\n  background-image: none !important;\n}\n\n.islike_focus {\n  /* 关注吧按钮 */\n}\n\n.cancel_focus {\n  background: none !important;\n  background-color: var(--tieba-theme-background) !important;\n}\n\n.cancel_focus {\n  /* 取关吧按钮 */\n}\n\n.sign_box_bright,\n.sign_box_bright_hover {\n  background: none !important;\n  background-color: var(--tieba-theme-color) !important;\n}\n\n.sign_box_bright,\n.sign_box_bright_hover {\n  /* 签到按钮 */\n}\n\n.sign_box_bright_signed,\n.sign_box_bright_noclass_hover {\n  background: none !important;\n  background-color: var(--tieba-theme-background) !important;\n}\n\n.sign_box_bright_signed,\n.sign_box_bright_noclass_hover {\n  /* 签到按钮：已签到 */\n}\n\n.sign_mod_bright .sign_keep_span {\n  margin: 0 !important;\n  margin: initial !important;\n  text-align: center !important;\n}\n\n.forum_content {\n  border-color: var(--border-color) !important;\n  border-right: none !important;\n  background: none !important;\n  background-color: var(--elem-color) !important;\n}\n\n.forum_content {\n  /* 容器 */\n}\n\n.nav_wrap {\n  border-color: var(--border-color) !important;\n}\n\n.nav_wrap {\n  /* tab */\n}\n\n.nav_list li.focus {\n  background: none !important;\n}\n\n.nav_list li.focus {\n  /* 焦点 tab */\n}\n\n.nav_list a {\n  color: inherit !important;\n}\n\n.j_tabnav_tab:hover {\n  background: none;\n}\n\n.nav_list a:hover,\n.nav_list a:focus {\n  background-color: var(--elem-color) !important;\n}\n\n.nav_list a:hover,\n.nav_list a:focus {\n  /* tab hover */\n}\n\n.search_internal_input {\n  height: 24px !important;\n  border-color: var(--border-color) !important;\n  color: var(--default-fore) !important;\n}\n\n.search_internal_input {\n  /* 吧内搜索 */\n  border-radius: 4px 0 0 4px;\n}\n\n.search_internal_btn {\n  height: 26px !important;\n  background-color: var(--tieba-theme-color) !important;\n  background-image: none !important;\n  vertical-align: middle !important;\n}\n\n.search_internal_btn {\n  /* 吧内搜索按钮 */\n  border-radius: 0 4px 4px 0;\n  /* background-image: var(--svg-search) !important;\n  background-size: 16px !important;\n  background-repeat: no-repeat !important;\n  background-position: center !important; */\n}\n\n.search_internal_btn::after {\n  color: var(--default-background);\n  content: "search";\n  font-size: 18px;\n  font-weight: var(--font-weight-bold);\n  line-height: 26px;\n  text-align: center;\n}\n\n.aside_region {\n  border-bottom: none !important;\n}\n\n.aside_region {\n  /* 右侧内容 */\n}\n\n.aside_region .region_header {\n  color: var(--default-fore) !important;\n}\n\n.my_tieba .media_left,\n.my_tieba .media-left {\n  border: none !important;\n}\n\n.my_tieba .media_left,\n.my_tieba .media-left {\n  /* 我的头像 */\n}\n\n.my_current_forum .badge {\n  border: 1px solid var(--border-color) !important;\n  background-color: var(--light-background) !important;\n  color: var(--default-fore) !important;\n}\n\n.my_current_forum .badge {\n  /* 我的等级 */\n}\n\n.my_current_forum .badge_name {\n  color: var(--default-fore) !important;\n}\n\n.media_top img,\n.media-top img {\n  /* 右侧图片 */\n  border-radius: 6px;\n}\n\n.aside_media_horizontal a,\n.aside-media-horizontal a {\n  color: var(--tieba-theme-fore) !important;\n}\n\n.aside_media_horizontal a,\n.aside-media-horizontal a {\n  /* 右侧超链接 */\n}\n\n.threadlist_bright li.thread_top_list_folder,\n.threadlist_bright li.thread_top_list_folder:hover {\n  background-color: var(--very-light-background) !important;\n}\n\n.threadlist_bright li.thread_top_list_folder,\n.threadlist_bright li.thread_top_list_folder:hover {\n  /* 置顶贴 */\n}\n\n.threadlist_bright > li {\n  border: none !important;\n  background-color: var(--default-background) !important;\n}\n\n.threadlist_bright > li {\n  /* 贴子 */\n}\n\n.threadlist_bright > li:hover {\n  background-color: var(--trans-light-background) !important;\n}\n\n.threadlist_bright .ylh-ad-container {\n  box-sizing: border-box !important;\n  width: 100% !important;\n  max-width: 100% !important;\n  min-width: 0 !important;\n  overflow: hidden !important;\n}\n.threadlist_bright .ylh-ad-container > *, .threadlist_bright .ylh-ad-container .ylh-ad-content, .threadlist_bright .ylh-ad-container .ylh-ad-content img, .threadlist_bright .ylh-ad-container .ylh-ad-content video,\n.threadlist_bright .ylh-ad-container .ylh-video-container, .threadlist_bright .ylh-ad-container .ylh-video-container > div {\n  max-width: 100% !important;\n}\n\n.j_th_tit {\n  /* 帖子标题 */\n  color: var(--tieba-theme-fore);\n  font-weight: var(--font-weight-bold);\n}\n\n.threadlist_bright .threadlist_abs_onlyline,\n.threadlist_bright .threadlist_abs {\n  color: var(--default-fore) !important;\n}\n\n.threadlist_bright .threadlist_abs_onlyline,\n.threadlist_bright .threadlist_abs {\n  /* 帖子摘要 */\n}\n\n/* 隐藏未加载完成的图片 */\n.vpic_wrap img:not([style]) {\n  opacity: 0;\n}\n\n.threadlist_bright .threadlist_media li {\n  border-radius: 4px !important;\n}\n\n.threadlist_bright .threadlist_media li {\n  /* 贴子图片 hover */\n}\n\n.threadlist_media li:hover .threadlist_pic_highlight {\n  display: none !important;\n}\n\n.threadlist_media li:hover .threadlist_pic_highlight {\n  border-radius: 4px;\n}\n\n.vpic_wrap img {\n  border-radius: 4px;\n}\n\n.threadlist_bright .media_disp {\n  border: none !important;\n  background: none !important;\n}\n\n.threadlist_bright .threadlist_video {\n  /* 视频预览 */\n  border-radius: 4px;\n}\n\n.threadlist_rep_num {\n  height: auto !important;\n  height: initial !important;\n  background: none !important;\n  background-color: var(--tieba-theme-background) !important;\n}\n\n.threadlist_rep_num {\n  /* 回贴数 */\n  border-radius: 8px;\n  color: var(--tieba-theme-fore);\n  font-weight: var(--font-weight-bold);\n}\n\n.pagination-default .pagination-item {\n  border: none !important;\n  background-color: var(--light-background) !important;\n  color: var(--light-fore) !important;\n}\n\n.pagination-default .pagination-item {\n  border-radius: 4px;\n  /* 跳页按钮 */\n}\n\n.pagination-default .pagination-current {\n  border: none !important;\n  background-color: var(--tieba-theme-color) !important;\n  color: var(--default-background) !important;\n}\n\n.pagination-default .pagination-current {\n  /* 跳页按钮：当前 */\n}\n\n.pagination-default .pagination-item:not(.pagination-current):hover {\n  border: none !important;\n  background-color: var(--trans-light-background) !important;\n}\n\n.pagination-default .pagination-item:not(.pagination-current):hover {\n  /* 跳页按钮：hover */\n}\n\n/* 底部 */\n#tb_rich_poster_container {\n  width: 982px !important;\n  background-color: var(--very-light-background) !important;\n}\n#tb_rich_poster_container {\n  border-radius: 0 0 24px 24px;\n  margin-left: -1px;\n}\n\n.tb_rich_poster .poster_body .editor_textfield {\n  border-color: var(--border-color) !important;\n  background-color: var(--default-background) !important;\n  color: var(--default-fore) !important;\n}\n\n.tb_rich_poster .poster_body .editor_textfield {\n  border-radius: 4px;\n  /* 标题文本框 */\n}\n\n.tb_rich_poster .poster_body .editor_textfield:focus {\n  border-color: var(--tieba-theme-color) !important;\n}\n\n.old_style_wrapper {\n  border-color: var(--border-color) !important;\n  background-color: var(--elem-color) !important;\n}\n\n.old_style_wrapper {\n  /* 编辑器容器 */\n}\n\n.old_style_wrapper .edui-editor-body {\n  background: none !important;\n}\n\n.edui-container .edui-toolbar {\n  background: none !important;\n}\n\n.edui-container .edui-toolbar {\n  /* 编辑器工具栏 */\n}\n\n.edui-editor-body .edui-body-container {\n  border-color: var(--border-color) !important;\n  background-color: var(--default-background) !important;\n}\n\n.edui-editor-body .edui-body-container {\n  /* 编辑器 */\n}\n\n.frs_content_footer_pagelet {\n  background: none !important;\n}\n\n.footer {\n  display: none !important;\n}\n\n.icon_author {\n  background-image: none !important;\n}\n\n.icon_author {\n  /* 用户图标 */\n}\n\n.icon_author::after {\n  content: "person";\n  font-style: normal;\n}\n\n.icon_replyer {\n  background-image: none !important;\n}\n\n.icon_replyer {\n  /* 回贴图标 */\n}\n\n.icon_replyer::after {\n  content: "comment";\n  font-style: normal;\n}';
    const tiebaHomeStyle = '@charset "UTF-8";\nbody {\n  background-color: var(--page-background);\n  color: var(--default-fore);\n}\n\n/* 导航栏 */\n.head_inner {\n  /* 导航栏额头 */\n  background-color: var(--default-background);\n}\n\n.u_menu_item a {\n  /* 顶部超链接 */\n  color: var(--default-fore);\n}\n\n.head_inner .search_logo {\n  left: 72px;\n  width: 60px;\n  height: 60px;\n  /* logo */\n  background-image: var(--img-tieba-icon);\n}\n\n.search_top {\n  border: none;\n}\n\n.search_nav a:link,\n.search_nav a:hover,\n.search_nav a:visited {\n  /* 导航栏超链接 */\n  color: var(--default-fore);\n}\n\n.u_menu_item a:hover,\n.u_menu_item a:visited {\n  color: var(--default-fore);\n}\n\n/* 搜索 */\n.search_main {\n  padding-bottom: 96px;\n}\n\n.search_bright .search_inp_border {\n  /* 搜索框 */\n  border-color: var(--border-color);\n  border-bottom-left-radius: 8px;\n  border-top-left-radius: 8px;\n  color: var(--default-fore);\n}\n\n.search_bright .search_inp_border:focus {\n  border-color: var(--tieba-theme-color);\n}\n\n.search_bright .search_btn {\n  border-color: var(--trans-tieba-theme-color);\n  /* 搜索相关按钮 */\n  border-radius: 8px;\n  background-color: var(--tieba-theme-background);\n  color: var(--tieba-theme-fore);\n}\n\n.search_bright .search_btn_enter_ba {\n  /* “进入贴吧”按钮 */\n  background-color: var(--tieba-theme-color);\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n  color: var(--default-background);\n}\n\n.search_bright .search_btn:visited {\n  color: var(--tieba-theme-fore);\n}\n\n.search_bright .search_btn_enter_ba:visited {\n  background-color: var(--tieba-theme-color);\n  color: var(--default-background);\n}\n\n.search_bright .search_btn_enter_ba:hover {\n  background-color: var(--tieba-theme-color);\n  color: var(--default-background);\n}\n\n.suggestion {\n  border-color: var(--border-color) !important;\n  border-radius: 6px !important;\n  background-color: var(--elem-color) !important;\n  box-shadow: none !important;\n  color: var(--default-fore) !important;\n}\n\n.suggestion {\n  transform: translateY(4px);\n}\n\n.suggestion .break_tip {\n  background-color: var(--default-background) !important;\n}\n\n.suggestion .highlight {\n  color: var(--tieba-theme-color) !important;\n}\n\n.suggestion .highlight {\n  /* 高亮文本 */\n}\n\n.suggestion .operation_title {\n  color: var(--default-fore) !important;\n}\n\n.suggestion .operation_title {\n  /* 热议文字 */\n}\n\n.suggestion .forum_image {\n  /* 推荐图标 */\n  border-radius: 8px;\n}\n\n.suggestion .forum_name {\n  color: var(--default-fore) !important;\n}\n\n.suggestion .forum_name {\n  /* 推荐标题 */\n}\n\n.suggestion .on {\n  background-color: var(--light-background) !important;\n}\n\n.suggestion .on {\n  /* 搜索推荐：选中 */\n}\n\n/* 首页横幅 */\n.page-container .top-sec {\n  display: none;\n}\n\n/* 内容 */\n.page-container .content-sec {\n  background: none;\n}\n\n/* 左侧悬停 */\n.page-container .left-sec {\n  border-radius: 24px;\n  border-top: none;\n  background: none;\n  background-color: var(--elem-color);\n}\n\n.f-d-w {\n  border-radius: 24px;\n  /* 左侧悬停 2 */\n  background-color: var(--elem-color);\n}\n\n.f-d-w .f-d-item {\n  background: none;\n}\n\n.aggregate_entrance_wrap {\n  /* 专题 */\n  display: none;\n}\n\n.u-f-t .gap {\n  border: none;\n  /* “贴吧分类”分隔符 */\n  background: none;\n}\n\n.f-d-w .all {\n  /* “查看全部”按钮 */\n  background: none;\n}\n\n.forum_rcmd {\n  /* 热门吧卡片 */\n  border: 0;\n  border-radius: 24px;\n  background-color: var(--elem-color);\n}\n\n.region_bright .region_header {\n  /* “我在贴吧”标题 */\n  color: var(--default-fore);\n}\n\n.page-container .left-sec .region_bright {\n  border-radius: 24px;\n}\n\n.my_tieba_mod .media_left,\n.my_tieba_mod .media-left {\n  /* 头像边框 */\n  border: none;\n}\n\n.media_left img,\n.media-left img {\n  /* 头像 */\n  border-radius: 16px;\n}\n\n#nameValue {\n  /* 我的用户名 */\n  color: var(--default-fore);\n}\n\n#j_tcharge_dialog {\n  /* “获取”超链接 */\n  color: var(--default-fore);\n}\n\n#onekey_sign .onekey_btn,\n#onekey_sign a.onekey_btn {\n  /* 签到按钮 */\n  border-radius: 8px;\n  margin-right: -5px;\n  background: none;\n  background-color: var(--tieba-theme-color);\n  color: var(--elem-color);\n  text-align: center;\n}\n\n#onekey_sign .onekey_btn::after {\n  content: "一键签到";\n}\n\n#onekey_sign a.signed_btn .icon_signed {\n  /* 已签到标记 */\n  margin-top: 2px;\n  background: var(--svg-checkmark);\n  background-repeat: no-repeat;\n  background-size: 20px;\n  filter: drop-shadow(var(--elem-color) 0 9999px);\n  transform: translateY(-9999px);\n}\n\n#onekey_sign .onekey_btn:hover {\n  box-shadow: 0 0 10px var(--tieba-theme-color);\n}\n\n.u-f-w {\n  /* 进吧 div */\n  padding-bottom: 20px;\n}\n\n.left-cont-fixed {\n  /* 进吧 div 固定 */\n  position: relative;\n  bottom: 0;\n}\n\n.u-f-w .sign,\n.u-f-w .unsign,\n.always-forum-item .sign,\n.always-forum-item .unsign {\n  /* 进吧按钮 */\n  border-radius: 8px;\n  background: none;\n  background-color: var(--light-background);\n  color: var(--default-fore);\n}\n\n.u-f-w .sign,\n.always-forum-item .sign {\n  /* 已签到 */\n  background-color: var(--tieba-theme-background);\n  color: var(--tieba-theme-fore);\n}\n\n.u-f-w .sign,\n.u-f-w .unsign {\n  margin-bottom: 8px;\n}\n\n.u-f-w .sign:hover,\n.u-f-w .unsign:hover,\n.always-forum-item .sign:hover,\n.always-forum-item .unsign:hover {\n  background: none;\n  background-color: var(--tieba-theme-color);\n  box-shadow: 0 0 10px var(--tieba-theme-color);\n  color: var(--elem-color);\n  -webkit-text-decoration: none;\n  text-decoration: none;\n}\n\n.u-f-w .more {\n  /* “查看更多”按钮 */\n  border: none;\n  border-radius: 8px;\n  background: none;\n  background-color: var(--elem-color);\n  box-shadow: none;\n  color: var(--default-fore);\n}\n\n.more-txt {\n  /* “查看更多”按钮文字 */\n  color: var(--default-fore);\n}\n\n.u-f-w .more-hover {\n  width: 188px;\n  margin: auto;\n  background-color: var(--tieba-theme-color);\n  box-shadow: 0 0 10px var(--tieba-theme-color);\n  color: var(--elem-color);\n}\n\n.u-f-w .more-hover .more-txt,\n.u-f-w .more:hover .more-txt {\n  margin-left: 60px;\n  color: var(--elem-color);\n}\n\n.always-forum-title {\n  /* 展开标题 */\n  border: none;\n  margin-top: 10px;\n}\n\n#alwayforum-wraper {\n  /* 关注吧展开 */\n  background-color: var(--elem-color);\n}\n\n.pop-up-frame {\n  /* 展开页面 */\n  border: none;\n  border-radius: 24px;\n  background-color: var(--elem-color);\n  border-bottom-left-radius: 0;\n  box-shadow: none;\n}\n\n.always-forum-close {\n  /* 展开叉号 */\n  display: none;\n}\n\n.always-forum-item .addnewforumbtn {\n  /* “添加爱逛的吧”按钮 */\n  width: 110px;\n  padding-left: 0;\n  border-radius: 8px;\n  background: none;\n  background-color: var(--tieba-theme-background);\n  color: var(--tieba-theme-fore);\n  font-size: 20px;\n  text-align: center;\n}\n\n.always-forum-item .addnewforumbtn::after {\n  content: "+";\n}\n\n.always-forum-item .addnewforumbtn:hover {\n  background-color: var(--tieba-theme-color);\n  box-shadow: 0 0 10px var(--tieba-theme-color);\n  color: var(--elem-color);\n}\n\n.tbui_scroll_panel .tbui_scroll_button {\n  /* 展开滚动条 */\n  width: 6px;\n  border: none;\n  border-radius: 24px;\n  background-color: var(--very-light-background);\n}\n\n.tbui_scroll_panel .tbui_scroll_bar {\n  width: 6px;\n  /* 滚动条背景 */\n  background: none;\n}\n\n.forum_rcmd .class_title > div {\n  /* 热门吧 icon */\n  color: var(--default-fore);\n}\n\n.rcmd_forum_item .forum_name {\n  /* 热门吧标题 */\n  color: var(--default-fore);\n}\n\n.rcmd_forum_item .rcmd_forum_logo {\n  /* 热门吧图片 */\n  border: none;\n  border-radius: 16px;\n  background: none;\n}\n\n/* 动态 */\n.page-container .r-left-sec,\n.sub_nav_wrap,\n.title-tag-wraper,\n.thread-name-wraper,\n.n_reply {\n  width: 780px;\n}\n\n.n_txt {\n  /* 动态正文 */\n  width: 720px;\n  color: var(--light-fore);\n}\n\n.sub_nav_wrap {\n  /* 动态切换 */\n  background: none;\n  background-color: var(--default-background);\n  box-shadow: none;\n}\n\n.sub_nav_list a.cur {\n  /* 当前标签 */\n  border: none;\n  color: var(--tieba-theme-color);\n}\n\n.sub_nav_list .nav_hover {\n  width: 56px !important;\n}\n\n.sub_nav_list .nav_hover {\n  /* 标签色块 */\n  border-bottom: 3px solid var(--tieba-theme-color);\n}\n\n.sub_nav_list li.sub_nav_line {\n  /* 标签分隔符 */\n  background: none;\n}\n\n/* 右侧悬停 */\n.page-container .r-right-sec {\n  display: none;\n}\n\n.item_hd {\n  /* “贴吧热议榜”标题 */\n  border: none;\n  border-radius: 24px;\n  background-color: var(--default-background);\n  color: var(--default-fore);\n}\n\n.item_hd .title {\n  color: var(--default-fore);\n}\n\n.topic_list .topic_item .topic_flag_hot {\n  /* 热点数字编号 */\n  border-radius: 4px;\n}\n\n.item .item_hd {\n  /* 公告板标题 */\n  border: none;\n  background-color: var(--default-background);\n  color: var(--default-fore);\n}\n\n.item .item_hd .title {\n  color: var(--default-fore);\n}\n\n.notice-wrap-fixed {\n  /* 公告板悬停 */\n  background-color: var(--default-color);\n  border-bottom-left-radius: 24px;\n  border-bottom-right-radius: 24px;\n}\n\n.notice,\n.notice img {\n  /* 公告板图片 */\n  border-radius: 24px;\n}\n\n/* 动态内容 */\n.new_list .title {\n  /* 贴子标题 */\n  color: var(--tieba-theme-color);\n}\n\n.new_list .title:hover {\n  color: var(--tieba-theme-color);\n  -webkit-text-decoration: underline;\n  text-decoration: underline;\n}\n\n.title-tag-wraper a {\n  /* 动态贴吧名 */\n  padding: 4px 10px;\n  border-radius: 24px;\n  background-color: var(--light-background);\n  color: var(--light-fore);\n  font-size: 12px;\n}\n\n.title-tag-wraper a:hover {\n  color: var(--light-fore);\n  -webkit-text-decoration: none;\n  text-decoration: none;\n}\n\n.list-post-num {\n  /* 贴子回复数 */\n  top: 0;\n  padding: 4px 10px;\n  border: none;\n  border-radius: 16px;\n  background-color: var(--tieba-theme-background);\n  color: var(--tieba-theme-fore);\n}\n\n.list-triangle-border,\n.list-triangle-body {\n  /* 贴子回复数三角 */\n  display: none;\n}\n\n.new_list .post_author {\n  /* 作者 */\n  padding: 0;\n  margin-bottom: 24px;\n  background: none;\n  color: var(--default-fore);\n  -webkit-text-decoration: none;\n  text-decoration: none;\n}\n\n.new_list .time {\n  /* 时间 */\n  padding: 0;\n  background: none;\n}\n\n.topic-tag {\n  /* 动态话题 */\n  display: none;\n}\n\n.n_img img {\n  /* 动态图片 */\n  border: none;\n  border-radius: 16px;\n  cursor: pointer;\n}\n\n.n_img li {\n  border-radius: 16px;\n}\n\n.n_img li .feed_highlight {\n  /* 图片放大 */\n  background: none;\n  cursor: pointer;\n}\n\n.media_box {\n  /* 图片控件 */\n  border: none;\n  border-radius: 16px;\n  background-color: var(--light-background);\n}\n\n.media_box img {\n  border-radius: 16px;\n  cursor: pointer;\n}\n\n.ui_btn {\n  /* “进入贴子”按钮 */\n  border: none;\n  border-radius: 24px;\n  background: none;\n  background-color: var(--tieba-theme-color);\n  color: var(--default-background);\n}\n\n.ui_btn:hover {\n  -webkit-text-decoration: none !important;\n  text-decoration: none !important;\n}\n\n.ui_btn:hover {\n  background: none;\n  background-color: var(--tieba-theme-color);\n  box-shadow: 0 0 10px var(--tieba-theme-color);\n  color: var(--default-background);\n}\n\n.btn_more {\n  /* 更多按钮 */\n  width: 200px;\n  height: auto;\n  height: initial;\n  border-radius: 24px;\n  background: none;\n  background-color: var(--tieba-theme-background);\n}\n\n.btn_more:hover,\n.data_error_bar a:hover,\n.btn_more a:hover {\n  background: none !important;\n  background-color: var(--tieba-theme-color) !important;\n  color: var(--default-background) !important;\n}\n\n.data_error_bar a,\n.btn_more a {\n  border: none;\n  color: var(--tieba-theme-fore);\n}\n\n/* 页脚 */\n.bottom-bg {\n  background: none;\n}\n\n.footer {\n  border-top: 1px solid var(--light-background);\n  background-color: var(--light-background);\n}\n\n/* 无关内容 */\n.f-d-w,\n.left-cont-wraper .ufw-gap {\n  display: none;\n}\n\n/* 底部加载 gif */\n#data_loading img {\n  display: none;\n}';
    const tiebaMainStyle = '@charset "UTF-8";\n.tbui_aside_float_bar li a {\n  font-family: "Material Symbols", monospace !important;\n}\n.tbui_aside_float_bar li a {\n  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;\n  font-weight: normal;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n\n/* 动画 */\n/* 淡入动画 */\n@keyframes animation-fade-in {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n.fade-in-elem {\n  animation: animation-fade-in ease 0.3s forwards;\n}\n\n#com_userbar {\n  display: none;\n}\n\n/* 功能按钮 */\n.tbui_aside_float_bar {\n  border: none !important;\n  background: none !important;\n}\n\n.tbui_aside_float_bar li {\n  width: 40px;\n  height: 40px;\n  border-radius: 24px;\n  margin: 8px 0;\n  background-color: var(--light-background);\n}\n\n.tbui_aside_float_bar li:hover {\n  background-color: var(--default-hover);\n}\n\n.tbui_aside_float_bar li:active {\n  background-color: var(--default-active);\n}\n\n.tbui_aside_float_bar li a {\n  width: 40px !important;\n  height: 40px !important;\n  background: none !important;\n}\n\n.tbui_aside_float_bar li a {\n  border-radius: 24px;\n}\n\n.tbui_aside_float_bar a {\n  width: 40px !important;\n  height: 40px !important;\n}\n\n.tbui_aside_float_bar a {\n  /* 功能按钮 svg 容器 */\n  color: var(--minimal-fore);\n  font-size: 24px;\n  line-height: 40px;\n  text-align: center;\n  /* background-size: 20px;\n  background-repeat: no-repeat;\n  background-position: center;\n  filter: drop-shadow(var(--minimal-fore) 0 -9999px);\n  transform: translateY(9999px); */\n}\n\n/* .tbui_aside_float_bar a:hover {\n    color: var(--default-background);\n    filter: drop-shadow(var(--default-fore) 0 -9999px);\n} */\n.tbui_aside_float_bar .tbui_fbar_auxiliaryCare a {\n  height: 40px !important;\n  background: none !important;\n}\n.tbui_aside_float_bar .tbui_fbar_auxiliaryCare a {\n  /* 无障碍模式 */\n}\n\n.tbui_fbar_auxiliaryCare a::after {\n  content: "accessibility_new";\n  /* background-image: var(--svg-accessibility); */\n}\n\n.tbui_fbar_top a::after {\n  /* 回到顶部 */\n  /* color: var(--tieba-theme-fore); */\n  content: "arrow_upward";\n  /* background-image: var(--svg-arrow-up);\n  filter: drop-shadow(var(--tieba-theme-fore) 0 -9999px); */\n}\n\n/* .tbui_aside_float_bar .tbui_fbar_top a {\n    background-color: var(--tieba-theme-background) !important;\n} */\n/* .tbui_fbar_top a:hover::after {\n    color: var(--default-background);\n} */\n.tbui_fbar_post a::after {\n  /* 回贴 */\n  /* color: var(--default-background); */\n  content: "chat";\n  font-size: 22px;\n  /* vertical-align: bottom; */\n  /* background-image: var(--svg-message);\n  filter: drop-shadow(var(--default-background) 0 -9999px); */\n}\n\n/* .tbui_aside_float_bar .tbui_fbar_post a,\n.tbui_aside_float_bar .tbui_fbar_post a:hover {\n    background-color: var(--tieba-theme-color) !important;\n} */\n.tbui_fbar_feedback a::after {\n  /* 反馈 */\n  content: "report";\n  font-size: 26px;\n  /* background-image: var(--svg-infomation-outline);\n  background-size: 24px; */\n}\n\n.tbui_aside_float_bar li.tbui_fbar_feedback a {\n  background: none !important;\n}\n\n.tbui_aside_float_bar li.tbui_fbar_feedback a {\n  /* 部分吧反馈 */\n}\n\n.tbui_aside_float_bar .tbui_fbar_feedback a,\n.tbui_aside_float_bar .tbui_fbar_feedback a:hover {\n  background: none !important;\n}\n\n.tbui_aside_float_bar .tbui_fbar_down,\n.tbui_aside_float_bar .tbui_fbar_props,\n.tbui_aside_float_bar .tbui_fbar_tsukkomi,\n.tbui_aside_float_bar .tbui_fbar_share,\n.tbui_aside_float_bar .tbui_fbar_favor,\n.tbui_aside_float_bar .tbui_fbar_refresh {\n  display: none;\n}\n\n/* 图片缩放控件 */\n.p_tools a {\n  padding: 0 10px;\n  background: none;\n  vertical-align: bottom;\n}\n\n.p_tools span {\n  /* 分隔线 */\n  display: none;\n}\n\n.p_tools .p_putup::before,\n.p_tools .tb_icon_ypic::before,\n.p_tools .tb_icon_turnleft::before,\n.p_tools .tb_icon_turnright::before {\n  margin-right: 4px;\n  font-family: "Material Symbols", system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;\n  font-size: 14px;\n  vertical-align: bottom;\n}\n\n.p_tools .p_putup::before {\n  /* 收起 */\n  content: "zoom_out";\n}\n\n.p_tools .tb_icon_ypic::before {\n  /* 查看大图 */\n  content: "zoom_out_map";\n}\n\n.p_tools .tb_icon_turnleft::before {\n  /* 左转 */\n  content: "turn_left";\n}\n\n.p_tools .tb_icon_turnright::before {\n  /* 右转 */\n  content: "turn_right";\n}';
    const tiebaThreadStyle = `@charset "UTF-8";
.d_name a:hover,
#container .content a.at:hover {
  -webkit-text-decoration: none;
  text-decoration: none;
}

.l_reply_num {
  color: inherit !important;
}

.l_reply_num {
  /* 回帖信息 */
}

#j_navtab_game,
.nav_list .more-config-navtab {
  /* 游戏 tab */
  display: none;
}

#j_navtab_wanle {
  /* 玩乐 tab */
  display: none;
}

.nav_wrap_add_border {
  border: none;
}

#head {
  /* 背景 */
  background: none;
  background-color: transparent;
}

/* 内容 */
#container .content {
  border-radius: 8px;
  background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;
  background: initial;
}

.card_top_wrap {
  background: none !important;
  background-color: var(--elem-color) !important;
}

.card_top_wrap {
  border-radius: 8px 8px 0 0;
}

.card_top_theme2 {
  border: none;
  margin-right: 0;
}

/* 去除无关内容 */
#novel-ranking .novel-ranking-frs-body,
.novel-award-aside {
  /* 小说人气榜相关 */
  display: none;
}

/* 吧图标 */
.card_head,
.plat_head_theme2 .plat_picbox {
  top: -32px !important;
  width: 64px !important;
  height: 64px !important;
  padding: 0 !important;
  padding: initial !important;
  border: 2px solid var(--border-color) !important;
  border-radius: 8px !important;
  background: none !important;
}
.card_head,
.plat_head_theme2 .plat_picbox {
  overflow: hidden;
}

.card_head_img,
.plat_head_theme2 .plat_picbox img {
  width: 64px !important;
  height: 64px !important;
}

/* 吧名 */
.card_title,
.plat_title_h3 {
  margin: 5px 20px 0;
}

.card_top_theme2 .card_title_fname,
.plat_title_h3,
.plat_title_h3:hover,
.plat_title_h3:visited {
  color: var(--highlight-fore);
}

.islike_focus {
  margin-top: 4px !important;
}

.islike_focus {
  /* 关注吧按钮 */
  border-radius: 8px;
  background: none;
  background-color: var(--tieba-theme-color);
  color: var(--elem-color);
  font-size: 14px;
  line-height: 28px;
  text-align: center;
}

.islike_focus::after {
  content: "关注";
}

.cancel_focus {
  /* 取关吧按钮 */
  width: 72px;
  border: 2px solid var(--trans-tieba-theme-color);
  border-radius: 8px;
  background: none;
  background-color: var(--tieba-theme-background);
  color: var(--tieba-theme-fore);
  font-size: 14px;
  line-height: 28px;
  text-align: center;
}

.cancel_focus::after {
  content: "已关注";
}

.card_top_right {
  /* 签到按钮 container */
  margin-top: 20px;
}

.sign_box_bright {
  width: 140px !important;
  height: 40px !important;
}

.sign_box_bright {
  /* 签到按钮 */
  border: 2px solid var(--trans-tieba-theme-color);
  border-radius: 8px;
  background: none;
  background-color: var(--tieba-theme-color);
  color: var(--default-background);
  font-size: 18px;
  line-height: 40px;
  text-align: center;
}

.sign_btn_bright::before {
  color: var(--elem-color);
  content: "签到";
}

.sign_box_bright_signed {
  /* 签到按钮：已签到 */
  background-color: var(--tieba-theme-background);
  text-align: inherit;
}

.sign_today_date,
.sign_month_lack_days {
  /* 签到日期等 */
  display: none;
}

.sign_keep_span {
  width: 140px !important;
}

.sign_keep_span {
  height: 40px;
}

.sign_keep_span,
.sign_mod_bright .sign_keep_span {
  /* 已签到按钮文本 */
  margin: 0;
  margin: initial;
  color: var(--tieba-theme-fore);
  font-size: 12px;
  text-align: center;
}

.sign_box_bright_signed::before {
  content: none !important;
}

.sign_mod_bright .sign_keep_span::before {
  content: "已签到 | ";
}

.jump_input_bright {
  padding: 0 10px;
  /* 跳页文本框 */
  border-color: var(--border-color);
  border-radius: 6px;
}

/* 标题 */
.left_section {
  background: none;
}

.core_title_wrap_bright {
  /* 标题栏 */
  border-color: var(--border-color);
  background-color: var(--trans-default-background);
}
html[glass-effect] .core_title_wrap_bright {
  -webkit-backdrop-filter: blur(24px);
          backdrop-filter: blur(24px);
}
html[glass-effect].dark-theme .core_title_wrap_bright {
  -webkit-backdrop-filter: blur(24px) brightness(0.8);
          backdrop-filter: blur(24px) brightness(0.8);
}

.core_title_theme_bright,
.core_title_absolute_bright .core_title_theme_bright {
  /* 部分吧标题栏 */
  border-color: var(--border-color);
  background: none;
}

.left_section .core_title_absolute_bright {
  background-color: var(--trans-default-background);
}
html[glass-effect] .left_section .core_title_absolute_bright {
  -webkit-backdrop-filter: blur(24px);
          backdrop-filter: blur(24px);
}
html[glass-effect].dark-theme .left_section .core_title_absolute_bright {
  -webkit-backdrop-filter: blur(24px) brightness(0.8);
          backdrop-filter: blur(24px) brightness(0.8);
}

.core_title_txt {
  /* 标题文字 */
  margin-left: 24px;
  background: none;
}

.tittle_fill_dom.filled {
  background-color: var(--default-background);
}

.core_title h1 {
  /* 部分吧标题 */
  margin-left: 0;
  color: var(--highlight-fore);
}

.nav_wrap {
  background-image: none !important;
}

.nav_wrap {
  border-color: var(--border-color);
  background-color: var(--light-background);
  /* 导航 */
}

.nav_list a.nav_icon,
.nav_list .tbnav_arrow {
  /* 部分吧导航栏 */
  padding-left: 22px;
  background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;
  background: initial;
}

.nav_wrap,
.nav_list .space,
.nav_list .focus,
.nav_list li:hover,
.nav_list li:hover .tbnav_tab_inner,
.nav_list .focus .tbnav_tab_inner {
  background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;
  background: initial;
}

.nav_list a {
  color: var(--default-fore);
}

span.tP {
  /* 强调字 */
  color: var(--tieba-theme-fore);
}

.thread_theme_5 {
  /* 跳页 */
  width: auto;
  width: initial;
  border-color: var(--border-color);
  border-right: none;
  border-left: none;
  background-color: var(--light-background);
}

.btn_sub,
.btn-sub,
.btn-sub-b,
.core_title_btns li a,
.p_favthr_main {
  border: none;
  border-radius: 4px;
  /* 部分按钮 */
  background: none;
  background-color: var(--tieba-theme-background);
  color: var(--tieba-theme-fore);
}

.btn_sub:hover,
.btn-sub:hover,
.btn-sub-b:hover,
.btn_sub:active,
.btn-sub:active,
.btn-sub-b:active,
.btn_sub:focus,
.btn-sub:focus,
.btn-sub-b:focus {
  background-color: var(--tieba-theme-color);
  color: var(--default-background);
}

.l_lzonly:hover,
.p_favthr_main:hover {
  background-color: var(--tieba-theme-color) !important;
  color: var(--default-background) !important;
}

.l_lzonly:hover,
.p_favthr_main:hover {
  /* 部分吧按钮 hover */
}

#quick_reply {
  /* 回复按钮 */
  display: none;
}

.d_lzonly_bdaside,
.p_favthr_main p,
.j_quick_reply,
.j_lzl_p a {
  /* 部分吧按钮字体 */
  color: inherit;
}

.j_quick_reply {
  /* 部分吧额头 */
  padding-left: 0;
  padding-left: initial;
}

/* 左侧用户信息 */
.l_post_bright {
  width: auto !important;
  width: initial !important;
  border-color: var(--border-color) !important;
  background: none !important;
}

.p_author_face {
  border: none !important;
  border-radius: 4px !important;
  margin-bottom: 4px !important;
  background: none !important;
}

.p_author_face {
  overflow: hidden;
}

.icon_relative {
  overflow: hidden;
  border-radius: 6px;
}

.icon_relative img {
  /* 层主头像 */
  border-radius: 6px;
}

.d_name .p_author_name {
  /* 层主名 */
  color: var(--tieba-theme-fore);
}

.novel-level-icon {
  /* 小说等级图标 */
  display: none;
}

.d_badge_bright,
.user_level .badge {
  /* 等级头衔 */
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: -2px;
  background-color: var(--light-background);
}

.user_level .badge_name {
  /* 等级头衔文本 */
  color: inherit;
}

.d_badge_bright .d_badge_title {
  padding-left: 4px;
  color: var(--default-fore);
}

.d_badge_bright .d_badge_lv,
.user_level .badge_index {
  background-image: none !important;
}

.d_badge_bright .d_badge_lv,
.user_level .badge_index {
  /* 等级图标 */
  background-color: var(--tieba-theme-background);
  color: var(--tieba-theme-fore);
}

.d_badge_lv,
.user_level .badge_index {
  top: auto !important;
  top: initial !important;
  left: 60px !important;
  width: auto !important;
  width: initial !important;
  height: 8px !important;
  padding: 0 4px !important;
  margin: 12px 4px !important;
  font-family: inherit !important;
  line-height: 2px !important;
}

.d_badge_lv,
.user_level .badge_index {
  border-radius: 6px;
  font-size: 14px;
  font-style: italic;
}

.d_badge_icon1 .d_badge_lv,
.tieba-lvl-green {
  background-color: var(--level-green-background) !important;
  color: var(--level-green-fore) !important;
}

.d_badge_icon1 .d_badge_lv,
.tieba-lvl-green {
  /* 绿牌 */
}

.d_badge_icon2 .d_badge_lv,
.d_badge_icon2_1 .d_badge_lv,
.d_badge_icon2_2 .d_badge_lv,
.tieba-lvl-blue {
  background-color: var(--level-blue-background) !important;
  color: var(--level-blue-fore) !important;
}

.d_badge_icon2 .d_badge_lv,
.d_badge_icon2_1 .d_badge_lv,
.d_badge_icon2_2 .d_badge_lv,
.tieba-lvl-blue {
  /* 蓝牌 */
}

.d_badge_icon3 .d_badge_lv,
.d_badge_icon3_1 .d_badge_lv,
.d_badge_icon3_2 .d_badge_lv,
.tieba-lvl-yellow {
  background-color: var(--level-yellow-background) !important;
  color: var(--level-yellow-fore) !important;
}

.d_badge_icon3 .d_badge_lv,
.d_badge_icon3_1 .d_badge_lv,
.d_badge_icon3_2 .d_badge_lv,
.tieba-lvl-yellow {
  /* 黄牌 */
}

.d_badge_icon4 .d_badge_lv,
.d_badge_icon4_1 .d_badge_lv,
.d_badge_icon4_2 .d_badge_lv,
.tieba-lvl-orange {
  background-color: var(--level-orange-background) !important;
  color: var(--level-orange-fore) !important;
}

.d_badge_icon4 .d_badge_lv,
.d_badge_icon4_1 .d_badge_lv,
.d_badge_icon4_2 .d_badge_lv,
.tieba-lvl-orange {
  /* 橙牌 */
}

.d_badge_bawu1 .d_badge_lv,
.d_badge_bawu2 .d_badge_lv {
  text-indent: inherit !important;
}

.d_badge_bawu1 .d_badge_lv,
.d_badge_bawu2 .d_badge_lv {
  /* 吧务 */
}

.d_author .d_pb_icons {
  /* 印记 */
  display: none;
}

.icon_book_link_icon {
  /* 查看我的印记 */
  display: none;
}

.region_bright {
  /* 右侧信息 */
  border: none;
  margin-top: 12px;
  background: none;
  background-color: var(--elem-color);
}

.region_bright .region_title {
  color: var(--default-fore) !important;
}

#celebrity {
  display: none;
}

.balv_mod .media_left,
.balv_mod .media-left {
  /* 我的头像 */
  border: none;
}

.right_section .tieba_notice {
  /* 右侧反馈 */
  background: none;
}

.topic_list_box {
  /* 右侧贴吧热议榜 */
  display: none;
  background-color: var(--default-background);
}

.pb_content {
  /* 容器：右侧剩余部分 */
  border: none;
  background: none;
  background-color: var(--elem-color);
}

.notice-icon,
.right_section .tieba_notice {
  padding-left: 0 !important;
  padding-left: initial !important;
  background: none !important;
}

.notice-icon,
.right_section .tieba_notice {
  /* 右侧反馈 */
}

.tieba_notice li {
  background: none;
}

/* 正文 */
.p_content {
  border: none;
  background-color: var(--default-background);
}

.forbid-speech-banner {
  /* 楼主屏蔽 */
  border-top: none;
}

.BDE_Image {
  /* 正文图片 */
  border-radius: 8px;
}

.BDE_Image:first-child {
  margin-top: 8px;
}

.share_btn_wrapper {
  /* 分享控件 */
  display: none;
}

.post-tail-wrap .icon-jubao {
  /* 楼层举报 */
  display: none;
}

.post-tail-wrap .icon-jubao::after {
  content: "举报";
}

.post-tail-wrap .tail-info {
  /* 楼层超链接 */
  color: var(--light-fore);
}

.complaint {
  /* 部分吧楼层举报 */
  padding-right: 4px;
  background: none;
}

.complaint::after {
  content: "举报";
}

.post-tail-wrap .question-image:hover::before {
  /* IP属地说明 */
  border-color: var(--border-color);
  border-radius: 4px;
  background-color: var(--light-background);
  color: var(--default-fore);
}

.post_bubble_top,
.post_bubble_bottom {
  /* 特殊气泡 */
  display: none;
}

.post_bubble_middle {
  background: none !important;
}

.post_bubble_middle {
  width: auto;
  width: initial;
  padding: 0;
  padding: initial;
}

.save_face_bg_2 {
  /* 会员右上角标记 */
  display: none;
}

.replace_div .replace_tip {
  /* 展开图片 */
  border-color: var(--border-color);
  background-color: var(--elem-color);
}

.achievement_medal_section {
  /* 成就徽章 */
  display: none;
}

.l_post_bright .d_post_content_main .d_sign_split {
  /* 签名档分割线 */
  border-bottom: 1px solid var(--border-color);
}

/* 回复 */
.d_post_content_main {
  background-color: var(--default-background) !important;
}

.lzl_p_p {
  border-radius: 4px !important;
}

.lzl_p_p {
  overflow: hidden;
  border: none;
}

.lzl_p_p img {
  /* 回复头像 */
  border-radius: 4px;
}

.core_reply_wrapper {
  overflow: hidden !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
  margin-bottom: 16px !important;
  background: none !important;
  background-color: var(--very-light-background) !important;
  color: var(--default-fore) !important;
}

.core_reply_wrapper {
  /* 回复 */
  /* border-top-right-radius: 0 !important; */
}

.core_reply_content li {
  border-top: 0;
  border-top: initial;
}

.lzl_content_main {
  /* 回复文字 */
  color: var(--default-fore);
}

.l_post_bright .core_reply_wrapper .core_reply_border_top,
.core_reply_border_bottom,
.l_post_bright .core_reply_wrapper .core_reply_content {
  border: none;
  background: none;
}

/* 收起回复 */
.lzl_link_fold {
  width: auto;
  height: auto;
  border: none;
  background: none;
  color: var(--minimal-fore);
}

.core_reply div.hideLzl {
  /* 加载回复 */
  background: none;
  background-color: var(--very-light-background);
}

.core_reply_wrapper .loading_reply {
  /* 加载动画 */
  display: none;
}

.lzl_cnt .lzl_s_r {
  /* 回复超链接 */
  color: var(--tieba-theme-fore);
}

.j_lzl_container .lzl_li_pager_s {
  overflow: visible;
}

.lzl_li_pager_s .lzl_more,
.lzl_more span {
  /* 还有x条回复 */
  color: var(--light-fore);
}

.j_lzl_m {
  /* 点击查看 */
  color: var(--tieba-theme-fore);
}

.lzl_cnt .lzl_time {
  color: var(--light-fore);
}

/* 楼中楼举报 */
.lzl_jb_in,
.user-jubao-button {
  background: none;
}

.lzl_jb_in::after,
.user-jubao-button::after {
  content: "举报";
}

.lzl_cnt .lzl_content_main {
  display: block;
}

/* .core_reply .hideLzl {
    opacity: 0;
    height: 0;
}

.core_reply div:not(.hideLzl) {
    opacity: 1;
    height: unset;
} */
/* 文字链接：固定蓝色 + 链接图标前缀；:not(:has(img)) 排除图片/链接卡 */
.d_post_content a:not(.at):not(:has(img)),
.lzl_cnt .lzl_content_main a:not(.at):not(:has(img)) {
  color: #2563eb !important;
}
.d_post_content a:not(.at):not(:has(img)),
.lzl_cnt .lzl_content_main a:not(.at):not(:has(img)) {
  margin: auto 2px;
  text-decoration: underline;
  -webkit-text-decoration: underline solid rgba(37, 99, 235, 0.5);
          text-decoration: underline solid rgba(37, 99, 235, 0.5);
  text-decoration-thickness: 1px;
  -webkit-text-decoration: underline 1px rgba(37, 99, 235, 0.5);
          text-decoration: underline 1px rgba(37, 99, 235, 0.5);
  text-underline-offset: 2px;
  transition: 0.4s;
}

.d_post_content a:not(.at):not(:has(img))::before,
.lzl_cnt .lzl_content_main a:not(.at):not(:has(img))::before {
  content: "";
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 4px;
  vertical-align: -0.15em;
  background-color: currentColor;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>') no-repeat center/contain;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>') no-repeat center/contain;
}

/* .d_post_content a:hover,
.d_post_content a:focus,
.lzl_cnt .lzl_content_main a:not(.at):hover,
.lzl_cnt .lzl_content_main a:not(.at):focus {
    background-color: var(--trans-light-background);
    text-decoration: none;
} */
.pager_theme_5 a,
.pager_theme_5 span,
.jump_btn_bright {
  /* 跳页按钮 */
  border-color: var(--default-background);
  border-radius: 4px;
  background: none;
  background-color: var(--default-background);
  color: var(--minimal-fore);
}

.pager_theme_5 a:hover,
.jump_btn_bright:hover {
  border-color: var(--tieba-theme-color);
  background-color: var(--tieba-theme-color);
  color: var(--default-background);
}

/* 底部 */
.thread_theme_7 {
  /* 顶栏 */
  width: auto;
  width: initial;
  border-color: var(--border-color);
  background-color: var(--light-background);
}

#pb-footer-header {
  background-color: var(--default-background);
}

#tb_rich_poster_container {
  /* 内容 */
  width: auto;
  width: initial;
  border-radius: 8px;
  background-color: var(--default-background);
}

.poster_head_text a.cur {
  color: var(--highlight-fore) !important;
}

.edui-editor-body {
  border-color: var(--border-color) !important;
}

.edui-editor-body {
  /* 文本框 */
  border-radius: 6px;
  background: none;
}

.edui-container .edui-editor-body.body-container-focus,
.edui-container .edui-editor-body.body-container-focus .edui-body-container {
  border-color: var(--tieba-theme-color) !important;
}

.old_style_wrapper {
  border-color: var(--border-color);
  border-radius: 8px;
  background-color: var(--elem-color);
}

.edui-editor-body .edui-body-container {
  width: auto !important;
  width: initial !important;
}

.edui-editor-body .edui-body-container {
  /* 全部文本框 */
  border-radius: 6px;
  background: var(--default-background);
}

.edui-toolbar .edui-btn-toolbar,
.edui-container .edui-toolbar {
  margin-top: 4px;
  /* 工具栏 */
  background-color: var(--elem-color);
}

.pb_footer {
  width: auto;
  width: initial;
  border: none;
  border-color: var(--border-color);
  background: none;
}

.save-to-quick-reply-btn {
  /* “保存至快速回贴”按钮 */
  border-color: var(--border-color);
  background: none;
  background-color: var(--light-background);
  color: inherit;
}

.save-to-quick-reply-btn span {
  color: var(--tieba-theme-fore);
}

.footer {
  display: none;
}

.skin_normal .wrap2 {
  background: none;
  background-color: var(--page-background);
}

#lcsas-container {
  display: none;
}

/* TODO: 隐藏用户3天 */
.user-hide-post-down,
.user-hide-post-up {
  display: none !important;
}
.user-hide-post-down,
.user-hide-post-up {
  background-color: var(--light-fore);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 16px;
  opacity: 0;
}

/* 选择搜索 */
#selectsearch-icon {
  display: none;
}

/* TODO: 用户卡片 */
.ui_card_wrap {
  background: none;
}

.ui_card_content {
  border-color: var(--border-color);
  border-radius: 6px;
  background: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card_userinfo_wrap {
  background: none;
  background-color: var(--default-background);
}

.card_userinfo_left .userinfo_head {
  /* 头像边框 */
  background: none;
}

.j_avatar img {
  width: 92px;
  height: 92px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
}
html[glass-effect] .j_avatar img {
  -webkit-backdrop-filter: blur(24px);
          backdrop-filter: blur(24px);
}
html[glass-effect].dark-theme .j_avatar img {
  -webkit-backdrop-filter: blur(24px) brightness(0.8);
          backdrop-filter: blur(24px) brightness(0.8);
}

.card_userinfo_middle .userinfo_sex {
  background: none;
}

.userinfo_sex_male::after {
  content: "♂";
}

.userinfo_sex_female::after {
  content: "♀";
}

.ui_card_wrap .ui_white_down,
.ui_card_wrap .ui_white_up {
  /* 三角 */
  display: none;
}

.card_userinfo_guide {
  /* 右上角 */
  display: none;
}

.user_card_loading {
  /* 加载 */
  background-color: var(--default-background);
}

.user_card_loading img {
  display: none;
}

/* TODO: 第三方内容吧适配 */
/* 由第三方提供的吧 */
/* 进吧导航 */
.plat_head_theme2,
.plat_header {
  border: none;
  background-color: transparent;
  background-color: initial;
}

.ylh-ad-wrap {
  display: none;
}`;
    const vercelErrorStyle = "html.style-vercel .search-form {\n  background-color: var(--default-background);\n}\nhtml.style-vercel .page404 {\n  background-color: var(--default-background);\n}\nhtml.style-vercel .main-title {\n  color: var(--default-fore);\n}\nhtml.style-vercel .main-title a {\n  color: var(--default-fore);\n  -webkit-text-decoration: underline 1px var(--minimal-fore);\n          text-decoration: underline 1px var(--minimal-fore);\n  text-underline-offset: 2px;\n}\nhtml.style-vercel .app_download_box,\nhtml.style-vercel #error_404_iframe {\n  display: none;\n}";
    const vercelForumStyle = `@charset "UTF-8";
html.style-vercel #content {
  background-color: transparent !important;
}
html.style-vercel #content {
  width: min(var(--content-max), 982px);
  max-width: 100%;
}
html.style-vercel #head {
  background: none !important;
  background-color: var(--page-background) !important;
}
html.style-vercel #head .head_inner {
  background-color: var(--default-background) !important;
}
html.style-vercel .card_banner,
html.style-vercel .plat_recom_carousel {
  display: none !important;
}
html.style-vercel .search_main {
  padding-bottom: 24px;
}
html.style-vercel .search_bright .search_inp_border,
html.style-vercel .search_bright .search_ipt {
  height: 36px !important;
  padding: 0 12px !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
  background-color: var(--default-background) !important;
  color: var(--default-fore) !important;
  box-shadow: none !important;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
html.style-vercel .search_bright .search_inp_border,
html.style-vercel .search_bright .search_ipt {
  box-sizing: border-box;
}
html.style-vercel .search_bright .search_inp_border:hover,
html.style-vercel .search_bright .search_ipt:hover {
  border-color: var(--minimal-fore) !important;
}
html.style-vercel .search_bright .search_inp_border:focus,
html.style-vercel .search_bright .search_ipt:focus {
  border-color: var(--default-fore) !important;
  box-shadow: 0 0 0 1px var(--default-fore) !important;
}
html.style-vercel .search_bright .search_btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 36px !important;
  padding: 0 18px !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
  background-color: var(--default-background) !important;
  color: var(--default-fore) !important;
  box-shadow: none !important;
  line-height: 1 !important;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
html.style-vercel .search_bright .search_btn {
  box-sizing: border-box;
}
html.style-vercel .search_bright .search_btn:hover {
  border-color: var(--minimal-fore) !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .search_bright .search_btn:hover {
  filter: none;
}
html.style-vercel .search_bright .search_btn_enter_ba {
  background-color: var(--default-fore) !important;
  border: 1px solid var(--default-fore) !important;
  color: var(--default-background) !important;
}
html.style-vercel .search_main_fixed {
  display: none !important;
}
html.style-vercel .card_top_theme {
  display: flex !important;
  align-items: stretch !important;
  height: auto !important;
  min-height: 132px !important;
  gap: 24px !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .card_top_theme {
  position: relative;
  overflow: hidden;
}
html.style-vercel .card_top_theme::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  opacity: 0.4;
  z-index: 0;
  background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
  background-size: 20px 20px;
  -webkit-mask-image: linear-gradient(to bottom, rgb(0, 0, 0), transparent);
          mask-image: linear-gradient(to bottom, rgb(0, 0, 0), transparent);
}
html.style-vercel .card_top_theme::after {
  content: none !important;
}
html.style-vercel .card_top_theme .card_top {
  order: 1 !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
  display: grid !important;
  grid-template-columns: 100px 1fr !important;
  grid-template-areas: "head title" "head slogan" "head info" !important;
  align-items: center !important;
  grid-column-gap: 20px !important;
  -moz-column-gap: 20px !important;
       column-gap: 20px !important;
  grid-row-gap: 0 !important;
  row-gap: 0 !important;
  box-sizing: border-box !important;
  min-height: 132px !important;
  padding: 16px 0 16px 24px !important;
  border: none !important;
  border-radius: 0 !important;
  background: none !important;
}
html.style-vercel .card_top_theme .card_top {
  position: relative;
  z-index: 1;
}
html.style-vercel .card_top_theme .card_top::before {
  display: none !important;
}
html.style-vercel .card_top_theme .card_top::after {
  content: none !important;
}
html.style-vercel .card_top_theme .card_top > .card_head {
  grid-area: head !important;
  align-self: center !important;
  justify-self: start !important;
  position: static !important;
  top: auto !important;
  left: auto !important;
  transform: none !important;
  width: 100px !important;
  height: 100px !important;
  margin: 0 !important;
}
html.style-vercel .card_top_theme .card_top > .card_head .card_head_img {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}
html.style-vercel .card_top_theme .card_top > .card_title {
  grid-area: title !important;
}
html.style-vercel .card_top_theme .card_top > .card_slogan {
  grid-area: slogan !important;
}
html.style-vercel .card_top_theme .card_top > .card_info {
  grid-area: info !important;
}
html.style-vercel .card_top_theme .card_top_right {
  order: 2 !important;
  flex-shrink: 0 !important;
  float: none !important;
  align-self: stretch !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  padding: 16px 24px !important;
}
html.style-vercel .card_top_theme .card_top_right {
  position: relative;
  z-index: 1;
}
html.style-vercel .card_top_theme .card_top_right > [id*=sign_mod],
html.style-vercel .card_top_theme .card_top_right .sign_mod_bright {
  display: flex !important;
  align-items: center !important;
}
html.style-vercel .card_title_fname {
  color: var(--default-fore) !important;
}
html.style-vercel .card_title_fname {
  font-weight: var(--font-weight-bold);
}
html.style-vercel .card_slogan {
  color: var(--light-fore) !important;
}
html.style-vercel .islike_focus {
  background-color: var(--default-fore) !important;
  background-image: none !important;
  border: 1px solid var(--default-fore) !important;
  border-radius: 6px !important;
  color: var(--default-background) !important;
}
html.style-vercel .cancel_focus {
  background: none !important;
  background-color: var(--default-background) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
  color: var(--default-fore) !important;
}
html.style-vercel .cancel_focus:hover {
  border-color: var(--minimal-fore) !important;
}
html.style-vercel .sign_box_bright,
html.style-vercel .sign_box_bright_hover {
  background: none !important;
  background-color: var(--default-fore) !important;
  border: 1px solid var(--default-fore) !important;
  border-radius: 6px !important;
  color: var(--default-background) !important;
}
html.style-vercel .sign_box_bright_signed,
html.style-vercel .sign_box_bright_noclass_hover {
  background: none !important;
  background-color: var(--default-background) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--default-fore) !important;
}
html.style-vercel .forum_content {
  position: relative !important;
  overflow: visible !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  background: var(--default-background) !important;
}
html.style-vercel .nav_wrap {
  display: flex !important;
  align-items: stretch !important;
  justify-content: space-between !important;
  box-sizing: border-box !important;
  padding: 0 16px !important;
  margin: 12px 0 !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  background-color: var(--default-background) !important;
  background-image: none !important;
  overflow: visible !important;
}
html.style-vercel .nav_wrap .nav_list {
  display: flex !important;
  align-items: stretch !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
  background: none !important;
  border: none !important;
  float: none !important;
}
html.style-vercel .nav_wrap .nav_list li {
  display: flex !important;
  align-items: stretch !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  background: none !important;
  border: none !important;
  float: none !important;
}
html.style-vercel .nav_wrap .nav_list li a {
  display: inline-flex !important;
  align-items: center !important;
  height: auto !important;
  padding: 10px 14px !important;
  margin: 0 0 -1px 0 !important;
  border: none !important;
  border-bottom: 2px solid transparent !important;
  background: none !important;
  background-color: transparent !important;
  color: var(--light-fore) !important;
  font-size: 13px !important;
  font-weight: var(--font-weight-normal) !important;
  line-height: 1.4 !important;
  -webkit-text-decoration: none !important;
  text-decoration: none !important;
  transition: color 0.18s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
html.style-vercel .nav_wrap .nav_list li a:hover,
html.style-vercel .nav_wrap .j_tabnav_tab:hover {
  background-color: transparent !important;
  color: var(--default-fore) !important;
}
html.style-vercel .nav_wrap .nav_list li.focus {
  background: none !important;
  border: none !important;
  border-bottom: none !important;
}
html.style-vercel .nav_wrap .nav_list li.focus a {
  color: var(--default-fore) !important;
  font-weight: var(--font-weight-bold) !important;
  border-bottom-color: var(--default-fore) !important;
}
html.style-vercel .nav_wrap .search_internal_wrap {
  display: flex !important;
  align-items: center !important;
  margin: 0 !important;
  padding: 0 !important;
  float: none !important;
  align-self: center !important;
}
html.style-vercel .nav_wrap .search_internal_input {
  height: 28px !important;
  box-sizing: border-box !important;
  padding: 0 10px !important;
  border: 1px solid var(--border-color) !important;
  border-right: none !important;
  border-radius: 6px 0 0 6px !important;
  background-color: var(--default-background) !important;
  color: var(--default-fore) !important;
}
html.style-vercel .nav_wrap .search_internal_input:focus {
  border-color: var(--default-fore) !important;
}
html.style-vercel .nav_wrap .search_internal_btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 30px !important;
  height: 28px !important;
  box-sizing: border-box !important;
  padding: 0 !important;
  border: 1px solid var(--default-fore) !important;
  border-radius: 0 6px 6px 0 !important;
  background-color: var(--default-fore) !important;
  background-image: none !important;
  color: var(--default-background) !important;
}
html.style-vercel .nav_wrap .search_internal_btn > i {
  display: inline-block !important;
  margin: 0 !important;
  vertical-align: middle !important;
  background-position: center center !important;
}
html.style-vercel .nav_wrap .search_internal_btn::after {
  color: var(--default-background) !important;
}
html.style-vercel .aside {
  box-sizing: border-box !important;
  padding: 15px 12px 0 0 !important;
}
html.style-vercel .aside_region.celebrity {
  display: none !important;
}
html.style-vercel .aside_region {
  box-sizing: border-box !important;
  margin: 0 0 12px -8px !important;
  padding: 10px 14px !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .aside_region {
  overflow: hidden;
}
html.style-vercel .aside_region.forum_info .region_header .pull_right a {
  display: inline-block;
  padding: 0;
  font-size: 0;
  line-height: 1;
  color: transparent;
  -webkit-text-decoration: none;
  text-decoration: none;
  vertical-align: middle;
}
html.style-vercel .aside_region.forum_info .region_header .pull_right a::after {
  content: "查看详情";
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--default-fore);
  font-size: 11px;
  font-weight: var(--font-weight-normal);
  line-height: 1.4;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .aside_region.forum_info .region_header .pull_right a:hover::after {
  border-color: var(--minimal-fore);
  background-color: var(--default-hover);
}
html.style-vercel .aside_region.my_tieba .region_header .pull_right a.p_balv_btnmanager {
  display: inline-block;
  padding: 0;
  font-size: 0;
  line-height: 1;
  color: transparent;
  -webkit-text-decoration: none;
  text-decoration: none;
  vertical-align: middle;
  opacity: 0;
  transition: opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .aside_region.my_tieba .region_header .pull_right a.p_balv_btnmanager::after {
  content: "管理";
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--default-fore);
  font-size: 11px;
  font-weight: var(--font-weight-normal);
  line-height: 1.4;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .aside_region.my_tieba .region_header .pull_right a.p_balv_btnmanager:hover::after {
  border-color: var(--minimal-fore);
  background-color: var(--default-hover);
}
html.style-vercel .aside_region.my_tieba .region_header:hover .pull_right a.p_balv_btnmanager {
  opacity: 1;
}
html.style-vercel .aside_region .region_header {
  color: var(--default-fore) !important;
}
html.style-vercel .aside_region .region_header {
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
  position: relative;
  padding-right: 24px;
}
html.style-vercel .aside_region .region_header::after {
  content: "▸";
  position: absolute;
  right: 10px;
  top: 50%;
  color: var(--minimal-fore);
  font-size: 12px;
  line-height: 1;
  transform: translateY(-50%) rotate(0);
  transform-origin: center;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .aside_region:not([data-collapsed=true]) .region_header::after {
  transform: translateY(-50%) rotate(90deg);
}
html.style-vercel .aside_region[data-collapsed=true] .region_cnt,
html.style-vercel .aside_region[data-collapsed=true] .region_footer {
  display: none !important;
}
html.style-vercel .my_current_forum .badge {
  border: 1px solid var(--border-color) !important;
  border-radius: 4px !important;
  background-color: var(--default-background) !important;
  color: var(--default-fore) !important;
}
html.style-vercel .threadlist_bright {
  display: grid !important;
  grid-template-columns: 1fr !important;
  grid-gap: 12px !important;
  gap: 12px !important;
  padding: 16px !important;
  background: none !important;
  list-style: none !important;
  margin: 0 !important;
}
html.style-vercel .threadlist_bright > li {
  display: grid !important;
  box-sizing: border-box !important;
  grid-template-columns: minmax(0, 1fr) auto auto !important;
  grid-template-rows: auto auto auto !important;
  grid-template-areas: "title rep author" "abs   abs abs" "media media media" !important;
  grid-auto-flow: row !important;
  grid-auto-rows: 0 !important;
  align-items: center !important;
  grid-column-gap: 12px !important;
  -moz-column-gap: 12px !important;
       column-gap: 12px !important;
  grid-row-gap: 8px !important;
  row-gap: 8px !important;
  min-height: 80px !important;
  padding: 16px !important;
  margin: 0 !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  background-color: var(--default-background) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  float: none !important;
  width: auto !important;
  height: auto !important;
  overflow: hidden !important;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
html.style-vercel .threadlist_bright > li:hover {
  border-color: var(--minimal-fore) !important;
  background-color: var(--default-background) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
}
html.dark-theme html.style-vercel .threadlist_bright > li {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}
html.dark-theme html.style-vercel .threadlist_bright > li:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
}
html.style-vercel .threadlist_bright > li::after,
html.style-vercel .threadlist_bright > li::before,
html.style-vercel .threadlist_bright .t_con::after,
html.style-vercel .threadlist_bright .t_con::before,
html.style-vercel .threadlist_bright .threadlist_lz::after,
html.style-vercel .threadlist_bright .threadlist_lz::before,
html.style-vercel .threadlist_bright .threadlist_detail::after,
html.style-vercel .threadlist_bright .threadlist_detail::before,
html.style-vercel .threadlist_bright .threadlist_text::after,
html.style-vercel .threadlist_bright .threadlist_text::before {
  content: none !important;
  display: none !important;
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder,
html.style-vercel .threadlist_bright > li.thread_top_list_folder:hover {
  background-color: var(--default-background) !important;
  border-left: 2px solid var(--default-fore) !important;
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder:not(.pinned-folded) {
  display: contents !important;
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder:not(.pinned-folded) > ul.thread_top_list,
html.style-vercel .threadlist_bright > li.thread_top_list_folder:not(.pinned-folded) > .thread_top_list {
  display: contents !important;
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
}
html.style-vercel .threadlist_bright .thread_top_list > li.j_thread_list.thread_top {
  display: grid !important;
  position: relative !important;
  box-sizing: border-box !important;
  grid-template-columns: minmax(0, 1fr) auto auto !important;
  grid-template-rows: auto !important;
  grid-template-areas: "title rep author" !important;
  grid-auto-rows: 0 !important;
  align-items: center !important;
  grid-column-gap: 12px !important;
  -moz-column-gap: 12px !important;
       column-gap: 12px !important;
  grid-row-gap: 0 !important;
  row-gap: 0 !important;
  min-height: 56px !important;
  padding: 12px 16px !important;
  margin: 0 !important;
  border: 1px solid var(--border-color) !important;
  border-left: 2px solid var(--default-fore) !important;
  border-radius: 8px !important;
  background-color: var(--default-background) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  float: none !important;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
html.style-vercel .threadlist_bright .thread_top_list > li.j_thread_list.thread_top:hover {
  border-color: var(--minimal-fore) !important;
  background-color: var(--default-background) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
}
html.dark-theme html.style-vercel .threadlist_bright .thread_top_list > li.j_thread_list.thread_top {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}
html.dark-theme html.style-vercel .threadlist_bright .thread_top_list > li.j_thread_list.thread_top:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
}
html.style-vercel .threadlist_bright .thread_top_list > li.j_thread_list.thread_top[style*="display: none"],
html.style-vercel .threadlist_bright .thread_top_list > li.j_thread_list.thread_top[style*="display:none"],
html.style-vercel .threadlist_bright .thread_top_list > li.j_thread_list.thread_top[hidden] {
  display: none !important;
}
html.style-vercel .threadlist_bright .thread_top_list .threadlist_title {
  display: flex !important;
  align-items: center !important;
  flex-wrap: nowrap !important;
  gap: 0 !important;
}
html.style-vercel .threadlist_bright .thread_top_list a.j_th_tit {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
html.style-vercel .threadlist_bright .thread_top_list .threadlist_title .icon-top,
html.style-vercel .threadlist_bright .thread_top_list .threadlist_title .icon-good {
  display: inline-flex !important;
  flex-shrink: 0 !important;
  padding: 1px 6px !important;
  margin-right: 6px !important;
  border-radius: 4px !important;
  color: #fff !important;
  font-size: 11px !important;
  font-style: normal !important;
  font-weight: var(--font-weight-normal) !important;
  line-height: 1.4 !important;
  background-image: none !important;
  width: auto !important;
  height: auto !important;
  text-indent: 0 !important;
  vertical-align: middle !important;
}
html.style-vercel .threadlist_bright .thread_top_list .threadlist_title .icon-top,
html.style-vercel .threadlist_bright .thread_top_list .threadlist_title .icon-good {
  align-items: center;
  justify-content: center;
}
html.style-vercel .threadlist_bright .thread_top_list .threadlist_title .icon-top {
  background-color: var(--error-color) !important;
}
html.style-vercel .threadlist_bright .thread_top_list .threadlist_title .icon-good {
  background-color: var(--warning-color) !important;
}
html.style-vercel .threadlist_bright .thread_top_list .threadlist_title .icon-top::before {
  content: "置顶";
}
html.style-vercel .threadlist_bright .thread_top_list .threadlist_title .icon-good::before {
  content: "精";
}
html.style-vercel .threadlist_bright .thread_top_list .is_show_create_time {
  display: none !important;
}
html.style-vercel .threadlist_bright .thread_top_list .j_thread_hidden,
html.style-vercel .threadlist_bright .thread_top_list .icon_thread_hidden {
  position: absolute !important;
  background: none !important;
  background-image: none !important;
  text-indent: 0 !important;
}
html.style-vercel .threadlist_bright .thread_top_list .j_thread_hidden,
html.style-vercel .threadlist_bright .thread_top_list .icon_thread_hidden {
  top: 4px;
  right: 6px;
  width: 16px;
  height: 16px;
  opacity: 0;
  color: var(--minimal-fore);
  cursor: pointer;
  transition: opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1), color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .threadlist_bright .thread_top_list .j_thread_hidden::before,
html.style-vercel .threadlist_bright .thread_top_list .icon_thread_hidden::before {
  content: "×";
  display: block;
  font-size: 16px;
  line-height: 16px;
  text-align: center;
}
html.style-vercel .threadlist_bright .thread_top_list .j_thread_hidden:hover,
html.style-vercel .threadlist_bright .thread_top_list .icon_thread_hidden:hover {
  color: var(--default-fore);
}
html.style-vercel .threadlist_bright .thread_top_list > li.j_thread_list.thread_top:hover .j_thread_hidden,
html.style-vercel .threadlist_bright .thread_top_list > li.j_thread_list.thread_top:hover .icon_thread_hidden {
  opacity: 1;
}
html.style-vercel .threadlist_bright > li[style*="display: none"],
html.style-vercel .threadlist_bright > li[style*="display:none"],
html.style-vercel .threadlist_bright > li[hidden] {
  display: none !important;
}
html.style-vercel .threadlist_bright #thread_top_folder {
  display: none !important;
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder.pinned-folded {
  display: block !important;
  position: absolute !important;
  top: 0 !important;
  left: -24px !important;
  right: auto !important;
  width: 28px !important;
  min-height: 0 !important;
  height: 28px !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  background: none !important;
  box-shadow: none !important;
  transform: none !important;
  z-index: 100 !important;
  grid-template-areas: none !important;
  grid-template-columns: none !important;
  grid-template-rows: none !important;
  overflow: visible !important;
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder.pinned-folded > ul,
html.style-vercel .threadlist_bright > li.thread_top_list_folder.pinned-folded > .thread_top_list {
  display: none !important;
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder.pinned-folded #thread_top_folder {
  display: flex !important;
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder.pinned-folded #thread_top_folder {
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--default-background);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder.pinned-folded #thread_top_folder::before {
  content: "";
  display: block;
  width: 14px;
  height: 14px;
  background-color: var(--light-fore);
  transition: background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>') no-repeat center/contain;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>') no-repeat center/contain;
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder.pinned-folded #thread_top_folder:hover {
  border-color: var(--minimal-fore);
}
html.style-vercel .threadlist_bright > li.thread_top_list_folder.pinned-folded #thread_top_folder:hover::before {
  background-color: var(--default-fore);
}
html.style-vercel .threadlist_bright .t_con,
html.style-vercel .threadlist_bright .t_con > .col2_left,
html.style-vercel .threadlist_bright .t_con > .col2_right,
html.style-vercel .threadlist_bright > li > .t_con,
html.style-vercel .threadlist_bright .threadlist_lz,
html.style-vercel .threadlist_bright .threadlist_detail,
html.style-vercel .threadlist_bright .threadlist_text,
html.style-vercel .threadlist_bright .small_list,
html.style-vercel .threadlist_bright .j_small_list,
html.style-vercel .threadlist_bright .small_list_gallery {
  display: contents !important;
}
html.style-vercel .threadlist_bright .small_wrap,
html.style-vercel .threadlist_bright .j_small_wrap {
  grid-area: media !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  gap: 8px !important;
  width: auto !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 0 !important;
}
html.style-vercel .threadlist_bright .small_btn_pre,
html.style-vercel .threadlist_bright .small_btn_next,
html.style-vercel .threadlist_bright .j_small_pic_pre,
html.style-vercel .threadlist_bright .j_small_pic_next {
  display: none !important;
}
html.style-vercel .threadlist_bright .small_pic_num {
  flex-shrink: 0 !important;
  align-self: center !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 4px 10px !important;
  margin: 0 !important;
  border-radius: 4px !important;
  background-color: var(--default-hover) !important;
  color: var(--light-fore) !important;
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace !important;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace) !important;
  font-size: 11px !important;
  line-height: 1 !important;
  white-space: nowrap !important;
  float: none !important;
  position: static !important;
}
html.style-vercel .threadlist_bright .threadlist_title,
html.style-vercel .threadlist_bright .threadlist_lz > .threadlist_title {
  grid-area: title !important;
  min-width: 0 !important;
  max-width: none !important;
  float: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
html.style-vercel .threadlist_bright .threadlist_title a,
html.style-vercel .threadlist_bright a.j_th_tit {
  display: -webkit-box !important;
  color: var(--default-fore) !important;
  font-size: 16px !important;
  font-weight: var(--font-weight-bold) !important;
  line-height: 1.4 !important;
  -webkit-text-decoration: none !important;
  text-decoration: none !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
html.style-vercel .threadlist_bright .threadlist_title a:hover, html.style-vercel .threadlist_bright .threadlist_title a:focus, html.style-vercel .threadlist_bright .threadlist_title a:active, html.style-vercel .threadlist_bright .threadlist_title a:visited,
html.style-vercel .threadlist_bright a.j_th_tit:hover,
html.style-vercel .threadlist_bright a.j_th_tit:focus,
html.style-vercel .threadlist_bright a.j_th_tit:active,
html.style-vercel .threadlist_bright a.j_th_tit:visited {
  color: var(--default-fore) !important;
  -webkit-text-decoration: none !important;
  text-decoration: none !important;
}
html.style-vercel .threadlist_bright .threadlist_rep_num {
  grid-area: rep !important;
  display: inline-flex !important;
  align-items: center !important;
  align-self: center !important;
  justify-self: end !important;
  height: auto !important;
  width: auto !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
  background: none !important;
  color: var(--default-fore) !important;
  font-weight: var(--font-weight-bold) !important;
  float: none !important;
  gap: 4px !important;
  line-height: 1 !important;
}
html.style-vercel .threadlist_bright .threadlist_rep_num {
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
  font-size: 13px;
  color: var(--light-fore);
  font-feature-settings: "tnum" 1;
  letter-spacing: 0;
}
html.style-vercel .threadlist_bright .threadlist_rep_num::before {
  content: "";
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  background-color: var(--minimal-fore);
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6.5 5A1.5 1.5 0 0 0 5 6.5v7A1.5 1.5 0 0 0 6.5 15H8v3.5c0 .33.39.5.63.27L12.6 15h4.9A1.5 1.5 0 0 0 19 13.5v-7A1.5 1.5 0 0 0 17.5 5h-11Z"/></svg>') no-repeat center/contain;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6.5 5A1.5 1.5 0 0 0 5 6.5v7A1.5 1.5 0 0 0 6.5 15H8v3.5c0 .33.39.5.63.27L12.6 15h4.9A1.5 1.5 0 0 0 19 13.5v-7A1.5 1.5 0 0 0 17.5 5h-11Z"/></svg>') no-repeat center/contain;
}
html.style-vercel .threadlist_bright .threadlist_author {
  grid-area: author !important;
  display: inline-flex !important;
  align-items: center !important;
  align-self: center !important;
  justify-self: end !important;
  width: -moz-max-content !important;
  width: max-content !important;
  min-width: -moz-max-content !important;
  min-width: max-content !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  float: none !important;
  border-top: none !important;
  gap: 6px !important;
  line-height: 1 !important;
  text-align: right !important;
  overflow: visible !important;
}
html.style-vercel .threadlist_bright .threadlist_author {
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
  font-size: 11px;
  color: var(--light-fore);
  font-feature-settings: "tnum" 1;
  letter-spacing: 0;
}
html.style-vercel .threadlist_bright .threadlist_author .tb_icon_author,
html.style-vercel .threadlist_bright .threadlist_author .frs-author-name-wrap,
html.style-vercel .threadlist_bright .threadlist_author .frs-author-name,
html.style-vercel .threadlist_bright .threadlist_author .j_user_card,
html.style-vercel .threadlist_bright .threadlist_author > a,
html.style-vercel .threadlist_bright .threadlist_author span,
html.style-vercel .threadlist_bright .threadlist_author a {
  display: inline-flex !important;
  align-items: center !important;
  width: auto !important;
  max-width: none !important;
  min-width: 0 !important;
  margin: 0 !important;
  overflow: visible !important;
  text-overflow: clip !important;
  line-height: 1 !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}
html.style-vercel .threadlist_bright .threadlist_author .icon_author,
html.style-vercel .threadlist_bright .threadlist_author .icon_replyer,
html.style-vercel .threadlist_bright .threadlist_author i,
html.style-vercel .threadlist_bright .threadlist_author .frs_pp_icon,
html.style-vercel .threadlist_bright .threadlist_author .gold_member_icon,
html.style-vercel .threadlist_bright .threadlist_author .like_forum_user_icon,
html.style-vercel .threadlist_bright .threadlist_author .tb_icon_grade,
html.style-vercel .threadlist_bright .threadlist_author img,
html.style-vercel .threadlist_bright .threadlist_author .icon_wrap,
html.style-vercel .threadlist_bright .threadlist_author .frs_bright_icons,
html.style-vercel .threadlist_bright .threadlist_author .icon_wrap_theme1,
html.style-vercel .threadlist_bright .threadlist_author .j_icon_slot,
html.style-vercel .threadlist_bright .threadlist_author .is_show_create_time,
html.style-vercel .threadlist_bright .threadlist_author .threadlist_reply_date,
html.style-vercel .threadlist_bright .icon_wrap.frs_bright_icons,
html.style-vercel .threadlist_bright .icon_wrap_theme1,
html.style-vercel .threadlist_bright .j_icon_slot {
  display: none !important;
}
html.style-vercel .threadlist_bright .threadlist_author_replyer,
html.style-vercel .threadlist_bright .threadlist_author.threadlist_author_replyer,
html.style-vercel .threadlist_bright .threadlist_detail > .threadlist_author {
  display: none !important;
}
html.style-vercel .threadlist_bright .frs-author-name-wrap,
html.style-vercel .threadlist_bright .frs-author-name-wrap a,
html.style-vercel .threadlist_bright .frs-author-name,
html.style-vercel .threadlist_bright .tb_icon_author > a,
html.style-vercel .threadlist_bright .tb_icon_author > .frs-author-name-wrap {
  color: var(--light-fore) !important;
  font-family: inherit !important;
  margin: 0 !important;
  float: none !important;
}
html.style-vercel .threadlist_bright .threadlist_abs,
html.style-vercel .threadlist_bright .threadlist_abs_onlyline {
  grid-area: abs !important;
  display: -webkit-box !important;
  float: none !important;
  width: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: var(--light-fore) !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
html.style-vercel .threadlist_bright .threadlist_media {
  grid-area: media !important;
  display: flex !important;
  flex-wrap: nowrap !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  float: none !important;
  width: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  gap: 4px !important;
  line-height: 0 !important;
  list-style: none !important;
  overflow: hidden !important;
  mask-image: linear-gradient(to right, #000 calc(100% - 48px), transparent 100%) !important;
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 48px), transparent 100%) !important;
}
html.style-vercel .threadlist_bright .threadlist_media li {
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  line-height: 0 !important;
  flex: 0 0 auto !important;
  border-radius: 6px !important;
  overflow: hidden !important;
}
html.style-vercel .threadlist_bright .threadlist_media a,
html.style-vercel .threadlist_bright .threadlist_media .thumbnail,
html.style-vercel .threadlist_bright .threadlist_media .vpic_wrap {
  display: inline-block !important;
  height: auto !important;
  min-height: 0 !important;
  line-height: 0 !important;
  vertical-align: top !important;
}
html.style-vercel .threadlist_bright .threadlist_media img {
  max-height: 120px !important;
  vertical-align: top !important;
}
html.style-vercel .threadlist_bright .vpic_wrap img:not([style]) {
  opacity: 0;
}
html.style-vercel .threadlist_bright .vpic_wrap img {
  border-radius: 6px !important;
}
html.style-vercel .threadlist_bright .threadlist_pic_highlight {
  display: none !important;
}
html.style-vercel .threadlist_bright .threadlist_video {
  border-radius: 6px !important;
}
html.style-vercel .threadlist_bright .media_box,
html.style-vercel .threadlist_bright .j_media_box {
  display: none !important;
}
html.style-vercel .threadlist_bright .threadlist_icon,
html.style-vercel .threadlist_bright .threadlist_pin {
  opacity: 0.6;
}
html.style-vercel .threadlist_bright > li:has(> .ylh-ad-container) {
  display: contents !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container {
  display: grid !important;
  position: relative !important;
  box-sizing: border-box !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  grid-template-areas: "title rep" "media media" !important;
  grid-column-gap: 12px !important;
  -moz-column-gap: 12px !important;
       column-gap: 12px !important;
  grid-row-gap: 8px !important;
  row-gap: 8px !important;
  align-items: center !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  min-height: 80px !important;
  padding: 16px !important;
  margin: 0 !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  background-color: var(--default-background) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  overflow: hidden !important;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container:hover {
  border-color: var(--minimal-fore) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
}
html.dark-theme html.style-vercel .threadlist_bright .ylh-ad-container {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}
html.dark-theme html.style-vercel .threadlist_bright .ylh-ad-container:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container > .ylh-ad-reply-num-wrap {
  grid-area: rep !important;
  display: inline-flex !important;
  align-items: center !important;
  align-self: center !important;
  justify-self: end !important;
  padding: 0 !important;
  margin: 0 !important;
  background: none !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container > .ylh-ad-reply-num-wrap .ylh-ad-reply-num {
  margin: 0 !important;
  padding: 0 !important;
  color: var(--default-fore) !important;
  font-weight: var(--font-weight-bold) !important;
  line-height: 1 !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container > .ylh-ad-reply-num-wrap .ylh-ad-reply-num {
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
  font-size: 13px;
  color: var(--light-fore);
  font-feature-settings: "tnum" 1;
  letter-spacing: 0;
}
html.style-vercel .threadlist_bright .ylh-ad-container > .ylh-custom-ad-container {
  display: contents !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-top-wrap {
  grid-area: title !important;
  display: flex !important;
  align-items: center !important;
  min-width: 0 !important;
  gap: 8px !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-title-wrap {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-title {
  display: -webkit-box !important;
  color: var(--default-fore) !important;
  font-size: 16px !important;
  font-weight: var(--font-weight-bold) !important;
  line-height: 1.4 !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-author {
  display: none !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-tag {
  flex-shrink: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 1px 6px !important;
  border-radius: 4px !important;
  background-color: var(--warning-color) !important;
  color: #fff !important;
  font-size: 11px !important;
  line-height: 1.4 !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-tag .ylh-ad-icon {
  display: none !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-tag .ylh-ad-text {
  color: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-content-wrap {
  grid-area: media !important;
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
  max-width: 100% !important;
  overflow: hidden !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-content {
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  max-height: 120px !important;
  border-radius: 6px !important;
  overflow: hidden !important;
  background-size: cover !important;
  background-position: center !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-content .ylh-ad-img,
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-content video {
  width: 100% !important;
  max-width: 100% !important;
  max-height: 120px !important;
  height: auto !important;
  -o-object-fit: cover !important;
     object-fit: cover !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-content .ylh-video-container,
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-content .ylh-video-container > div {
  width: 100% !important;
  max-width: 100% !important;
  max-height: 120px !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container .ylh-ad-reply {
  display: none !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container > .ylh-ad-close {
  position: absolute !important;
  top: 4px !important;
  right: 6px !important;
  width: 16px !important;
  height: 16px !important;
  background: none !important;
  color: var(--minimal-fore) !important;
  opacity: 0 !important;
  cursor: pointer !important;
  transition: opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container > .ylh-ad-close::before {
  content: "×";
  display: block;
  font-size: 16px;
  line-height: 16px;
  text-align: center;
}
html.style-vercel .threadlist_bright .ylh-ad-container > .ylh-ad-close:hover {
  color: var(--default-fore) !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container:hover > .ylh-ad-close {
  opacity: 1 !important;
}
html.style-vercel .threadlist_bright .ylh-ad-container > .handle-btn-box {
  display: none !important;
}
html.style-vercel .pagination-default .pagination-item {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
  font-size: 13px;
  min-width: 32px;
  text-align: center;
}
html.style-vercel .pagination-default .pagination-item:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel .pagination-default .pagination-item:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel .pagination-default .pagination-item:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel .pagination-default .pagination-current {
  background-color: var(--default-fore) !important;
  border-color: var(--default-fore) !important;
  color: var(--default-background) !important;
}
html.style-vercel .pagination-default .pagination-item:not(.pagination-current):hover {
  border-color: var(--minimal-fore) !important;
  background-color: var(--default-background) !important;
}
html.style-vercel #tb_rich_poster_container {
  border-radius: 8px !important;
  background-color: var(--default-background) !important;
}
html.style-vercel #tb_rich_poster_container {
  border: 1px solid var(--border-color);
}
html.style-vercel .tb_rich_poster .poster_body .editor_textfield {
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
  background-color: var(--default-background) !important;
  color: var(--default-fore) !important;
}
html.style-vercel .tb_rich_poster .poster_body .editor_textfield:focus {
  border-color: var(--default-fore) !important;
  box-shadow: 0 0 0 1px var(--default-fore) !important;
}
html.style-vercel .old_style_wrapper {
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .edui-editor-body .edui-body-container {
  border-color: var(--border-color) !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .footer {
  display: none !important;
}`;
    const vercelHomeStyle = 'html.style-vercel body {\n  background-color: var(--page-background);\n  color: var(--default-fore);\n}\nhtml.style-vercel .head_inner {\n  box-shadow: none !important;\n}\nhtml.style-vercel .head_inner {\n  background-color: var(--default-background);\n  border-bottom: 1px solid var(--border-color);\n}\nhtml.style-vercel .u_menu_item a,\nhtml.style-vercel .u_menu_item a:hover,\nhtml.style-vercel .u_menu_item a:visited,\nhtml.style-vercel .search_nav a:link,\nhtml.style-vercel .search_nav a:hover,\nhtml.style-vercel .search_nav a:visited {\n  color: var(--default-fore) !important;\n}\nhtml.style-vercel .head_inner .search_logo {\n  background-image: var(--img-tieba-icon);\n}\nhtml.style-vercel .search_top {\n  border: none;\n}\nhtml.style-vercel .search_main {\n  padding-bottom: 60px;\n}\nhtml.style-vercel .search_bright .search_inp_border {\n  border: 1px solid var(--border-color) !important;\n  border-radius: 6px 0 0 6px !important;\n  background-color: var(--default-background) !important;\n  color: var(--default-fore) !important;\n}\nhtml.style-vercel .search_bright .search_inp_border:focus {\n  border-color: var(--default-fore) !important;\n}\nhtml.style-vercel .search_bright .search_btn {\n  border: 1px solid var(--border-color) !important;\n  border-radius: 6px !important;\n  background-color: var(--default-background) !important;\n  color: var(--default-fore) !important;\n  box-shadow: none !important;\n}\nhtml.style-vercel .search_bright .search_btn_enter_ba {\n  background-color: var(--default-fore) !important;\n  border-color: var(--default-fore) !important;\n  color: var(--default-background) !important;\n  border-radius: 0 6px 6px 0 !important;\n}\nhtml.style-vercel .suggestion {\n  border: 1px solid var(--border-color) !important;\n  border-radius: 6px !important;\n  background-color: var(--default-background) !important;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;\n  color: var(--default-fore) !important;\n}\nhtml.style-vercel .suggestion .highlight {\n  color: var(--default-fore) !important;\n  font-weight: var(--font-weight-bold) !important;\n}\nhtml.style-vercel .suggestion .forum_image {\n  border-radius: 6px !important;\n}\nhtml.style-vercel .suggestion .forum_name,\nhtml.style-vercel .suggestion .operation_title {\n  color: var(--default-fore) !important;\n}\nhtml.style-vercel .suggestion .on {\n  background-color: var(--default-hover) !important;\n}\nhtml.style-vercel .page-container .top-sec,\nhtml.style-vercel .aggregate_entrance_wrap,\nhtml.style-vercel .topic-tag,\nhtml.style-vercel .page-container .r-right-sec {\n  display: none;\n}\nhtml.style-vercel .page-container .left-sec {\n  border-radius: 8px;\n  border: 1px solid var(--border-color);\n  background-color: var(--default-background);\n}\nhtml.style-vercel .f-d-w {\n  border-radius: 8px;\n  background-color: var(--default-background);\n}\nhtml.style-vercel .f-d-w .f-d-item {\n  background: none;\n}\nhtml.style-vercel .u-f-t .gap {\n  border: none;\n  background: none;\n}\nhtml.style-vercel .f-d-w .all {\n  background: none;\n}\nhtml.style-vercel .forum_rcmd {\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  background-color: var(--default-background);\n}\nhtml.style-vercel .region_bright .region_header {\n  color: var(--default-fore);\n  font-weight: var(--font-weight-bold);\n}\nhtml.style-vercel .page-container .left-sec .region_bright {\n  border-radius: 8px;\n}\nhtml.style-vercel .my_tieba_mod .media_left,\nhtml.style-vercel .my_tieba_mod .media-left {\n  border: none;\n}\nhtml.style-vercel .media_left img,\nhtml.style-vercel .media-left img {\n  border-radius: 6px;\n}\nhtml.style-vercel #nameValue,\nhtml.style-vercel #j_tcharge_dialog {\n  color: var(--default-fore);\n}\nhtml.style-vercel #onekey_sign .onekey_btn,\nhtml.style-vercel #onekey_sign a.onekey_btn {\n  border-radius: 6px;\n  background: var(--default-fore);\n  color: var(--default-background);\n}\nhtml.style-vercel #onekey_sign .onekey_btn:hover,\nhtml.style-vercel #onekey_sign a.onekey_btn:hover {\n  box-shadow: none;\n  background-color: var(--default-fore);\n}\nhtml.style-vercel .u-f-w .sign,\nhtml.style-vercel .u-f-w .unsign,\nhtml.style-vercel .always-forum-item .sign,\nhtml.style-vercel .always-forum-item .unsign {\n  border: 1px solid var(--border-color);\n  border-radius: 6px;\n  background: var(--default-background);\n  color: var(--default-fore);\n}\nhtml.style-vercel .u-f-w .sign,\nhtml.style-vercel .always-forum-item .sign {\n  background-color: var(--default-hover);\n  color: var(--default-fore);\n}\nhtml.style-vercel .u-f-w .sign:hover,\nhtml.style-vercel .u-f-w .unsign:hover,\nhtml.style-vercel .always-forum-item .sign:hover,\nhtml.style-vercel .always-forum-item .unsign:hover {\n  background: var(--default-fore);\n  box-shadow: none;\n  color: var(--default-background);\n  -webkit-text-decoration: none;\n  text-decoration: none;\n  border-color: var(--default-fore);\n}\nhtml.style-vercel .u-f-w .more {\n  border: 1px solid var(--border-color);\n  border-radius: 6px;\n  background: var(--default-background);\n  box-shadow: none;\n  color: var(--default-fore);\n}\nhtml.style-vercel .u-f-w .more-hover {\n  background-color: var(--default-fore);\n  box-shadow: none;\n  color: var(--default-background);\n}\nhtml.style-vercel #alwayforum-wraper,\nhtml.style-vercel .pop-up-frame {\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  background-color: var(--default-background);\n  box-shadow: none;\n}\nhtml.style-vercel .always-forum-item .addnewforumbtn {\n  border-radius: 6px;\n  background: var(--default-background);\n  border: 1px solid var(--border-color);\n  color: var(--default-fore);\n}\nhtml.style-vercel .always-forum-item .addnewforumbtn:hover {\n  background-color: var(--default-fore);\n  box-shadow: none;\n  color: var(--default-background);\n}\nhtml.style-vercel .forum_rcmd .class_title > div,\nhtml.style-vercel .rcmd_forum_item .forum_name {\n  color: var(--default-fore);\n}\nhtml.style-vercel .rcmd_forum_item .rcmd_forum_logo {\n  border: 1px solid var(--border-color);\n  border-radius: 6px;\n  background: none;\n}\nhtml.style-vercel .sub_nav_wrap {\n  background-color: var(--default-background);\n  box-shadow: none;\n  border-bottom: 1px solid var(--border-color);\n}\nhtml.style-vercel .sub_nav_list a.cur {\n  border: none;\n  color: var(--default-fore);\n}\nhtml.style-vercel .sub_nav_list .nav_hover {\n  border-bottom: 2px solid var(--default-fore);\n}\nhtml.style-vercel .item_hd,\nhtml.style-vercel .item .item_hd {\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  background-color: var(--default-background);\n  color: var(--default-fore);\n}\nhtml.style-vercel .item_hd .title,\nhtml.style-vercel .item .item_hd .title {\n  color: var(--default-fore);\n}\nhtml.style-vercel .topic_list .topic_item .topic_flag_hot {\n  border-radius: 4px;\n}\nhtml.style-vercel .notice-wrap-fixed {\n  background-color: var(--default-background);\n  border-bottom-left-radius: 8px;\n  border-bottom-right-radius: 8px;\n}\nhtml.style-vercel .notice,\nhtml.style-vercel .notice img {\n  border-radius: 8px;\n}\nhtml.style-vercel .new_list .title {\n  color: var(--default-fore);\n}\nhtml.style-vercel .new_list .title:hover {\n  color: var(--default-fore);\n  -webkit-text-decoration: underline;\n  text-decoration: underline;\n}\nhtml.style-vercel .title-tag-wraper a {\n  padding: 2px 8px;\n  border: 1px solid var(--border-color);\n  border-radius: 4px;\n  background-color: var(--default-background);\n  color: var(--light-fore);\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n  font-size: 11px;\n}\nhtml.style-vercel .title-tag-wraper a:hover {\n  color: var(--default-fore);\n  -webkit-text-decoration: none;\n  text-decoration: none;\n}\nhtml.style-vercel .list-post-num {\n  color: var(--default-fore) !important;\n}\nhtml.style-vercel .list-post-num {\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n  font-size: 13px;\n  color: var(--light-fore);\n  font-feature-settings: "tnum" 1;\n  letter-spacing: 0;\n  top: 0;\n  padding: 2px 8px;\n  border: 1px solid var(--border-color);\n  border-radius: 4px;\n  background: none;\n  font-weight: var(--font-weight-bold);\n}\nhtml.style-vercel .list-triangle-border,\nhtml.style-vercel .list-triangle-body {\n  display: none;\n}\nhtml.style-vercel .new_list .post_author {\n  background: none;\n  color: var(--light-fore);\n  -webkit-text-decoration: none;\n  text-decoration: none;\n}\nhtml.style-vercel .new_list .time {\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n  font-size: 11px;\n  color: var(--light-fore);\n  font-feature-settings: "tnum" 1;\n  letter-spacing: 0;\n  background: none;\n}\nhtml.style-vercel .n_img img,\nhtml.style-vercel .n_img li {\n  border-radius: 6px;\n}\nhtml.style-vercel .n_img li .feed_highlight {\n  background: none;\n}\nhtml.style-vercel .media_box {\n  border: 1px solid var(--border-color);\n  border-radius: 6px;\n  background-color: var(--default-background);\n}\nhtml.style-vercel .media_box img {\n  border-radius: 6px;\n}\nhtml.style-vercel .ui_btn {\n  border: 1px solid var(--default-fore);\n  border-radius: 6px;\n  background: var(--default-fore);\n  color: var(--default-background);\n}\nhtml.style-vercel .ui_btn:hover {\n  -webkit-text-decoration: none !important;\n  text-decoration: none !important;\n}\nhtml.style-vercel .ui_btn:hover {\n  background: var(--default-fore);\n  box-shadow: none;\n  color: var(--default-background);\n}\nhtml.style-vercel .btn_more {\n  width: 200px;\n  height: auto;\n  height: initial;\n  border: 1px solid var(--border-color);\n  border-radius: 6px;\n  background: var(--default-background);\n}\nhtml.style-vercel .btn_more:hover,\nhtml.style-vercel .data_error_bar a:hover,\nhtml.style-vercel .btn_more a:hover {\n  background-color: var(--default-fore) !important;\n  color: var(--default-background) !important;\n}\nhtml.style-vercel .data_error_bar a,\nhtml.style-vercel .btn_more a {\n  border: none;\n  color: var(--default-fore);\n}\nhtml.style-vercel .footer {\n  border-top: 1px solid var(--border-color);\n  background-color: var(--page-background);\n}';
    const vercelMainStyle = "html.style-vercel body {\n  background-color: var(--page-background);\n  color: var(--default-fore);\n}\nhtml.style-vercel #nav-bar {\n  box-shadow: none !important;\n}\nhtml.style-vercel #nav-bar {\n  border: 1px solid var(--border-color);\n  background-color: var(--surface-glass);\n}\nhtml.dark-theme html.style-vercel #nav-bar {\n  box-shadow: none !important;\n}\nhtml.style-vercel button,\nhtml.style-vercel .user-button {\n  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);\n}\nhtml.style-vercel .anchor,\nhtml.style-vercel .anchor-noback {\n  color: var(--default-fore);\n  transition: color 0.18s cubic-bezier(0.4, 0, 0.2, 1);\n}\nhtml.style-vercel .anchor:hover,\nhtml.style-vercel .anchor-noback:hover {\n  color: var(--default-fore);\n  background-color: transparent;\n}\nhtml.style-vercel .tbui_aside_float_bar .tbui_fbar_auxiliaryCare,\nhtml.style-vercel .tbui_aside_float_bar .tbui_fbar_down,\nhtml.style-vercel .tbui_aside_float_bar .tbui_fbar_refresh,\nhtml.style-vercel .tbui_aside_float_bar .tbui_fbar_share,\nhtml.style-vercel .tbui_aside_float_bar .tbui_fbar_favor {\n  display: none !important;\n}\nhtml.style-vercel .tbui_aside_float_bar li {\n  border-radius: 6px;\n  background-color: transparent;\n  transition: background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);\n}\nhtml.style-vercel .tbui_aside_float_bar li:hover {\n  background-color: var(--default-hover);\n}\nhtml.style-vercel .tbui_aside_float_bar li:active {\n  background-color: var(--default-active);\n}\nhtml.style-vercel .tbui_aside_float_bar a {\n  color: var(--minimal-fore);\n  transition: color 0.18s cubic-bezier(0.4, 0, 0.2, 1);\n}\nhtml.style-vercel .tbui_aside_float_bar a:hover {\n  color: var(--default-fore);\n}\nhtml.style-vercel body[hide-bottom-editor] .tbui_aside_float_bar .tbui_fbar_post {\n  display: none !important;\n}\nhtml.style-vercel .head_inner {\n  background-color: var(--default-background) !important;\n  box-shadow: none !important;\n}\nhtml.style-vercel .blur-effect,\nhtml.style-vercel .blur-if-custom-background {\n  -webkit-backdrop-filter: none;\n          backdrop-filter: none;\n}\nhtml.style-vercel .d_badge_bright .d_badge_lv,\nhtml.style-vercel .user_level .badge_index {\n  background-color: var(--level-orange-background) !important;\n  color: var(--level-orange-fore) !important;\n}\nhtml.style-vercel .level-green,\nhtml.style-vercel .tieba-lvl-green {\n  background-color: var(--level-green-background) !important;\n  color: var(--level-green-fore) !important;\n}\nhtml.style-vercel .level-blue,\nhtml.style-vercel .tieba-lvl-blue {\n  background-color: var(--level-blue-background) !important;\n  color: var(--level-blue-fore) !important;\n}\nhtml.style-vercel .level-yellow,\nhtml.style-vercel .tieba-lvl-yellow {\n  background-color: var(--level-yellow-background) !important;\n  color: var(--level-yellow-fore) !important;\n}\nhtml.style-vercel .level-orange,\nhtml.style-vercel .tieba-lvl-orange {\n  background-color: var(--level-orange-background) !important;\n  color: var(--level-orange-fore) !important;\n}\nhtml.style-vercel ::-moz-selection {\n  background-color: var(--default-fore);\n  color: var(--default-background);\n}\nhtml.style-vercel ::selection {\n  background-color: var(--default-fore);\n  color: var(--default-background);\n}\nhtml.style-vercel .search_top {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  padding: 8px 0 !important;\n  border: none !important;\n  background: none !important;\n}\nhtml.style-vercel .search_nav {\n  display: inline-flex !important;\n  align-items: center !important;\n  flex-wrap: nowrap !important;\n  gap: 4px !important;\n  margin: 0 !important;\n  float: none !important;\n  background: none !important;\n}\nhtml.style-vercel .search_nav a,\nhtml.style-vercel .search_nav a:link,\nhtml.style-vercel .search_nav a:visited {\n  display: inline-flex !important;\n  align-items: center !important;\n  padding: 4px 10px !important;\n  border-radius: 6px !important;\n  background: none !important;\n  color: var(--light-fore) !important;\n  font-size: 13px !important;\n  font-weight: var(--font-weight-normal) !important;\n  line-height: 1.4 !important;\n  -webkit-text-decoration: none !important;\n  text-decoration: none !important;\n  white-space: nowrap !important;\n  transition: color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;\n}\nhtml.style-vercel .search_nav a:hover {\n  color: var(--default-fore) !important;\n  background-color: var(--default-hover) !important;\n}\nhtml.style-vercel .search_nav b {\n  display: inline-flex !important;\n  align-items: center !important;\n  padding: 4px 10px !important;\n  border-radius: 6px !important;\n  background-color: var(--default-fore) !important;\n  color: var(--default-background) !important;\n  font-size: 13px !important;\n  font-weight: var(--font-weight-bold) !important;\n  line-height: 1.4 !important;\n  white-space: nowrap !important;\n}";
    const vercelSettingsStyle = 'html.style-vercel .user-dialog-modal .user-dialog.default {\n  border: 1px solid var(--border-color) !important;\n  border-radius: 8px !important;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;\n  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;\n}\nhtml.style-vercel.dark-theme .user-dialog-modal .user-dialog.default {\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.24) !important;\n}\nhtml.style-vercel .settings-wrapper {\n  --user-back: var(--default-background);\n  --user-back-deep: var(--deep-background);\n  --user-back-light: var(--light-background);\n  --user-hover: var(--default-hover);\n  --user-active: var(--default-active);\n  --user-fore: var(--default-fore);\n  --user-fore-light: var(--light-fore);\n  --user-fore-minimal: var(--minimal-fore);\n  --user-fore-highlight: var(--highlight-fore);\n  --user-border: var(--border-color);\n  --user-border-light: var(--light-border-color);\n  --user-theme: var(--default-fore);\n  --user-theme-hover: var(--default-fore);\n  --user-theme-active: var(--default-fore);\n  --user-theme-fore: var(--default-fore);\n  --user-theme-back: var(--default-hover);\n  --user-theme-transp: var(--default-hover);\n}\nhtml.style-vercel .settings-wrapper .sidebar-search.user-textbox,\nhtml.style-vercel .settings-wrapper .widget-textbox.user-textbox {\n  padding: 6px 10px !important;\n  border: 1px solid var(--border-color) !important;\n  border-radius: 6px !important;\n  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;\n}\nhtml.style-vercel .settings-wrapper .sidebar-search.user-textbox:hover,\nhtml.style-vercel .settings-wrapper .widget-textbox.user-textbox:hover {\n  border-color: var(--minimal-fore) !important;\n}\nhtml.style-vercel .settings-wrapper .sidebar-search.user-textbox:focus,\nhtml.style-vercel .settings-wrapper .widget-textbox.user-textbox:focus {\n  border-color: var(--default-fore) !important;\n  box-shadow: 0 0 0 1px var(--default-fore) !important;\n}\nhtml.style-vercel .settings-wrapper .widget-textbox.is-textarea {\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n}\nhtml.style-vercel .settings-wrapper .user-button {\n  padding: 6px 12px;\n  border-radius: 6px;\n  font-size: 13px;\n  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);\n}\nhtml.style-vercel .settings-wrapper .user-select .select-toggle {\n  border-radius: 6px;\n}\nhtml.style-vercel .settings-wrapper .sidebar-title {\n  letter-spacing: -0.01em;\n}\nhtml.style-vercel .settings-wrapper .breadcrumb {\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n  font-size: 11px;\n  letter-spacing: 0;\n}\nhtml.style-vercel .settings-wrapper .nav-group-label {\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n  letter-spacing: 0.06em;\n}\nhtml.style-vercel .settings-wrapper .about-wrapper .main-title .title {\n  font-size: 24px;\n  font-style: normal;\n}\nhtml.style-vercel .settings-wrapper .about-wrapper .script-info .author-info .version,\nhtml.style-vercel .settings-wrapper .about-wrapper .script-info .author-info .author {\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n  font-size: 13px;\n  color: var(--light-fore);\n  font-feature-settings: "tnum" 1;\n  letter-spacing: 0;\n}\nhtml.style-vercel .settings-wrapper .about-wrapper .script-info .author-info .version {\n  padding: 1px 6px;\n  border: 1px solid var(--border-color);\n  border-radius: 4px;\n}\nhtml.style-vercel .settings-wrapper .update-wrapper .latest-info {\n  border-radius: 6px;\n  font-size: 13px;\n}\nhtml.style-vercel .settings-wrapper .update-wrapper .title-container .title {\n  font-size: 16px;\n}\nhtml.style-vercel .settings-wrapper .update-wrapper .is-pre-release {\n  border-radius: 4px;\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n  font-size: 11px;\n}\nhtml.style-vercel .settings-wrapper .update-wrapper .main-info .owner {\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n  color: var(--light-fore);\n}\nhtml.style-vercel .settings-wrapper .update-wrapper .release-body.markdown {\n  padding: 12px 16px;\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  background-color: var(--default-background);\n  font-size: 13px;\n  line-height: 1.5;\n}\nhtml.style-vercel .settings-wrapper .update-wrapper .release-body.markdown code {\n  padding: 0 4px;\n  border-radius: 4px;\n  background-color: var(--deep-background);\n  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;\n  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);\n  font-size: 0.9em;\n}\nhtml.style-vercel .settings-wrapper .update-wrapper .release-body.markdown pre {\n  padding: 12px;\n  border-radius: 6px;\n  background-color: var(--deep-background);\n  overflow-x: auto;\n}\nhtml.style-vercel .settings-wrapper .update-wrapper .update-controls .up-button.download-button {\n  border-radius: 6px;\n  font-size: 13px;\n}';
    const vercelThreadStyle = `@charset "UTF-8";
html.style-vercel #container .content {
  border-radius: 8px !important;
  background: transparent none repeat 0 0 / auto auto padding-box border-box scroll !important;
  background: initial !important;
}
html.style-vercel .card_top_wrap {
  border-radius: 8px !important;
  background: var(--default-background) !important;
}
html.style-vercel .card_top_theme2 {
  border: none !important;
}
html.style-vercel .card_head,
html.style-vercel .plat_head_theme2 .plat_picbox {
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
}
html.style-vercel .card_top_theme2 .card_title_fname,
html.style-vercel .plat_title_h3,
html.style-vercel .plat_title_h3:hover,
html.style-vercel .plat_title_h3:visited {
  color: var(--default-fore) !important;
}
html.style-vercel .islike_focus {
  border: 1px solid var(--default-fore) !important;
  border-radius: 6px !important;
  background-color: var(--default-fore) !important;
  color: var(--default-background) !important;
}
html.style-vercel .cancel_focus {
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
  background: var(--default-background) !important;
  color: var(--default-fore) !important;
}
html.style-vercel .sign_box_bright {
  border: 1px solid var(--default-fore) !important;
  border-radius: 6px !important;
  background: var(--default-fore) !important;
  color: var(--default-background) !important;
}
html.style-vercel .sign_box_bright_signed {
  background-color: var(--default-background) !important;
  border-color: var(--border-color) !important;
  color: var(--default-fore) !important;
}
html.style-vercel .sign_keep_span {
  color: var(--default-fore) !important;
}
html.style-vercel .jump_input_bright {
  border-radius: 6px !important;
}
html.style-vercel .jump_input_bright {
  box-sizing: border-box;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  color: var(--default-fore);
  outline: none;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .jump_input_bright:hover {
  border-color: var(--minimal-fore);
}
html.style-vercel .jump_input_bright:focus {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
}
html.style-vercel .core_title_wrap_bright {
  border-color: var(--border-color) !important;
  -webkit-backdrop-filter: none !important;
          backdrop-filter: none !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .core_title_theme_bright,
html.style-vercel .core_title_absolute_bright .core_title_theme_bright {
  border-color: var(--border-color) !important;
  background: var(--default-background) !important;
}
html.style-vercel .left_section .core_title_absolute_bright {
  background-color: var(--default-background) !important;
}
html.style-vercel .left_section .core_title_absolute_bright {
  -webkit-backdrop-filter: none;
          backdrop-filter: none;
}
html.style-vercel .core_title h1 {
  color: var(--default-fore) !important;
}
html.style-vercel[data-page-type=thread] .nav_wrap {
  display: none !important;
}
html.style-vercel .nav_list a {
  color: var(--default-fore) !important;
}
html.style-vercel span.tP {
  color: var(--default-fore) !important;
}
html.style-vercel .thread_theme_5 {
  border-color: var(--border-color) !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .btn_sub,
html.style-vercel .btn-sub,
html.style-vercel .btn-sub-b,
html.style-vercel .core_title_btns li a,
html.style-vercel .p_favthr_main {
  background-color: var(--default-background) !important;
  color: var(--default-fore) !important;
}
html.style-vercel .btn_sub,
html.style-vercel .btn-sub,
html.style-vercel .btn-sub-b,
html.style-vercel .core_title_btns li a,
html.style-vercel .p_favthr_main {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .btn_sub:hover:not([disabled]),
html.style-vercel .btn-sub:hover:not([disabled]),
html.style-vercel .btn-sub-b:hover:not([disabled]),
html.style-vercel .core_title_btns li a:hover:not([disabled]),
html.style-vercel .p_favthr_main:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel .btn_sub:active:not([disabled]),
html.style-vercel .btn-sub:active:not([disabled]),
html.style-vercel .btn-sub-b:active:not([disabled]),
html.style-vercel .core_title_btns li a:active:not([disabled]),
html.style-vercel .p_favthr_main:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel .btn_sub:focus:not([disabled]),
html.style-vercel .btn-sub:focus:not([disabled]),
html.style-vercel .btn-sub-b:focus:not([disabled]),
html.style-vercel .core_title_btns li a:focus:not([disabled]),
html.style-vercel .p_favthr_main:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel .l_post_bright {
  border-color: var(--border-color) !important;
  background: none !important;
}
html.style-vercel .p_author_face,
html.style-vercel .icon_relative {
  border-radius: 6px !important;
}
html.style-vercel .p_author_face {
  margin-bottom: 4px !important;
}
html.style-vercel .icon_relative img {
  border-radius: 6px !important;
}
html.style-vercel .d_name .p_author_name {
  color: var(--default-fore) !important;
}
html.style-vercel .d_badge_bright,
html.style-vercel .user_level .badge {
  border: 1px solid var(--border-color) !important;
  border-radius: 4px !important;
  margin-top: -2px !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .d_badge_bright .d_badge_lv,
html.style-vercel .user_level .badge_index {
  background-image: none !important;
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace !important;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace) !important;
}
html.style-vercel .region_bright {
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  background: var(--default-background) !important;
}
html.style-vercel .region_bright .region_title {
  color: var(--default-fore) !important;
}
html.style-vercel .pb_content {
  border: none !important;
  background: var(--default-background) !important;
}
html.style-vercel .p_content {
  border: none !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .BDE_Image {
  border-radius: 6px !important;
}
html.style-vercel .replace_div {
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  text-align: center !important;
}
html.style-vercel .replace_div .BDE_Image {
  display: inline-block !important;
}
html.style-vercel .replace_tip {
  display: none !important;
}
html.style-vercel .vercel-image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 200px));
  grid-auto-rows: 180px;
  grid-gap: 3px;
  gap: 3px;
  justify-content: center;
  margin: 8px 0;
}
html.style-vercel .vercel-image-grid .BDE_Image {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  max-height: 100% !important;
  margin: 0 !important;
  -o-object-fit: cover !important;
     object-fit: cover !important;
  border-radius: 6px !important;
}
html.style-vercel .vercel-image-grid > .replace_div {
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  text-align: inherit !important;
}
html.style-vercel .vercel-image-grid > .replace_div {
  overflow: hidden;
}
html.style-vercel .post-tail-wrap,
html.style-vercel .core_reply_tail:not(.clearfix) {
  display: flex !important;
  align-items: center !important;
  color: var(--minimal-fore) !important;
}
html.style-vercel .post-tail-wrap,
html.style-vercel .core_reply_tail:not(.clearfix) {
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
  font-size: 13px;
  color: var(--light-fore);
  font-feature-settings: "tnum" 1;
  letter-spacing: 0;
  flex-wrap: wrap;
  gap: 8px;
}
html.style-vercel .post-tail-wrap .tail-info,
html.style-vercel .post-tail-wrap .tail-info a,
html.style-vercel .core_reply_tail:not(.clearfix) .tail-info,
html.style-vercel .core_reply_tail:not(.clearfix) .tail-info a {
  color: var(--minimal-fore) !important;
}
html.style-vercel .post-tail-wrap a:hover,
html.style-vercel .core_reply_tail:not(.clearfix) a:hover {
  color: var(--default-fore) !important;
}
html.style-vercel .post-tail-wrap .vercel-floor-tag,
html.style-vercel .core_reply_tail:not(.clearfix) .vercel-floor-tag {
  font-size: 0 !important;
}
html.style-vercel .post-tail-wrap .vercel-floor-tag,
html.style-vercel .core_reply_tail:not(.clearfix) .vercel-floor-tag {
  order: -2;
  display: inline-block;
  padding: 0 6px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  line-height: 1.6;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .post-tail-wrap .vercel-floor-tag::before,
html.style-vercel .core_reply_tail:not(.clearfix) .vercel-floor-tag::before {
  content: "#" attr(data-floor-num);
  color: var(--default-fore);
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
  font-size: 13px;
}
html.style-vercel .post-tail-wrap .vercel-floor-tag:hover,
html.style-vercel .core_reply_tail:not(.clearfix) .vercel-floor-tag:hover {
  border-color: var(--minimal-fore);
}
html.style-vercel .post-tail-wrap .vercel-time-tag,
html.style-vercel .core_reply_tail:not(.clearfix) .vercel-time-tag {
  order: -1;
}
html.style-vercel .core_reply_wrapper {
  overflow: hidden !important;
  border: none !important;
  border-radius: 10px !important;
  padding: 8px !important;
  background: var(--very-light-background) !important;
  color: var(--default-fore) !important;
  box-shadow: none !important;
}
html.style-vercel .core_reply_content li,
html.style-vercel .l_post_bright .core_reply_wrapper .core_reply_border_top,
html.style-vercel .core_reply_border_bottom {
  border: none !important;
  background: transparent !important;
}
html.style-vercel .l_post_bright .core_reply_wrapper .core_reply_content {
  border: none !important;
  padding-left: 16px !important;
  margin-left: 12px !important;
  background: transparent !important;
}
html.style-vercel .lzl_content_main {
  color: var(--default-fore) !important;
}
html.style-vercel .core_reply div.hideLzl {
  background-color: var(--default-background) !important;
}
html.style-vercel .core_reply_content .lzl_li_pager {
  padding-top: 10px !important;
  margin-top: 10px !important;
  border-top: 1px dashed var(--border-color) !important;
}
html.style-vercel .lzl_more {
  font-size: 13px !important;
  color: var(--minimal-fore) !important;
}
html.style-vercel .lzl_more a.j_lzl_m {
  color: var(--default-fore) !important;
}
html.style-vercel .lzl_more a.j_lzl_m {
  -webkit-text-decoration: underline 1px var(--minimal-fore);
          text-decoration: underline 1px var(--minimal-fore);
  text-underline-offset: 2px;
  transition: text-decoration-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .lzl_more a.j_lzl_m:hover {
  text-decoration-color: var(--default-fore);
}
html.style-vercel .lzl_cnt .lzl_s_r {
  color: var(--default-fore) !important;
}
html.style-vercel .l_post_bright .core_reply_wrapper .j_lzl_p.btn-sub {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 11px;
  line-height: 1.4;
}
html.style-vercel .l_post_bright .core_reply_wrapper .j_lzl_p.btn-sub:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel .l_post_bright .core_reply_wrapper .j_lzl_p.btn-sub:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel .l_post_bright .core_reply_wrapper .j_lzl_p.btn-sub:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel .tieba-tags-lz::after {
  background-color: var(--level-blue-background) !important;
  color: var(--level-blue-fore) !important;
}
html.style-vercel .tieba-tags-cz::after {
  background-color: var(--level-green-background) !important;
  color: var(--level-green-fore) !important;
}
html.style-vercel .louzhubiaoshi_wrap {
  background-color: var(--level-blue-background) !important;
  color: var(--level-blue-fore) !important;
}
html.style-vercel .louzhubiaoshi_wrap {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: var(--font-weight-normal);
  line-height: 1.4;
}
html.style-vercel .louzhubiaoshi_wrap * {
  color: inherit !important;
  background: none !important;
}
html.style-vercel .lzl_cnt .lzl_time {
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
  font-size: 11px;
  color: var(--light-fore);
  font-feature-settings: "tnum" 1;
  letter-spacing: 0;
}
html.style-vercel .lzl_p_p {
  border: none !important;
  border-radius: 4px !important;
}
html.style-vercel .lzl_p_p img {
  border-radius: 4px !important;
}
html.style-vercel .d_post_content a:not(.at):not(:has(img)),
html.style-vercel .lzl_cnt .lzl_content_main a:not(.at):not(:has(img)) {
  color: #2563eb !important;
}
html.style-vercel .d_post_content a:not(.at):not(:has(img)),
html.style-vercel .lzl_cnt .lzl_content_main a:not(.at):not(:has(img)) {
  text-decoration: underline;
  -webkit-text-decoration: underline solid rgba(37, 99, 235, 0.5);
          text-decoration: underline solid rgba(37, 99, 235, 0.5);
  text-decoration-thickness: 1px;
  -webkit-text-decoration: underline 1px rgba(37, 99, 235, 0.5);
          text-decoration: underline 1px rgba(37, 99, 235, 0.5);
  text-underline-offset: 2px;
  transition: text-decoration-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .d_post_content a:not(.at):not(:has(img))::before,
html.style-vercel .lzl_cnt .lzl_content_main a:not(.at):not(:has(img))::before {
  content: "";
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 4px;
  vertical-align: -0.15em;
  background-color: currentColor;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>') no-repeat center/contain;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>') no-repeat center/contain;
}
html.style-vercel .d_post_content a:not(.at):not(:has(img)):hover,
html.style-vercel .lzl_cnt .lzl_content_main a:not(.at):not(:has(img)):hover {
  text-decoration-color: #2563eb;
}
html.style-vercel .pager_theme_5 a,
html.style-vercel .pager_theme_5 span,
html.style-vercel .jump_btn_bright {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
}
html.style-vercel .pager_theme_5 a:hover:not([disabled]),
html.style-vercel .pager_theme_5 span:hover:not([disabled]),
html.style-vercel .jump_btn_bright:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel .pager_theme_5 a:active:not([disabled]),
html.style-vercel .pager_theme_5 span:active:not([disabled]),
html.style-vercel .jump_btn_bright:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel .pager_theme_5 a:focus:not([disabled]),
html.style-vercel .pager_theme_5 span:focus:not([disabled]),
html.style-vercel .jump_btn_bright:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel .pager_theme_5 a:hover,
html.style-vercel .jump_btn_bright:hover {
  background-color: var(--default-background) !important;
  border-color: var(--minimal-fore) !important;
  color: var(--default-fore) !important;
}
html.style-vercel .thread_theme_7 {
  border-color: var(--border-color) !important;
  background-color: var(--default-background) !important;
}
html.style-vercel #pb-footer-header {
  background-color: var(--default-background) !important;
}
html.style-vercel #tb_rich_poster_container {
  border-radius: 8px !important;
  background-color: var(--default-background) !important;
}
html.style-vercel .edui-editor-body {
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
}
html.style-vercel .edui-container .edui-editor-body.body-container-focus,
html.style-vercel .edui-container .edui-editor-body.body-container-focus .edui-body-container {
  border-color: var(--default-fore) !important;
}
html.style-vercel .old_style_wrapper {
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
}
html.style-vercel .edui-editor-body .edui-body-container {
  border-radius: 6px !important;
}
html.style-vercel .save-to-quick-reply-btn {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .save-to-quick-reply-btn:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel .save-to-quick-reply-btn:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel .save-to-quick-reply-btn:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel #title-wrapper .thread-title {
  color: var(--default-fore) !important;
  font-size: 24px !important;
  font-weight: var(--font-weight-normal) !important;
  line-height: 1.45 !important;
  border-left-color: var(--tieba-theme-color) !important;
}
html.style-vercel #title-wrapper .forum-wrapper-button {
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  background-color: var(--default-background) !important;
  -webkit-backdrop-filter: none !important;
          backdrop-filter: none !important;
  gap: 3px !important;
}
html.style-vercel #title-wrapper .forum-wrapper-button .forum-icon {
  border-radius: 8px !important;
}
html.style-vercel #title-wrapper .forum-wrapper-button .forum-button {
  color: var(--default-fore) !important;
}
html.style-vercel .forum-mask-wrapper {
  display: none !important;
}
html.style-vercel #container .content .pb_content {
  border-top: 1px solid var(--border-color) !important;
  border-radius: 8px 8px 0 0 !important;
  background-color: var(--default-background) !important;
  box-shadow: none !important;
}
html.style-vercel .content-wrapper .author-container .floor-avatar {
  border-radius: 6px !important;
}
html.style-vercel .content-wrapper .author-container .floor-avatar img {
  border-radius: 6px !important;
}
html.style-vercel .content-wrapper .author-container .floor-name {
  color: var(--default-fore) !important;
}
html.style-vercel .content-wrapper .author-container .badge-container .floor-badge {
  border-radius: 4px !important;
  background-color: var(--level-blue-background) !important;
  color: var(--level-blue-fore) !important;
}
html.style-vercel .content-wrapper .author-container .badge-container .floor-badge {
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
}
html.style-vercel .content-wrapper .author-container .badge-container .floor-badge.level-green {
  background-color: var(--level-green-background) !important;
  color: var(--level-green-fore) !important;
}
html.style-vercel .content-wrapper .author-container .badge-container .floor-badge.level-blue {
  background-color: var(--level-blue-background) !important;
  color: var(--level-blue-fore) !important;
}
html.style-vercel .content-wrapper .author-container .badge-container .floor-badge.level-yellow {
  background-color: var(--level-yellow-background) !important;
  color: var(--level-yellow-fore) !important;
}
html.style-vercel .content-wrapper .author-container .badge-container .floor-badge.level-orange {
  background-color: var(--level-orange-background) !important;
  color: var(--level-orange-fore) !important;
}
html.style-vercel .content-wrapper .floor-wrapper .floor-avatar {
  border-radius: 6px !important;
}
html.style-vercel .content-wrapper .floor-wrapper .floor-avatar img {
  border-radius: 6px !important;
}
html.style-vercel .content-wrapper .floor-wrapper .floor-badge {
  border-radius: 4px !important;
  background-color: var(--level-blue-background) !important;
  color: var(--level-blue-fore) !important;
}
html.style-vercel .content-wrapper .floor-wrapper .floor-badge.level-green {
  background-color: var(--level-green-background) !important;
  color: var(--level-green-fore) !important;
}
html.style-vercel .content-wrapper .floor-wrapper .floor-badge.level-blue {
  background-color: var(--level-blue-background) !important;
  color: var(--level-blue-fore) !important;
}
html.style-vercel .content-wrapper .floor-wrapper .floor-badge.level-yellow {
  background-color: var(--level-yellow-background) !important;
  color: var(--level-yellow-fore) !important;
}
html.style-vercel .content-wrapper .floor-wrapper .floor-badge.level-orange {
  background-color: var(--level-orange-background) !important;
  color: var(--level-orange-fore) !important;
}
html.style-vercel .content-wrapper .floor-wrapper .floor-info {
  font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-family: var(--code-monospace, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace);
  font-size: 13px;
  color: var(--light-fore);
  font-feature-settings: "tnum" 1;
  letter-spacing: 0;
}
html.style-vercel #thread-jsx-components .dummy-button {
  border-bottom: 1px solid var(--border-color) !important;
  color: var(--minimal-fore) !important;
}
html.style-vercel #thread-jsx-components .dummy-button:hover {
  border-color: var(--minimal-fore) !important;
}
html.style-vercel #thread-jsx-components .dummy-button:focus {
  border-color: var(--default-fore) !important;
}
html.style-vercel #thread-editor {
  gap: 10px;
  padding: 16px;
  font-size: 13px;
  transition: none;
  scrollbar-width: thin;
  scrollbar-color: var(--minimal-fore) transparent;
}
html.style-vercel #thread-editor::-webkit-scrollbar {
  width: 6px;
}
html.style-vercel #thread-editor::-webkit-scrollbar-track {
  background: transparent;
}
html.style-vercel #thread-editor::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: var(--minimal-fore);
}
html.style-vercel #thread-editor #thread-editor-exit {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 4px 8px;
  font-size: 16px;
  line-height: 1;
}
html.style-vercel #thread-editor #thread-editor-exit:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel #thread-editor #thread-editor-exit:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel #thread-editor #thread-editor-exit:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel #thread-editor #thread-editor-exit:not(:hover):not(:active):not(:focus) {
  box-shadow: none;
  border-color: transparent;
}
html.style-vercel #thread-editor .title-editor {
  border-width: 1px !important;
}
html.style-vercel #thread-editor .title-editor {
  box-sizing: border-box;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  color: var(--default-fore);
  outline: none;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 12px;
  font-size: 20px;
}
html.style-vercel #thread-editor .title-editor:hover {
  border-color: var(--minimal-fore);
}
html.style-vercel #thread-editor .title-editor:focus {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
}
html.style-vercel #thread-editor #thread-editor-slot {
  min-height: 0;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-editor-body {
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
  height: auto !important;
  overflow: hidden !important;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-editor-body {
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-editor-body:hover {
  border-color: var(--minimal-fore) !important;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-editor-body:focus-within {
  border-color: var(--default-fore) !important;
  box-shadow: 0 0 0 1px var(--default-fore) !important;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-body-container {
  overflow-y: auto !important;
  min-height: calc(1.5em + 16px) !important;
  padding: 8px 12px !important;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-body-container {
  font-size: 14px;
  line-height: 1.5;
  scrollbar-width: thin;
  scrollbar-color: var(--minimal-fore) transparent;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-body-container::-webkit-scrollbar {
  width: 6px;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-body-container::-webkit-scrollbar-track {
  background: transparent;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-body-container::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: var(--minimal-fore);
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2px 8px;
  font-size: 13px;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn .edui-icon {
  font-size: 13px;
}
html.style-vercel #thread-editor #thread-editor-slot .edui-container .edui-toolbar .edui-btn-toolbar .edui-btn .edui-icon::before {
  font-size: 14px;
}
html.style-vercel #thread-editor #thread-editor-toolbar #thread-editor-submit {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 6px 16px;
  border-color: var(--default-fore);
  background-color: var(--default-fore);
  color: var(--default-background);
  font-size: 13px;
  font-weight: 500;
}
html.style-vercel #thread-editor #thread-editor-toolbar #thread-editor-submit:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel #thread-editor #thread-editor-toolbar #thread-editor-submit:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel #thread-editor #thread-editor-toolbar #thread-editor-submit:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel #thread-editor #thread-editor-toolbar #thread-editor-submit:hover:not([disabled]) {
  border-color: var(--default-fore);
  background-color: var(--default-fore);
  opacity: 0.85;
}
html.style-vercel .user-dialog-modal .user-dialog.default:has(#thread-editor) {
  border: 1px solid var(--border-color) !important;
  border-bottom: none !important;
  border-radius: 12px 12px 0 0 !important;
  box-shadow: 0 0 24px var(--tieba-theme-color) !important;
}
html.style-vercel .user-dialog-modal .user-dialog.default:has(#thread-editor) .dialog-content {
  scrollbar-width: thin;
  scrollbar-color: var(--minimal-fore) transparent;
}
html.style-vercel .user-dialog-modal .user-dialog.default:has(#thread-editor) .dialog-content::-webkit-scrollbar {
  width: 6px;
}
html.style-vercel .user-dialog-modal .user-dialog.default:has(#thread-editor) .dialog-content::-webkit-scrollbar-track {
  background: transparent;
}
html.style-vercel .user-dialog-modal .user-dialog.default:has(#thread-editor) .dialog-content::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: var(--minimal-fore);
}
html.style-vercel.dark-theme .user-dialog-modal .user-dialog.default:has(#thread-editor) {
  box-shadow: 0 0 24px var(--tieba-theme-color) !important;
}
html.style-vercel .dialogJ {
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  background: var(--default-background) !important;
}
html.style-vercel .dialogJ {
  overflow: hidden;
}
html.style-vercel .dialogJ.dialogJshadow {
  background: var(--default-background) !important;
}
html.style-vercel .dialogJ .uiDialogWrapper {
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  background: none !important;
  background-image: none !important;
}
html.style-vercel .dialogJ .dialogJtitle {
  padding: 12px 16px !important;
  border-bottom: 1px solid var(--border-color) !important;
  border-radius: 0 !important;
  background: var(--default-background) !important;
  background-image: none !important;
}
html.style-vercel .dialogJ .dialogJtitle .dialogJtxt {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: var(--default-fore) !important;
}
html.style-vercel .dialogJ .dialogJtitle .dialogJclose {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 6px !important;
  background: var(--default-background) !important;
  background-image: none !important;
  color: var(--default-fore) !important;
  font-size: 0 !important;
  text-indent: 0 !important;
}
html.style-vercel .dialogJ .dialogJtitle .dialogJclose {
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .dialogJ .dialogJtitle .dialogJclose::after {
  content: "×";
  font-size: 16px;
  line-height: 1;
  color: var(--default-fore);
}
html.style-vercel .dialogJ .dialogJtitle .dialogJclose:hover {
  border-color: var(--minimal-fore) !important;
}
html.style-vercel .dialogJ .dialogJcontent {
  border: none !important;
  border-radius: 0 !important;
  background: var(--default-background) !important;
}
html.style-vercel .dialogJ .dialogJcontent .dialogJbody {
  border: none !important;
  border-radius: 0 !important;
  background: var(--default-background) !important;
}
html.style-vercel .dialogJ .l_netpic_input,
html.style-vercel .dialogJ .ui_textfield {
  box-sizing: border-box;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  color: var(--default-fore);
  outline: none;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .dialogJ .l_netpic_input:hover,
html.style-vercel .dialogJ .ui_textfield:hover {
  border-color: var(--minimal-fore);
}
html.style-vercel .dialogJ .l_netpic_input:focus,
html.style-vercel .dialogJ .ui_textfield:focus {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
}
html.style-vercel .dialogJ .ui_btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  float: none !important;
  border-radius: 6px !important;
  background: none !important;
}
html.style-vercel .dialogJ .ui_btn {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .dialogJ .ui_btn:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel .dialogJ .ui_btn:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel .dialogJ .ui_btn:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel .dialogJ .ui_btn span {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  float: none !important;
  padding: 0 !important;
  background: none !important;
}
html.style-vercel .dialogJ .ui_btn span em {
  float: none !important;
  background: none !important;
  color: var(--default-fore) !important;
  font-style: normal !important;
  font-size: 13px !important;
}
html.style-vercel .dialogJ .ui_btn_m {
  border-color: var(--default-fore) !important;
  background-color: var(--default-fore) !important;
}
html.style-vercel .dialogJ .ui_btn_m span em {
  color: var(--default-background) !important;
}
html.style-vercel .dialogJ .ui_btn_m:hover {
  opacity: 0.85;
}
html.style-vercel .dialogJ .ui_btn_sub_m {
  border-color: var(--border-color) !important;
}
html.style-vercel .dialogJ .ui_btn_sub_m:hover {
  border-color: var(--minimal-fore) !important;
}
html.style-vercel .dialogJ .ui_btn_disable,
html.style-vercel .dialogJ .ui_btn_m_disable {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  float: none !important;
  border-radius: 6px !important;
  border-color: var(--border-color) !important;
  background: none !important;
}
html.style-vercel .dialogJ .ui_btn_disable,
html.style-vercel .dialogJ .ui_btn_m_disable {
  box-sizing: border-box;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--default-background);
  box-shadow: none;
  color: var(--default-fore);
  cursor: pointer;
  transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
html.style-vercel .dialogJ .ui_btn_disable:hover:not([disabled]),
html.style-vercel .dialogJ .ui_btn_m_disable:hover:not([disabled]) {
  border-color: var(--minimal-fore);
  background-color: var(--default-background);
}
html.style-vercel .dialogJ .ui_btn_disable:active:not([disabled]),
html.style-vercel .dialogJ .ui_btn_m_disable:active:not([disabled]) {
  background-color: var(--default-hover);
}
html.style-vercel .dialogJ .ui_btn_disable:focus:not([disabled]),
html.style-vercel .dialogJ .ui_btn_m_disable:focus:not([disabled]) {
  border-color: var(--default-fore);
  box-shadow: 0 0 0 1px var(--default-fore);
  outline: none;
}
html.style-vercel .dialogJ .ui_btn_disable span,
html.style-vercel .dialogJ .ui_btn_m_disable span {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  float: none !important;
  padding: 0 !important;
  background: none !important;
}
html.style-vercel .dialogJ .ui_btn_disable span em,
html.style-vercel .dialogJ .ui_btn_m_disable span em {
  float: none !important;
  background: none !important;
  color: var(--default-fore) !important;
  font-style: normal !important;
  font-size: 13px !important;
}
html.style-vercel .dialogJ .ui_btn_disable:hover,
html.style-vercel .dialogJ .ui_btn_m_disable:hover {
  border-color: var(--minimal-fore) !important;
}
html.style-vercel .dialogJ .i_layer_bottom {
  width: 100% !important;
  box-sizing: border-box !important;
  padding: 12px 16px !important;
  border-top: 1px solid var(--border-color) !important;
  background: var(--default-background) !important;
}
html.style-vercel.dark-theme .dialogJ {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32) !important;
}`;
    async function requestInstance(api) {
      try {
        const response = await api;
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        userView.toast({
          message: errorMessage(error),
          type: "error",
          duration: 6e3
        });
      }
    }
    const modules = [];
    function AllModules() {
      return modules;
    }
    function errorMessage(error) {
      const errBody = error.stack ? error.stack : error.message;
      return `${_GM_info.script.name} ${_GM_info.script.version}
${errBody}`;
    }
    function spawnOffsetTS(year = 0, month = 0, day = 0, hours = 0, minutes = 0, seconds = 0) {
      const now = /* @__PURE__ */ new Date();
      const offset = new Date(
        now.getFullYear() + year,
        now.getMonth() + month,
        now.getDate() + day,
        now.getHours() + hours,
        now.getMinutes() + minutes,
        now.getSeconds() + seconds,
        0
      );
      return offset.getTime();
    }
    function requestBody(body) {
      const params = new URLSearchParams();
      _2.forOwn(body, (value, key) => {
        params.set(key, value ?? "");
      });
      return params.toString();
    }
    function waitUntil(pred, timeout = Infinity) {
      return new Promise((resolve, reject) => {
        const startTime = performance.now();
        let id = -1;
        function tick() {
          if (pred()) {
            cancelAnimationFrame(id);
            resolve();
          } else if (performance.now() - startTime >= timeout) {
            cancelAnimationFrame(id);
            reject(new Error("等待超时"));
            if (_GM_info.script.version === "developer-only") {
              console.error(`等待超时，该函数未在指定时间内得到期望值：${pred}`);
              console.trace("发生错误的调用者：");
            }
          } else {
            id = requestAnimationFrame(tick);
          }
        }
        id = requestAnimationFrame(tick);
      });
    }
    function isLiteralObject(obj) {
      return obj && typeof obj === "object" && !Array.isArray(obj);
    }
    function outputFile(filename, content) {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
    async function selectLocalFile(mode = "text") {
      return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.addEventListener("change", function() {
          if (!input.files) return;
          const file = input.files[0];
          const reader = new FileReader();
          reader.addEventListener("loadend", function() {
            const base64String = reader.result;
            resolve(base64String);
          });
          reader.addEventListener("error", function() {
            reject(new Error());
          });
          switch (mode) {
            case "text": {
              reader.readAsText(file);
              break;
            }
            case "base64": {
              reader.readAsDataURL(file);
              break;
            }
          }
        });
        input.click();
      });
    }
    const fadeInElems = [];
    const fadeInClass = "fade-in-elem";
    function dom(selector, arg1, arg2) {
      if (!arg1) {
        return document.querySelector(selector) ?? undefined;
      }
      if (Array.isArray(arg1)) {
        return Array.from(document.querySelectorAll(selector));
      }
      if (!arg2) {
        return arg1.querySelector(selector) ?? undefined;
      }
      return Array.from(arg1.querySelectorAll(selector));
    }
    async function asyncdom(selector, parent, timeout = Infinity) {
      return waitUntil(() => !_2.isNil(dom(selector, parent)), timeout).then(() => dom(selector, parent));
    }
    function afterHead(callbackfn) {
      callbackfn();
    }
    function mergeNodeAttrs(node, attrs) {
      _2.forOwn(attrs, (value, key) => {
        if (value !== node.getAttribute(key)) {
          if (isLiteralObject(value)) {
            node.setAttribute(key, JSON.stringify(attrs[key]));
          } else {
            node.setAttribute(key, attrs[key]);
          }
        }
      });
    }
    function domrd(tag, attrs, children = [], doc) {
      const DOC = document;
      const elem = DOC.createElement(tag);
      if (attrs) {
        mergeNodeAttrs(elem, attrs);
      }
      if (typeof children === "string") {
        elem.appendChild(document.createTextNode(children));
      } else {
        _2.forEach(children, (child) => {
          if (typeof child === "string") {
            elem.appendChild(document.createTextNode(child));
          } else {
            elem.appendChild(child);
          }
        });
      }
      return elem;
    }
    function findParent(el, trait, mode = "className") {
      const verifier = (() => {
        switch (mode) {
          case "selector": {
            const allValid = new Set(dom(trait, []));
            return (parent) => {
              return allValid.has(parent);
            };
          }
          case "className": {
            return (parent) => parent.classList.contains(trait) ?? false;
          }
          case "id": {
            return (parent) => parent.id === trait;
          }
          case "tagName": {
            return (parent) => parent.tagName.toLowerCase() === trait.toLowerCase();
          }
        }
      })();
      while (el.parentElement && !verifier(el.parentElement)) {
        el = el.parentElement;
      }
      return el.parentElement ? el.parentElement : undefined;
    }
    function fadeInLoad(selector) {
      dom(selector, []).forEach((elem) => {
        elem.classList.add(fadeInClass);
        elem.addEventListener("animationend", () => {
          elem.style.opacity = "1";
          elem.classList.remove(fadeInClass);
        });
      });
    }
    function parseMultiCSS(cssObject) {
      return _2.flatMapDeep(cssObject, (value, key) => {
        return [
          `${key} {`,
          ..._2.flatMapDeep(value, (v, k) => `${_2.startsWith(k, "--") ? k : _2.kebabCase(k)}: ${v};`),
          "}",
          ""
        ];
      }).join("\n");
    }
    function parseCSSRule(cssRule) {
      let css = "";
      _2.forOwn(cssRule, (value, key) => {
        css += `${_2.kebabCase(key)}:${value};`;
      });
      return css;
    }
    function injectCSSRule(selector, cssRule) {
      return _GM_addStyle(`${selector}{${parseCSSRule(cssRule)}}`);
    }
    function insertCSS(style) {
      return _GM_addStyle(style);
    }
    function overwriteCSS(...style) {
      const styles = [];
      _2.forEach(style, (styleElement) => {
        styles.push(insertCSS(styleElement));
      });
      waitUntil(() => !_2.isNil(document.body)).then(() => {
        _2.forEach(styles, (styleElement) => {
          document.head.appendChild(styleElement);
        });
      });
      return styles;
    }
    function _isSlot(s) {
      return typeof s === "function" || Object.prototype.toString.call(s) === "[object Object]" && !vue.isVNode(s);
    }
    function renderComponent(root, container, rootProps) {
      const app = vue.createApp(root, rootProps);
      return {
        app,
        instance: app.mount(container)
      };
    }
    const scrollbarWidth = _2.once(function() {
      return window.innerWidth - document.documentElement.clientWidth;
    });
    function renderPage(root, rootProps) {
      if (document.getElementsByTagName("body").length === 0) {
        document.documentElement.appendChild(domrd("body"));
      }
      removeDefault();
      const page = domrd("div", {
        id: "remixed-page"
      });
      document.body.insertBefore(page, document.body.firstChild);
      document.body.appendChild(domrd("div", {
        "id": "carousel_wrap"
      }));
      injectCSSRule("#spage-tbshare-container, .tbui_aside_float_bar", {
        display: "none !important"
      });
      return renderComponent(root, page, rootProps);
    }
    function renderDialog(content, opts, events) {
      var _a, _b;
      (_a = events == null ? undefined : events.beforeRender) == null ? undefined : _a.call(events);
      const dialogWrapper = document.body.appendChild(domrd("div", {
        class: "dialog-wrapper"
      }));
      const dialogApp = vue.createApp(content, {
        ...opts,
        onUnload(payload) {
          var _a2, _b2;
          (_a2 = events == null ? undefined : events.beforeUnload) == null ? undefined : _a2.call(events, rendered);
          _unload();
          (_b2 = events == null ? undefined : events.unloaded) == null ? undefined : _b2.call(events, payload);
        },
        onAbnormalUnload(abnormal) {
          var _a2;
          _unload();
          (_a2 = events == null ? undefined : events.abnormalUnload) == null ? undefined : _a2.call(events, abnormal);
        }
      });
      const rendered = {
        app: dialogApp,
        instance: dialogApp.mount(dialogWrapper)
      };
      (_b = events == null ? undefined : events.rendered) == null ? undefined : _b.call(events, rendered);
      return rendered;
      function _unload() {
        dialogApp.unmount();
        if (dom("[aria-modal]", []).length === 0) {
          document.body.removeAttribute("no-scrollbar");
          document.body.style.paddingRight = "";
        }
        dialogWrapper.remove();
      }
    }
    function userDialog(content, dialogOpts, opts) {
      let _slot;
      return renderDialog(vue.createVNode(userView.UserDialog, dialogOpts, _isSlot(_slot = vue.h(content, opts)) ? _slot : {
        default: () => [_slot]
      }));
    }
    function removeDefault() {
      _2.forEach(document.head.children, (el) => {
        if (el && el.tagName.toUpperCase() === "LINK" && _2.includes(el.getAttribute("href"), "static-common/style")) {
          el.remove();
        }
        if (el && el.tagName.toUpperCase() === "SCRIPT" && _2.includes(el.getAttribute("src"), "static-common/lib")) {
          el.remove();
        }
      });
      _2.forEach(document.body.children, (el) => {
        if (el && el.tagName.toUpperCase() === "STYLE") {
          el.remove();
        }
        if (el && el.tagName.toUpperCase() === "SCRIPT") {
          el.remove();
        }
        if (el && el.tagName.toUpperCase() === "IFRAME") {
          el.remove();
        }
        if (el && _2.includes(el.className, "translatorExtension")) {
          el.remove();
        }
        if (el && _2.includes(el.className, "dialogJ")) {
          el.remove();
        }
      });
    }
    function hexToRGBA(hex) {
      const hexValue = _2.startsWith(hex, "#") ? _2.trimStart(hex, "#") : hex;
      const tokenConverter = hexValue.length <= 4 ? (chunk) => parseInt(_2.repeat(chunk[0], 2), 16) : (chunk) => parseInt(_2.join(chunk, ""), 16);
      const chunkSize = hexValue.length <= 4 ? 1 : 2;
      const chunks = _2.chunk(hexValue, chunkSize);
      return {
        r: tokenConverter(chunks[0]),
        g: tokenConverter(chunks[1]),
        b: tokenConverter(chunks[2]),
        a: chunks.length === 4 ? tokenConverter(chunks[3]) : 1
      };
    }
    function rgbaToHSLA(rgba) {
      const normalizedR = rgba.r / 255;
      const normalizedG = rgba.g / 255;
      const normalizedB = rgba.b / 255;
      const minValue = Math.min(normalizedR, normalizedG, normalizedB);
      const maxValue = Math.max(normalizedR, normalizedG, normalizedB);
      const lightness = (maxValue + minValue) / 2;
      let saturation;
      if (lightness <= 0.5) {
        saturation = (maxValue - minValue) / (maxValue + minValue);
      } else {
        saturation = (maxValue - minValue) / (2 - maxValue - minValue);
      }
      let hue;
      if (maxValue === minValue) {
        hue = 0;
      } else if (maxValue === normalizedR) {
        hue = (normalizedG - normalizedB) / (maxValue - minValue);
      } else if (maxValue === normalizedG) {
        hue = 2 + (normalizedB - normalizedR) / (maxValue - minValue);
      } else {
        hue = 4 + (normalizedR - normalizedG) / (maxValue - minValue);
      }
      hue *= 60;
      if (hue < 0) {
        hue += 360;
      }
      return {
        h: _2.round(hue, 2),
        s: `${_2.round(saturation * 100)}%`,
        l: `${_2.round(lightness * 100)}%`,
        a: rgba.a
      };
    }
    const darkPrefers = matchMedia("(prefers-color-scheme: dark)");
    let themeColorStyleEl;
    function applyThemeColor() {
      const theme = themeColor.get();
      const darkRGBA = hexToRGBA(theme.dark);
      const lightRGBA = hexToRGBA(theme.light);
      const darkHSLA = rgbaToHSLA(darkRGBA);
      const lightHSLA = rgbaToHSLA(lightRGBA);
      const darkHover = `hsl(${darkHSLA.h}deg ${parseInt(darkHSLA.s) + 40}% ${parseInt(darkHSLA.l) + 10}%)`;
      const darkActive = `hsl(${darkHSLA.h}deg ${parseInt(darkHSLA.s) + 50}% ${parseInt(darkHSLA.l) + 20}%)`;
      const darkTransp = `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 80%)`;
      const darkBack = `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 24%)`;
      const darkFore = `hsl(${darkHSLA.h}deg 100% 75%)`;
      const lightHover = `hsl(${lightHSLA.h}deg ${parseInt(lightHSLA.s) - 40}% ${parseInt(lightHSLA.l) - 10}%)`;
      const lightActive = `hsl(${lightHSLA.h}deg ${parseInt(lightHSLA.s) - 50}% ${parseInt(lightHSLA.l) - 20}%)`;
      const lightTransp = `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 80%)`;
      const lightBack = `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 24%)`;
      const lightFore = `hsl(${lightHSLA.h}deg 60% 32%)`;
      const css = parseMultiCSS({
        "html.dark-theme": {
          "--tieba-theme-color": theme.dark,
          "--trans-tieba-theme-color": darkTransp,
          "--tieba-theme-hover": darkHover,
          "--tieba-theme-active": darkActive,
          "--tieba-theme-background": darkBack,
          "--tieba-theme-fore": darkFore,
          // 桥接 user-view 内部变量，使聚焦/激活态跟随主题色
          "--user-theme": theme.dark,
          "--user-theme-transp": darkTransp,
          "--user-theme-hover": darkHover,
          "--user-theme-active": darkActive,
          "--user-theme-back": darkBack,
          "--user-theme-fore": darkFore
        },
        "html.light-theme": {
          "--tieba-theme-color": theme.light,
          "--trans-tieba-theme-color": lightTransp,
          "--tieba-theme-hover": lightHover,
          "--tieba-theme-active": lightActive,
          "--tieba-theme-background": lightBack,
          "--tieba-theme-fore": lightFore,
          "--user-theme": theme.light,
          "--user-theme-transp": lightTransp,
          "--user-theme-hover": lightHover,
          "--user-theme-active": lightActive,
          "--user-theme-back": lightBack,
          "--user-theme-fore": lightFore
        }
      });
      if (!themeColorStyleEl) {
        themeColorStyleEl = document.createElement("style");
        themeColorStyleEl.id = "remixed-theme-color";
        document.head.appendChild(themeColorStyleEl);
      }
      themeColorStyleEl.textContent = css;
    }
    let dynFontStyleEl;
    let customStyleEl;
    function applyDynamicFonts() {
      const css = parseMultiCSS({
        ":root": {
          "--content-max": "982px",
          "--code-zh": `${_2.join(userFonts.get(), ",")}`,
          "--code-monospace": `${_2.join(monospaceFonts.get(), ",")}`,
          "--font-weight-normal": `${fontWeights.get().normal}`,
          "--font-weight-bold": `${fontWeights.get().bold}`
        }
      });
      if (!dynFontStyleEl) {
        dynFontStyleEl = document.createElement("style");
        dynFontStyleEl.id = "remixed-dynamic-fonts";
        document.head.appendChild(dynFontStyleEl);
      }
      dynFontStyleEl.textContent = css;
    }
    function applyCustomStyle() {
      const customCSS = customStyle.get();
      if (!customStyleEl) {
        customStyleEl = document.createElement("style");
        customStyleEl.id = "remixed-custom-style";
        document.head.appendChild(customStyleEl);
      }
      customStyleEl.textContent = customCSS;
    }
    async function loadDynamicCSS() {
      applyDynamicFonts();
      applyThemeColor();
      window.addEventListener("load", function() {
        _GM_addStyle(
          parseMultiCSS({
            ":root": {
              "--scrollbar-width": `${scrollbarWidth()}px`
            }
          })
        );
      }, { once: true });
      applyCustomStyle();
    }
    async function loadMainCSS() {
      overwriteCSS(
        baseStyle,
        universalStyle,
        tiebaErrorStyle,
        tiebaForumStyle,
        tiebaHomeStyle,
        tiebaMainStyle,
        tiebaThreadStyle,
        // Vercel 主题样式（仅 html.style-vercel 时通过选择器作用域生效）
        vercelMainStyle,
        vercelForumStyle,
        vercelThreadStyle,
        vercelHomeStyle,
        vercelErrorStyle,
        vercelSettingsStyle
      );
      document.addEventListener("DOMContentLoaded", function() {
        document.head.appendChild(domrd("link", {
          type: "image/icon",
          rel: "shortcut icon",
          href: getResource("/assets/images/main/favicon32.ico")
        }));
      }, { once: true });
    }
    function setStyleTheme(value) {
      const html = document.documentElement;
      html.classList.toggle("style-vercel", value === "vercel");
      html.classList.toggle("style-remixed", value === "remixed");
    }
    let customBackgroundElement = undefined;
    async function setCustomBackground() {
      if (customBackgroundElement) {
        document.head.removeChild(customBackgroundElement);
      }
      customBackgroundElement = injectCSSRule("body.custom-background", {
        backgroundImage: `url('${customBackground.get()}') !important`,
        backgroundRepeat: "no-repeat !important",
        backgroundAttachment: "fixed !important",
        backgroundSize: "cover !important"
      });
      waitUntil(() => !_2.isNil(document.body)).then(function() {
        if (customBackground.get()) {
          document.body.classList.add("custom-background");
        } else {
          document.body.classList.remove("custom-background");
        }
      });
    }
    const MainTitle = "Tieba Remix";
    const Owner = "naseaoi";
    const RepoName = "Tieba-Remix";
    const GithubRepo = `https://github.com/${Owner}/${RepoName}`;
    const GiteeRepo = `https://gitee.com/${Owner}/${RepoName}`;
    const BaiduPassport = "https://passport.baidu.com/";
    const REMIXED = "\n██████╗ ███████╗███╗   ███╗██╗██╗  ██╗███████╗██████╗ \n██╔══██╗██╔════╝████╗ ████║██║╚██╗██╔╝██╔════╝██╔══██╗\n██████╔╝█████╗  ██╔████╔██║██║ ╚███╔╝ █████╗  ██║  ██║\n██╔══██╗██╔══╝  ██║╚██╔╝██║██║ ██╔██╗ ██╔══╝  ██║  ██║\n██║  ██║███████╗██║ ╚═╝ ██║██║██╔╝ ██╗███████╗██████╔╝\n╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ \n";
    const _UserKey = class _UserKey {
      constructor(key, defaultValue, listeners, migration) {
        __publicField(this, "key");
        __publicField(this, "defaultValue");
        __publicField(this, "listeners");
        __publicField(this, "migration");
        this.key = key;
        this.defaultValue = defaultValue;
        this.listeners = {
          getter: (listeners == null ? undefined : listeners.getter) ? [listeners.getter] : [],
          setter: (listeners == null ? undefined : listeners.setter) ? [listeners.setter] : []
        };
        this.migration = migration;
        _UserKey.backupRegistry.add(this);
      }
      excludeFromBackup() {
        _UserKey.backupRegistry.delete(this);
      }
      static getBackupableKeys() {
        return Array.from(_UserKey.backupRegistry);
      }
      dispatchEvent(event, value) {
        _2.forEach(this.listeners[event], (listener) => listener(value));
      }
      on(event, listener) {
        this.listeners[event].push(listener);
      }
      get() {
        let value = _GM_getValue(this.key, this.defaultValue);
        if (isLiteralObject(value) && _2.keys(value).length < _2.keys(this.defaultValue).length) {
          value = _2.merge(this.defaultValue, value);
        }
        if (this.migration) {
          const migrated = this.migration(value);
          if (!_2.isEqual(migrated, value)) {
            value = migrated;
            _GM_setValue(this.key, value);
          }
        }
        this.dispatchEvent("getter", value);
        return value;
      }
      set(value) {
        _GM_setValue(this.key, value);
        this.dispatchEvent("setter", value);
      }
      remove() {
        _GM_deleteValue(this.key);
      }
      merge(value) {
        if (isLiteralObject(value)) {
          const merged = { ...this.get(), ...value };
          this.set(merged);
          this.dispatchEvent("setter", merged);
        }
      }
      mergeDeeply(value) {
        if (isLiteralObject(value)) {
          const merged = _2.merge(this.get(), value);
          this.set(merged);
          this.dispatchEvent("setter", merged);
        }
      }
    };
    // 备份注册表：UserKey 默认加入，UserKeyTS（运行时缓存）在子类构造里 excludeFromBackup() 退出
    __publicField(_UserKey, "backupRegistry", /* @__PURE__ */ new Set());
    let UserKey = _UserKey;
    class UserKeyTS extends UserKey {
      constructor(key, defaultValue, invalidfn, listeners, migration) {
        super(key, defaultValue, listeners, migration);
        __publicField(this, "defaultInvalid", () => spawnOffsetTS(0, 0, 0, 12));
        this.defaultInvalid = invalidfn ? invalidfn : this.defaultInvalid;
        this.excludeFromBackup();
      }
      get() {
        let value = getUserValueTS(this.key, this.defaultValue);
        if (isLiteralObject(value) && _2.keys(value).length < _2.keys(this.defaultValue).length) {
          value = _2.merge(this.defaultValue, value);
        }
        if (this.migration) value = this.migration(value);
        this.dispatchEvent("getter", value);
        return value;
      }
      /**
       * 设置时间敏感的用户 key
       * @param value 需要设置的值
       * @param invalidTime 失效时间，默认为函数执行 12 小时后
       */
      set(value, invalidTime) {
        setUserValueTS(this.key, value, invalidTime ? invalidTime : this.defaultInvalid());
        this.dispatchEvent("setter", value);
      }
      merge(value, invalidTime) {
        if (isLiteralObject(value)) {
          const merged = { ...this.get(), ...value };
          this.set(merged, invalidTime ? invalidTime : this.defaultInvalid());
          this.dispatchEvent("setter", merged);
        }
      }
      mergeDeeply(value, invalidTime) {
        if (isLiteralObject(value)) {
          const merged = _2.merge(this.get(), value);
          this.set(merged, invalidTime ? invalidTime : this.defaultInvalid());
          this.dispatchEvent("setter", merged);
        }
      }
    }
    const disabledModules = new UserKey("disabledModules", []);
    const unreadFeeds = new UserKeyTS("unreadFeeds", []);
    const latestRelease = new UserKeyTS("latestRelease", undefined);
    const updateConfig = new UserKey("updateConfig", {
      time: "6h",
      notify: true
    });
    const showUpdateToday = new UserKeyTS("showUpdateToday", true, () => (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1e3);
    const ignoredTag = new UserKey("ignoredTag", "");
    const themeType = new UserKey(
      "themeType",
      "auto",
      {
        setter(value) {
          setTheme(value);
        }
      }
    );
    const styleTheme = new UserKey(
      "styleTheme",
      "vercel",
      {
        setter(value) {
          setStyleTheme(value);
        }
      }
    );
    const compactLayout = new UserKey("compactLayout", false);
    const glassEffect = new UserKey("glassEffect", false, {
      setter(value) {
        document.documentElement.toggleAttribute("glass-effect", value);
      }
    });
    const indexTopicCollapsed = new UserKey("indexTopicCollapsed", false);
    const themeColor = new UserKey("themeColor", {
      light: "#589AFE",
      dark: "#589AFE"
    });
    const customBackground = new UserKey(
      "customBackground",
      undefined,
      {
        setter() {
          setCustomBackground();
        }
      }
    );
    const pageExtension = new UserKey("pageExtension", {
      index: true,
      thread: true
    });
    const showBottomEditor = new UserKey("showBottomEditor", false);
    const userFonts = new UserKey("userFonts", ["Microsoft YaHei"], {
      setter() {
        applyDynamicFonts();
      }
    });
    const monospaceFonts = new UserKey("monospaceFonts", [
      "Consolas",
      "JetBrains Mono",
      "Fira Code",
      "Menlo",
      "monospace"
    ], {
      setter() {
        applyDynamicFonts();
      }
    });
    const navBarHideMode = new UserKey("navBarHideMode", "never", {
      setter(value) {
        document.documentElement.dataset.navBarMode = value;
      }
    });
    const customStyle = new UserKey("customStyle", "", {
      setter() {
        applyCustomStyle();
      }
    });
    const fontWeights = new UserKey("fontWeights", {
      "normal": 400,
      "bold": 600
    }, {
      setter() {
        applyDynamicFonts();
      }
    });
    const highQualityImage = new UserKey("highQualityImage", true);
    const threadImageQueueScope = new UserKey("threadImageQueueScope", "full");
    const currentStorageBase = /* @__PURE__ */ new Map();
    const HOME_FEED_IMAGES = ["home_feed_images", {}];
    const THREAD_IMAGES = ["thread_images", []];
    const currentStorage = {
      get(entry) {
        return currentStorageBase.get(entry[0]);
      },
      set(entry, value) {
        currentStorageBase.set(entry[0], value);
      },
      has(entry) {
        return currentStorageBase.has(entry[0]);
      },
      delete(entry) {
        currentStorageBase.delete(entry[0]);
      },
      clear() {
        currentStorageBase.clear();
      },
      entries() {
        return currentStorageBase.entries();
      },
      keys() {
        return currentStorageBase.keys();
      },
      values() {
        return currentStorageBase.values();
      },
      forEach(callback) {
        currentStorageBase.forEach(callback);
      },
      size() {
        return currentStorageBase.size;
      }
    };
    function getUserValueTS(key, def) {
      try {
        const valueTS = _GM_getValue(key, {
          value: def,
          invalidTime: 0
        });
        const timeStamp = Date.now();
        if (valueTS.invalidTime >= timeStamp) {
          return valueTS.value;
        } else {
          return def;
        }
      } catch (error) {
        return def;
      }
    }
    function setUserValueTS(key, value, invalidTime) {
      try {
        if (invalidTime) {
          _GM_setValue(key, {
            value,
            invalidTime
          });
        } else {
          _GM_setValue(key, value);
        }
      } catch (error) {
        console.warn("setUserValueTS", error);
      }
    }
    marked2.marked.setOptions({});
    function currentPageType() {
      if (location.hostname.toLowerCase() !== "tieba.baidu.com") return "unhandled";
      const pathname = location.pathname.toLocaleLowerCase();
      if (_2.includes(["/", "/index.html"], pathname)) return "index";
      if (/\/p\/\d+/.test(pathname)) return "thread";
      if (pathname === "/f") return "forum";
      if (pathname === "/home/main") return "user";
      return "unhandled";
    }
    async function getLatestReleaseFromGitee(forceUpdate = false) {
      if (latestRelease.get() && !forceUpdate) {
        return {
          release: latestRelease.get()
        };
      }
      const TTL = function() {
        switch (updateConfig.get().time) {
          case "1h":
            return 1;
          case "3h":
            return 3;
          case "6h":
            return 6;
          case "never":
            return -1;
        }
      }();
      if (TTL < 0) {
        return {
          errorKind: "disabled",
          errorMessage: "自动检查更新已关闭，请前往「检查更新设置」开启"
        };
      }
      const updateUrl = `https://api.github.com/repos/${Owner}/${RepoName}/releases/latest`;
      let response;
      try {
        response = await fetch(updateUrl);
      } catch (err) {
        return {
          errorKind: "network",
          errorMessage: `网络请求失败：${(err == null ? undefined : err.message) ?? "未知错误"}`
        };
      }
      if (response.status === 403 || response.status === 429) {
        return {
          errorKind: "ratelimit",
          errorMessage: "GitHub 接口请求频率限制，请稍后再试"
        };
      }
      if (response.status === 404) {
        return {
          errorKind: "notfound",
          errorMessage: "尚未发布任何 Release"
        };
      }
      if (!response.ok) {
        return {
          errorKind: "server",
          errorMessage: `请求失败：HTTP ${response.status} ${response.statusText}`
        };
      }
      let result;
      try {
        result = await response.json();
      } catch {
        return {
          errorKind: "server",
          errorMessage: "响应解析失败"
        };
      }
      if ((result == null ? undefined : result.message) && !(result == null ? undefined : result.tag_name)) {
        return {
          errorKind: "server",
          errorMessage: result.message
        };
      }
      if ((result == null ? undefined : result.author) && !result.author.name) {
        result.author.name = result.author.login;
      }
      latestRelease.set(result, spawnOffsetTS(0, 0, 0, TTL));
      return {
        release: result
      };
    }
    function checkUpdateAndNotify(showLatest = false) {
      if (updateConfig.get().time === "never") return;
      if (!updateConfig.get().notify) return;
      if (!showUpdateToday.get()) return;
      if (_GM_info.script.version === "developer-only") return;
      getLatestReleaseFromGitee().then(({
        release: latestRelease2
      }) => {
        if (latestRelease2 && latestRelease2.tag_name > `v${_GM_info.script.version}`) {
          if (ignoredTag.get() === latestRelease2.tag_name) return;
          userDialog(vue.createVNode("div", {
            "class": "markdown",
            "innerHTML": marked2.marked(latestRelease2.body),
            "style": parseCSSRule({
              maxWidth: "600px"
            })
          }, null), {
            title: latestRelease2.name,
            dialogButtons: [{
              text: "安装",
              event() {
                installFromRelease(latestRelease2);
                return true;
              },
              style: "themed"
            }, {
              text: "今日不再提醒",
              event() {
                showUpdateToday.set(false);
                return true;
              }
            }, {
              text: "跳过该版本",
              event() {
                ignoredTag.set(latestRelease2.tag_name);
                return true;
              }
            }]
          });
        } else {
          if (showLatest) userView.messageBox({
            title: "检查更新",
            content: "当前已是最新版本",
            type: "okCancel"
          });
        }
      });
    }
    function installFromRelease(release) {
      function notFound() {
        userView.toast({
          message: "安装失败：未找到可用的资源",
          type: "error",
          duration: 6e3,
          blurEffect: true
        });
      }
      const asset = resolveReleaseInstallUrl(release);
      if (asset) {
        _GM_openInTab(asset, {
          active: true
        });
      } else {
        notFound();
        return;
      }
    }
    function resolveReleaseInstallUrl(release) {
      if (!release.tag_name) return undefined;
      if (release.assets && release.assets.length > 0) {
        for (const asset of release.assets) {
          if (asset.name && asset.name.endsWith(".user.js")) {
            return asset.browser_download_url;
          }
        }
      }
      return `https://raw.githubusercontent.com/${Owner}/${RepoName}/${release.tag_name}/build/tieba-remix.user.js`;
    }
    function getResource(path) {
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      return `https://raw.githubusercontent.com/${Owner}/${RepoName}/master/${cleanPath}`;
    }
    function setTheme(theme) {
      switch (theme) {
        case "dark":
          darkTheme();
          break;
        case "light":
          lightTheme();
          break;
        case "auto":
        default:
          darkPrefers.matches ? darkTheme() : lightTheme();
          break;
      }
      function lightTheme() {
        document.documentElement.classList.add("light-theme");
        document.documentElement.classList.remove("dark-theme");
        document.documentElement.classList.remove("dark");
        waitUntil(() => !_2.isNil(document.body)).then(function() {
          document.body.classList.remove("dark-theme");
        });
      }
      function darkTheme() {
        document.documentElement.classList.add("dark-theme");
        document.documentElement.classList.remove("light-theme");
        document.documentElement.classList.add("dark");
        waitUntil(() => !_2.isNil(document.body)).then(function() {
          document.body.classList.add("dark-theme");
        });
      }
    }
    function backupUserConfigs() {
      const configs = {};
      for (const userKey of UserKey.getBackupableKeys()) {
        configs[userKey.key] = _GM_getValue(userKey.key, userKey.defaultValue);
      }
      const payload = {
        __meta: {
          version: 1,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          scriptVersion: _GM_info.script.version
        },
        configs
      };
      outputFile(`tieba-remix-backup@${(/* @__PURE__ */ new Date()).getTime()}.json`, JSON.stringify(payload, null, 2));
    }
    async function restoreUserConfigs() {
      let parsed;
      try {
        parsed = JSON.parse(await selectLocalFile());
      } catch {
        userView.toast({
          message: "备份文件解析失败，请检查 JSON 格式",
          type: "warning"
        });
        return;
      }
      const configs = extractConfigs(parsed);
      if (!configs) {
        userView.toast({
          message: "备份文件格式无效",
          type: "warning"
        });
        return;
      }
      const entries = Object.entries(configs);
      for (const [key, value] of entries) {
        _GM_setValue(key, value);
      }
      if (await userView.messageBox({
        title: "恢复完成",
        content: `已恢复 ${entries.length} 项配置。需要刷新页面以应用所有设置，是否立即刷新？`,
        type: "okCancel"
      }) === "positive") {
        location.reload();
      }
    }
    function extractConfigs(parsed) {
      if (!_2.isPlainObject(parsed)) return null;
      const obj = parsed;
      if (_2.isPlainObject(obj.__meta) && _2.isPlainObject(obj.configs)) {
        return obj.configs;
      }
      return obj;
    }
    const _hoisted_1$h = { class: "about-wrapper" };
    const _hoisted_2$f = { class: "main-title" };
    const _hoisted_3$c = { class: "title" };
    const _hoisted_4$a = { class: "script-info" };
    const _hoisted_5$8 = { class: "author-info" };
    const _hoisted_6$6 = { class: "version" };
    const _hoisted_7$5 = { class: "author" };
    const _hoisted_8$4 = { class: "about-desc" };
    const _hoisted_9$4 = { class: "line" };
    const _hoisted_10$4 = { class: "about-controls" };
    const _sfc_main$j = /* @__PURE__ */ vue.defineComponent({
      __name: "about.detail",
      setup(__props) {
        const scriptInfo = _GM_info;
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$h, [
            vue.createElementVNode("div", _hoisted_2$f, [
              vue.createElementVNode("div", _hoisted_3$c, vue.toDisplayString(vue.unref(MainTitle)), 1)
            ]),
            vue.createElementVNode("div", _hoisted_4$a, [
              vue.createElementVNode("div", _hoisted_5$8, [
                vue.createElementVNode("div", _hoisted_6$6, "v" + vue.toDisplayString(vue.unref(scriptInfo).script.version), 1),
                vue.createElementVNode("div", _hoisted_7$5, "@" + vue.toDisplayString(vue.unref(Owner)), 1)
              ]),
              vue.createElementVNode("div", _hoisted_8$4, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(`本开源项目使用 MIT 协议`.split("\n"), (line) => {
                  return vue.openBlock(), vue.createElementBlock("div", _hoisted_9$4, vue.toDisplayString(line), 1);
                }), 256))
              ])
            ]),
            vue.createElementVNode("div", _hoisted_10$4, [
              vue.createVNode(vue.unref(userView.UserButton), {
                class: "about-button github",
                "is-anchor": true,
                href: vue.unref(GithubRepo),
                "shadow-border": true,
                target: "_blank"
              }, {
                default: vue.withCtx(() => _cache[0] || (_cache[0] = [
                  vue.createTextVNode("开放源代码 ")
                ])),
                _: 1
              }, 8, ["href"])
            ])
          ]);
        };
      }
    });
    const AboutDetail = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__scopeId", "data-v-4060d874"]]);
    const _hoisted_1$g = {
      key: 0,
      class: "update-wrapper"
    };
    const _hoisted_2$e = { class: "icon" };
    const _hoisted_3$b = { class: "content" };
    const _hoisted_4$9 = { class: "title-container" };
    const _hoisted_5$7 = { class: "title" };
    const _hoisted_6$5 = {
      key: 0,
      class: "is-pre-release"
    };
    const _hoisted_7$4 = ["innerHTML"];
    const _hoisted_8$3 = { class: "update-controls" };
    const _hoisted_9$3 = {
      key: 1,
      class: "status-wrapper"
    };
    const _hoisted_10$3 = {
      key: 2,
      class: "status-wrapper"
    };
    const _hoisted_11$3 = { class: "icon" };
    const _hoisted_12$2 = { class: "status-text" };
    const _sfc_main$i = /* @__PURE__ */ vue.defineComponent({
      __name: "about.update",
      setup(__props) {
        const release = vue.ref();
        const isLatest = vue.ref();
        const loading = vue.ref(true);
        const errorKind = vue.ref();
        const errorText = vue.ref("");
        const scriptInfo = _GM_info;
        const errorIcon = vue.computed(() => {
          switch (errorKind.value) {
            case "disabled":
              return "do_not_disturb_on";
            case "ratelimit":
              return "hourglass_top";
            case "network":
              return "wifi_off";
            case "notfound":
              return "inventory_2";
            default:
              return "warning";
          }
        });
        const installUrl = vue.computed(() => release.value ? resolveReleaseInstallUrl(release.value) : undefined);
        const canRetry = vue.computed(() => errorKind.value !== "disabled");
        async function loadRelease() {
          loading.value = true;
          errorKind.value = undefined;
          errorText.value = "";
          release.value = undefined;
          isLatest.value = undefined;
          const outcome = await getLatestReleaseFromGitee(true);
          loading.value = false;
          if (outcome.release) {
            release.value = outcome.release;
            isLatest.value = `v${scriptInfo.script.version}` >= outcome.release.tag_name;
          } else {
            errorKind.value = outcome.errorKind;
            errorText.value = outcome.errorMessage ?? "未知错误";
          }
        }
        vue.onMounted(loadRelease);
        return (_ctx, _cache) => {
          var _a, _b, _c, _d;
          return release.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$g, [
            isLatest.value !== undefined ? (vue.openBlock(), vue.createElementBlock("div", {
              key: 0,
              class: vue.normalizeClass(["latest-info", { "is-latest": isLatest.value }])
            }, [
              vue.createElementVNode("div", _hoisted_2$e, vue.toDisplayString(isLatest.value ? "check" : "warning"), 1),
              vue.createElementVNode("div", _hoisted_3$b, vue.toDisplayString(isLatest.value ? "当前是最新版本" : "检测到新版本"), 1)
            ], 2)) : vue.createCommentVNode("", true),
            !isLatest.value ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
              vue.createElementVNode("div", _hoisted_4$9, [
                vue.createElementVNode("h2", _hoisted_5$7, vue.toDisplayString((_a = release.value) == null ? undefined : _a.name), 1),
                ((_b = release.value) == null ? undefined : _b.prerelease) ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_6$5, "预览版")) : vue.createCommentVNode("", true)
              ]),
              vue.createElementVNode("div", {
                class: "release-body markdown",
                innerHTML: ((_c = release.value) == null ? undefined : _c.body) ? vue.unref(marked2.marked)((_d = release.value) == null ? undefined : _d.body) : ""
              }, null, 8, _hoisted_7$4),
              vue.createElementVNode("div", _hoisted_8$3, [
                vue.createVNode(vue.unref(userView.UserButton), {
                  class: "up-button download-button",
                  "shadow-border": "",
                  "theme-style": "",
                  "is-anchor": "",
                  href: installUrl.value
                }, {
                  default: vue.withCtx(() => _cache[0] || (_cache[0] = [
                    vue.createTextVNode("安装更新 ")
                  ])),
                  _: 1
                }, 8, ["href"])
              ])
            ], 64)) : vue.createCommentVNode("", true)
          ])) : loading.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_9$3, _cache[1] || (_cache[1] = [
            vue.createElementVNode("div", { class: "icon" }, "sync", -1),
            vue.createElementVNode("div", { class: "status-text" }, "正在检查更新...", -1)
          ]))) : (vue.openBlock(), vue.createElementBlock("div", _hoisted_10$3, [
            vue.createElementVNode("div", _hoisted_11$3, vue.toDisplayString(errorIcon.value), 1),
            vue.createElementVNode("div", _hoisted_12$2, vue.toDisplayString(errorText.value), 1),
            canRetry.value ? (vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
              key: 0,
              class: "retry-button",
              "shadow-border": "",
              onClick: loadRelease
            }, {
              default: vue.withCtx(() => _cache[2] || (_cache[2] = [
                vue.createTextVNode("重新检查")
              ])),
              _: 1
            })) : vue.createCommentVNode("", true)
          ]));
        };
      }
    });
    const AboutUpdate = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__scopeId", "data-v-8b81bea5"]]);
    const _hoisted_1$f = { class: "layout-custom-back" };
    const _hoisted_2$d = { class: "head-row" };
    const _hoisted_3$a = { class: "head-actions" };
    const _hoisted_4$8 = { class: "preview-row" };
    const _hoisted_5$6 = ["src"];
    const _sfc_main$h = /* @__PURE__ */ vue.defineComponent({
      __name: "layout.custom-back",
      setup(__props) {
        const imageData = vue.ref(customBackground.get());
        const alphaValue = vue.ref("100");
        vue.watch(imageData, (newValue) => {
          customBackground.set(newValue);
        });
        vue.onMounted(async function() {
          imageData.value = customBackground.get();
        });
        async function clearImage() {
          imageData.value = undefined;
        }
        async function selectImageFile() {
          imageData.value = await selectLocalFile("base64");
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$f, [
            vue.createElementVNode("div", _hoisted_2$d, [
              _cache[2] || (_cache[2] = vue.createElementVNode("div", { class: "head-text" }, [
                vue.createElementVNode("div", { class: "head-title" }, "自定义背景图"),
                vue.createElementVNode("div", { class: "head-desc" }, "上传图片作为页面背景图")
              ], -1)),
              vue.createElementVNode("div", _hoisted_3$a, [
                vue.createVNode(vue.unref(userView.UserButton), {
                  class: "back-button",
                  onClick: clearImage
                }, {
                  default: vue.withCtx(() => _cache[0] || (_cache[0] = [
                    vue.createTextVNode("清除")
                  ])),
                  _: 1
                }),
                vue.createVNode(vue.unref(userView.UserButton), {
                  class: "back-button",
                  onClick: selectImageFile
                }, {
                  default: vue.withCtx(() => _cache[1] || (_cache[1] = [
                    vue.createTextVNode("上传图片")
                  ])),
                  _: 1
                })
              ])
            ]),
            vue.withDirectives(vue.createElementVNode("div", _hoisted_4$8, [
              vue.createElementVNode("img", {
                class: "custom-image",
                src: imageData.value ?? "",
                title: "自定义背景",
                alt: "自定义背景",
                style: vue.normalizeStyle(`opacity: ${+alphaValue.value / 100}`)
              }, null, 12, _hoisted_5$6)
            ], 512), [
              [vue.vShow, imageData.value]
            ])
          ]);
        };
      }
    });
    const LayoutCustomBack = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["__scopeId", "data-v-bc28201e"]]);
    const _hoisted_1$e = { class: "color-picker" };
    const _hoisted_2$c = { key: 0 };
    const DEBOUNCE_TIME = 500;
    const _sfc_main$g = /* @__PURE__ */ vue.defineComponent({
      __name: "color-picker",
      props: /* @__PURE__ */ vue.mergeModels({
        text: { default: "" }
      }, {
        "modelValue": { required: true },
        "modelModifiers": {}
      }),
      emits: /* @__PURE__ */ vue.mergeModels(["change"], ["update:modelValue"]),
      setup(__props, { emit: __emit }) {
        const model = vue.useModel(__props, "modelValue");
        const emit = __emit;
        const debouncedUpdate = _2.debounce(() => {
          emit("change", model.value);
        }, DEBOUNCE_TIME);
        vue.onBeforeUnmount(function() {
          debouncedUpdate.cancel();
        });
        vue.watch(model, function() {
          debouncedUpdate();
        });
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$e, [
            vue.withDirectives(vue.createElementVNode("input", {
              class: "color-input",
              type: "color",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => model.value = $event)
            }, null, 512), [
              [vue.vModelText, model.value]
            ]),
            _ctx.text ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_2$c, vue.toDisplayString(_ctx.text), 1)) : vue.createCommentVNode("", true)
          ]);
        };
      }
    });
    const ColorPicker = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__scopeId", "data-v-d258c23f"]]);
    const _hoisted_1$d = { class: "theme-color-component" };
    const _sfc_main$f = /* @__PURE__ */ vue.defineComponent({
      __name: "theme.color",
      setup(__props) {
        const lightTheme = vue.ref(themeColor.get().light);
        const darkTheme = vue.ref(themeColor.get().dark);
        function changeThemeColor() {
          themeColor.set({
            dark: darkTheme.value,
            light: lightTheme.value
          });
          applyThemeColor();
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$d, [
            vue.createVNode(ColorPicker, {
              text: "浅色主题",
              modelValue: lightTheme.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => lightTheme.value = $event),
              onChange: changeThemeColor
            }, null, 8, ["modelValue"]),
            vue.createVNode(ColorPicker, {
              text: "深色主题",
              modelValue: darkTheme.value,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => darkTheme.value = $event),
              onChange: changeThemeColor
            }, null, 8, ["modelValue"])
          ]);
        };
      }
    });
    const ThemeColor = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-b4e9e941"]]);
    const getUserSettings = _2.once(() => ({
      "visibility": {
        name: "显示",
        icon: "visibility",
        description: "主题、显示设置",
        sub: {
          "theme": {
            name: "主题",
            content: {
              "switch-theme": {
                title: "主题偏好",
                description: `在自动模式下，将根据当前系统设置自动选择合适的主题`,
                widgets: [{
                  type: "select",
                  content: [{
                    value: "auto",
                    text: "自动",
                    desc: "根据系统设置自动切换主题"
                  }, {
                    value: "dark",
                    text: "深色",
                    desc: "使用深色主题"
                  }, {
                    value: "light",
                    text: "浅色",
                    desc: "使用浅色主题"
                  }],
                  init() {
                    return themeType.get();
                  },
                  event(theme) {
                    themeType.set(theme);
                  }
                }]
              },
              "style-theme": {
                title: "样式风格",
                description: `提供两套视觉主题，切换后即时生效`,
                widgets: [{
                  type: "select",
                  content: [{
                    value: "remixed",
                    text: "Remixed",
                    desc: "脚本默认风格，圆润色彩与品牌紫"
                  }, {
                    value: "vercel",
                    text: "Vercel",
                    desc: "极简中性，吧首页帖子列表为卡片网格"
                  }],
                  init() {
                    return styleTheme.get();
                  },
                  event(value) {
                    styleTheme.set(value);
                  }
                }]
              },
              "glass-effect": {
                title: "磨砂玻璃质感",
                description: `为导航栏、首页标题栏、下拉菜单等元素启用磨砂玻璃背景效果`,
                widgets: [{
                  type: "toggle",
                  content: `关闭后，所有使用到磨砂玻璃质感的位置都将回退为普通半透明背景`,
                  init() {
                    return glassEffect.get();
                  },
                  event() {
                    glassEffect.set(!glassEffect.get());
                    return glassEffect.get();
                  }
                }]
              },
              "color": {
                title: "主题颜色",
                description: `自定义主题色，由于存在深浅两种主题，需要设置两种主题色。`,
                widgets: [{
                  type: "component",
                  component: vue.markRaw(ThemeColor)
                }]
              }
            }
          },
          "layout": {
            name: "页面布局",
            content: {
              "compact-layout": {
                title: "紧凑布局",
                widgets: [{
                  type: "toggle",
                  content: `对部分页面应用更紧凑的布局以提高信息密度。当前会受到影响的页面有：新版看贴页面`,
                  init() {
                    return compactLayout.get();
                  },
                  event() {
                    compactLayout.set(!compactLayout.get());
                    document.body.toggleAttribute("compact-layout");
                    return compactLayout.get();
                  }
                }]
              },
              "forum-bottom-editor": {
                title: "显示吧首页底部发帖模块",
                widgets: [{
                  type: "toggle",
                  content: `开启后会在吧首页底部显示贴吧原生的发帖编辑器`,
                  init() {
                    return showBottomEditor.get();
                  },
                  event() {
                    const next = !showBottomEditor.get();
                    showBottomEditor.set(next);
                    document.body.toggleAttribute("hide-bottom-editor", !next);
                    return next;
                  }
                }]
              },
              "custom-background": {
                widgets: [{
                  type: "component",
                  component: vue.markRaw(LayoutCustomBack)
                }]
              },
              "nav-bar-mode": {
                title: "导航栏隐藏模式",
                description: `设置导航栏的隐藏模式`,
                widgets: [{
                  type: "select",
                  content: [{
                    value: "fold",
                    text: "滚动隐藏",
                    desc: "当页面向下滚动时隐藏导航栏，将鼠标移至屏幕最顶端可重新呼出"
                  }, {
                    value: "alwaysFold",
                    text: "始终隐藏",
                    desc: "导航栏始终保持隐藏，将鼠标移至屏幕最顶端可呼出"
                  }, {
                    value: "never",
                    text: "始终显示",
                    desc: "始终显示完整的导航栏"
                  }],
                  init() {
                    return navBarHideMode.get();
                  },
                  event(hideMode) {
                    navBarHideMode.set(hideMode);
                  }
                }]
              }
            }
          },
          "page-extension": {
            name: "页面扩展",
            content: {
              "index": {
                title: "首页扩展",
                widgets: [{
                  type: "toggle",
                  content: `首页扩展旨在提供更纯粹的浏览体验，提供管理关注的吧、贴吧热议、瀑布流推送等功能`,
                  init() {
                    return pageExtension.get().index;
                  },
                  event() {
                    pageExtension.merge({
                      index: !pageExtension.get().index
                    });
                    return pageExtension.get().index;
                  }
                }]
              },
              "thread": {
                title: "帖子浏览页面扩展",
                widgets: [{
                  type: "toggle",
                  content: `使用全新的 UI 简化帖子浏览，并改进屏幕空间利用率`,
                  init() {
                    return pageExtension.get().thread;
                  },
                  event() {
                    pageExtension.merge({
                      thread: !pageExtension.get().thread
                    });
                    return pageExtension.get().thread;
                  }
                }]
              },
              "thread-image-queue": {
                title: "看图模式加载全帖图片",
                description: `控制看图模式打开时的图片队列范围`,
                widgets: [{
                  type: "toggle",
                  content: `开启时加载整个帖子的所有图片到队列；关闭时仅加载当前楼层中的图片`,
                  init() {
                    return threadImageQueueScope.get() === "full";
                  },
                  event() {
                    const next = threadImageQueueScope.get() === "full" ? "floor" : "full";
                    threadImageQueueScope.set(next);
                    return next === "full";
                  }
                }]
              }
            }
          },
          "fonts": {
            name: "字体",
            content: {
              "code-zh": {
                title: "主要字体组合",
                description: `应用在贴吧绝大多数场景的字体组合`,
                widgets: [{
                  type: "textarea",
                  placeHolder: "填入字体名，以换行分隔。若需要中英文混排，需将英文字体写在中文字体之前",
                  init() {
                    return _2.join(userFonts.get(), "\n");
                  },
                  event(e) {
                    userFonts.set(_2.split(e.target.value, "\n"));
                    return _2.join(userFonts.get(), "\n");
                  }
                }]
              },
              "code-monospace": {
                title: "等宽字体组合",
                description: `应用在数据显示等场景的等宽字体组合`,
                widgets: [{
                  type: "textarea",
                  placeHolder: "填入字体名，以换行分隔。建议在此处写入等宽字体",
                  init() {
                    return _2.join(monospaceFonts.get(), "\n");
                  },
                  event(e) {
                    monospaceFonts.set(_2.split(e.target.value, "\n"));
                    return _2.join(monospaceFonts.get(), "\n");
                  }
                }]
              },
              "font-weights": {
                title: "字重调整",
                description: `设置字体的字重`,
                widgets: [{
                  type: "subTitle",
                  content: "默认字重"
                }, {
                  type: "textbox",
                  placeHolder: "默认字重",
                  init() {
                    return fontWeights.get().normal;
                  },
                  event(e) {
                    const newValue = e.target.value;
                    fontWeights.merge({
                      normal: +newValue
                    });
                  }
                }, {
                  type: "subTitle",
                  content: "粗体字重"
                }, {
                  type: "textbox",
                  placeHolder: "粗体字重",
                  init() {
                    return fontWeights.get().bold;
                  },
                  event(e) {
                    const newValue = e.target.value;
                    fontWeights.merge({
                      bold: +newValue
                    });
                  }
                }]
              }
            }
          }
        }
      },
      "modules": {
        name: "模块",
        icon: "deployed_code",
        description: "用户模块管理及部署",
        sub: AllModules().filter((m) => m.id !== "remixed-theme").reduce((accu, curr, index2) => {
          function toSubSettingKey(module) {
            return {
              name: module.name,
              description: module.brief,
              content: {
                "module-info": {
                  title: module.name,
                  description: `${module.id} ${module.version}`,
                  widgets: [{
                    type: "toggle",
                    content: module.description,
                    init() {
                      return _2.includes(disabledModules.get(), module.id) ? false : true;
                    },
                    event() {
                      if (_2.includes(disabledModules.get(), module.id)) {
                        const newSet = new Set(disabledModules.get());
                        newSet.delete(module.id);
                        disabledModules.set([...newSet]);
                        return true;
                      } else {
                        disabledModules.set([module.id, ...disabledModules.get()]);
                        return false;
                      }
                    }
                  }]
                },
                ...module.settings
              }
            };
          }
          if (index2 === 1) {
            const accuObject = toSubSettingKey(accu);
            accu = {};
            accu[accuObject.name] = accuObject;
          }
          accu[curr.name] = toSubSettingKey(curr);
          return accu;
        })
      },
      "enhanced": {
        name: "高级",
        icon: "labs",
        description: "性能、更新与高级设置",
        sub: {
          "backup-recover": {
            name: "备份与恢复",
            content: {
              "data-backup": {
                title: "数据备份",
                description: `备份脚本所有自定义配置`,
                widgets: [{
                  type: "button",
                  content: "备份",
                  event() {
                    backupUserConfigs();
                  }
                }]
              },
              "recover-backup": {
                title: "数据恢复",
                description: `从备份文件中恢复脚本所有自定义配置`,
                widgets: [{
                  type: "button",
                  content: "恢复",
                  event() {
                    restoreUserConfigs();
                  }
                }]
              }
            }
          },
          "custom-style": {
            name: "自定义样式",
            content: {
              "content": {
                title: "自定义样式",
                description: `你可以在这里添加一些自定义的CSS代码，用以覆盖脚本内置的一些样式`,
                widgets: [{
                  type: "textarea",
                  init() {
                    return customStyle.get();
                  },
                  event(e) {
                    customStyle.set(e.target.value);
                  }
                }]
              }
            }
          },
          "factory-reset": {
            name: "重置所有配置",
            content: {
              "reset": {
                title: "重置所有配置",
                description: `如果你需要将脚本的一切配置恢复默认，请使用此功能`,
                widgets: [{
                  type: "button",
                  content: "重置",
                  async event() {
                    if (await userView.messageBox({
                      title: "重置所有配置",
                      content: "该操作是不可逆的，请做最后一次确认",
                      type: "forceTrueFalse"
                    }) === "positive") {
                      _2.forEach(_GM_listValues(), (key) => {
                        _GM_deleteValue(key);
                      });
                      location.reload();
                    }
                  }
                }]
              }
            }
          },
          "update": {
            name: "检查更新",
            content: {
              "update-time": {
                title: "检查更新设置",
                description: `发行信息追踪频率`,
                widgets: [{
                  type: "select",
                  content: [{
                    value: "1h",
                    text: "1 小时"
                  }, {
                    value: "3h",
                    text: "3 小时"
                  }, {
                    value: "6h",
                    text: "6 小时"
                  }, {
                    value: "never",
                    text: "从不"
                  }],
                  init() {
                    return updateConfig.get().time;
                  },
                  event(updateTime) {
                    updateConfig.merge({
                      time: updateTime
                    });
                  }
                }]
              },
              "update-notify": {
                title: "弹窗更新",
                widgets: [{
                  type: "toggle",
                  content: `当检测到新版本时会在网页里弹窗提醒`,
                  init() {
                    return updateConfig.get().notify;
                  },
                  event() {
                    updateConfig.merge({
                      notify: !updateConfig.get().notify
                    });
                  }
                }]
              },
              "update-component": {
                widgets: [{
                  type: "component",
                  component: vue.markRaw(AboutUpdate)
                }]
              }
            }
          },
          "about": {
            name: "关于项目",
            content: {
              "about-component": {
                widgets: [{
                  type: "component",
                  component: vue.markRaw(AboutDetail)
                }]
              }
            }
          }
        }
      }
    }));
    const _hoisted_1$c = {
      class: "settings-wrapper remove-default"
    };
    const _hoisted_2$b = {
      class: "settings-sidebar"
    };
    const _hoisted_3$9 = {
      class: "sidebar-header"
    };
    const _hoisted_4$7 = {
      class: "sidebar-nav"
    };
    const _hoisted_5$5 = {
      class: "nav-group-label"
    };
    const _hoisted_6$4 = {
      class: "material-symbols-outlined nav-group-icon"
    };
    const _hoisted_7$3 = {
      class: "nav-group-name"
    };
    const _hoisted_8$2 = {
      class: "nav-list"
    };
    const _hoisted_9$2 = ["onClick"];
    const _hoisted_10$2 = {
      class: "settings-main"
    };
    const _hoisted_11$2 = {
      key: 0,
      class: "main-header"
    };
    const _hoisted_12$1 = {
      class: "breadcrumb"
    };
    const _hoisted_13$1 = {
      class: "crumb"
    };
    const _hoisted_14$1 = {
      class: "crumb current"
    };
    const _hoisted_15$1 = {
      class: "main-title"
    };
    const _hoisted_16$1 = {
      key: 0,
      class: "main-desc"
    };
    const _hoisted_17$1 = {
      key: 1,
      class: "main-body"
    };
    const _hoisted_18$1 = {
      key: 0,
      class: "setting-component-wrap"
    };
    const _hoisted_19$1 = {
      key: 1,
      class: "setting-row simple"
    };
    const _hoisted_20 = {
      class: "row-text"
    };
    const _hoisted_21 = {
      key: 0,
      class: "row-title"
    };
    const _hoisted_22 = {
      class: "row-control"
    };
    const _hoisted_23 = {
      key: 2,
      class: "setting-row composite"
    };
    const _hoisted_24 = {
      key: 0,
      class: "row-head"
    };
    const _hoisted_25 = {
      key: 0,
      class: "row-title"
    };
    const _hoisted_26 = {
      key: 1,
      class: "row-desc"
    };
    const _hoisted_27 = {
      key: 1,
      class: "row-body"
    };
    const _hoisted_28 = {
      key: 0,
      class: "widget-subtitle"
    };
    const _hoisted_29 = {
      key: 1,
      class: "widget-desc"
    };
    const _hoisted_30 = {
      key: 2,
      class: "widget-toggle"
    };
    const _hoisted_31 = {
      class: "toggle-label"
    };
    const _hoisted_32 = {
      key: 6,
      class: "widget-icon material-symbols-outlined"
    };
    const _hoisted_33 = ["src", "alt", "title", "onLoad"];
    const _hoisted_34 = {
      key: 2,
      class: "main-empty"
    };
    const _hoisted_35 = {
      key: 0,
      class: "main-desc-floater"
    };
    const _sfc_main$e = /* @__PURE__ */ vue.defineComponent({
      __name: "settings",
      setup(__props, {
        expose: __expose
      }) {
        const userSettings = getUserSettings();
        const dialogOpts = {
          uniqueName: "settings",
          animation: false,
          modal: true,
          lockScroll: true,
          modalStyle: {
            alignItems: "center",
            justifyContent: "center"
          },
          containerStyle: {
            display: "flex",
            flexDirection: "row",
            width: "min(960px, 92vw)",
            height: "min(640px, 86vh)",
            maxWidth: "92vw",
            maxHeight: "86vh",
            padding: "0",
            overflow: "hidden"
          }
        };
        const searchText = vue.ref("");
        const selectedKey = vue.ref();
        const selectedSubKey = vue.ref();
        const hoverDesc = vue.ref("");
        vue.provide("settingHoverDesc", {
          set: (text) => {
            hoverDesc.value = text || "";
          },
          clear: () => {
            hoverDesc.value = "";
          }
        });
        function selectSubByPath(main2, sub) {
          selectedKey.value = main2;
          selectedSubKey.value = sub;
        }
        function changeView(key, sub) {
          selectedKey.value = userSettings[key];
          selectedSubKey.value = userSettings[key].sub[sub];
        }
        function clearSelections() {
          selectedKey.value = undefined;
          selectedSubKey.value = undefined;
        }
        function searchKey() {
          if (searchText.value.length <= 0) return;
          if (!_2.find(userSettings, (mainKey) => {
            return !!_2.find(mainKey.sub, (subKey) => {
              if (subKey.name.toLowerCase().includes(searchText.value.toLowerCase())) {
                selectedKey.value = mainKey;
                selectedSubKey.value = subKey;
                return true;
              }
              return false;
            });
          })) clearSelections();
        }
        const debSearchKey = _2.debounce(searchKey, 300);
        const SIMPLE_TYPES = /* @__PURE__ */ new Set(["toggle", "button", "select"]);
        function isSimpleRow(content) {
          const widgets = content.widgets ?? [];
          if (widgets.length !== 1) return false;
          return SIMPLE_TYPES.has(widgets[0].type);
        }
        function isComponentOnly(content) {
          if (content.title || content.description) return false;
          const widgets = content.widgets ?? [];
          if (widgets.length !== 1) return false;
          return widgets[0].type === "component" && !!widgets[0].component;
        }
        function splitLines(text) {
          if (!text) return [];
          return text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
        }
        function resolveSimpleDesc(content) {
          var _a;
          if (content.description) return splitLines(content.description);
          const w = (_a = content.widgets) == null ? undefined : _a[0];
          if ((w == null ? undefined : w.type) === "toggle" && typeof w.content === "string") return splitLines(w.content);
          return [];
        }
        vue.onMounted(() => {
          const firstMain = _2.values(userSettings)[0];
          if (firstMain) {
            const firstSub = _2.values(firstMain.sub)[0];
            if (firstSub) {
              selectedKey.value = firstMain;
              selectedSubKey.value = firstSub;
            }
          }
        });
        __expose({
          dialogOpts
        });
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createBlock(vue.unref(userView.UserDialog), vue.normalizeProps(vue.guardReactiveProps(dialogOpts)), {
            default: vue.withCtx(() => {
              var _a, _b, _c, _d;
              return [vue.createElementVNode("div", _hoisted_1$c, [vue.createElementVNode("aside", _hoisted_2$b, [vue.createElementVNode("header", _hoisted_3$9, [_cache[1] || (_cache[1] = vue.createElementVNode("h1", {
                class: "sidebar-title"
              }, "设置", -1)), vue.createVNode(vue.unref(userView.UserTextbox), {
                modelValue: searchText.value,
                "onUpdate:modelValue": [_cache[0] || (_cache[0] = ($event) => searchText.value = $event), vue.unref(debSearchKey)],
                class: "sidebar-search",
                placeholder: "搜索设置..."
              }, null, 8, ["modelValue", "onUpdate:modelValue"])]), vue.createElementVNode("nav", _hoisted_4$7, [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(userSettings), (main2) => {
                return vue.openBlock(), vue.createElementBlock("div", {
                  key: main2.name,
                  class: "nav-group"
                }, [vue.createElementVNode("div", _hoisted_5$5, [vue.createElementVNode("span", _hoisted_6$4, vue.toDisplayString(main2.icon), 1), vue.createElementVNode("span", _hoisted_7$3, vue.toDisplayString(main2.name), 1)]), vue.createElementVNode("ul", _hoisted_8$2, [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(main2.sub, (sub) => {
                  var _a2, _b2;
                  return vue.openBlock(), vue.createElementBlock("li", {
                    key: sub.name,
                    class: vue.normalizeClass(["nav-item", {
                      active: ((_a2 = selectedSubKey.value) == null ? undefined : _a2.name) === sub.name && ((_b2 = selectedKey.value) == null ? undefined : _b2.name) === main2.name
                    }]),
                    onClick: ($event) => selectSubByPath(main2, sub)
                  }, vue.toDisplayString(sub.name), 11, _hoisted_9$2);
                }), 128))])]);
              }), 128))])]), vue.createElementVNode("main", _hoisted_10$2, [selectedSubKey.value ? (vue.openBlock(), vue.createElementBlock("header", _hoisted_11$2, [vue.createElementVNode("div", _hoisted_12$1, [vue.createElementVNode("span", _hoisted_13$1, vue.toDisplayString((_a = selectedKey.value) == null ? undefined : _a.name), 1), _cache[2] || (_cache[2] = vue.createElementVNode("span", {
                class: "material-symbols-outlined crumb-sep"
              }, "chevron_right", -1)), vue.createElementVNode("span", _hoisted_14$1, vue.toDisplayString((_b = selectedSubKey.value) == null ? undefined : _b.name), 1)]), vue.createElementVNode("h2", _hoisted_15$1, vue.toDisplayString((_c = selectedSubKey.value) == null ? undefined : _c.name), 1), ((_d = selectedSubKey.value) == null ? undefined : _d.description) ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_16$1, vue.toDisplayString(selectedSubKey.value.description), 1)) : vue.createCommentVNode("", true)])) : vue.createCommentVNode("", true), selectedSubKey.value ? (vue.openBlock(), vue.createElementBlock("section", _hoisted_17$1, [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(selectedSubKey.value.content, (content, key) => {
                var _a2, _b2, _c2, _d2, _e;
                return vue.openBlock(), vue.createElementBlock(vue.Fragment, {
                  key
                }, [content && isComponentOnly(content) ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_18$1, [(vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(content.widgets[0].component), {
                  onChangeView: changeView
                }, null, 32))])) : content && isSimpleRow(content) ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_19$1, [vue.createElementVNode("div", _hoisted_20, [content.title ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_21, vue.toDisplayString(content.title), 1)) : vue.createCommentVNode("", true), (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(resolveSimpleDesc(content), (line, idx) => {
                  return vue.openBlock(), vue.createElementBlock("p", {
                    key: idx,
                    class: "row-desc"
                  }, vue.toDisplayString(line), 1);
                }), 128))]), vue.createElementVNode("div", _hoisted_22, [content.widgets[0].type === "toggle" ? (vue.openBlock(), vue.createBlock(SettingSwitch, {
                  key: 0,
                  "model-value": !!((_b2 = (_a2 = content.widgets[0]).init) == null ? undefined : _b2.call(_a2)),
                  onChange: ($event) => {
                    var _a3, _b3;
                    return (_b3 = (_a3 = content.widgets[0]).event) == null ? undefined : _b3.call(_a3, $event);
                  }
                }, null, 8, ["model-value", "onChange"])) : content.widgets[0].type === "button" ? (vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                  key: 1,
                  class: "row-button",
                  onClick: content.widgets[0].event
                }, {
                  default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString(content.widgets[0].content), 1)]),
                  _: 2
                }, 1032, ["onClick"])) : content.widgets[0].type === "select" ? (vue.openBlock(), vue.createBlock(SettingSelect, {
                  key: 2,
                  class: "row-select",
                  data: content.widgets[0].content,
                  "default-value": (_d2 = (_c2 = content.widgets[0]).init) == null ? undefined : _d2.call(_c2),
                  onChange: content.widgets[0].event
                }, null, 8, ["data", "default-value", "onChange"])) : vue.createCommentVNode("", true)])])) : content ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_23, [content.title || content.description ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_24, [content.title ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_25, vue.toDisplayString(content.title), 1)) : vue.createCommentVNode("", true), content.description ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_26, [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(splitLines(content.description), (line, idx) => {
                  return vue.openBlock(), vue.createElementBlock("p", {
                    key: idx
                  }, vue.toDisplayString(line), 1);
                }), 128))])) : vue.createCommentVNode("", true)])) : vue.createCommentVNode("", true), ((_e = content.widgets) == null ? undefined : _e.length) ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_27, [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(content.widgets, (widget, widx) => {
                  var _a3, _b3, _c3;
                  return vue.openBlock(), vue.createElementBlock(vue.Fragment, {
                    key: widx
                  }, [widget.type === "subTitle" ? (vue.openBlock(), vue.createElementBlock("h4", _hoisted_28, vue.toDisplayString(widget.content), 1)) : widget.type === "desc" ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_29, [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(splitLines(widget.content), (line, idx) => {
                    return vue.openBlock(), vue.createElementBlock("p", {
                      key: idx
                    }, vue.toDisplayString(line), 1);
                  }), 128))])) : widget.type === "toggle" ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_30, [vue.createElementVNode("div", _hoisted_31, vue.toDisplayString(widget.content), 1), vue.createVNode(SettingSwitch, {
                    "model-value": !!((_a3 = widget.init) == null ? undefined : _a3.call(widget)),
                    onChange: ($event) => {
                      var _a4;
                      return (_a4 = widget.event) == null ? undefined : _a4.call(widget, $event);
                    }
                  }, null, 8, ["model-value", "onChange"])])) : widget.type === "button" ? (vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                    key: 3,
                    class: "widget-button",
                    onClick: widget.event
                  }, {
                    default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString(widget.content), 1)]),
                    _: 2
                  }, 1032, ["onClick"])) : widget.type === "select" && Array.isArray(widget.content) ? (vue.openBlock(), vue.createBlock(SettingSelect, {
                    key: 4,
                    class: "widget-select",
                    data: widget.content,
                    "default-value": (_b3 = widget.init) == null ? undefined : _b3.call(widget),
                    onChange: widget.event
                  }, null, 8, ["data", "default-value", "onChange"])) : widget.type === "textbox" || widget.type === "textarea" ? (vue.openBlock(), vue.createBlock(vue.unref(userView.UserTextbox), {
                    key: 5,
                    class: vue.normalizeClass(["widget-textbox", {
                      "is-textarea": widget.type === "textarea"
                    }]),
                    value: widget.init ? widget.init() : "",
                    "muti-lines": widget.type === "textarea",
                    placeholder: widget.placeHolder,
                    onChange: widget.event
                  }, null, 8, ["class", "value", "muti-lines", "placeholder", "onChange"])) : widget.type === "icon" ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_32, vue.toDisplayString(widget.content), 1)) : widget.type === "image" ? (vue.openBlock(), vue.createElementBlock("img", {
                    key: 7,
                    class: "widget-image",
                    src: (_c3 = widget.content) == null ? undefined : _c3.toString(),
                    alt: widget.altContent,
                    title: widget.altContent,
                    onLoad: widget.init
                  }, null, 40, _hoisted_33)) : widget.component ? (vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(widget.component), {
                    key: 8,
                    class: "widget-component",
                    onChangeView: changeView
                  }, null, 32)) : vue.createCommentVNode("", true)], 64);
                }), 128))])) : vue.createCommentVNode("", true)])) : vue.createCommentVNode("", true)], 64);
              }), 128))])) : (vue.openBlock(), vue.createElementBlock("section", _hoisted_34, _cache[3] || (_cache[3] = [vue.createElementVNode("span", {
                class: "material-symbols-outlined empty-icon"
              }, "tune", -1), vue.createElementVNode("p", {
                class: "empty-tip"
              }, "从左侧选择一项以开始配置", -1)]))), vue.createVNode(vue.Transition, {
                name: "desc-pop"
              }, {
                default: vue.withCtx(() => [hoverDesc.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_35, vue.toDisplayString(hoverDesc.value), 1)) : vue.createCommentVNode("", true)]),
                _: 1
              })])])];
            }),
            _: 1
          }, 16);
        };
      }
    });
    const Settings = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-343efbfc"]]);
    function parseUserModules(glob, callbackfn) {
      const modules2 = [];
      _2.forEach(glob, async (moduleExport) => {
        const currentModule = (await moduleExport()).default;
        const disabledSet = new Set(disabledModules.get());
        const runnable = (() => {
          if (currentModule.switch || currentModule.switch === undefined) {
            if (currentModule.id !== "remixed-theme" && disabledSet.has(currentModule.id)) {
              return false;
            }
            if (currentModule.scope === true) {
              return true;
            }
            if (Array.isArray(currentModule.scope)) {
              for (let i = 0; i < currentModule.scope.length; i++) {
                const scope = currentModule.scope[i];
                if (currentPageType() === scope) {
                  return true;
                }
              }
            }
            if (currentModule.scope instanceof RegExp) {
              if (currentModule.scope.test(location.href)) {
                return true;
              }
            }
          }
          return false;
        })();
        const runModule = {
          "immediately": () => {
            currentModule.entry();
          },
          "afterHead": () => {
            afterHead(() => {
              currentModule.entry();
            });
          },
          "DOMLoaded": () => {
            document.addEventListener("DOMContentLoaded", () => {
              currentModule.entry();
            });
          },
          "loaded": () => {
            window.addEventListener("load", () => {
              currentModule.entry();
            });
          }
        };
        currentModule.runnable = runnable;
        if (runnable) {
          runModule[currentModule.runAt]();
        }
        modules2.push(currentModule);
        callbackfn(currentModule);
      });
      return modules2;
    }
    const SECURITY_RETRY_KEY = "tiebaRemix:securityRetry";
    const SECURITY_MAX_RETRIES = 5;
    const SECURITY_RELOAD_DELAY_MS = 600;
    const SWITCH_SAFETY_RELOAD_MS = 5e3;
    const SECURITY_PAGE_TITLE = "百度安全验证";
    const CLOAK_STYLE_ID = "__tr_legacy_cloak";
    const CLOAK_SAFETY_MS = 8e3;
    let bootstrapped = false;
    let redirectTriggered = false;
    let securityHandled = false;
    let cloakRemoved = false;
    function setupLegacyRedirect(bootstrap2) {
      if (location.hostname.toLowerCase() !== "tieba.baidu.com") {
        bootstrapped = true;
        bootstrap2({ onReady: () => {
        } });
        return;
      }
      applyCloak();
      window.setTimeout(removeCloak, CLOAK_SAFETY_MS);
      waitForBody(() => {
        handleSecurityPage();
      });
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", finalize, { once: true });
      } else {
        finalize();
      }
      function finalize() {
        var _a;
        if (bootstrapped || redirectTriggered) return;
        if (handleSecurityPage()) return;
        const isNewVersion = ((_a = document.body) == null ? undefined : _a.classList.contains("cos-tieba")) === true || typeof window.PageData === "undefined";
        if (isNewVersion) {
          clearSecurityRetry();
          redirectTriggered = true;
          void redirectToLegacy();
          return;
        }
        clearSecurityRetry();
        bootstrapped = true;
        bootstrap2({ onReady: removeCloak });
      }
    }
    function applyCloak() {
      if (!document.documentElement) return;
      if (document.getElementById(CLOAK_STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = CLOAK_STYLE_ID;
      style.textContent = "html { visibility: hidden !important; }";
      document.documentElement.appendChild(style);
    }
    function removeCloak() {
      var _a;
      if (cloakRemoved) return;
      cloakRemoved = true;
      (_a = document.getElementById(CLOAK_STYLE_ID)) == null ? undefined : _a.remove();
    }
    function waitForBody(cb) {
      if (document.body) {
        cb();
        return;
      }
      const obs = new MutationObserver(() => {
        if (document.body) {
          obs.disconnect();
          cb();
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: false });
    }
    function handleSecurityPage() {
      if (securityHandled) return true;
      if (!isSecurityPage()) return false;
      securityHandled = true;
      const count = readSecurityRetry();
      if (count >= SECURITY_MAX_RETRIES) {
        removeCloak();
        return true;
      }
      writeSecurityRetry(count + 1);
      window.setTimeout(() => window.location.reload(), SECURITY_RELOAD_DELAY_MS);
      return true;
    }
    function isSecurityPage() {
      var _a;
      if (document.title === SECURITY_PAGE_TITLE) return true;
      const text = (_a = document.body) == null ? undefined : _a.textContent;
      if (text && text.includes(SECURITY_PAGE_TITLE)) return true;
      return false;
    }
    function readSecurityRetry() {
      try {
        return Number(sessionStorage.getItem(SECURITY_RETRY_KEY) ?? "0") || 0;
      } catch {
        return 0;
      }
    }
    function writeSecurityRetry(value) {
      try {
        sessionStorage.setItem(SECURITY_RETRY_KEY, String(value));
      } catch {
      }
    }
    function clearSecurityRetry() {
      try {
        sessionStorage.removeItem(SECURITY_RETRY_KEY);
      } catch {
      }
    }
    async function redirectToLegacy() {
      let reloaded = false;
      const reload = () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      };
      const safety = window.setTimeout(reload, SWITCH_SAFETY_RELOAD_MS);
      try {
        await fetch("/c/s/pc/updateSwitch?status=0&_client_type=20", {
          credentials: "include",
          cache: "no-store"
        });
      } catch {
      }
      window.clearTimeout(safety);
      reload();
    }
    class TbObserver {
      constructor(selector, options, initEvent) {
        __publicField(this, "selector");
        __publicField(this, "options");
        __publicField(this, "initEvent");
        __publicField(this, "events", []);
        this.selector = selector;
        this.options = options;
        this.initEvent = initEvent;
      }
      observe() {
        const eventFuncs = () => {
          this.events.forEach((func) => {
            func();
          });
        };
        if (typeof this.initEvent === "undefined") {
          eventFuncs();
        } else {
          window.addEventListener(this.initEvent, eventFuncs);
        }
        const observer = new MutationObserver(eventFuncs);
        const obsElem = dom(this.selector);
        if (obsElem) observer.observe(obsElem, this.options);
      }
      addEvent(...events) {
        _2.forEach(events, (event) => {
          if (this.events.includes(event)) return;
          if (typeof this.initEvent === "undefined") {
            event();
          } else {
            window.addEventListener(this.initEvent, event);
          }
          this.events.push(event);
        });
      }
    }
    const threadFloorsObserver = new TbObserver("#j_p_postlist", { childList: true });
    const threadCommentsObserver = new TbObserver("#j_p_postlist", { childList: true, subtree: true });
    const legacyIndexFeedsObserver = new TbObserver("#new_list", { childList: true });
    const forumThreadsObserver = new TbObserver("#pagelet_frs-list\\/pagelet\\/thread", { attributes: true }, "load");
    const tiebaAPI = {
      /** 首页推荐 */
      feedlist: () => fetch(`/f/index/feedlist?${requestBody({
      "is_new": 1,
      "tag_id": "like"
    })}`),
      /** 用户头像 */
      URL_profile: (portrait) => `https://gss0.baidu.com/7Ls0a8Sm2Q5IlBGlnYG/sys/portrait/item/${portrait}`,
      /** 当前登录用户信息 */
      userInfo: (serverTime) => fetch(`/f/user/json_userinfo?${requestBody({
      "_": serverTime
    })}`),
      /** 用户主页 */
      URL_userHome: (portrait) => `/home/main?id=${portrait}&fr=index`,
      /** 搜索建议 */
      suggestions: (query, encoding = "UTF-8", serverTime) => fetch(`/suggestion?${requestBody({
      "query": query,
      "ie": encoding,
      "_": serverTime
    })}`),
      /** 贴吧热议 */
      topicList: () => fetch("/hottopic/browse/topicList"),
      /** 吧跳转 */
      URL_forum: (keywords, encoding = "utf-8") => `/f?ie=${encoding}&kw=${keywords}`,
      /** 未读消息 */
      unreadMessages: (serverTime) => fetch(`/im/pcmsg/query/getAllUnread?${requestBody({
      "_": serverTime
    })}`),
      /** 收藏更新 */
      favUpdateNum: () => fetch("/sysmsg/userpost/queryStoreUpdateNum"),
      /** 获取 tbs */
      tbs: () => fetch("/dc/common/tbs"),
      /** imgtbs */
      imgtbs: () => fetch("/dc/common/imgtbs"),
      /** 获取已关注的吧 */
      followedForums: () => fetch("/mo/q/newmoindex"),
      /** 更详细的用户信息 */
      userInfoAll: (un, encoding = "UTF-8") => fetch(`/home/get/panel?${requestBody({
      "ie": encoding,
      "un": un
    })}`),
      /** 关注吧 */
      followForum: (tbs, forumId, forumName) => fetch(`/mo/q/favolike?${requestBody({
      "itb_tbs": tbs,
      "fid": forumId,
      "kw": forumName
    })}`),
      /** 取消关注吧 */
      unfollowForum: (tbs, forumName) => fetch(`/mo/q/delmylike?${requestBody({
      "itb_tbs": tbs,
      "forum_name": forumName
    })}`),
      /** 通过 `uid` 查找用户 */
      getUserFromUID: (uid) => fetch(`/im/pcmsg/query/getUserInfo?${requestBody({
      "chatUid": uid
    })}`),
      /** 一键签到（Web 端） */
      oneKeySign: () => fetch("/tbmall/onekeySignin1"),
      /** 热门动态 */
      hotFeeds: (un, pn, encoding = "utf-8", serverTime) => fetch(`/mo/q/newmoindex?${requestBody({
      "un": un,
      "pn": pn,
      "ie": encoding,
      "_": serverTime
    })}`),
      /** 获取当前页所有楼中楼数据 */
      totalComments: (timeStamp, tid, fid, pn, lzOnly = false) => fetch(`/p/totalComment?${requestBody({
      "t": timeStamp,
      "tid": tid,
      "fid": fid,
      "pn": pn,
      "see_lz": Number(lzOnly)
    })}`),
      /** 获取热门话题相关贴 */
      topicRelatedThreads: (topicName, page, lastId, topicId, sortType = 1) => fetch(`/hottopic/browse/getTopicRelateThread?${requestBody({
      "topic_name": topicName,
      "page_no": page,
      "last_id": lastId,
      "topic_id": topicId,
      "sort_type": sortType
    })}`),
      /** 将贴子添加到收藏 */
      addFavoritePost: (tbs, tid, fid, encoding = "utf-8") => fetch("/i/submit/open_storethread", {
        method: "POST",
        body: JSON.stringify({ tbs, tid, fid, encoding })
      }),
      forumSignInfo: (forumName, encoding = "utf-8") => fetch(`/sign/info?${requestBody({
      "kw": forumName,
      "ie": encoding
    })}`),
      forumLoadMonth: (forumName, encoding = "utf-8") => fetch(`/sign/loadmonth?${requestBody({
      "kw": forumName,
      "ie": encoding
    })}`),
      addFloor: (tbs, forum, forumId, threadId, content, floorNum, richText, ev = "comment", __type__ = "reply") => fetch("/f/commit/post/add", {
        method: "POST",
        body: JSON.stringify({
          "ie": "utf-8",
          "kw": forum,
          "fid": forumId,
          "tid": threadId,
          "floor_num": floorNum,
          "rich_text": Number(richText),
          "tbs": tbs,
          "content": content,
          "basilisk": 1,
          "nick_name": PageData.user.user_nickname,
          "ev": ev,
          "biz[po]": PageData.user.portrait.split("?")[0],
          "__type__": __type__,
          "geetest_success": 0
        })
      }),
      getThreadImages(threadId, lzOnly = false, prev = 15, next = 15, picId, fromPage = 0) {
        return fetch(`/photo/bw/picture/guide?${requestBody({
        tid: threadId,
        see_lz: +lzOnly,
        pic_id: picId ?? "",
        from_page: fromPage,
        prev,
        next
      })}`);
      }
    };
    function parsePostFromElement(elem) {
      const titleTagWrapperAnch = dom(".title-tag-wraper a", elem);
      const threadNameWrapper = elem.getElementsByClassName("thread-name-wraper")[0];
      const threadNameWrapperAnch = threadNameWrapper.getElementsByTagName("a")[0];
      const listPostNum = dom(".list-post-num em", threadNameWrapper);
      const imgs = dom("img:not(.nicknameEmoji)", elem, []);
      const nReply = elem.getElementsByClassName("n_reply")[0];
      const nReplyAnch = nReply.getElementsByTagName("a")[0];
      const imgArray = [];
      if (imgs.length > 0) {
        _2.forEach(imgs, (img) => {
          imgArray.push({
            thumb: img.src,
            original: img.getAttribute("original") ?? img.src
          });
        });
      }
      return {
        id: _2.defaultTo(elem.getAttribute("data-thread-id"), ""),
        forum: {
          id: _2.defaultTo(elem.getAttribute("data-forum-id"), ""),
          name: (titleTagWrapperAnch == null ? undefined : titleTagWrapperAnch.title) ?? "",
          href: (titleTagWrapperAnch == null ? undefined : titleTagWrapperAnch.href) ?? ""
        },
        author: {
          portrait: _2.split(nReplyAnch.href, /(\?id=)|&/)[2],
          name: transEmojiFromDOMString(nReplyAnch.innerHTML),
          href: nReplyAnch.href
        },
        time: _2.defaultTo(elem.getElementsByClassName("time")[0].textContent, ""),
        title: threadNameWrapperAnch.title,
        content: _2.defaultTo(elem.getElementsByClassName("n_txt")[0].textContent, ""),
        replies: _2.defaultTo(listPostNum == null ? undefined : listPostNum.getAttribute("data-num"), 0),
        images: imgArray
      };
    }
    function parsePostsFromString(responseString, callbackfn) {
      const feedList = [];
      const dom2 = new DOMParser().parseFromString(responseString, "text/html");
      const threads = dom2.getElementsByClassName("j_feed_li");
      const undesired = "home-place-item";
      _2.forEach(threads, (thread2) => {
        if (thread2.classList.contains(undesired)) return;
        const post = parsePostFromElement(thread2);
        feedList.push(post);
      });
      return feedList;
    }
    function transEmojiFromDOMString(str) {
      const indexRegex = new RegExp("(?<=nickemoji\\/).*?(?=.png)", "gi");
      if (!str.match(indexRegex)) return str;
      const emojis = [
        "º",
        "◎",
        "▫",
        "◆",
        "♤",
        "♀",
        "♂",
        "ლ",
        "♬",
        "☞",
        "☜",
        "✆",
        "☎",
        "♋",
        "Ω",
        "℃",
        "℉",
        "😄",
        "😍",
        "😘",
        "😚",
        "😜",
        "😳",
        "😁",
        "😞",
        "😢",
        "😂",
        "😫",
        "😨",
        "😱",
        "😡",
        "😷",
        "😲",
        "😈",
        "🐷",
        "🐶",
        "🐑",
        "🐵",
        "🐨",
        "🐴",
        "🐼",
        "🐯",
        "🍪",
        "🍺",
        "🍦",
        "🍭",
        "🍗",
        "🍼",
        "🔯",
        "🍒",
        "👀",
        "🐭",
        "😇",
        "😺",
        "😻",
        "🙀",
        "😿",
        "😹",
        "😾",
        "👹",
        "👺",
        "🌞",
        "🌝",
        "🌚",
        "🌜",
        "🌛",
        "👦",
        "👧",
        "🎎",
        "🌸",
        "🍀",
        "🌹",
        "🌻",
        "🌺",
        "🍁",
        "🌿",
        "🍄",
        "🌵",
        "🌴",
        "🌳",
        "🌰",
        "🌱",
        "🌼",
        "🌐",
        "🌙",
        "🌋",
        "🌌",
        "⛅",
        "⚡",
        "☔",
        "⛄",
        "🌀",
        "🌈",
        "🌊",
        "🔥",
        "✨",
        "🌟",
        "💥",
        "💫",
        "💢",
        "💦",
        "💧",
        "💤",
        "💨",
        "🎀",
        "🌂",
        "💄",
        "💕",
        "💖",
        "💞",
        "💘",
        "💌",
        "💋",
        "💝",
        "🎒",
        "🎓",
        "🎏",
        "🎃",
        "👻",
        "🎅",
        "🎄",
        "🎁",
        "🙈",
        "🐒",
        "💯",
        "👯",
        "💍"
      ];
      const transformed = [
        "1-1.png",
        "1-2.png",
        "1-4.png",
        "1-5.png",
        "1-6.png",
        "1-7.png",
        "1-8.png",
        "1-9.png",
        "1-10.png",
        "1-11.png",
        "1-12.png",
        "1-13.png",
        "1-14.png",
        "1-15.png",
        "1-16.png",
        "1-17.png",
        "1-18.png",
        "1-19.png",
        "1-20.png",
        "1-21.png",
        "1-22.png",
        "1-23.png",
        "1-24.png",
        "1-25.png",
        "1-26.png",
        "1-27.png",
        "1-28.png",
        "1-29.png",
        "1-30.png",
        "1-31.png",
        "1-32.png",
        "1-33.png",
        "1-34.png",
        "1-35.png",
        "2-1.png",
        "2-2.png",
        "2-3.png",
        "2-4.png",
        "2-5.png",
        "2-6.png",
        "2-7.png",
        "2-8.png",
        "2-9.png",
        "2-10.png",
        "2-11.png",
        "2-12.png",
        "2-13.png",
        "2-14.png",
        "2-15.png",
        "2-16.png",
        "2-17.png",
        "2-18.png",
        "2-19.png",
        "2-20.png",
        "2-21.png",
        "2-22.png",
        "2-23.png",
        "2-24.png",
        "2-25.png",
        "2-26.png",
        "2-27.png",
        "2-28.png",
        "2-29.png",
        "2-30.png",
        "2-31.png",
        "2-32.png",
        "2-33.png",
        "2-34.png",
        "2-35.png",
        "3-1.png",
        "3-2.png",
        "3-3.png",
        "3-4.png",
        "3-5.png",
        "3-6.png",
        "3-7.png",
        "3-8.png",
        "3-9.png",
        "3-10.png",
        "3-11.png",
        "3-12.png",
        "3-13.png",
        "3-14.png",
        "3-15.png",
        "3-16.png",
        "3-17.png",
        "3-18.png",
        "3-19.png",
        "3-20.png",
        "3-21.png",
        "3-22.png",
        "3-23.png",
        "3-24.png",
        "3-25.png",
        "3-26.png",
        "3-27.png",
        "3-28.png",
        "3-29.png",
        "3-30.png",
        "3-31.png",
        "3-32.png",
        "3-33.png",
        "3-34.png",
        "3-35.png",
        "4-1.png",
        "4-2.png",
        "4-3.png",
        "4-4.png",
        "4-5.png",
        "4-6.png",
        "4-7.png",
        "4-8.png",
        "4-9.png",
        "4-10.png",
        "4-11.png",
        "4-12.png",
        "4-13.png",
        "4-14.png",
        "4-15.png",
        "4-16.png",
        "4-17.png",
        "4-18.png",
        "4-19.png",
        "4-20.png",
        "4-21.png",
        "4-22.png",
        "4-23.png"
      ];
      const arrIndex = str.match(indexRegex);
      arrIndex == null ? undefined : arrIndex.forEach((index2) => {
        const emoji = emojis[transformed.indexOf(`${index2}.png`)];
        const arrInner = _2.split(str, RegExp(
          `<img[^>]*?${index2}.png(?:[^>]*?)*>`,
          "g"
        ));
        str = _2.join(arrInner, decodeURIComponent(emoji));
      });
      return str;
    }
    function levelToClass(level) {
      if (level < 0) return;
      if (level >= 1 && level <= 3) return "green";
      if (level >= 4 && level <= 9) return "blue";
      if (level >= 10 && level <= 15) return "yellow";
      if (level >= 16) return "orange";
    }
    async function getAllThreadImages(opts) {
      var _a, _b;
      const TIMEOUT = 3e3;
      if (currentStorage.has(THREAD_IMAGES)) {
        return currentStorage.get(THREAD_IMAGES);
      }
      const firstResponse = await requestInstance(tiebaAPI.getThreadImages(
        opts.threadId,
        opts.lzOnly
      ));
      const pictureList = picListConv(firstResponse.data.pic_list);
      const startTime = Date.now();
      if (pictureList.length < firstResponse.data.pic_amount) {
        let lastPicId = ((_a = _2(pictureList).last()) == null ? undefined : _a.pictureId) ?? "";
        let lastPostId = ((_b = _2(pictureList).last()) == null ? undefined : _b.postId) ?? 0;
        while (pictureList.length < firstResponse.data.pic_amount) {
          if (Date.now() - startTime > TIMEOUT) {
            userView.toast({
              type: "error",
              message: "获取贴子图片超时，请刷新后再试。"
            });
            return writeCurrent();
          }
          const response = await requestInstance(tiebaAPI.getThreadImages(
            opts.threadId,
            opts.lzOnly,
            0,
            firstResponse.data.pic_amount,
            lastPicId
          ));
          const newList = picListConv(response.data.pic_list);
          pictureList.push(..._2.slice(newList, _2.findLastIndex(newList, { pictureId: lastPicId, postId: lastPostId }) + 1));
          const lastItem = _2.last(newList);
          lastPicId = (lastItem == null ? undefined : lastItem.pictureId) ?? "";
          lastPostId = (lastItem == null ? undefined : lastItem.postId) ?? 0;
        }
      }
      return writeCurrent();
      function picListConv(picList) {
        return _2(picList).keys().sortBy((key) => parseInt(key.slice(1))).map((key) => {
          const value = picList[key];
          return {
            original: highQualityImage.get() ? value.img.original.waterurl : value.img.screen.waterurl,
            thumbnail: value.img.medium.url,
            pictureId: value.img.original.id,
            postId: value.post_id
          };
        }).value();
      }
      function writeCurrent() {
        currentStorage.set(THREAD_IMAGES, pictureList);
        return pictureList;
      }
    }
    const _sfc_main$d = {};
    const _hoisted_1$b = { class: "block-panel blur-if-custom-background" };
    function _sfc_render(_ctx, _cache) {
      return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$b, [
        vue.renderSlot(_ctx.$slots, "default")
      ]);
    }
    const BlockPanel = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render]]);
    /**
     * Flex Masonry
     * @author @HacksawBlade
     * @version 1.1
     * @license MIT
     */
    class FlexMasonry {
      constructor(options) {
        __publicField(this, "container");
        __publicField(this, "items");
        __publicField(this, "columnContainers", []);
        __publicField(this, "columnWidth");
        __publicField(this, "gap");
        __publicField(this, "options");
        __publicField(this, "containerSelector");
        __publicField(this, "itemsSelector");
        __publicField(this, "columnSelector", ".masonry-column");
        __publicField(this, "columnsHeight", []);
        __publicField(this, "fragment");
        /** 当前布局的列数 */
        __publicField(this, "_columns");
        options = parseOptions(options);
        this.container = (() => {
          if (typeof options.container === "string") {
            this.containerSelector = options.container;
            const _container = document.querySelector(options.container);
            if (_container) {
              return _container;
            } else {
              throw new Error("Can't find container element.");
            }
          } else {
            return options.container;
          }
        })();
        if (options.items) {
          this.items = (() => {
            if (typeof options.items === "string") {
              this.itemsSelector = options.items;
              const _items = document.querySelectorAll(options.items);
              if (_items) {
                return Array.from(_items);
              } else {
                return [];
              }
            } else {
              return options.items;
            }
          })().map((el) => {
            el.style.visibility = "hidden";
            return { element: el, cachedHeight: el.clientHeight };
          });
        } else {
          this.items = [];
        }
        this.columnWidth = options.columnWidth;
        if (options.gap) {
          if (Array.isArray(options.gap)) {
            this.gap = options.gap;
          } else {
            this.gap = [options.gap, options.gap];
          }
        } else {
          this.gap = [0, 0];
        }
        this._columns = 0;
        this.options = options;
        this.initStyle();
        if (options.autoExec) this.exec();
      }
      initStyle() {
        this.container.style.display = "flex";
        this.container.style.alignItems = "flex-start";
        this.container.style.justifyContent = "center";
        this.container.style.gap = `${this.gap[0]}px`;
      }
      get columns() {
        return this._columns;
      }
      /** 执行布局 */
      exec() {
        this.calcColumns();
        const originalPosition = window.scrollY;
        this.calc();
        this.layout();
        if (this.options.fixScrollOffset) window.scrollTo(0, originalPosition);
      }
      adjustWidth() {
        const elColumns = this.container.querySelectorAll(this.columnSelector);
        const width = (this.container.clientWidth - this.gap[0] * (this._columns - 1)) / this._columns;
        elColumns.forEach((el) => {
          el.style.width = `${width}px`;
        });
      }
      /** 仅计算布局 */
      calc() {
        this.columnsHeight = Array(this.calcColumns()).fill(0);
        const fragment = document.createDocumentFragment();
        const _col = this.container.querySelectorAll(this.columnSelector);
        _col.forEach((col) => {
          col.remove();
        });
        this.columnContainers.length = 0;
        for (let i = 0; i < this._columns; i++) {
          this.columnContainers.push(
            fragment.appendChild(createNewElement("div", {
              class: this.columnSelector.substring(1),
              style: `width: ${(this.container.clientWidth - this.gap[0] * (this._columns - 1)) / this._columns}px;`
            }))
          );
        }
        this.columnContainers.forEach((ccontainer) => {
          ccontainer.style.display = "flex";
          ccontainer.style.flexDirection = "column";
          ccontainer.style.gap = `${this.gap[1]}px`;
        });
        this.items.forEach((el) => {
          this._appendElement(el);
        });
        this.fragment = fragment;
      }
      /**
       * 仅应用布局
       * 
       * 调用该函数前需要已经至少计算过一次布局
       */
      layout() {
        if (this.fragment) {
          this.container.appendChild(this.fragment);
        } else {
          throw Error("Never conducted layout calculations before. You should use exec() or calc() first.");
        }
      }
      removeUnusedColumns() {
        const _col = this.container.querySelectorAll(this.columnSelector);
        _col.forEach((col) => {
          if (col.children.length === 0) col.remove();
        });
      }
      /** 
       * 清空布局中的所有 `items`
       *  
       * 该操作并不会将元素从文档中移除
       */
      clear() {
        this.items.length = 0;
        this.columnsHeight = Array(this.calcColumns()).fill(0);
      }
      /** 仅计算当前需要的列数 */
      calcColumns() {
        this._columns = Math.ceil((this.container.clientWidth - this.columnWidth) / (this.columnWidth + this.gap[0]));
        return this._columns;
      }
      /**
       * 向布局中加入元素
       * @param el 要添加的元素
       */
      appendElement(...elems) {
        const masonryElements = elems.map((el) => {
          return {
            element: el,
            cachedHeight: el.clientHeight
          };
        });
        this._appendElement(...masonryElements);
        this.items.push(...masonryElements);
      }
      _appendElement(...elems) {
        elems.forEach((el) => {
          const minIndex = this.columnsHeight.indexOf(Math.min(...this.columnsHeight));
          this.columnsHeight[minIndex] += el.cachedHeight;
          this.columnContainers[minIndex].appendChild(el.element);
          el.element.style.visibility = "visible";
          const clientHeight = this.columnContainers[minIndex].clientHeight;
          if (clientHeight !== 0) {
            this.columnsHeight[minIndex] = this.columnContainers[minIndex].clientHeight;
          }
        });
      }
      /**
       * 在原有子项的基础上追加子项
       * @param newItems 要添加的新元素，接受 CSS选择器
       * @param interval 插入每个元素间的时间间隔
       */
      append(newItems, interval) {
        const appended = (() => {
          if (newItems) {
            if (typeof newItems === "string") {
              const _items = document.querySelectorAll(newItems);
              return Array.from(_items);
            } else {
              return newItems;
            }
          } else {
            if (this.itemsSelector) {
              const _items = Array.from(document.querySelectorAll(this.itemsSelector));
              const appendCount = _items.length - this.items.length;
              if (appendCount > 0) {
                const _appended = _items.slice(-appendCount);
                return _appended;
              }
            }
          }
        })();
        if (appended) {
          if (!interval || interval <= 0) {
            appended.forEach((el) => {
              this.appendElement(el);
            });
          } else {
            appended.forEach((el, index2) => {
              setTimeout(() => {
                this.appendElement(el);
              }, interval * index2);
            });
          }
        }
      }
      refreshContainer() {
        if (this.containerSelector) {
          const newContainer = document.querySelector(this.containerSelector);
          if (newContainer) {
            this.container = newContainer;
          }
        }
      }
    }
    function parseOptions(options) {
      options.gap = options.gap || 0;
      options.autoExec = options.autoExec === undefined ? true : options.autoExec;
      options.fixScrollOffset = options.fixScrollOffset === undefined ? false : options.fixScrollOffset;
      return options;
    }
    function createNewElement(tag, attrs) {
      const el = document.createElement(tag);
      for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
      return el;
    }
    class FrameInterval {
      constructor(callback) {
        __publicField(this, "id");
        __publicField(this, "callback");
        __publicField(this, "thenfn", () => undefined);
        __publicField(this, "stopCondition");
        this.callback = callback ?? (() => undefined);
        this.stopCondition = () => false;
        this.id = requestAnimationFrame(this.tick.bind(this));
      }
      tick() {
        if (this.stopCondition()) {
          this.cancel();
          return;
        }
        this.callback();
        this.id = requestAnimationFrame(this.tick.bind(this));
      }
      cancel() {
        if (this.id) {
          cancelAnimationFrame(this.id);
          this.id = undefined;
        }
        this.thenfn();
      }
      until(stopCondition) {
        this.stopCondition = stopCondition;
        return this;
      }
      then(thenfn) {
        this.thenfn = thenfn;
      }
    }
    const _sfc_main$c = /* @__PURE__ */ vue.defineComponent({
      __name: "header-progress",
      props: {
        calc: { type: Function }
      },
      setup(__props) {
        const props = __props;
        const headerProgress2 = vue.ref();
        const valueRef = vue.ref(0);
        vue.onMounted(function() {
          if (headerProgress2.value) {
            new FrameInterval(calcValue).until(() => valueRef.value >= 100);
          }
        });
        function calcValue() {
          valueRef.value = props.calc();
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", {
            ref_key: "headerProgress",
            ref: headerProgress2,
            id: "header-progress",
            class: vue.normalizeClass({ "complete": valueRef.value >= 100 }),
            style: vue.normalizeStyle(`width: ${valueRef.value}vw;`)
          }, null, 6);
        };
      }
    });
    const HeaderProgress = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-782eb887"]]);
    function renderJSX(jsxel, parent) {
      vue.render(jsxel, parent);
      const root = parent.firstChild;
      return {
        root,
        vnode: jsxel,
        remove() {
          vue.render(null, parent);
          if (root.parentNode) root.remove();
        }
      };
    }
    function createJSXWrapper() {
      return domrd("div", {
        class: "jsx-wrapper"
      });
    }
    function insertJSX(jsxel, parent, position) {
      const jsxWrapper = createJSXWrapper();
      return renderJSX(jsxel, parent.insertBefore(jsxWrapper, position ?? null));
    }
    function appendJSX(jsxel, parent) {
      const jsxWrapper = createJSXWrapper();
      return renderJSX(jsxel, parent.appendChild(jsxWrapper));
    }
    function headerProgress(props, delay = 2e3, timeout = 1e4) {
      const progressBar = vue.createVNode(HeaderProgress, {
        "calc": props.calc
      }, null);
      const rendered = insertJSX(progressBar, document.body, document.body.firstChild ?? undefined);
      const timeoutTimer = setTimeout(() => {
        rendered.root.remove();
      }, timeout);
      waitUntil(() => rendered.root.style.width === "100vw", timeout).then(function() {
        setTimeout(() => {
          rendered.root.remove();
          clearTimeout(timeoutTimer);
        }, delay);
      });
      return rendered;
    }
    const shieldList = new UserKey(
      "shieldList",
      [],
      undefined,
      (maybeLegacy) => _2.map(maybeLegacy, shieldRuleMigration)
    );
    function matchShield(rule, str, scope) {
      if (!rule.toggle) return false;
      if (rule.scope !== scope) return false;
      if (rule.ignoreCase === undefined) rule.ignoreCase = true;
      if (rule.type === "text") {
        if (rule.ignoreCase) {
          rule.content = rule.content.toLowerCase();
          str = str.toLowerCase();
        }
        if (str.indexOf(rule.content) !== -1) {
          return true;
        }
      }
      if (rule.type === "regex") {
        let regex;
        if (rule.ignoreCase) {
          regex = new RegExp(rule.content, "i");
        } else {
          regex = new RegExp(rule.content);
        }
        if (regex.test(str)) {
          return true;
        }
      }
      return false;
    }
    function shieldRuleMigration(rule) {
      if (!_2.has(rule, "rule")) return rule;
      rule = rule;
      const newRule = {
        content: rule.rule,
        type: "text",
        scope: "content",
        toggle: rule.switch,
        ignoreCase: rule.ignoreCase,
        matchHTML: rule.matchHTML
      };
      if (rule.type === "string") newRule.type = "text";
      if (rule.scope === "posts") newRule.scope = "content";
      if (rule.scope === "users") newRule.scope = "username";
      return newRule;
    }
    const _hoisted_1$a = {
      id: "shield-editor"
    };
    const _hoisted_2$a = {
      id: "shield-editor-rule-control"
    };
    const _hoisted_3$8 = {
      id: "shield-editor-toggle-control"
    };
    const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
      __name: "shield-editor",
      props: {
        rule: {}
      },
      setup(__props) {
        const props = __props;
        const dialog = vue.ref();
        const useRegex = vue.ref(props.rule.type === "regex");
        const userScope = vue.ref(props.rule.scope === "username");
        const ruleRef = vue.ref({
          ...props.rule
        });
        function keyPressHandler(e) {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }
        function submit() {
          var _a;
          const newRule = {
            ...ruleRef.value,
            type: useRegex.value ? "regex" : "text",
            scope: userScope.value ? "username" : "content"
          };
          (_a = dialog.value) == null ? undefined : _a.unload(newRule);
        }
        function unload() {
          var _a;
          (_a = dialog.value) == null ? undefined : _a.unload({
            ...props.rule
          });
        }
        function deleteRule() {
          var _a;
          (_a = dialog.value) == null ? undefined : _a.unload();
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createBlock(vue.unref(userView.UserDialog), {
            ref_key: "dialog",
            ref: dialog,
            title: "编辑",
            "dialog-buttons": [{
              text: "确定",
              event: submit,
              style: "themed"
            }, {
              text: "取消",
              event: unload
            }],
            "default-payload": {
              ...props.rule
            }
          }, {
            default: vue.withCtx(() => [vue.createElementVNode("div", _hoisted_1$a, [vue.createElementVNode("div", _hoisted_2$a, [_cache[4] || (_cache[4] = vue.createElementVNode("label", {
              for: "shield-editor-rule"
            }, "规则", -1)), vue.createVNode(vue.unref(userView.UserTextbox), {
              modelValue: ruleRef.value.content,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => ruleRef.value.content = $event),
              id: "shield-editor-rule",
              "muti-lines": "",
              onKeypress: keyPressHandler
            }, null, 8, ["modelValue"])]), vue.createElementVNode("div", _hoisted_3$8, [vue.createVNode(vue.unref(userView.UserCheck), {
              modelValue: ruleRef.value.toggle,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => ruleRef.value.toggle = $event),
              id: "shield-editor-toggle",
              text: "启用"
            }, null, 8, ["modelValue"]), vue.createVNode(vue.unref(userView.UserCheck), {
              modelValue: useRegex.value,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => useRegex.value = $event),
              id: "shield-editor-regex",
              text: "正则表达式"
            }, null, 8, ["modelValue"]), vue.createVNode(vue.unref(userView.UserCheck), {
              modelValue: userScope.value,
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => userScope.value = $event),
              id: "shield-editor-user",
              text: "屏蔽用户名"
            }, null, 8, ["modelValue"])]), vue.createVNode(vue.unref(userView.UserButton), {
              id: "shield-editor-delete",
              onClick: deleteRule
            }, {
              default: vue.withCtx(() => _cache[5] || (_cache[5] = [vue.createTextVNode("删除规则")])),
              _: 1
            })])]),
            _: 1
          }, 8, ["dialog-buttons", "default-payload"]);
        };
      }
    });
    const ShieldEditor = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-bf172916"]]);
    const _hoisted_1$9 = {
      class: "shield-container"
    };
    const _hoisted_2$9 = {
      key: 0,
      class: "words-container"
    };
    const _hoisted_3$7 = {
      class: "icon"
    };
    const _hoisted_4$6 = {
      class: "content"
    };
    const _hoisted_5$4 = {
      key: 1,
      class: "empty-list-container"
    };
    const _hoisted_6$3 = {
      class: "shield-controls"
    };
    const _hoisted_7$2 = {
      class: "submit-controls"
    };
    const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
      __name: "module.shield",
      setup(__props) {
        const shieldListRef = vue.ref(shieldList.get());
        const inputRule = vue.ref("");
        const useRegex = vue.ref(false);
        const userScope = vue.ref(false);
        function inputKeyPress(e) {
          if (e.key === "Enter") {
            e.preventDefault();
            updateShieldList();
          }
        }
        function editRule(rule, index2) {
          renderDialog(ShieldEditor, {
            rule
          }, {
            unloaded(rule2) {
              if (!rule2) {
                shieldListRef.value.splice(index2, 1);
                shieldList.set(shieldListRef.value);
                return;
              }
              shieldListRef.value[index2] = rule2;
              shieldList.set(shieldListRef.value);
            }
          });
        }
        function removeAll() {
          shieldListRef.value.length = 0;
          shieldList.remove();
        }
        async function removeAllWithConfirm() {
          if (await userView.messageBox({
            content: "该操作将无法恢复，确定要删除所有屏蔽规则吗？",
            type: "forceTrueFalse"
          }) === "positive") {
            removeAll();
          }
        }
        function updateShieldList() {
          if (inputRule.value.length <= 0) return;
          const rule = {
            content: inputRule.value,
            type: useRegex.value ? "regex" : "text",
            scope: userScope.value ? "username" : "content",
            toggle: true
          };
          shieldListRef.value.push(rule);
          inputRule.value = "";
          shieldList.set(shieldListRef.value);
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$9, [shieldListRef.value.length > 0 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$9, [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(shieldListRef.value, (sh, index2) => {
            return vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
              class: vue.normalizeClass(["shield-elem", {
                "content-scope": sh.scope === "content",
                "user-scope": sh.scope === "username",
                "disabled": !sh.toggle
              }]),
              onClick: ($event) => editRule(sh, index2)
            }, {
              default: vue.withCtx(() => [vue.createElementVNode("div", _hoisted_3$7, vue.toDisplayString(sh.scope === "content" ? "chat" : "account_circle"), 1), vue.createElementVNode("p", _hoisted_4$6, vue.toDisplayString(sh.content), 1)]),
              _: 2
            }, 1032, ["class", "onClick"]);
          }), 256)), vue.createVNode(vue.unref(userView.UserButton), {
            class: "remove-all shield-elem icon",
            onClick: removeAllWithConfirm
          }, {
            default: vue.withCtx(() => _cache[3] || (_cache[3] = [vue.createTextVNode("delete")])),
            _: 1
          })])) : (vue.openBlock(), vue.createElementBlock("div", _hoisted_5$4, "当前没有记录屏蔽规则")), vue.createElementVNode("div", _hoisted_6$3, [vue.createVNode(vue.unref(userView.UserTextbox), {
            modelValue: inputRule.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => inputRule.value = $event),
            "muti-lines": "",
            class: "shield-input",
            placeholder: "输入屏蔽规则，按下 [ENTER] 提交。",
            onKeypress: inputKeyPress
          }, null, 8, ["modelValue"]), vue.createElementVNode("div", _hoisted_7$2, [vue.createVNode(vue.unref(userView.UserCheck), {
            modelValue: useRegex.value,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => useRegex.value = $event),
            id: "use-regex",
            text: "正则表达式"
          }, null, 8, ["modelValue"]), vue.createVNode(vue.unref(userView.UserCheck), {
            modelValue: userScope.value,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => userScope.value = $event),
            id: "user-scope",
            text: "屏蔽用户名"
          }, null, 8, ["modelValue"]), vue.createVNode(vue.unref(userView.UserButton), {
            class: "submit-button",
            "shadow-border": true,
            "theme-style": true,
            onClick: updateShieldList
          }, {
            default: vue.withCtx(() => _cache[4] || (_cache[4] = [vue.createTextVNode("确定 ")])),
            _: 1
          })])])]);
        };
      }
    });
    const moduleShieldVue = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-5a687904"]]);
    const index$f = {
      id: "shield",
      name: "贴吧屏蔽",
      author: "锯条",
      version: "1.2",
      brief: "眼不见为净",
      description: `用户自定义屏蔽规则，符合规则的贴子和楼层将不会显示在首页、看贴页面和进吧页面。支持正则匹配`,
      scope: true,
      runAt: "immediately",
      settings: {
        "shield-controls": {
          title: "管理屏蔽规则",
          description: `这些屏蔽规则将会在首页、看贴页面生效，会自动隐藏所有符合匹配规则的贴子和楼层。`,
          widgets: [{
            type: "component",
            component: vue.markRaw(moduleShieldVue)
          }]
        }
      },
      entry: main$6
    };
    function shieldBySelector(observer, scope, parentSelector, subSelector) {
      observer.addEvent(() => {
        dom(parentSelector, []).forEach((elem) => {
          let isMatch = false;
          const content = _2.join(_2.map(dom(subSelector, elem, []), (el) => el.textContent ?? ""), "\n");
          for (const rule of shieldList.get()) {
            if (matchShield(rule, content, scope)) {
              isMatch = true;
              break;
            }
          }
          if (isMatch) {
            elem.style.display = "none";
          }
        });
      });
    }
    function main$6() {
      shieldBySelector(threadFloorsObserver, "content", ".l_post_bright", ".d_post_content");
      shieldBySelector(threadFloorsObserver, "username", ".l_post_bright", ".p_author_name");
      shieldBySelector(threadCommentsObserver, "content", ".lzl_single_post", ".lzl_content_main");
      shieldBySelector(threadCommentsObserver, "username", ".lzl_single_post", ".lzl_cnt .j_user_card");
      shieldBySelector(legacyIndexFeedsObserver, "content", ".j_feed_li", ".title, .n_txt");
      shieldBySelector(legacyIndexFeedsObserver, "username", ".j_feed_li", ".post_author");
      shieldBySelector(forumThreadsObserver, "content", ".j_thread_list", ".threadlist_title a");
      shieldBySelector(forumThreadsObserver, "username", ".j_thread_list", ".frs-author-name-wrap");
    }
    const index$g = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: index$f,
      matchShield,
      shieldList,
      shieldRuleMigration
    }, Symbol.toStringTag, { value: "Module" }));
    class EventProxy {
      constructor() {
        __publicField(this, "records", []);
      }
      /**
       * 注册事件
       * @param target 事件目标
       * @param type 事件类型
       * @param callback 事件回调函数
       * @param options 选项
       */
      on(target, type, callback, options) {
        if (!target) return;
        target.addEventListener(type, callback, options);
        this.records.push({ target, type, callback, options });
      }
      /** 销毁通过该代理注册的所有事件 */
      release() {
        _2.forEach(this.records, ({ target, type, callback, options }) => {
          target.removeEventListener(type, callback, options);
        });
        this.records = [];
      }
    }
    const _hoisted_1$8 = { class: "image-loading-spinner" };
    const _hoisted_2$8 = ["src"];
    const _hoisted_3$6 = { class: "zoom-size" };
    const _hoisted_4$5 = ["data-lazyload", "onClick"];
    const MIN_SIZE = 0.1;
    const MAX_SIZE = 8;
    const DEFAULT_HIDE_CONTROLS_DELAY = 3e3;
    const SHOW_CONTROLS_THRESHOLD_X = 180;
    const SHOW_CONTROLS_THRESHOLD_Y = 140;
    const UI_RESERVED_HEIGHT = 160;
    const UI_RESERVED_WIDTH = 200;
    const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
      __name: "images-viewer",
      props: {
        content: {},
        defaultIndex: { default: 0 }
      },
      setup(__props) {
        const props = __props;
        const imageArray = [];
        const thumbArray = [];
        if (typeof props.content === "string") {
          imageArray.push(props.content);
          thumbArray.push(props.content);
        } else if (Array.isArray(props.content)) {
          if (typeof props.content[0] === "string") {
            imageArray.push(...props.content);
            thumbArray.push(...props.content);
          } else {
            _2.forEach(props.content, (value) => {
              imageArray.push(value.original);
              thumbArray.push(value.thumbnail);
            });
          }
        } else {
          _2.forEach(props.content.images, (value) => {
            imageArray.push(value.original);
            thumbArray.push(value.thumb);
          });
        }
        const dialog = vue.ref();
        const imagesViewer2 = vue.ref();
        const imageContainer = vue.ref();
        const currImage = vue.ref();
        const bottomPanel = vue.ref();
        const bottomContainerRef = vue.ref();
        const thumbContainer = vue.ref();
        const scrollBar = vue.ref();
        const curr = vue.ref(props.defaultIndex);
        const scale = vue.ref(1);
        const deg = vue.ref(0);
        const imageLeft = vue.ref(undefined);
        const imageTop = vue.ref(undefined);
        const naturalSize = vue.ref({ width: 0, height: 0 });
        const showControls = vue.ref({
          left: false,
          right: false,
          top: false,
          bottom: false
        });
        const lockControls = vue.ref({
          left: false,
          right: false,
          top: false,
          bottom: false
        });
        const loading = vue.ref(true);
        const disableImageTransition = vue.ref(false);
        const isScrollDragging = vue.ref(false);
        const imageStyle = vue.computed(() => {
          const w = naturalSize.value.width * scale.value;
          const h = naturalSize.value.height * scale.value;
          return {
            width: w ? `${w}px` : undefined,
            height: h ? `${h}px` : undefined,
            transform: `rotate(${deg.value}deg)`,
            left: imageLeft.value === undefined ? undefined : `${imageLeft.value}px`,
            top: imageTop.value === undefined ? undefined : `${imageTop.value}px`,
            transition: disableImageTransition.value ? "none" : "width 0.4s ease, height 0.4s ease, transform 0.4s ease, left 0s, top 0s"
          };
        });
        const dialogOpts = {
          blurEffect: false,
          shadowMode: true,
          contentStyle: {
            width: "100%",
            height: "100%",
            padding: "0"
          },
          // 透明化 user-dialog 容器，去除其默认白底/边框/圆角，避免出现"圆角矩形白底"
          containerStyle: {
            background: "transparent",
            border: "none",
            boxShadow: "none",
            margin: "0",
            borderRadius: "0",
            padding: "0"
          },
          // Vercel 主题：接管 modal mask 颜色 + 渐暗动画
          ...styleTheme.get() === "vercel" ? {
            modalStyle: {
              backgroundColor: "rgb(0 0 0 / 92%)",
              animation: "kf-viewer-mask-fade 0.25s ease both"
            }
          } : {},
          renderAnimation: "kf-fade-in var(--fast-duration)",
          unloadAnimation: "kf-fade-out var(--fast-duration)",
          uniqueName: "images-viewer"
        };
        const evproxy = new EventProxy();
        let lastMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let lastControlTimeout = {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        };
        let thumbLazyloadObserver;
        vue.onMounted(async () => {
          var _a;
          await vue.nextTick();
          const currentBottom = dom(".bottom-btn", thumbContainer.value, [])[props.defaultIndex];
          currentBottom == null ? undefined : currentBottom.scrollIntoView({
            inline: "center"
          });
          let offsetX = 0, offsetY = 0;
          evproxy.on(window, "mousemove", _2.throttle(function(e) {
            const { clientX, clientY } = e;
            lastMousePos = { x: clientX, y: clientY };
            showControls.value = verifyPos();
          }, 100, { leading: true }));
          lockControlsTemporarily("all", DEFAULT_HIDE_CONTROLS_DELAY);
          evproxy.on(imagesViewer2.value, "wheel", imageWheel, { passive: true });
          evproxy.on(currImage.value, "mousedown", (e) => {
            if (!currImage.value) return;
            e.preventDefault();
            offsetX = e.clientX - currImage.value.offsetLeft;
            offsetY = e.clientY - currImage.value.offsetTop;
            document.addEventListener("mousemove", moveHandler);
          });
          evproxy.on(document, "mouseup", (e) => {
            e.preventDefault();
            document.removeEventListener("mousemove", moveHandler);
          });
          evproxy.on(currImage.value, "load", function() {
            if (!currImage.value) return;
            naturalSize.value = {
              width: currImage.value.naturalWidth,
              height: currImage.value.naturalHeight
            };
            (() => {
              const availableW = window.innerWidth - UI_RESERVED_WIDTH;
              const availableH = window.innerHeight - UI_RESERVED_HEIGHT;
              if (currImage.value.naturalHeight < availableH && currImage.value.naturalWidth < availableW) {
                scale.value = 1;
                return;
              }
              scale.value = Math.min(
                availableW / currImage.value.naturalWidth,
                availableH / currImage.value.naturalHeight
              );
            })();
            syncImagePosition();
            loading.value = false;
            vue.nextTick(() => {
              var _a2;
              (_a2 = currImage.value) == null ? undefined : _a2.classList.remove("changing");
            });
          });
          evproxy.on(currImage.value, "transitionend", function() {
            var _a2, _b, _c;
            if (Math.abs(deg.value) >= 360) {
              (_a2 = currImage.value) == null ? undefined : _a2.classList.add("changing");
              deg.value = Math.abs(deg.value) % 360;
              (_b = currImage.value) == null ? undefined : _b.offsetHeight;
              (_c = currImage.value) == null ? undefined : _c.classList.remove("changing");
            }
          });
          thumbLazyloadObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.src = entry.target.dataset.lazyload ?? "";
                thumbLazyloadObserver.unobserve(entry.target);
              }
            });
          });
          if (bottomPanel.value) {
            dom("img", bottomPanel.value, []).forEach((img) => {
              thumbLazyloadObserver.observe(img);
            });
          }
          syncScrollBar();
          evproxy.on(bottomContainerRef.value, "scroll", syncScrollBar, { passive: true });
          evproxy.on(bottomPanel.value, "wheel", (e) => {
            e.stopPropagation();
            if (!bottomContainerRef.value) return;
            if (e.deltaX === 0 && e.deltaY !== 0) {
              bottomContainerRef.value.scrollBy({
                left: e.deltaY
              });
            } else if (e.deltaX !== 0 && e.deltaY === 0) {
              bottomContainerRef.value.scrollBy({
                left: e.deltaX
              });
            }
          }, { passive: false });
          function moveHandler(e) {
            if (!currImage.value) return;
            imageLeft.value = e.clientX - offsetX;
            imageTop.value = e.clientY - offsetY;
          }
          if (((_a = currImage.value) == null ? undefined : _a.complete) && currImage.value.naturalHeight > 0) {
            currImage.value.dispatchEvent(new Event("load"));
          }
        });
        vue.onUnmounted(function() {
          evproxy.release();
          thumbLazyloadObserver.disconnect();
          if (imageTransitionTimer) {
            clearTimeout(imageTransitionTimer);
          }
        });
        vue.watch(curr, function() {
          var _a;
          loading.value = true;
          (_a = currImage.value) == null ? undefined : _a.classList.add("changing");
          deg.value = 0;
          disableImageTransition.value = false;
          imageLeft.value = undefined;
          imageTop.value = undefined;
          naturalSize.value = { width: 0, height: 0 };
        });
        function unload() {
          var _a;
          (_a = dialog.value) == null ? undefined : _a.unload();
        }
        function listBack() {
          if (curr.value > 0) curr.value--;
        }
        function listForward() {
          if (curr.value < imageArray.length - 1) curr.value++;
        }
        function zoomImage(delta, anchor = getDefaultZoomAnchor()) {
          if (!currImage.value || !imageContainer.value) return;
          suspendImageTransition();
          const nextScale = _2.clamp(scale.value + delta, MIN_SIZE, MAX_SIZE);
          if (nextScale === scale.value) return;
          const currentMetrics = getImageMetrics();
          if (!anchor) {
            scale.value = nextScale;
            const centeredMetrics = getImageMetrics(nextScale);
            imageLeft.value = centeredMetrics.left;
            imageTop.value = centeredMetrics.top;
            return;
          }
          const containerRect = imageContainer.value.getBoundingClientRect();
          if (!currentMetrics.width || !currentMetrics.height) {
            scale.value = nextScale;
            return;
          }
          const imageLeftPx = containerRect.left + currentMetrics.left;
          const imageTopPx = containerRect.top + currentMetrics.top;
          const anchorX = _2.clamp(anchor.x, imageLeftPx, imageLeftPx + currentMetrics.width);
          const anchorY = _2.clamp(anchor.y, imageTopPx, imageTopPx + currentMetrics.height);
          const zoomRatioX = _2.clamp((anchorX - imageLeftPx) / currentMetrics.width, 0, 1);
          const zoomRatioY = _2.clamp((anchorY - imageTopPx) / currentMetrics.height, 0, 1);
          const nextWidth = naturalSize.value.width * nextScale;
          const nextHeight = naturalSize.value.height * nextScale;
          scale.value = nextScale;
          imageLeft.value = currentMetrics.left - (nextWidth - currentMetrics.width) * zoomRatioX;
          imageTop.value = currentMetrics.top - (nextHeight - currentMetrics.height) * zoomRatioY;
        }
        function rotateImage(delta) {
          deg.value += delta;
        }
        function imageWheel(e) {
          if (!currImage.value) return;
          zoomImage(-e.deltaY / 1e3, { x: e.clientX, y: e.clientY });
        }
        function getDefaultZoomAnchor() {
          var _a;
          const containerRect = (_a = imageContainer.value) == null ? undefined : _a.getBoundingClientRect();
          if (!containerRect) return undefined;
          const metrics = getImageMetrics();
          return {
            x: containerRect.left + metrics.left + metrics.width / 2,
            y: containerRect.top + metrics.top + metrics.height / 2
          };
        }
        function getImageMetrics(scaleOverride = scale.value) {
          var _a;
          const containerRect = (_a = imageContainer.value) == null ? undefined : _a.getBoundingClientRect();
          const width = naturalSize.value.width * scaleOverride;
          const height = naturalSize.value.height * scaleOverride;
          const centeredLeft = containerRect ? (containerRect.width - width) / 2 : 0;
          const centeredTop = containerRect ? (containerRect.height - height) / 2 : 0;
          return {
            width,
            height,
            left: imageLeft.value ?? centeredLeft,
            top: imageTop.value ?? centeredTop
          };
        }
        function syncImagePosition() {
          if (!imageContainer.value) return;
          const metrics = getImageMetrics();
          imageLeft.value = metrics.left;
          imageTop.value = metrics.top;
        }
        let imageTransitionTimer = 0;
        function suspendImageTransition(timeout = 80) {
          disableImageTransition.value = true;
          if (imageTransitionTimer) {
            clearTimeout(imageTransitionTimer);
          }
          imageTransitionTimer = window.setTimeout(() => {
            disableImageTransition.value = false;
          }, timeout);
        }
        function clickModal(e) {
          if (e.target === imageContainer.value) {
            unload();
          }
        }
        function syncScrollBar() {
          const container = bottomContainerRef.value;
          const bar = scrollBar.value;
          if (!container || !bar) return;
          const ratio = container.clientWidth / container.scrollWidth;
          if (ratio >= 1) {
            bar.style.display = "none";
            return;
          }
          bar.style.display = "";
          bar.style.width = `${ratio * 100}%`;
          const maxScroll = container.scrollWidth - container.clientWidth;
          const progress = maxScroll === 0 ? 0 : container.scrollLeft / maxScroll;
          bar.style.left = `${progress * (100 - ratio * 100)}%`;
        }
        function onScrollBarMouseDown(e) {
          const container = bottomContainerRef.value;
          const bar = scrollBar.value;
          const wrapper = bottomPanel.value;
          if (!container || !bar || !wrapper) return;
          e.preventDefault();
          e.stopPropagation();
          isScrollDragging.value = true;
          lockControls.value.bottom = true;
          const wrapperRect = wrapper.getBoundingClientRect();
          const barRect = bar.getBoundingClientRect();
          const grabOffset = e.clientX >= barRect.left && e.clientX <= barRect.right ? e.clientX - barRect.left : barRect.width / 2;
          function setScrollFromClientX(clientX) {
            if (!container || !bar) return;
            const trackWidth = wrapperRect.width - bar.offsetWidth;
            if (trackWidth <= 0) return;
            const x = _2.clamp(clientX - wrapperRect.left - grabOffset, 0, trackWidth);
            const progress = x / trackWidth;
            const maxScroll = container.scrollWidth - container.clientWidth;
            container.scrollLeft = progress * maxScroll;
          }
          setScrollFromClientX(e.clientX);
          const onMove = (ev) => setScrollFromClientX(ev.clientX);
          const onUp = () => {
            isScrollDragging.value = false;
            lockControls.value.bottom = false;
            showControls.value = verifyPos();
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
          };
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
        }
        function lockControlsTemporarily(direction, timeout) {
          {
            lock("left");
            lock("right");
            lock("top");
            lock("bottom");
          }
          function lock(direction2) {
            lockControls.value[direction2] = true;
            if (lastControlTimeout[direction2]) {
              clearTimeout(lastControlTimeout[direction2]);
            }
            showControls.value[direction2] = true;
            lastControlTimeout[direction2] = setTimeout(() => {
              lockControls.value[direction2] = false;
              showControls.value = verifyPos();
            }, timeout);
          }
        }
        function verifyPos(pos = lastMousePos) {
          const distanceToLeft = pos.x;
          const distanceToRight = window.innerWidth - pos.x;
          const distanceToTop = pos.y;
          const distanceToBottom = window.innerHeight - pos.y;
          const calcValue = {
            left: false,
            right: false,
            top: false,
            bottom: false
          };
          distanceToLeft <= SHOW_CONTROLS_THRESHOLD_X || lockControls.value.left ? calcValue.left = true : calcValue.left = false;
          distanceToRight <= SHOW_CONTROLS_THRESHOLD_X || lockControls.value.right ? calcValue.right = true : calcValue.right = false;
          distanceToTop <= SHOW_CONTROLS_THRESHOLD_Y || lockControls.value.top ? calcValue.top = true : calcValue.top = false;
          distanceToBottom <= SHOW_CONTROLS_THRESHOLD_Y || lockControls.value.bottom ? calcValue.bottom = true : calcValue.bottom = false;
          return calcValue;
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createBlock(vue.unref(userView.UserDialog), vue.mergeProps({
            ref_key: "dialog",
            ref: dialog
          }, dialogOpts), {
            default: vue.withCtx(() => [
              vue.createElementVNode("div", {
                ref_key: "imagesViewer",
                ref: imagesViewer2,
                class: "images-viewer",
                onClick: clickModal
              }, [
                vue.createElementVNode("div", {
                  ref_key: "imageContainer",
                  ref: imageContainer,
                  class: "image-container dialog-toggle"
                }, [
                  vue.withDirectives(vue.createElementVNode("div", _hoisted_1$8, null, 512), [
                    [vue.vShow, loading.value]
                  ]),
                  vue.createElementVNode("img", {
                    ref_key: "currImage",
                    ref: currImage,
                    class: vue.normalizeClass(["curr-image changing", { "loading-img": loading.value }]),
                    src: imageArray[curr.value],
                    style: vue.normalizeStyle(vue.unref(parseCSSRule)(imageStyle.value))
                  }, null, 14, _hoisted_2$8)
                ], 512),
                vue.createElementVNode("div", {
                  class: vue.normalizeClass(["control-panel head-controls", { "hide": !showControls.value.top }])
                }, [
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "zoom-in head-btn icon",
                    title: "缩小",
                    onClick: _cache[0] || (_cache[0] = ($event) => zoomImage(0.5))
                  }, {
                    default: vue.withCtx(() => _cache[4] || (_cache[4] = [
                      vue.createTextVNode(" zoom_in ")
                    ])),
                    _: 1
                  }),
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "zoom-out head-btn icon",
                    title: "放大",
                    onClick: _cache[1] || (_cache[1] = ($event) => zoomImage(-0.5))
                  }, {
                    default: vue.withCtx(() => _cache[5] || (_cache[5] = [
                      vue.createTextVNode(" zoom_out ")
                    ])),
                    _: 1
                  }),
                  vue.createElementVNode("span", _hoisted_3$6, vue.toDisplayString(vue.unref(_2).round(scale.value * 100) + "%"), 1),
                  _cache[9] || (_cache[9] = vue.createElementVNode("span", { class: "head-sep" }, "|", -1)),
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "turn-left head-btn icon",
                    title: "逆时针旋转",
                    onClick: _cache[2] || (_cache[2] = ($event) => rotateImage(-90))
                  }, {
                    default: vue.withCtx(() => _cache[6] || (_cache[6] = [
                      vue.createTextVNode(" undo ")
                    ])),
                    _: 1
                  }),
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "turn-right head-btn icon",
                    title: "顺时针旋转",
                    onClick: _cache[3] || (_cache[3] = ($event) => rotateImage(90))
                  }, {
                    default: vue.withCtx(() => _cache[7] || (_cache[7] = [
                      vue.createTextVNode(" redo ")
                    ])),
                    _: 1
                  }),
                  _cache[10] || (_cache[10] = vue.createElementVNode("span", { class: "head-sep" }, "|", -1)),
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "close head-btn icon",
                    title: "关闭",
                    onClick: unload
                  }, {
                    default: vue.withCtx(() => _cache[8] || (_cache[8] = [
                      vue.createTextVNode(" close ")
                    ])),
                    _: 1
                  })
                ], 2),
                imageArray.length > 1 ? (vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                  key: 0,
                  class: vue.normalizeClass(["control-panel back icon", { "hide": !showControls.value.left }]),
                  title: "上一张",
                  onClick: listBack
                }, {
                  default: vue.withCtx(() => _cache[11] || (_cache[11] = [
                    vue.createTextVNode(" chevron_left ")
                  ])),
                  _: 1
                }, 8, ["class"])) : vue.createCommentVNode("", true),
                imageArray.length > 1 ? (vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                  key: 1,
                  class: vue.normalizeClass(["control-panel forward icon", { "hide": !showControls.value.right }]),
                  title: "下一张",
                  onClick: listForward
                }, {
                  default: vue.withCtx(() => _cache[12] || (_cache[12] = [
                    vue.createTextVNode(" chevron_right ")
                  ])),
                  _: 1
                }, 8, ["class"])) : vue.createCommentVNode("", true),
                vue.createElementVNode("div", {
                  ref_key: "bottomPanel",
                  ref: bottomPanel,
                  class: vue.normalizeClass(["control-panel bottom-controls-wrapper", { "hide": !showControls.value.bottom }])
                }, [
                  vue.createElementVNode("div", {
                    ref_key: "bottomContainerRef",
                    ref: bottomContainerRef,
                    class: "bottom-controls-container"
                  }, [
                    vue.createElementVNode("div", {
                      ref_key: "thumbContainer",
                      ref: thumbContainer,
                      class: "thumb-container"
                    }, [
                      (vue.openBlock(), vue.createElementBlock(vue.Fragment, null, vue.renderList(thumbArray, (thumb, index2) => {
                        return vue.createVNode(vue.unref(userView.UserButton), {
                          class: vue.normalizeClass(["bottom-btn", { "selected": index2 === curr.value }]),
                          "no-border": "all"
                        }, {
                          default: vue.withCtx(() => [
                            vue.createElementVNode("img", {
                              class: "image-list",
                              alt: "",
                              "data-lazyload": thumb,
                              onClick: ($event) => curr.value = index2
                            }, null, 8, _hoisted_4$5)
                          ]),
                          _: 2
                        }, 1032, ["class"]);
                      }), 64))
                    ], 512)
                  ], 512),
                  vue.createElementVNode("div", {
                    ref_key: "scrollBar",
                    ref: scrollBar,
                    class: vue.normalizeClass(["bottom-panel-scroll-bar", { "dragging": isScrollDragging.value }]),
                    onMousedown: onScrollBarMouseDown
                  }, null, 34)
                ], 2)
              ], 512)
            ]),
            _: 1
          }, 16);
        };
      }
    });
    const ImagesViewer = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-a7d6dda9"]]);
    function openThreadImages(tid, defaultIndex = 0) {
      const cache = currentStorage.get(HOME_FEED_IMAGES);
      if (!_2.isNil(cache) && !_2.isNil(cache[tid])) {
        const cached = cache[tid];
        if (cached.length > 0) {
          imagesViewer({ content: cached, defaultIndex });
        }
        return;
      }
      void (async () => {
        var _a;
        try {
          const response = await (await tiebaAPI.getThreadImages(tid, true)).json();
          const picList = (_a = response == null ? void 0 : response.data) == null ? void 0 : _a.pic_list;
          const pictureList = _2(picList ?? {}).keys().sortBy((key) => parseInt(key.slice(1))).map((key) => {
            const value = picList[key];
            return {
              original: highQualityImage.get() ? value.img.original.waterurl : value.img.screen.waterurl,
              thumbnail: value.img.medium.url
            };
          }).value();
          currentStorage.set(HOME_FEED_IMAGES, {
            ...currentStorage.get(HOME_FEED_IMAGES),
            [tid]: pictureList
          });
          if (pictureList.length > 0) {
            imagesViewer({ content: pictureList, defaultIndex });
          }
        } catch (err) {
          currentStorage.set(HOME_FEED_IMAGES, {
            ...currentStorage.get(HOME_FEED_IMAGES),
            [tid]: []
          });
          console.warn("[Tieba-Remix] 拉取帖子图片失败:", err);
        }
      })();
    }
    function imagesViewer(opts) {
      const savedX = window.scrollX;
      const savedY = window.scrollY;
      const body = document.body;
      const prev = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width
      };
      body.style.position = "fixed";
      body.style.top = `-${savedY}px`;
      body.style.left = `-${savedX}px`;
      body.style.right = "0";
      body.style.width = "100%";
      const restore = () => {
        body.style.position = prev.position;
        body.style.top = prev.top;
        body.style.left = prev.left;
        body.style.right = prev.right;
        body.style.width = prev.width;
        window.scrollTo(savedX, savedY);
      };
      renderDialog(vue.createVNode(ImagesViewer, opts, null), undefined, {
        unloaded: restore,
        abnormalUnload: restore
      });
    }
    const _hoisted_1$7 = { class: "main-content" };
    const _hoisted_2$7 = { class: "title" };
    const _hoisted_3$5 = {
      key: 0,
      class: "content"
    };
    const _hoisted_4$4 = {
      key: 0,
      class: "img-container"
    };
    const _hoisted_5$3 = ["src"];
    const _hoisted_6$2 = { class: "bottom-controls" };
    const _hoisted_7$1 = ["src"];
    const _hoisted_8$1 = { class: "author-info" };
    const _hoisted_9$1 = { class: "author-name" };
    const _hoisted_10$1 = { class: "post-time" };
    const _hoisted_11$1 = { class: "replies" };
    const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
      __name: "post-container",
      props: {
        post: {},
        lazyLoad: { type: Boolean, default: false },
        dynamic: { type: Boolean, default: false }
      },
      emits: ["assetsLoaded"],
      setup(__props, { emit: __emit }) {
        const props = __props;
        const emit = __emit;
        const postContainer = vue.ref();
        const isIntersecting = vue.ref(!props.lazyLoad);
        const loadedAssets = vue.ref(0);
        vue.onMounted(() => {
          if (!postContainer.value) return;
          if (props.post.images.length === 0) {
            emit("assetsLoaded", postContainer.value);
          }
          if (!props.lazyLoad) return;
          const iObs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                isIntersecting.value = true;
                iObs.disconnect();
              }
            });
          });
          iObs.observe(postContainer.value.$el);
        });
        function showImage(e, index2) {
          e.preventDefault();
          openThreadImages(+props.post.id, index2);
        }
        function addLoadedPost() {
          loadedAssets.value += 1;
          if (loadedAssets.value === props.post.images.length) {
            emit("assetsLoaded", postContainer.value);
          }
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
            ref_key: "postContainer",
            ref: postContainer,
            "is-anchor": true,
            class: vue.normalizeClass(["post-container", { "dynamic": props.dynamic, "assets-loaded": loadedAssets.value === props.post.images.length }]),
            href: "/p/" + props.post.id,
            target: "_blank"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("div", null, [
                vue.createVNode(vue.unref(userView.UserButton), {
                  "is-anchor": true,
                  class: "forum-btn",
                  "shadow-border": true,
                  href: props.post.forum.href,
                  target: "_blank"
                }, {
                  default: vue.withCtx(() => [
                    vue.createTextVNode(vue.toDisplayString(props.post.forum.name + " 吧"), 1)
                  ]),
                  _: 1
                }, 8, ["href"])
              ]),
              vue.createElementVNode("div", _hoisted_1$7, [
                vue.createElementVNode("p", _hoisted_2$7, vue.toDisplayString(props.post.title), 1),
                props.post.content && props.post.content !== " " ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_3$5, vue.toDisplayString(props.post.content), 1)) : vue.createCommentVNode("", true)
              ]),
              props.post.images.length > 0 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4$4, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.post.images, (image, index2) => {
                  return vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                    class: "img-button",
                    onClick: ($event) => showImage($event, index2),
                    "no-border": "all"
                  }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("img", {
                        class: "post-img",
                        src: isIntersecting.value ? image.original : image.thumb,
                        onLoad: addLoadedPost
                      }, null, 40, _hoisted_5$3)
                    ]),
                    _: 2
                  }, 1032, ["onClick"]);
                }), 256))
              ])) : vue.createCommentVNode("", true),
              vue.createElementVNode("div", _hoisted_6$2, [
                vue.createVNode(vue.unref(userView.UserButton), {
                  class: "author",
                  "is-anchor": true,
                  href: props.post.author.href,
                  target: "_blank",
                  "shadow-border": true
                }, {
                  default: vue.withCtx(() => [
                    vue.createElementVNode("img", {
                      class: "author-portrait",
                      src: isIntersecting.value ? vue.unref(tiebaAPI).URL_profile(props.post.author.portrait) : ""
                    }, null, 8, _hoisted_7$1),
                    vue.createElementVNode("div", _hoisted_8$1, [
                      vue.createElementVNode("div", _hoisted_9$1, vue.toDisplayString(props.post.author.name), 1),
                      vue.createElementVNode("div", _hoisted_10$1, vue.toDisplayString(props.post.time), 1)
                    ])
                  ]),
                  _: 1
                }, 8, ["href"]),
                vue.createElementVNode("div", _hoisted_11$1, vue.toDisplayString(props.post.replies), 1)
              ])
            ]),
            _: 1
          }, 8, ["href", "class"]);
        };
      }
    });
    const PostContainer = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-8fa74492"]]);
    const maxFeeds = 1e3;
    const nextFeedsMargin = 320;
    const unreadTTL = 2;
    const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
      __name: "feeds-masonry",
      props: {
        initFeeds: { default: () => [] },
        showProgress: { type: Boolean, default: false }
      },
      setup(__props, { expose: __expose }) {
        const props = __props;
        const feeds = vue.ref([]);
        const masonryWrapper = vue.ref();
        const masonryContainer = vue.ref();
        const hasMoreFeeds = vue.ref(true);
        let currentLoadedFeeds = [];
        let isFetchingFeeds = false;
        const debAddFeeds = _2.debounce(addFeeds, 2e3, { leading: true });
        let flexMasonry;
        window.addEventListener("resize", _2.throttle(function() {
          flexMasonry.adjustWidth();
          if (flexMasonry.columns !== flexMasonry.calcColumns()) flexMasonry.exec();
        }, 100), { passive: true });
        vue.onMounted(() => {
          if (!masonryWrapper.value) return;
          if (!masonryContainer.value) return;
          debAddFeeds(props.initFeeds);
          renderMasonry();
          window.addEventListener("scroll", () => {
            if (isFetchingFeeds) return;
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const clientHeight = document.documentElement.clientHeight;
            if (scrollTop + clientHeight >= scrollHeight - nextFeedsMargin) {
              if (feeds.value.length < maxFeeds) {
                debAddFeeds();
              }
            }
          });
        });
        vue.watch(hasMoreFeeds, (newVal) => {
          if (!newVal) {
            userView.toast({
              message: "没有更多推送了",
              type: "warning"
            });
          }
        });
        async function addFeeds(newFeeds) {
          if (!newFeeds) newFeeds = [];
          if (isFetchingFeeds) return;
          isFetchingFeeds = true;
          if (newFeeds.length <= 0) {
            const response = await requestInstance(tiebaAPI.feedlist());
            if (response) {
              newFeeds = parsePostsFromString(response.data.html);
              hasMoreFeeds.value = !!response.data.has_more;
              const ruleList = shieldList.get();
              newFeeds = _2.filter(newFeeds, (feed) => {
                for (const rule of ruleList) {
                  if (matchShield(rule, feed.author.name, "username") || matchShield(rule, feed.title, "content") || matchShield(rule, feed.content, "content")) {
                    return false;
                  }
                }
                return true;
              });
              if (props.showProgress) {
                headerProgress({ calc: () => currentLoadedFeeds.length / ((newFeeds == null ? undefined : newFeeds.length) ?? 0) * 100 });
              }
            }
          }
          feeds.value.push(...newFeeds);
          await waitUntil(() => currentLoadedFeeds.length >= (newFeeds ?? []).length);
          renderMasonry().then(function() {
            unreadFeeds.set(newFeeds ? newFeeds : [], spawnOffsetTS(0, 0, 0, unreadTTL));
            currentLoadedFeeds.length = 0;
            isFetchingFeeds = false;
          });
        }
        async function renderMasonry() {
          await vue.nextTick();
          if (!masonryContainer.value) return;
          if (!flexMasonry) {
            flexMasonry = new FlexMasonry({
              container: masonryContainer.value,
              // items: ".post-elem.assets-loaded",
              columnWidth: 280,
              gap: 12,
              fixScrollOffset: true
            });
          } else {
            flexMasonry.append(".masonry-wrapper > .post-elem.assets-loaded", 60);
          }
        }
        function addToLoaded(payload) {
          currentLoadedFeeds.push(payload.$el);
        }
        function refresh() {
          if (!isFetchingFeeds) {
            feeds.value.length = 0;
            flexMasonry.clear();
            debAddFeeds();
          }
        }
        function refreshAndMove() {
          var _a;
          window.scrollTo({ top: (_a = masonryContainer.value) == null ? undefined : _a.offsetTop, behavior: "smooth" });
          refresh();
        }
        __expose({
          feeds,
          isFetchingFeeds,
          refresh,
          refreshAndMove
        });
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", {
            ref_key: "masonryWrapper",
            ref: masonryWrapper,
            class: "masonry-wrapper"
          }, [
            vue.createElementVNode("div", {
              ref_key: "masonryContainer",
              ref: masonryContainer,
              class: "masonry-container"
            }, null, 512),
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(feeds.value, (post) => {
              return vue.openBlock(), vue.createBlock(PostContainer, {
                key: post.id,
                post,
                class: "post-elem",
                dynamic: "",
                "shadow-border": "",
                onAssetsLoaded: addToLoaded
              }, null, 8, ["post"]);
            }), 128))
          ], 512);
        };
      }
    });
    const FeedsMasonry = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-d3bb286a"]]);
    function useSearchSuggestions() {
      const searchText = vue.ref("");
      const suggToggle = vue.ref(false);
      const suggestions = vue.ref([]);
      async function loadSuggestions(query) {
        const response = await tiebaAPI.suggestions(query);
        if (response.ok) {
          response.json().then((value) => {
            if (!query || query === "") {
              const topicList = value.hottopic_list.search_data;
              if (topicList)
                suggestions.value = _2.map(topicList, (topic) => ({
                  image: topic.topic_pic,
                  title: topic.topic_name,
                  desc: topic.topic_desc,
                  href: topic.topic_url
                }));
            } else {
              const matchList = value.query_match.search_data;
              if (matchList)
                suggestions.value = _2.map(matchList, (match) => ({
                  image: match.fpic,
                  title: match.fname,
                  desc: match.forum_desc,
                  href: tiebaAPI.URL_forum(match.fname)
                }));
            }
          });
        }
      }
      function toggleSuggControls(e) {
        const el = e.target;
        const pt = findParent(el, "search-controls");
        suggToggle.value = !!pt;
      }
      function searchBoxFocus() {
        if (suggestions.value.length <= 0) {
          loadSuggestions().then(() => {
            suggToggle.value = true;
          });
        } else {
          suggToggle.value = true;
        }
      }
      function searchTextChange() {
        loadSuggestions(searchText.value);
      }
      const searchMatch = _2.debounce(searchTextChange, 500);
      const onFocusin = (ev) => toggleSuggControls(ev);
      const onMousedown = (ev) => toggleSuggControls(ev);
      window.addEventListener("focusin", onFocusin);
      window.addEventListener("mousedown", onMousedown);
      vue.onUnmounted(() => {
        window.removeEventListener("focusin", onFocusin);
        window.removeEventListener("mousedown", onMousedown);
      });
      return { searchText, suggToggle, suggestions, searchBoxFocus, searchMatch };
    }
    const _hoisted_1$6 = {
      key: 0,
      class: "confirm-header"
    };
    const _hoisted_2$6 = ["innerHTML"];
    const _hoisted_3$4 = {
      key: 1,
      class: "confirm-title"
    };
    const _hoisted_4$3 = { class: "confirm-body" };
    const _hoisted_5$2 = { class: "confirm-content" };
    const _hoisted_6$1 = { class: "confirm-actions" };
    const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
      __name: "confirm-dialog",
      props: {
        title: {},
        content: {},
        type: { default: "okCancel" },
        variant: { default: "info" },
        danger: { type: Boolean, default: false },
        icon: {},
        positiveText: { default: "确定" },
        negativeText: { default: "取消" },
        onUnload: {}
      },
      setup(__props) {
        const props = __props;
        const dialog = vue.ref();
        const positiveRef = vue.ref();
        const response = vue.ref("cancel");
        const showCancelButton = vue.computed(() => props.type !== "okOnly");
        const ICON_PRESETS = {
          info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
          warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
          danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
          success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
        };
        const resolvedIcon = vue.computed(() => {
          if (props.icon !== undefined) return props.icon;
          return ICON_PRESETS[props.variant];
        });
        const dialogOpts = {
          animation: true,
          force: props.type === "forceTrueFalse",
          clickModalToUnload: props.type !== "forceTrueFalse",
          pressEscapeToUnload: props.type !== "forceTrueFalse",
          uniqueName: "remixed-confirm-dialog",
          // shadowMode 让 UserDialog 容器不应用 .default 的边框/圆角/背景，
          // 视觉完全交给 .confirm-dialog 自身，避免双层圆角不重合的缝隙。
          shadowMode: true,
          containerStyle: {
            margin: "16px",
            padding: "0",
            border: "none",
            borderRadius: "0",
            background: "transparent",
            boxShadow: "none"
          },
          contentStyle: {
            padding: "0"
          }
        };
        vue.onMounted(() => {
          vue.nextTick(() => {
            var _a;
            return (_a = positiveRef.value) == null ? undefined : _a.focus();
          });
        });
        function handleAction(action) {
          var _a;
          response.value = action;
          (_a = dialog.value) == null ? undefined : _a.unload(action);
        }
        function handleUnload(payload) {
          var _a;
          (_a = props.onUnload) == null ? undefined : _a.call(props, payload ?? response.value);
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createBlock(vue.unref(userView.UserDialog), vue.mergeProps({
            ref_key: "dialog",
            ref: dialog
          }, dialogOpts, { onUnload: handleUnload }), {
            default: vue.withCtx(() => [
              vue.createElementVNode("div", {
                class: vue.normalizeClass(["confirm-dialog", [`variant-${_ctx.variant}`, { "is-danger": _ctx.danger }]])
              }, [
                _ctx.title || resolvedIcon.value ? (vue.openBlock(), vue.createElementBlock("header", _hoisted_1$6, [
                  resolvedIcon.value ? (vue.openBlock(), vue.createElementBlock("div", {
                    key: 0,
                    class: "confirm-icon",
                    innerHTML: resolvedIcon.value
                  }, null, 8, _hoisted_2$6)) : vue.createCommentVNode("", true),
                  _ctx.title ? (vue.openBlock(), vue.createElementBlock("h3", _hoisted_3$4, vue.toDisplayString(_ctx.title), 1)) : vue.createCommentVNode("", true)
                ])) : vue.createCommentVNode("", true),
                vue.createElementVNode("div", _hoisted_4$3, [
                  vue.createElementVNode("p", _hoisted_5$2, vue.toDisplayString(_ctx.content), 1)
                ]),
                vue.createElementVNode("footer", _hoisted_6$1, [
                  showCancelButton.value ? (vue.openBlock(), vue.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "confirm-btn negative",
                    onClick: _cache[0] || (_cache[0] = ($event) => handleAction("negative"))
                  }, vue.toDisplayString(_ctx.negativeText), 1)) : vue.createCommentVNode("", true),
                  vue.createElementVNode("button", {
                    ref_key: "positiveRef",
                    ref: positiveRef,
                    type: "button",
                    class: vue.normalizeClass(["confirm-btn positive", { "is-danger": _ctx.danger }]),
                    onClick: _cache[1] || (_cache[1] = ($event) => handleAction("positive"))
                  }, vue.toDisplayString(_ctx.positiveText), 3)
                ])
              ], 2)
            ]),
            _: 1
          }, 16);
        };
      }
    });
    const ConfirmDialog = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-efc98705"]]);
    function confirmDialog(opts) {
      return new Promise((resolve) => {
        let resolved = false;
        renderDialog(ConfirmDialog, {
          ...opts,
          onUnload(payload) {
            if (resolved) return;
            resolved = true;
            resolve(payload ?? "cancel");
          }
        });
      });
    }
    function useSignIn() {
      const followed = vue.ref();
      const signedForums = vue.ref(0);
      function getFollowedInstance() {
        requestInstance(tiebaAPI.followedForums()).then((response) => {
          if (response) {
            signedForums.value = 0;
            followed.value = response.data;
            _2.forEach(followed.value.like_forum, (forum) => {
              if (forum.is_sign === 1) signedForums.value++;
            });
            followed.value.like_forum.sort((a, b) => parseInt(b.user_exp) - parseInt(a.user_exp));
          }
        });
      }
      async function oneKeySignInstance() {
        const tag = await confirmDialog({
          title: "一键签到",
          content: "需要注意，Web 端签到获取到的经验远少于移动端，建议使用其他设备进行签到。",
          type: "okCancel",
          variant: "warning",
          positiveText: "继续签到"
        });
        if (tag !== "positive") return;
        const response = await requestInstance(tiebaAPI.oneKeySign());
        userView.toast({
          message: `本次共签到成功 ${response.data.signedForumAmount} 个吧，未签到 ${response.data.unsignedForumAmount} 个吧，签到失败 ${response.data.signedForumAmountFail} 个吧，共获得 ${response.data.gradeNoVip} 经验。`,
          type: "check",
          blurEffect: true
        });
        getFollowedInstance();
      }
      return { followed, signedForums, getFollowedInstance, oneKeySignInstance };
    }
    const _hoisted_1$5 = { class: "grid-container" };
    const _hoisted_2$5 = { class: "head-controls" };
    const _hoisted_3$3 = { class: "search-controls" };
    const _hoisted_4$2 = { class: "search-suggestions" };
    const _hoisted_5$1 = ["src"];
    const _hoisted_6 = { class: "sugg-content" };
    const _hoisted_7 = { class: "sugg-title" };
    const _hoisted_8 = { class: "sugg-desc" };
    const _hoisted_9 = {
      key: 0,
      class: "block-wrapper followed-container"
    };
    const _hoisted_10 = { class: "followed-list" };
    const _hoisted_11 = {
      key: 0,
      class: "icon signed"
    };
    const _hoisted_12 = { class: "forum-title" };
    const _hoisted_13 = { class: "topic-list" };
    const _hoisted_14 = ["src"];
    const _hoisted_15 = { class: "topic-content" };
    const _hoisted_16 = { class: "topic-title" };
    const _hoisted_17 = { class: "topic-name" };
    const _hoisted_18 = { class: "topic-desc" };
    const _hoisted_19 = {
      key: 0,
      class: "empty-container"
    };
    const ICON_FOLLOWED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>`;
    const ICON_TOPIC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/></svg>`;
    const ICON_FEEDS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`;
    const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
      __name: "index",
      setup(__props) {
        const initFeeds = vue.ref([]);
        const userInfo = vue.ref();
        const masonryContainer = vue.ref();
        const feedsContainer = vue.ref();
        const followedHeader = vue.ref();
        const feedsHeader = vue.ref();
        const topicHeader = vue.ref();
        const isFollowedHeaderStuck = vue.ref(false);
        const isFeedsHeaderStuck = vue.ref(false);
        const isTopicHeaderStuck = vue.ref(false);
        const navHideMode = vue.ref(navBarHideMode.get());
        navBarHideMode.on("setter", (v) => {
          navHideMode.value = v;
        });
        const stickyTopPx = vue.computed(() => navHideMode.value === "never" ? 64 : 16);
        vue.ref(false);
        const configMenu = vue.ref();
        vue.ref(false);
        const profileMenu = vue.ref();
        const topicList = vue.ref([]);
        const feedsIntersecting = vue.ref(false);
        const feedsMasonry = vue.ref({});
        const topicCollapsed = vue.ref(indexTopicCollapsed.get());
        const topicShowAll = vue.ref(false);
        const displayedTopics = vue.computed(
          () => topicShowAll.value ? topicList.value : _2.take(topicList.value, 10)
        );
        const { searchText, suggToggle, suggestions, searchBoxFocus, searchMatch } = useSearchSuggestions();
        const { followed, signedForums, getFollowedInstance, oneKeySignInstance } = useSignIn();
        initFeeds.value = unreadFeeds.get();
        function toggleTopicCollapsed() {
          topicCollapsed.value = !topicCollapsed.value;
          indexTopicCollapsed.set(topicCollapsed.value);
        }
        function toggleTopicShowAll() {
          if (topicCollapsed.value) topicCollapsed.value = false;
          topicShowAll.value = !topicShowAll.value;
        }
        function scrollToFeeds() {
          if (!masonryContainer.value) return;
          window.scrollTo({
            top: masonryContainer.value.offsetTop - stickyTopPx.value,
            behavior: "smooth"
          });
        }
        function refreshFeeds() {
          var _a;
          scrollToFeeds();
          (_a = feedsMasonry.value) == null ? undefined : _a.refresh();
        }
        const updateStuck = _2.throttle(() => {
          const top = stickyTopPx.value;
          const isStuck = (el) => {
            if (!el) return false;
            const r = el.getBoundingClientRect();
            return r.top <= top + 0.5 && r.top >= top - 0.5;
          };
          isFollowedHeaderStuck.value = isStuck(followedHeader.value);
          isFeedsHeaderStuck.value = isStuck(feedsHeader.value);
          isTopicHeaderStuck.value = isStuck(topicHeader.value);
        }, 80);
        vue.onMounted(async () => {
          init().then(() => {
            if (masonryContainer.value) {
              const iObs = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                  feedsIntersecting.value = true;
                } else {
                  feedsIntersecting.value = false;
                }
              });
              iObs.observe(masonryContainer.value);
            }
          });
          window.addEventListener("scroll", updateStuck, { passive: true });
          window.addEventListener("resize", updateStuck);
          updateStuck();
        });
        vue.onUnmounted(() => {
          window.removeEventListener("scroll", updateStuck);
          window.removeEventListener("resize", updateStuck);
        });
        async function init() {
          const [userInfoData, topicListResp] = await Promise.all([
            (async () => {
              try {
                const userInfoResp = await (await tiebaAPI.userInfo()).json();
                if (userInfoResp) return userInfoResp.data;
              } catch (error) {
                userView.toast({
                  message: errorMessage(error),
                  type: "error",
                  duration: 6e3
                });
              }
            })(),
            requestInstance(tiebaAPI.topicList())
          ]);
          userInfo.value = userInfoData;
          if (topicListResp) {
            topicList.value.push(...topicListResp.data.bang_topic.topic_list);
          }
          configMenu.value = [
            {
              title: "设置",
              click() {
                renderDialog(Settings);
              }
            },
            "separator",
            {
              title: "源代码 (GitHub)",
              href: GithubRepo
            },
            {
              title: "源代码 (Gitee)",
              href: GiteeRepo
            }
          ];
          profileMenu.value = [
            {
              title: "登录",
              icon: "login",
              href: BaiduPassport
            }
          ];
          if (userInfo.value) {
            profileMenu.value = [
              {
                title: "我的收藏",
                icon: "star"
              },
              "separator",
              {
                title: "主页",
                icon: "home",
                href: tiebaAPI.URL_userHome(userInfo.value.user_portrait)
              },
              {
                title: "修改",
                icon: "settings"
              },
              "separator",
              {
                title: "退出登录",
                icon: "logout"
              }
            ];
          }
          if (userInfo.value) {
            getFollowedInstance();
          }
          if (!feedsContainer.value) return;
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", {
            class: "index-wrapper",
            style: vue.normalizeStyle({ "--sticky-top": stickyTopPx.value + "px" })
          }, [
            vue.createElementVNode("div", _hoisted_1$5, [
              vue.createElementVNode("div", _hoisted_2$5, [
                vue.createElementVNode("div", _hoisted_3$3, [
                  vue.createVNode(vue.unref(userView.UserTextbox), {
                    modelValue: vue.unref(searchText),
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => vue.isRef(searchText) ? searchText.value = $event : null),
                    class: "search-box",
                    placeholder: "搜索 贴吧",
                    autocomplete: "none",
                    onFocus: vue.unref(searchBoxFocus),
                    onInput: vue.unref(searchMatch)
                  }, null, 8, ["modelValue", "onFocus", "onInput"]),
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "search-button",
                    "theme-style": true,
                    "no-border": ""
                  }, {
                    default: vue.withCtx(() => _cache[1] || (_cache[1] = [
                      vue.createTextVNode("搜索")
                    ])),
                    _: 1
                  }),
                  vue.withDirectives(vue.createElementVNode("div", _hoisted_4$2, [
                    (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(suggestions), (sugg) => {
                      return vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                        "is-anchor": true,
                        class: "search-elem",
                        href: sugg.href,
                        target: "_blank",
                        "no-border": ""
                      }, {
                        default: vue.withCtx(() => [
                          vue.createElementVNode("img", {
                            class: "sugg-img",
                            src: sugg.image,
                            alt: ""
                          }, null, 8, _hoisted_5$1),
                          vue.createElementVNode("div", _hoisted_6, [
                            vue.createElementVNode("p", _hoisted_7, vue.toDisplayString(sugg.title), 1),
                            vue.createElementVNode("p", _hoisted_8, vue.toDisplayString(sugg.desc), 1)
                          ])
                        ]),
                        _: 2
                      }, 1032, ["href"]);
                    }), 256))
                  ], 512), [
                    [vue.vShow, vue.unref(suggToggle) && vue.unref(suggestions).length > 0]
                  ])
                ])
              ]),
              vue.unref(followed) ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_9, [
                vue.createElementVNode("div", {
                  ref_key: "followedHeader",
                  ref: followedHeader,
                  class: vue.normalizeClass(["block-controls followed sticky-header", { stuck: isFollowedHeaderStuck.value }])
                }, [
                  vue.createElementVNode("p", { class: "block-title" }, [
                    vue.createElementVNode("span", {
                      class: "block-title-icon icon-followed",
                      innerHTML: ICON_FOLLOWED
                    }),
                    _cache[2] || (_cache[2] = vue.createElementVNode("span", null, "关注的吧", -1))
                  ]),
                  vue.createVNode(BlockPanel, { class: "signed-count left-align" }, {
                    default: vue.withCtx(() => {
                      var _a;
                      return [
                        vue.createTextVNode(vue.toDisplayString(vue.unref(signedForums)) + " / " + vue.toDisplayString((_a = vue.unref(followed)) == null ? undefined : _a.like_forum.length), 1)
                      ];
                    }),
                    _: 1
                  }),
                  vue.createVNode(BlockPanel, { class: "followed actions" }, {
                    default: vue.withCtx(() => [
                      vue.createVNode(vue.unref(userView.UserButton), {
                        class: "panel-btn icon sign-btn",
                        title: "一键签到",
                        onClick: vue.unref(oneKeySignInstance),
                        "unset-background": "",
                        "no-border": ""
                      }, {
                        default: vue.withCtx(() => _cache[3] || (_cache[3] = [
                          vue.createTextVNode(" task_alt ")
                        ])),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    _: 1
                  })
                ], 2),
                vue.createElementVNode("div", _hoisted_10, [
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(followed).like_forum, (forum) => {
                    return vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                      "is-anchor": true,
                      class: "followed-btn",
                      "shadow-border": true,
                      href: vue.unref(tiebaAPI).URL_forum(forum.forum_name),
                      target: "_blank",
                      "no-border": ""
                    }, {
                      default: vue.withCtx(() => [
                        forum.is_sign === 1 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_11, "check")) : vue.createCommentVNode("", true),
                        vue.createElementVNode("div", _hoisted_12, vue.toDisplayString(forum.forum_name), 1),
                        vue.createElementVNode("div", {
                          class: vue.normalizeClass(["forum-level", "level-" + vue.unref(levelToClass)(forum.user_level)])
                        }, vue.toDisplayString(forum.user_level), 3)
                      ]),
                      _: 2
                    }, 1032, ["href"]);
                  }), 256))
                ])
              ])) : vue.createCommentVNode("", true),
              topicList.value.length > 0 ? (vue.openBlock(), vue.createElementBlock("div", {
                key: 1,
                class: vue.normalizeClass(["block-wrapper topic-container", { collapsed: topicCollapsed.value }])
              }, [
                vue.createElementVNode("div", {
                  ref_key: "topicHeader",
                  ref: topicHeader,
                  class: vue.normalizeClass(["block-controls topics sticky-header", { stuck: isTopicHeaderStuck.value }])
                }, [
                  vue.createElementVNode("p", { class: "block-title" }, [
                    vue.createElementVNode("span", {
                      class: "block-title-icon icon-topic",
                      innerHTML: ICON_TOPIC
                    }),
                    _cache[4] || (_cache[4] = vue.createElementVNode("span", null, "贴吧热议", -1))
                  ]),
                  vue.createVNode(BlockPanel, { class: "topics actions" }, {
                    default: vue.withCtx(() => [
                      vue.createVNode(vue.unref(userView.UserButton), {
                        class: "panel-btn icon toggle-collapse",
                        title: topicCollapsed.value ? "展开列表" : "收起列表",
                        onClick: toggleTopicCollapsed,
                        "unset-background": true,
                        "no-border": ""
                      }, {
                        default: vue.withCtx(() => [
                          vue.createTextVNode(vue.toDisplayString(topicCollapsed.value ? "expand_more" : "expand_less"), 1)
                        ]),
                        _: 1
                      }, 8, ["title"]),
                      vue.createVNode(vue.unref(userView.UserButton), {
                        class: "panel-btn icon more",
                        title: topicShowAll.value ? "只看前 10 条" : "查看更多",
                        onClick: toggleTopicShowAll,
                        "unset-background": true,
                        "no-border": ""
                      }, {
                        default: vue.withCtx(() => _cache[5] || (_cache[5] = [
                          vue.createTextVNode(" more_horiz ")
                        ])),
                        _: 1
                      }, 8, ["title"])
                    ]),
                    _: 1
                  })
                ], 2),
                vue.withDirectives(vue.createElementVNode("div", _hoisted_13, [
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(displayedTopics.value, (topic) => {
                    return vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                      "is-anchor": true,
                      class: "topic-btn",
                      "shadow-border": true,
                      href: topic.topic_url,
                      target: "_blank"
                    }, {
                      default: vue.withCtx(() => [
                        vue.createElementVNode("img", {
                          class: "topic-img",
                          src: topic.topic_pic
                        }, null, 8, _hoisted_14),
                        vue.createElementVNode("div", _hoisted_15, [
                          vue.createElementVNode("div", _hoisted_16, [
                            vue.createElementVNode("div", {
                              class: vue.normalizeClass("topic-rank-" + topic.idx_num)
                            }, vue.toDisplayString(topic.idx_num), 3),
                            vue.createElementVNode("div", _hoisted_17, vue.toDisplayString(vue.unref(_2).unescape(topic.topic_name)), 1)
                          ]),
                          vue.createElementVNode("div", _hoisted_18, vue.toDisplayString(vue.unref(_2).unescape(topic.topic_desc)), 1)
                        ])
                      ]),
                      _: 2
                    }, 1032, ["href"]);
                  }), 256))
                ], 512), [
                  [vue.vShow, !topicCollapsed.value]
                ])
              ], 2)) : vue.createCommentVNode("", true),
              _cache[6] || (_cache[6] = vue.createElementVNode("div", { id: "carousel_wrap" }, null, -1))
            ]),
            vue.createElementVNode("div", {
              ref_key: "masonryContainer",
              ref: masonryContainer,
              class: "masonry-container"
            }, [
              vue.createElementVNode("div", {
                ref_key: "feedsHeader",
                ref: feedsHeader,
                class: vue.normalizeClass(["block-controls feeds sticky-header", { stuck: isFeedsHeaderStuck.value }])
              }, [
                vue.createElementVNode("p", { class: "block-title" }, [
                  vue.createElementVNode("span", {
                    class: "block-title-icon icon-feeds",
                    innerHTML: ICON_FEEDS
                  }),
                  _cache[7] || (_cache[7] = vue.createElementVNode("span", null, "推送", -1))
                ]),
                feedsMasonry.value && feedsMasonry.value.feeds && (feedsMasonry.value.feeds.length > 0 || feedsMasonry.value.isFetchingFeeds) ? (vue.openBlock(), vue.createBlock(BlockPanel, {
                  key: 0,
                  class: "actions"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(vue.unref(userView.UserButton), {
                      class: "panel-button icon refresh",
                      title: "刷新推送",
                      "unset-background": "",
                      onClick: refreshFeeds,
                      "no-border": ""
                    }, {
                      default: vue.withCtx(() => _cache[8] || (_cache[8] = [
                        vue.createTextVNode(" refresh ")
                      ])),
                      _: 1
                    })
                  ]),
                  _: 1
                })) : vue.createCommentVNode("", true)
              ], 2),
              vue.createVNode(FeedsMasonry, {
                ref_key: "feedsMasonry",
                ref: feedsMasonry,
                "init-feeds": initFeeds.value,
                "show-progress": ""
              }, null, 8, ["init-feeds"]),
              initFeeds.value.length === 0 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_19, _cache[9] || (_cache[9] = [
                vue.createElementVNode("p", { class: "no-feed-content" }, "没有更多了", -1)
              ]))) : vue.createCommentVNode("", true)
            ], 512),
            vue.createVNode(vue.Transition, { name: "back-to-top" }, {
              default: vue.withCtx(() => [
                isFeedsHeaderStuck.value ? (vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                  key: 0,
                  class: "back-to-top-btn",
                  title: "回到「推送」顶部",
                  onClick: scrollToFeeds,
                  "no-border": ""
                }, {
                  default: vue.withCtx(() => _cache[10] || (_cache[10] = [
                    vue.createElementVNode("span", { class: "icon" }, "arrow_upward", -1)
                  ])),
                  _: 1
                })) : vue.createCommentVNode("", true)
              ]),
              _: 1
            })
          ], 4);
        };
      }
    });
    const Home = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-ceeadbd6"]]);
    async function index$e() {
      if (currentPageType() !== "index") return;
      if (!pageExtension.get().index) return;
      const bodyMask = _GM_addStyle(parseMultiCSS({
        "body": {
          display: "none"
        }
      }));
      const wrap = await asyncdom(".wrap1");
      renderPage(Home);
      wrap.remove();
      bodyMask.remove();
    }
    const _hoisted_1$4 = { class: "pager-wrapper" };
    const _hoisted_2$4 = {
      key: 0,
      class: "pager-button-container"
    };
    const _hoisted_3$2 = {
      key: 1,
      class: "pager-separactor"
    };
    const _hoisted_4$1 = {
      key: 2,
      class: "jumper-container"
    };
    const _hoisted_5 = { class: "tail-slot" };
    const _sfc_main$4 = /* @__PURE__ */ vue.defineComponent({
      __name: "pager",
      props: {
        total: {},
        current: {},
        jumperValue: {},
        maxDisplay: { default: 9 },
        fill: { type: Boolean, default: false },
        showPagers: { type: Boolean, default: true },
        head: { type: Boolean, default: true },
        tail: { type: Boolean, default: true },
        jumper: { type: Boolean, default: true },
        pagerClick: {},
        headClick: {},
        tailClick: {},
        prevClick: {},
        nextClick: {},
        pagerChange: {},
        jumperEnter: {}
      },
      emits: [
        "update:current",
        "update:jumperValue"
      ],
      setup(__props, { expose: __expose, emit: __emit }) {
        const props = __props;
        const current = vue.ref(props.current);
        const jumperValue = vue.ref(props.jumperValue ?? "");
        const emit = __emit;
        const pagerCount = Math.min(props.maxDisplay, props.total);
        const pagerStart = vue.computed(
          () => current.value + pagerCount / 2 > props.total ? props.total - pagerCount + 1 : Math.max(1, current.value - Math.floor(props.maxDisplay / 2))
        );
        const pagerEnd = vue.computed(() => Math.min(props.total, pagerStart.value + props.maxDisplay - 1) + 1);
        __expose({
          current,
          jumperValue
        });
        function pagerChange(type, page) {
          if (props.pagerChange && page !== current.value)
            props.pagerChange(page);
          current.value = page;
          emit("update:current", page);
          switch (type) {
            case "page":
              if (props.pagerClick) props.pagerClick(page);
              break;
            case "head":
              if (props.headClick) props.headClick();
              break;
            case "tail":
              if (props.tailClick) props.tailClick();
              break;
            case "prev":
              if (props.prevClick) props.prevClick(page);
              break;
            case "next":
              if (props.nextClick) props.nextClick(page);
              break;
          }
        }
        function handleJumperEnter() {
          if (!jumperValue.value) return;
          const page = +jumperValue.value;
          if (page < 1 || page > props.total) return;
          pagerChange(null, page);
          if (props.jumperEnter) props.jumperEnter(page);
          jumperValue.value = "";
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$4, [
            _ctx.showPagers ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$4, [
              vue.withDirectives(vue.createVNode(vue.unref(userView.UserButton), {
                class: "pager-button pager-head-button",
                "no-border": "",
                onClick: _cache[0] || (_cache[0] = ($event) => pagerChange("head", 1))
              }, {
                default: vue.withCtx(() => _cache[6] || (_cache[6] = [
                  vue.createTextVNode("1")
                ])),
                _: 1
              }, 512), [
                [vue.vShow, current.value > Math.ceil(vue.unref(pagerCount) / 2) && current.value > 1 && _ctx.total > vue.unref(pagerCount)]
              ]),
              vue.withDirectives(vue.createVNode(vue.unref(userView.UserButton), {
                class: "pager-button pager-back-button icon",
                "no-border": "",
                onClick: _cache[1] || (_cache[1] = ($event) => pagerChange("prev", Math.max(1, current.value - vue.unref(pagerCount))))
              }, {
                default: vue.withCtx(() => _cache[7] || (_cache[7] = [
                  vue.createTextVNode(" keyboard_double_arrow_left ")
                ])),
                _: 1
              }, 512), [
                [vue.vShow, current.value > Math.ceil(vue.unref(pagerCount) / 2) && current.value > 1 && _ctx.total > vue.unref(pagerCount)]
              ]),
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(_2).range(pagerStart.value, pagerEnd.value), (displayNumber, i) => {
                return vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                  key: i,
                  class: vue.normalizeClass(["pager-button", { "fill": _ctx.fill, "curr-pager-button": displayNumber === current.value }]),
                  onClick: ($event) => pagerChange("page", displayNumber),
                  "no-border": "all",
                  disabled: displayNumber === current.value
                }, {
                  default: vue.withCtx(() => [
                    vue.createTextVNode(vue.toDisplayString(displayNumber), 1)
                  ]),
                  _: 2
                }, 1032, ["class", "onClick", "disabled"]);
              }), 128)),
              vue.withDirectives(vue.createVNode(vue.unref(userView.UserButton), {
                class: "pager-button pager-forward-button icon",
                "no-border": "",
                onClick: _cache[2] || (_cache[2] = ($event) => pagerChange("next", Math.min(_ctx.total, current.value + vue.unref(pagerCount))))
              }, {
                default: vue.withCtx(() => _cache[8] || (_cache[8] = [
                  vue.createTextVNode(" keyboard_double_arrow_right ")
                ])),
                _: 1
              }, 512), [
                [vue.vShow, _ctx.total - vue.unref(pagerCount) > 1 && _ctx.total - current.value > vue.unref(pagerCount) / 2]
              ]),
              vue.withDirectives(vue.createVNode(vue.unref(userView.UserButton), {
                class: "pager-button pager-tail-button",
                "no-border": "",
                onClick: _cache[3] || (_cache[3] = ($event) => pagerChange("tail", _ctx.total))
              }, {
                default: vue.withCtx(() => [
                  vue.createTextVNode(vue.toDisplayString(_ctx.total), 1)
                ]),
                _: 1
              }, 512), [
                [vue.vShow, _ctx.tail && _ctx.total - vue.unref(pagerCount) > 1 && _ctx.total - current.value > vue.unref(pagerCount) / 2]
              ])
            ])) : vue.createCommentVNode("", true),
            _ctx.showPagers && _ctx.jumper ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3$2, "|")) : vue.createCommentVNode("", true),
            _ctx.showPagers && _ctx.jumper ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4$1, [
              _cache[9] || (_cache[9] = vue.createTextVNode(" 转到 ")),
              vue.createVNode(vue.unref(userView.UserTextbox), {
                modelValue: jumperValue.value,
                "onUpdate:modelValue": [
                  _cache[4] || (_cache[4] = ($event) => jumperValue.value = $event),
                  _cache[5] || (_cache[5] = ($event) => emit("update:jumperValue", jumperValue.value))
                ],
                class: "jumper",
                onKeydown: vue.withKeys(handleJumperEnter, ["enter"])
              }, null, 8, ["modelValue"]),
              _cache[10] || (_cache[10] = vue.createTextVNode(" 页 "))
            ])) : vue.createCommentVNode("", true),
            vue.createElementVNode("div", _hoisted_5, [
              vue.renderSlot(_ctx.$slots, "tailSlot", {}, undefined, true)
            ])
          ]);
        };
      }
    });
    const Pager$1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-706b517f"]]);
    const _hoisted_1$3 = {
      id: "thread-editor"
    };
    const _hoisted_2$3 = {
      id: "thread-editor-toolbar"
    };
    const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
      __name: "thread-editor",
      props: {
        ueditor: {},
        type: {
          default: "thread"
        }
      },
      setup(__props) {
        const props = __props;
        const dialogOpts = {
          modal: true,
          force: false,
          blurEffect: false,
          animation: true,
          lockScroll: true,
          clickModalToUnload: true,
          modalStyle: {
            background: "none"
          },
          containerStyle: {
            position: "fixed",
            width: "100%",
            maxWidth: "var(--content-max)",
            bottom: "0",
            marginBottom: "0",
            borderBottomLeftRadius: "0",
            borderBottomRightRadius: "0",
            boxShadow: "0 0 24px var(--tieba-theme-color)"
          },
          renderAnimation: "kf-editor-in var(--default-duration)",
          unloadAnimation: "kf-editor-out var(--default-duration)"
        };
        const dialog = vue.ref();
        const editorSlot = vue.ref();
        const originParent = vue.ref();
        vue.onMounted(async function() {
          var _a;
          await vue.nextTick();
          if (!editorSlot.value) return;
          originParent.value = props.ueditor.parentElement;
          editorSlot.value.appendChild(props.ueditor);
          const toolbar = await asyncdom(".edui-toolbar", editorSlot.value);
          const editorBody = await asyncdom(".edui-editor-body", editorSlot.value);
          if (toolbar.compareDocumentPosition(editorBody) & Node.DOCUMENT_POSITION_FOLLOWING) {
            (_a = toolbar.parentNode) == null ? undefined : _a.insertBefore(editorBody, toolbar);
          }
          const container = await asyncdom(".edui-body-container", editorSlot.value);
          const observer = new MutationObserver(() => {
            container.scrollTop = container.scrollHeight;
          });
          observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true
          });
          container.addEventListener("input", () => {
            container.scrollTop = container.scrollHeight;
          });
          (await asyncdom("#ueditor_replace", editorSlot.value)).focus();
        });
        async function submit() {
          (await asyncdom(".j_submit")).click();
          unload();
        }
        async function unload() {
          var _a;
          (_a = dialog.value) == null ? undefined : _a.unload();
        }
        async function returnEditor() {
          if (!originParent.value) return;
          if (!editorSlot.value) return;
          const container = editorSlot.value.querySelector(".edui-container");
          if (container) originParent.value.appendChild(container);
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createBlock(vue.unref(userView.UserDialog), vue.mergeProps({
            ref_key: "dialog",
            ref: dialog
          }, dialogOpts, {
            onUnload: returnEditor
          }), {
            default: vue.withCtx(() => [vue.createElementVNode("div", _hoisted_1$3, [vue.createVNode(vue.unref(userView.UserButton), {
              "aria-label": "关闭",
              id: "thread-editor-exit",
              class: "icon",
              "shadow-border": "",
              onClick: unload
            }, {
              default: vue.withCtx(() => _cache[0] || (_cache[0] = [vue.createTextVNode("close ")])),
              _: 1
            }), _ctx.type === "thread" ? (vue.openBlock(), vue.createBlock(vue.unref(userView.UserTextbox), {
              key: 0,
              class: "title-editor",
              placeholder: "输入标题",
              "lodash-style": ""
            })) : vue.createCommentVNode("", true), vue.createElementVNode("div", {
              ref_key: "editorSlot",
              ref: editorSlot,
              id: "thread-editor-slot"
            }, null, 512), vue.createElementVNode("div", _hoisted_2$3, [vue.createVNode(vue.unref(userView.UserButton), {
              id: "thread-editor-submit",
              "shadow-border": "",
              "theme-style": "",
              onClick: submit
            }, {
              default: vue.withCtx(() => _cache[1] || (_cache[1] = [vue.createTextVNode("发表")])),
              _: 1
            })])])]),
            _: 1
          }, 16);
        };
      }
    });
    const ThreadEditor = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-4e79c05d"]]);
    const _hoisted_1$2 = { class: "toggle-panel" };
    const _hoisted_2$2 = { class: "toggle-container" };
    const _hoisted_3$1 = ["title", "aria-label", "onClick"];
    const PANEL_GAP = 10;
    const VIEWPORT_PADDING = 12;
    const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
      __name: "toggle-panel",
      props: {
        toggles: {},
        anchorRect: {}
      },
      setup(__props, { expose: __expose }) {
        const props = __props;
        const dialog = vue.ref();
        const closeOnScroll = () => unload();
        const toggleStates = vue.ref(props.toggles.map((toggle) => !!toggle.defaultValue));
        function unload() {
          var _a;
          (_a = dialog.value) == null ? undefined : _a.unload();
        }
        function handleToggleClick(index2) {
          var _a, _b;
          const nextState = !toggleStates.value[index2];
          toggleStates.value[index2] = nextState;
          (_b = (_a = props.toggles[index2]) == null ? undefined : _a.event) == null ? undefined : _b.call(_a, nextState);
        }
        __expose({ unload });
        vue.onMounted(() => {
          window.addEventListener("scroll", closeOnScroll, true);
          window.addEventListener("resize", closeOnScroll);
        });
        vue.onUnmounted(() => {
          window.removeEventListener("scroll", closeOnScroll, true);
          window.removeEventListener("resize", closeOnScroll);
        });
        function getAnchorContainerStyle() {
          if (!props.anchorRect) return {};
          const maxLeft = Math.max(
            VIEWPORT_PADDING,
            window.innerWidth - props.anchorRect.width - VIEWPORT_PADDING
          );
          return {
            position: "fixed",
            bottom: `${window.innerHeight - props.anchorRect.top + PANEL_GAP}px`,
            left: `${Math.min(Math.max(props.anchorRect.left, VIEWPORT_PADDING), maxLeft)}px`,
            margin: "0",
            padding: "0",
            background: "transparent",
            border: "none",
            borderRadius: "0",
            boxShadow: "none"
          };
        }
        const dialogOpts = {
          animation: false,
          modal: false,
          lockScroll: false,
          modalStyle: {
            alignItems: "flex-end",
            justifyContent: "flex-start",
            background: "none"
          },
          containerStyle: getAnchorContainerStyle(),
          contentStyle: {
            maxWidth: "none",
            maxHeight: "calc(100vh - 24px)",
            padding: "0"
          }
        };
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createBlock(vue.unref(userView.UserDialog), vue.mergeProps({
            ref_key: "dialog",
            ref: dialog
          }, dialogOpts), {
            default: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_1$2, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.toggles, (toggle, index2) => {
                  return vue.openBlock(), vue.createElementBlock("div", _hoisted_2$2, [
                    vue.createElementVNode("button", {
                      type: "button",
                      class: vue.normalizeClass(["panel-button", toggleStates.value[index2] ? "toggle-on" : "toggle-off"]),
                      title: toggle.name,
                      "aria-label": toggle.name,
                      onClick: ($event) => handleToggleClick(index2)
                    }, vue.toDisplayString(toggle.icon), 11, _hoisted_3$1)
                  ]);
                }), 256))
              ])
            ]),
            _: 1
          }, 16);
        };
      }
    });
    class TiebaComponent {
      constructor(selector, parent) {
        __publicField(this, "selector");
        __publicField(this, "parent");
        this.selector = selector;
        this.parent = parent;
      }
      get() {
        if (!this.parent) {
          return dom(this.selector, [])[0];
        }
        return dom(this.selector, this.parent, [])[0];
      }
    }
    const floatButtonMap = {
      "auxiliary": "tbui_fbar_auxiliaryCare",
      "down": "tbui_fbar_down",
      "post": "tbui_fbar_post",
      "props": "tbui_fbar_props",
      "tsukkomi": "tbui_fbar_tsukkomi",
      "share": "tbui_fbar_share",
      "favor": "tbui_fbar_favor",
      "feedback": "tbui_fbar_feedback",
      "top": "tbui_fbar_top",
      "other": "*"
    };
    const floatButtonTitleMap = {
      auxiliary: "无障碍模式",
      down: "返回底部",
      post: "回复帖子",
      props: "道具",
      tsukkomi: "吐槽",
      share: "分享",
      favor: "收藏",
      feedback: "反馈",
      top: "顶部"
    };
    class FloatBar extends TiebaComponent {
      /**
       * 获取当前页面的 float buttons
       * @returns FloatBarButton[]
       */
      buttons() {
        if (!this.get()) return [];
        return Array.from(dom(".tbui_aside_fbar_button", floatBar.get(), [])).map((el) => ({
          el,
          type: function() {
            for (let i = 0; i < el.classList.length; i++) {
              const cls = el.classList[i];
              if (!cls.includes("tbui_fbar_")) continue;
              const key = _2.findKey(floatButtonMap, (value) => value === cls);
              if (key) {
                return key;
              }
            }
            return "other";
          }()
        }));
      }
      add(type, event, className, icon, index2 = 0) {
        const anchor = domrd("a", {
          href: "javascript:;"
        });
        const el = domrd("li", {
          class: "tbui_aside_fbar_button"
        }, [anchor]);
        el.addEventListener("click", event);
        if (type !== "other") {
          el.classList.add(floatButtonMap[type]);
        }
        if (className) el.classList.add(className);
        floatBar.get().insertBefore(el, floatBar.get().children[index2]);
        setFloatButtonIcon(anchor, icon);
        setFloatButtonTooltip(el, floatButtonTitleMap[type]);
        return {
          el,
          type
        };
        function setFloatButtonIcon(el2, icon2) {
          el2.classList.add("icon");
          el2.classList.add("tbui_aside_fbar_button");
          el2.innerHTML = icon2 ? icon2 : "";
        }
      }
      remove(param) {
        switch (typeof param) {
          case "string": {
            const el = dom(param, floatBar.get());
            el == null ? undefined : el.remove();
            break;
          }
          case "number": {
            const el = floatBar.get().children[param];
            el.remove();
            break;
          }
        }
      }
    }
    function setFloatButtonTooltip(target, title) {
      if (!title) return;
      target.setAttribute("title", title);
      target.setAttribute("aria-label", title);
      const anchor = target.querySelector("a");
      anchor == null ? undefined : anchor.setAttribute("title", title);
      anchor == null ? undefined : anchor.setAttribute("aria-label", title);
    }
    function decorateFloatBarTooltips(root = floatBar.get()) {
      if (!root) return;
      Array.from(dom(".tbui_aside_fbar_button", root, [])).forEach((el) => {
        const type = (() => {
          for (let i = 0; i < el.classList.length; i++) {
            const cls = el.classList[i];
            if (!cls.includes("tbui_fbar_")) continue;
            const key = _2.findKey(floatButtonMap, (value) => value === cls);
            if (key) {
              return key;
            }
          }
          return undefined;
        })();
        setFloatButtonTooltip(el, type ? floatButtonTitleMap[type] : undefined);
      });
    }
    const floatBar = new FloatBar(".tbui_aside_float_bar");
    class Pager extends TiebaComponent {
      allPagerButtons() {
        return dom("a, .tP", this.get(), []);
      }
      getPagerButton(pagerType, index2 = 0) {
        const allButtons = this.allPagerButtons();
        switch (pagerType) {
          case "prev": {
            return this.findMatchingButton(allButtons, "上一页");
          }
          case "next": {
            return this.findMatchingButton(allButtons, "下一页", true);
          }
          case "head": {
            return this.findMatchingButton(allButtons, "首页");
          }
          case "tail": {
            return this.findMatchingButton(allButtons, "尾页", true);
          }
          case "page": {
            let count = 0;
            for (const el of allButtons) {
              if (/^\d+$/.test(el.innerText)) {
                if (count === index2 && el instanceof HTMLAnchorElement) {
                  return el;
                }
                count++;
              }
            }
            return null;
          }
          default:
            return null;
        }
      }
      getByPage(page) {
        return this.findMatchingButton(this.allPagerButtons(), page.toString());
      }
      jumpTo(page) {
        const permKeys = ["pn", "see_lz"];
        const params = new URLSearchParams(location.search);
        const newParams = new URLSearchParams();
        for (const [key, value] of params) {
          if (_2.includes(permKeys, key)) {
            newParams.set(key, value);
          }
        }
        const url = new URL(location.href);
        url.search = newParams.toString();
        history.pushState({}, "", url);
        const jumperBox = dom("#jumpPage4, #jumpPage6");
        const jumperButton = dom("#pager_go4, #pager_go6");
        if (jumperBox) jumperBox.value = page.toString();
        jumperButton == null ? undefined : jumperButton.click();
      }
      findMatchingButton(buttons, text, reverse = false) {
        const iterator = reverse ? Array.from(buttons).reverse() : buttons;
        for (const el of iterator) {
          if (el.innerText === text) {
            return el;
          }
        }
        return null;
      }
    }
    const pager = new Pager(".l_pager");
    const commentsStyle = `.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .at, .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_main a, .core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .lzl_more a, .core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .j_pager a, .core_reply .core_reply_wrapper .core_reply_content .btn-sub, .core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_submit, .core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_smile .lzl_insertsmiley_holder {
  color: var(--tieba-theme-fore);
  cursor: pointer;
  -webkit-text-decoration: none;
  text-decoration: none;
  transition: var(--default-duration);
}

.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_op_list a, .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_jb .lzl_jb_in, .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_s_r {
  cursor: pointer;
  -webkit-text-decoration: none;
  text-decoration: none;
  transition: var(--default-duration);
}

.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .at:hover, .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_main a:hover, .core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .lzl_more a:hover, .core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .j_pager a:hover, .core_reply .core_reply_wrapper .core_reply_content .btn-sub:hover, .core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_submit:hover, .core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_smile .lzl_insertsmiley_holder:hover {
  background-color: var(--default-hover);
}

.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_op_list a:hover, .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_jb .lzl_jb_in:hover, .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_s_r:hover {
  color: var(--tieba-theme-fore);
}

.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .at:active, .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_main a:active, .core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .lzl_more a:active, .core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .j_pager a:active, .core_reply .core_reply_wrapper .core_reply_content .btn-sub:active, .core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_submit:active, .core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_smile .lzl_insertsmiley_holder:active {
  background-color: var(--default-active);
}

.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_op_list a:active, .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_jb .lzl_jb_in:active, .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_s_r:active {
  color: var(--tieba-theme-active);
}

.core_reply {
  margin-right: 0;
  margin-right: initial;
}
.core_reply .core_reply_wrapper {
  border: none !important;
  border-radius: 10px !important;
  border-top-left-radius: 10px !important;
  border-top-right-radius: 10px !important;
  background-color: var(--very-light-background) !important;
}
.core_reply .core_reply_wrapper {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
}
html.dark-theme .core_reply .core_reply_wrapper {
  --very-light-background: #292929;
}
.core_reply .core_reply_wrapper .core_reply_content {
  padding-right: 20px;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post {
  margin-bottom: 12px;
  animation: kf-slide-in var(--default-duration);
  transform-origin: bottom;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post:not(.first_no_border) {
  padding-top: 0;
  margin-top: 0;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .at {
  padding: 2px 0;
  color: var(--default-fore);
  font-size: 14px;
  font-weight: var(--font-weight-bold);
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_main {
  font-size: 15px;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_main img {
  vertical-align: text-bottom;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply {
  display: flex;
  align-items: center;
  font-size: 13px;
  line-height: 28px;
  text-align: justify;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_op_list {
  color: var(--light-fore);
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_op_list a {
  color: var(--light-fore);
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_jb {
  order: 1;
  margin-left: auto;
  color: var(--light-fore);
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_jb .lzl_jb_in {
  padding: 0;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_single_post .lzl_cnt .lzl_content_reply .lzl_s_r {
  padding: 0;
  margin-left: 8px;
  color: var(--light-fore);
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager {
  border-top: none !important;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager {
  padding: 0;
  margin-top: -12px;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .lzl_more {
  font-size: 13px;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .j_pager {
  display: flex;
  align-items: center;
  font-family: var(--code-zh);
  font-size: 13px;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .j_pager .tP {
  width: auto;
  color: var(--tieba-theme-fore);
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .j_pager a {
  color: var(--light-fore);
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_li_pager .j_pager a:hover {
  color: var(--tieba-theme-fore);
}
.core_reply .core_reply_wrapper .core_reply_content .btn-sub {
  padding: 4px 0;
  border-radius: 0;
  background: none;
  font-size: 13px;
}
.core_reply .core_reply_wrapper .core_reply_content .edui-container {
  width: auto !important;
}
.core_reply .core_reply_wrapper .core_reply_content .edui-container {
  max-height: 64px;
}
.core_reply .core_reply_wrapper .core_reply_content .edui-container .edui-editor-body {
  height: -moz-max-content !important;
  height: max-content !important;
}
.core_reply .core_reply_wrapper .core_reply_content .edui-container .edui-editor-body {
  overflow: hidden;
  max-height: 72px;
  padding: 6px;
  border-radius: 6px;
}
.core_reply .core_reply_wrapper .core_reply_content .edui-container .edui-editor-body .edui-body-container {
  min-height: 16px !important;
}
.core_reply .core_reply_wrapper .core_reply_content .edui-container .edui-editor-body .edui-body-container {
  max-height: 64px;
  padding-left: 0;
  border-radius: 6px;
  font-size: 14px;
  overflow-y: auto;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_error {
  color: var(--error-color);
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper {
  width: 100%;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_btn {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  order: 1;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  background: var(--very-light-background);
  font-size: 0;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_submit::before {
  content: "";
  display: block;
  width: 16px;
  height: 16px;
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/%3E%3C/svg%3E") center/contain no-repeat;
          mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/%3E%3C/svg%3E") center/contain no-repeat;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_smile {
  position: static !important;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_smile {
  width: -moz-max-content;
  width: max-content;
  height: -moz-max-content;
  height: max-content;
  margin: 0;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_smile .lzl_insertsmiley_holder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  background: var(--very-light-background);
  font-size: 0;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_panel_smile .lzl_insertsmiley_holder::after {
  content: "";
  display: block;
  width: 16px;
  height: 16px;
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z'/%3E%3C/svg%3E") center/contain no-repeat;
          mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z'/%3E%3C/svg%3E") center/contain no-repeat;
}
.core_reply .core_reply_wrapper .core_reply_content .lzl_panel_wrapper .lzl_edui_dialog_container {
  position: fixed;
  z-index: 9999;
}

.lzl_edui_dialog_container {
  position: fixed !important;
  height: auto !important;
  background: transparent !important;
  box-shadow: none !important;
  overflow: visible !important;
}

.lzl_edui_dialog_container {
  z-index: 9999;
  width: -moz-fit-content;
  width: fit-content;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}
.lzl_edui_dialog_container[data-positioned=true] {
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}
.lzl_edui_dialog_container .inde_edui_dropdown_menu {
  overflow: hidden;
  border-radius: 8px;
  background: var(--default-background);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.lzl_edui_dialog_container .inde_edui_dropdown_menu,
.lzl_edui_dialog_container .emotion_container,
.lzl_edui_dialog_container .s_layer_content {
  height: auto !important;
  min-height: 0 !important;
  padding: 0 !important;
}
.lzl_edui_dialog_container .tbui_panel_content {
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
}
.lzl_edui_dialog_container .tbui_scroll_panel {
  height: auto !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
}
.lzl_edui_dialog_container .tbui_scroll_panel {
  max-height: min(70vh, 420px);
}
.lzl_edui_dialog_container .emotion_preview {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  padding: 0 !important;
  border: none !important;
  overflow: hidden !important;
  pointer-events: none !important;
}
.lzl_edui_dialog_container .s_layer_table {
  margin: 0;
}
.lzl_edui_dialog_container .s_layer_tab .s_tab_btn,
.lzl_edui_dialog_container .ueditor_emotion_tab .s_tab_btn {
  color: var(--default-fore);
}
.lzl_edui_dialog_container .s_layer_tab .s_tab_btn .s_tab_btnbg,
.lzl_edui_dialog_container .ueditor_emotion_tab .s_tab_btn .s_tab_btnbg {
  color: inherit;
}
.lzl_edui_dialog_container .s_layer_tab .s_tab_btn.selected,
.lzl_edui_dialog_container .s_layer_tab .selected,
.lzl_edui_dialog_container .ueditor_emotion_tab .s_tab_btn.selected,
.lzl_edui_dialog_container .ueditor_emotion_tab .selected {
  color: var(--default-background) !important;
}
.lzl_edui_dialog_container .s_layer_tab .s_tab_btn.selected,
.lzl_edui_dialog_container .s_layer_tab .selected,
.lzl_edui_dialog_container .ueditor_emotion_tab .s_tab_btn.selected,
.lzl_edui_dialog_container .ueditor_emotion_tab .selected {
  background: none;
}
.lzl_edui_dialog_container .s_layer_tab .s_tab_btn.selected .s_tab_btnbg,
.lzl_edui_dialog_container .s_layer_tab .selected .s_tab_btnbg,
.lzl_edui_dialog_container .ueditor_emotion_tab .s_tab_btn.selected .s_tab_btnbg,
.lzl_edui_dialog_container .ueditor_emotion_tab .selected .s_tab_btnbg {
  background-color: var(--tieba-theme-color) !important;
  color: var(--default-background) !important;
}
.lzl_edui_dialog_container .s_layer_tab .s_tab_btn.selected .s_tab_btnbg,
.lzl_edui_dialog_container .s_layer_tab .selected .s_tab_btnbg,
.lzl_edui_dialog_container .ueditor_emotion_tab .s_tab_btn.selected .s_tab_btnbg,
.lzl_edui_dialog_container .ueditor_emotion_tab .selected .s_tab_btnbg {
  font-weight: var(--font-weight-bold);
}
.lzl_edui_dialog_container .inde_edui_popup_caret {
  display: none;
}`;
    const compactStyle = "body[compact-layout] #j_p_postlist {\n  gap: 0;\n}\nbody[compact-layout] .core_reply_content li.first_no_border {\n  margin-top: -4px;\n}\nbody[compact-layout] .core_reply .core_reply_wrapper .core_reply_content .lzl_single_post {\n  margin-bottom: 0;\n}";
    function threadParser() {
      var _a;
      const postWrappers = dom(".l_post", []);
      const contents = dom(".d_post_content", []);
      const dAuthors = dom(".d_author", []);
      const avatars = dom(".p_author_face", []);
      const nameAnchors = dom(".p_author_name", []);
      const levels = dom(".d_badge_lv", []);
      const badgeTitles = dom(".d_badge_title", []);
      const replyButtons = dom(".lzl_link_unfold", []);
      const locations = _2.map(dom(".post-tail-wrap span:first-child, .ip-location", []), (el) => el.innerText);
      const platforms = _2.map(dom(".tail-info a, .p_tail_wap", []), (el) => el.innerText);
      const floors = _2.map(dom(".j_jb_ele + .tail-info + .tail-info, .p_tail li:first-child span", []), (el) => el.innerText);
      const times = _2.map(dom(".post-tail-wrap span:nth-last-child(2), .p_tail li:last-child span", []), (el) => el.innerText);
      const threadContents = [];
      for (let i = 0; i < contents.length; i++) {
        contents[i].classList.add("floor-content");
        avatars[i].classList.add("floor-avatar");
        nameAnchors[i].classList.add("floor-name");
        threadContents.push({
          post: contents[i],
          replyButton: replyButtons[i],
          dataField: _2.defaults(postWrappers[i].getAttribute("data-field"), ""),
          isLouzhu: !!dom(".louzhubiaoshi_wrap", dAuthors[i]),
          profile: {
            avatar: avatars[i],
            nameAnchor: nameAnchors[i],
            level: parseInt(levels[i].innerText),
            badgeTitle: badgeTitles[i].innerText
          },
          tail: {
            location: locations[i],
            platform: platforms[i],
            floor: floors[i],
            time: times[i]
          }
        });
      }
      const thread2 = {
        displayWrapper: dom(".wrap2", [])[0],
        title: PageData.thread.title,
        reply: +(((_a = dom(".l_reply_num span:nth-child(1)")) == null ? undefined : _a.innerText) ?? 0),
        pages: PageData.pager.total_page,
        lzOnlyButton: dom("#lzonly_cntn", [])[0],
        favorButton: dom(".j_favor", [])[0],
        cotents: threadContents,
        forum: {
          info: {
            name: PageData.forum.forum_name
            // followersDisplay: DOMS(true, ".card_menNum", "span").innerText,
            // postsDisplay: DOMS(true, ".card_infoNum", "span").innerText,
          },
          components: {
            nameAnchor: dom(".card_title_fname", [])[0],
            iconContainer: dom(".card_head a, .plat_picbox", [])[0],
            followButton: dom(".card_head .focus_btn", [])[0],
            signButton: dom(".j_sign_box", [])[0]
          }
        },
        pager: {
          listPager: dom(".pb_list_pager", [])[0],
          jumper: {
            textbox: dom(".jump_input_bright", [])[0],
            submitButton: dom(".jump_btn_bright", [])[0]
          }
        }
      };
      return thread2;
    }
    const threadStyle = '.post-tail-wrap .p_reply,\n.core_reply_tail:not(.clearfix) .p_reply, .post-tail-wrap .p_reply .lzl_link_fold,\n.core_reply_tail:not(.clearfix) .p_reply .lzl_link_fold, .content-wrapper .author-container .floor-name, .d_post_content a,\n.lzl_cnt .lzl_content_main a:not(.at) {\n  color: var(--tieba-theme-fore);\n  cursor: pointer;\n  -webkit-text-decoration: none;\n  text-decoration: none;\n  transition: var(--default-duration);\n}\n\n.d_post_content a,\n.lzl_cnt .lzl_content_main a:not(.at) {\n  text-decoration: underline;\n  -webkit-text-decoration: underline solid currentColor;\n          text-decoration: underline solid currentColor;\n  text-decoration-thickness: 1.2px;\n  -webkit-text-decoration: underline 1.2px;\n          text-decoration: underline 1.2px;\n}\n\n.post-tail-wrap a, .core_reply_tail:not(.clearfix) .p_mtail a,\n.core_reply_tail:not(.clearfix) .p_mtail .j_jb_ele::after {\n  cursor: pointer;\n  -webkit-text-decoration: none;\n  text-decoration: none;\n  transition: var(--default-duration);\n}\n\n.post-tail-wrap .p_reply:hover,\n.core_reply_tail:not(.clearfix) .p_reply:hover, .post-tail-wrap .p_reply .lzl_link_fold:hover,\n.core_reply_tail:not(.clearfix) .p_reply .lzl_link_fold:hover, .content-wrapper .author-container .floor-name:hover, .d_post_content a:hover,\n.lzl_cnt .lzl_content_main a:hover:not(.at) {\n  background-color: var(--default-hover);\n}\n\n.d_post_content a:hover,\n.lzl_cnt .lzl_content_main a:hover:not(.at) {\n  text-decoration: underline;\n  -webkit-text-decoration: underline solid rgba(0, 0, 0, 0);\n          text-decoration: underline solid rgba(0, 0, 0, 0);\n  text-decoration-thickness: 1.2px;\n  -webkit-text-decoration: underline 1.2px rgba(0, 0, 0, 0);\n          text-decoration: underline 1.2px rgba(0, 0, 0, 0);\n}\n\n.post-tail-wrap a:hover, .core_reply_tail:not(.clearfix) .p_mtail a:hover,\n.core_reply_tail:not(.clearfix) .p_mtail .j_jb_ele:hover::after {\n  color: var(--tieba-theme-fore);\n}\n\n.post-tail-wrap .p_reply:active,\n.core_reply_tail:not(.clearfix) .p_reply:active, .post-tail-wrap .p_reply .lzl_link_fold:active,\n.core_reply_tail:not(.clearfix) .p_reply .lzl_link_fold:active, .content-wrapper .author-container .floor-name:active, .d_post_content a:active,\n.lzl_cnt .lzl_content_main a:active:not(.at) {\n  background-color: var(--default-active);\n}\n\n.post-tail-wrap a:active, .core_reply_tail:not(.clearfix) .p_mtail a:active,\n.core_reply_tail:not(.clearfix) .p_mtail .j_jb_ele:active::after {\n  color: var(--tieba-theme-active);\n}\n\n.lzl_p_p img, .content-wrapper .author-container .floor-avatar img {\n  -o-object-fit: contain;\n     object-fit: contain;\n}\n\nbody {\n  background-color: var(--page-background);\n  overflow-x: hidden;\n}\n\nbody.special_conf_skin {\n  background: var(--page-background);\n}\n\n.wrap1 {\n  background: none !important;\n  background-color: transparent !important;\n}\n.wrap1 .wrap2 {\n  background: none !important;\n  background-color: transparent !important;\n}\n\n.head_inner {\n  display: none;\n}\n\n#container {\n  width: 100%;\n  max-width: 100%;\n  max-width: var(--content-max);\n  box-sizing: border-box;\n  margin-top: 86px;\n  transition: margin-top var(--default-duration);\n}\nhtml[data-nav-bar-mode=alwaysFold] #container, html[thread-top-collapsed] #container {\n  margin-top: 16px;\n}\n#container .content {\n  width: 100%;\n}\n#container .content .pb_content {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n  padding: 24px 48px;\n  border-radius: 4px 4px 0 0;\n  border-top: 2px solid var(--tieba-theme-color);\n  background-color: var(--default-background);\n  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);\n}\n#container .tittle_fill_dom {\n  display: none;\n}\n\n.card_top_wrap,\n.nav_wrap,\n.p_thread {\n  display: none;\n}\n\n.core_title_wrap_bright {\n  display: none !important;\n}\n\n#j_p_postlist {\n  display: flex;\n  box-sizing: border-box;\n  flex-direction: column;\n  gap: 16px;\n}\n#j_p_postlist .save_face_bg {\n  display: none;\n}\n#j_p_postlist .l_post_bright {\n  border: none;\n}\n#j_p_postlist .l_post_bright .d_post_content_main {\n  background-color: transparent !important;\n  background-color: initial !important;\n}\n#j_p_postlist .l_post_bright .d_post_content_main {\n  width: 100%;\n  padding: 0;\n}\n#j_p_postlist .l_post_bright .d_post_content_main .p_content {\n  min-height: 0;\n  min-height: initial;\n  padding: 0;\n  margin-bottom: -42px;\n  background-color: transparent;\n  background-color: initial;\n}\n#j_p_postlist .l_post_bright .d_post_content_main .p_content .shield-tip {\n  background: none;\n}\n#j_p_postlist .l_post_bright .d_post_content_main .p_content .d_post_content {\n  background-color: transparent !important;\n  background-color: initial !important;\n}\n#j_p_postlist .l_post_bright .d_post_content_main .p_content .d_post_content {\n  padding: 0;\n  font-size: 16px;\n  grid-area: content;\n}\n#j_p_postlist .l_post_bright .d_post_content_main .p_content .replace_div {\n  width: auto !important;\n}\n#j_p_postlist .l_post_bright .d_post_content_main .p_content .BDE_Smiley {\n  width: 24px;\n  height: 24px;\n  vertical-align: text-bottom;\n}\n#j_p_postlist .l_post_bright .d_post_content_main .p_content .BDE_Image {\n  display: flex;\n  width: auto;\n  max-width: min(100%, 320px);\n  height: auto;\n  max-height: 400px;\n  border-radius: 4px;\n  margin: 6px auto;\n  -o-object-fit: contain;\n     object-fit: contain;\n}\n#j_p_postlist div[data-po] {\n  display: none;\n}\n\n.main-wrapper {\n  display: flex;\n  max-width: 80%;\n  flex-direction: column;\n  padding: 8px;\n  margin: auto;\n  margin-top: 64px;\n}\n@media (min-width: 1200px) {\n  .main-wrapper {\n    max-width: 60%;\n  }\n}\n\n.left_section {\n  width: 100%;\n}\n\n.core_reply_wrapper {\n  padding-left: 42px;\n}\n\n.post-tail-wrap,\n.core_reply_tail:not(.clearfix) {\n  display: flex;\n  align-items: center;\n  margin-top: 0;\n  color: var(--light-fore);\n  float: none;\n  font-size: 13px;\n  gap: 12px;\n}\n.post-tail-wrap .question-image,\n.core_reply_tail:not(.clearfix) .question-image {\n  display: none;\n}\n.post-tail-wrap .p_reply,\n.core_reply_tail:not(.clearfix) .p_reply {\n  margin: 0;\n}\n.post-tail-wrap .p_reply .lzl_link_fold,\n.core_reply_tail:not(.clearfix) .p_reply .lzl_link_fold {\n  border: none;\n  background: none;\n}\n\n.post-tail-wrap .tail-info {\n  margin: 0;\n}\n.post-tail-wrap .tail-info:hover {\n  color: var(--light-fore);\n}\n.post-tail-wrap .tail-info a:hover,\n.post-tail-wrap a.tail-info:hover,\n.post-tail-wrap .j_jb_ele a:hover {\n  color: var(--tieba-theme-fore);\n}\n.post-tail-wrap .tail-info a:active,\n.post-tail-wrap a.tail-info:active,\n.post-tail-wrap .j_jb_ele a:active {\n  color: var(--tieba-theme-active);\n}\n\n.core_reply_tail:not(.clearfix) {\n  flex-direction: row-reverse;\n  justify-content: flex-end;\n}\n.core_reply_tail:not(.clearfix) .p_tail li,\n.core_reply_tail:not(.clearfix) .p_tail_txt,\n.core_reply_tail:not(.clearfix) .p_mtail a,\n.core_reply_tail:not(.clearfix) .ip-location {\n  color: var(--light-fore);\n}\n.core_reply_tail:not(.clearfix) .p_tail {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.core_reply_tail:not(.clearfix) .p_tail li {\n  margin: 0;\n}\n.core_reply_tail:not(.clearfix) .p_mtail {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.core_reply_tail:not(.clearfix) .p_mtail li {\n  margin: 0;\n}\n.core_reply_tail:not(.clearfix) .p_mtail a,\n.core_reply_tail:not(.clearfix) .p_mtail .j_jb_ele::after {\n  color: var(--light-fore);\n}\n.core_reply_tail:not(.clearfix) .p_mtail .j_jb_ele {\n  padding: 0;\n}\n.core_reply_tail:not(.clearfix) .p_props_tail.props_appraise_wrap {\n  display: none;\n}\n\n.right_section {\n  display: none;\n}\n\n#title-wrapper {\n  display: flex;\n  box-sizing: border-box;\n  align-items: flex-end;\n  justify-content: space-between;\n  margin: 16px 0;\n  gap: 8px;\n}\n.shrink-view #title-wrapper {\n  padding: 0 48px;\n}\n#title-wrapper .thread-title {\n  display: flex;\n  max-width: 60%;\n  margin: 0;\n  padding-left: 12px;\n  border-left: 4px solid var(--tieba-theme-color);\n  align-items: center;\n  font-size: 28px;\n  font-weight: var(--font-weight-normal);\n  line-height: 36px;\n  text-align: left;\n}\n#title-wrapper .forum-wrapper-button {\n  background-color: var(--trans-light-background) !important;\n}\n#title-wrapper .forum-wrapper-button {\n  display: flex;\n  overflow: hidden;\n  width: -moz-max-content;\n  width: max-content;\n  height: -moz-max-content;\n  height: max-content;\n  align-items: center;\n  padding: 3px 6px 3px 3px;\n  border-radius: 8px;\n  gap: 4px;\n}\nhtml[glass-effect] body.custom-background #title-wrapper .forum-wrapper-button {\n  -webkit-backdrop-filter: blur(24px);\n          backdrop-filter: blur(24px);\n}\nhtml[glass-effect].dark-theme body.custom-background #title-wrapper .forum-wrapper-button {\n  -webkit-backdrop-filter: blur(24px) brightness(0.8);\n          backdrop-filter: blur(24px) brightness(0.8);\n}\n#title-wrapper .forum-wrapper-button .forum-icon-link {\n  display: flex;\n  align-items: center;\n  border-radius: 8px;\n  line-height: 0;\n  -webkit-text-decoration: none;\n  text-decoration: none;\n  transition: opacity var(--default-duration);\n}\n#title-wrapper .forum-wrapper-button .forum-icon-link:hover {\n  opacity: 0.8;\n}\n#title-wrapper .forum-wrapper-button .forum-icon {\n  width: 32px;\n  height: 32px;\n  border-radius: 8px;\n}\n#title-wrapper .forum-wrapper-button .button-container {\n  display: flex;\n  align-items: center;\n}\n#title-wrapper .forum-wrapper-button .button-container .forum-button {\n  padding: 0 2px;\n  color: var(--tieba-theme-color);\n  font-size: 14px;\n  font-weight: var(--font-weight-bold);\n}\n#title-wrapper .forum-wrapper-button .button-container .forum-button:not(:hover):not(:active):not(:focus) {\n  background-color: transparent;\n}\n\n.forum-mask-wrapper {\n  position: relative;\n  z-index: -1;\n  display: flex;\n  justify-content: center;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n@keyframes mask-fade-in {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 0.1;\n  }\n}\n.forum-mask-wrapper .forum-mask {\n  position: absolute;\n  top: -320px;\n  width: 480px;\n  height: 480px;\n  border-radius: 480px;\n  animation: mask-fade-in 1s ease-in-out;\n  filter: blur(60px);\n  opacity: 0.1;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n\n.core_reply_content {\n  padding: 0;\n}\n\n.content-wrapper {\n  display: flex;\n  width: 100%;\n  flex-direction: column;\n  gap: 16px;\n}\n.content-wrapper .author-container {\n  display: grid;\n  align-items: center;\n  margin-bottom: -4px;\n  grid-column-gap: 8px;\n  -moz-column-gap: 8px;\n       column-gap: 8px;\n  grid-row-gap: 0;\n  row-gap: 0;\n  grid-template: "avatar name" auto "avatar tags" auto/36px 1fr;\n}\n.content-wrapper .author-container .floor-avatar {\n  width: -moz-max-content !important;\n  width: max-content !important;\n  height: -moz-max-content !important;\n  height: max-content !important;\n  padding: 0 !important;\n  border-radius: 4px !important;\n}\n.content-wrapper .author-container .floor-avatar {\n  overflow: hidden;\n  grid-area: avatar;\n}\n.content-wrapper .author-container .floor-avatar img {\n  width: 36px;\n  height: 36px;\n  aspect-ratio: 1/1;\n  border-radius: 4px;\n  -o-object-fit: cover;\n     object-fit: cover;\n}\n.content-wrapper .author-container .floor-name {\n  width: -moz-fit-content;\n  width: fit-content;\n  color: var(--highlight-fore);\n  font-size: 14px;\n  font-weight: var(--font-weight-bold);\n  line-height: 18px;\n  transform: translateY(-5px);\n  grid-area: name;\n}\n.content-wrapper .author-container .badge-container {\n  display: flex;\n  align-items: center;\n  margin-top: -4px;\n  gap: 4px;\n  transform: translateY(-5px);\n  grid-area: tags;\n}\n.content-wrapper .author-container .badge-container .floor-badge {\n  display: flex;\n  align-items: center;\n  width: -moz-fit-content;\n  width: fit-content;\n  height: 14px;\n  padding: 0 4px;\n  border-radius: 3px;\n  background-color: var(--trans-light-background);\n  color: var(--light-fore);\n  font-size: 11px;\n  gap: 4px;\n  line-height: 14px;\n}\n.content-wrapper .author-container .badge-container .floor-badge .badge-level {\n  font-weight: var(--font-weight-bold);\n}\n.content-wrapper .floor-wrapper {\n  display: grid;\n  grid-template: "avatar name" auto "avatar tags" auto "content content" 1fr "footer footer" auto "comments comments" auto/36px 1fr;\n}\n.content-wrapper .floor-wrapper .floor-avatar {\n  width: -moz-max-content !important;\n  width: max-content !important;\n  height: -moz-max-content !important;\n  height: max-content !important;\n  padding: 0 !important;\n  border-radius: 4px !important;\n}\n.content-wrapper .floor-wrapper .floor-avatar {\n  overflow: hidden;\n  grid-area: avatar;\n}\n.content-wrapper .floor-wrapper .floor-avatar img {\n  width: 36px;\n  height: 36px;\n  aspect-ratio: 1/1;\n  border-radius: 4px;\n  -o-object-fit: cover;\n     object-fit: cover;\n}\n.content-wrapper .floor-wrapper .floor-name {\n  width: -moz-fit-content;\n  width: fit-content;\n  margin: 0 8px 4px;\n  font-size: 14px;\n  grid-area: name;\n}\n.content-wrapper .floor-wrapper .floor-badge {\n  display: flex;\n  width: -moz-fit-content;\n  width: fit-content;\n  padding: 0 6px;\n  border-radius: 4px;\n  margin: 0 8px 8px;\n  background-color: var(--trans-light-background);\n  color: var(--light-fore);\n  gap: 6px;\n  grid-area: tags;\n}\n.content-wrapper .floor-wrapper .floor-badge .badge-level {\n  font-weight: var(--font-weight-bold);\n}\n.content-wrapper .floor-wrapper .floor-content {\n  padding: 8px 0;\n  font-size: 16px;\n  grid-area: content;\n}\n.content-wrapper .floor-wrapper .floor-content .BDE_Smiley {\n  width: 24px;\n  height: 24px;\n  vertical-align: sub;\n}\n.content-wrapper .floor-wrapper .floor-info {\n  display: flex;\n  justify-content: flex-end;\n  color: var(--light-fore);\n  gap: 12px;\n  grid-area: footer;\n}\n.content-wrapper .floor-wrapper .floor-comments {\n  width: 100%;\n  grid-area: comments;\n}\n.content-wrapper .floor-wrapper .floor-comments .core_reply_wrapper {\n  width: 100%;\n}\n\n#ueditor_replace {\n  overflow: hidden;\n}\n\n#thread-jsx-components {\n  display: flex;\n  box-sizing: border-box;\n  flex-direction: column;\n  gap: 12px;\n}\n#thread-jsx-components .dummy-button {\n  width: 100%;\n  padding: 8px 0 0;\n  border: none;\n  border-radius: 0;\n  border-bottom: 3px solid var(--border-color);\n  margin-top: 8px;\n  background-color: transparent;\n  box-shadow: none;\n  color: var(--minimal-fore);\n  cursor: text;\n  font-size: 16px;\n  text-align: justify;\n}\n#thread-jsx-components .dummy-button:hover {\n  border-color: var(--light-background);\n}\n#thread-jsx-components .dummy-button:focus {\n  border-color: var(--tieba-theme-color);\n}\n\n.pb_footer {\n  display: none;\n}\n\n.post-foot-send-gift-container {\n  display: none;\n}\n\n.svelte-zmnt4x {\n  display: none;\n}\n\n.wrap2 {\n  padding-bottom: 0 !important;\n}\n\n.head_ad_pop {\n  display: none !important;\n}\n\n.plat_head,\n.star_nav_wrap {\n  display: none;\n}\n\n.error {\n  background: none;\n}';
    async function thread() {
      if (!pageExtension.get().thread) return;
      if (currentPageType() !== "thread") return;
      function normalizeCommentEmotionPanel(root = document, reposition = false) {
        const viewportPadding = 12;
        const triggerGap = 8;
        _2.forEach(root.querySelectorAll(".lzl_edui_dialog_container"), (panel) => {
          var _a;
          if (getComputedStyle(panel).display === "none") {
            panel.dataset.positioned = "false";
            panel.style.width = "";
            panel.style.height = "";
            panel.style.top = "";
            panel.style.bottom = "";
            panel.style.left = "";
            return;
          }
          const dropdown = panel.querySelector(".inde_edui_dropdown_menu");
          const container = panel.querySelector(".emotion_container");
          const content2 = panel.querySelector(".s_layer_content");
          const scrollPanel = panel.querySelector(".tbui_scroll_panel");
          const contentPanel = panel.querySelector(".tbui_panel_content");
          const table = panel.querySelector(".s_layer_table");
          const tab = panel.querySelector(".s_layer_tab, .ueditor_emotion_tab");
          const preview = panel.querySelector(".emotion_preview");
          const trigger = (_a = panel.parentElement) == null ? undefined : _a.querySelector(".j_lzl_p_sm, .lzl_panel_smile");
          if (!scrollPanel || !contentPanel || !table) return;
          const tableHeight = Math.ceil(table.getBoundingClientRect().height);
          const tabHeight = tab ? Math.ceil(tab.getBoundingClientRect().height) : 0;
          const panelHeight = tableHeight;
          [panel, dropdown, container, content2, scrollPanel, contentPanel].forEach((elem) => {
            if (!elem) return;
            elem.style.height = "auto";
            elem.style.minHeight = "0";
          });
          contentPanel.style.height = `${panelHeight}px`;
          contentPanel.style.overflow = "visible";
          scrollPanel.style.height = `${panelHeight}px`;
          scrollPanel.style.overflowX = "hidden";
          scrollPanel.style.overflowY = "auto";
          if (preview) {
            preview.style.display = "none";
            preview.style.width = "0";
            preview.style.height = "0";
            preview.style.padding = "0";
            preview.style.border = "none";
            preview.style.overflow = "hidden";
          }
          if (dropdown) {
            const totalHeight = panelHeight + tabHeight;
            dropdown.style.height = `${totalHeight}px`;
            panel.style.height = `${totalHeight}px`;
            const dropdownWidth = Math.ceil(dropdown.getBoundingClientRect().width);
            if (dropdownWidth <= 0) return;
            panel.style.width = `${dropdownWidth}px`;
            if (trigger) {
              const triggerRect = trigger.getBoundingClientRect();
              if (reposition) {
                const maxLeft = Math.max(viewportPadding, window.innerWidth - dropdownWidth - viewportPadding);
                const left = Math.min(Math.max(triggerRect.right - dropdownWidth, viewportPadding), maxLeft);
                const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
                const spaceAbove = triggerRect.top - viewportPadding;
                let verticalPlacement = "below";
                if (spaceBelow < totalHeight + triggerGap && spaceAbove >= totalHeight + triggerGap) {
                  verticalPlacement = "above";
                } else if (spaceBelow < totalHeight + triggerGap && spaceAbove < totalHeight + triggerGap) {
                  verticalPlacement = spaceAbove > spaceBelow ? "above" : "below";
                }
                panel.dataset.verticalPlacement = verticalPlacement;
                panel.style.left = `${Math.round(left)}px`;
                panel.style.right = "auto";
                panel.style.transform = "none";
              }
              if (panel.dataset.verticalPlacement === "above") {
                const bottom = Math.round(window.innerHeight - triggerRect.top + triggerGap);
                const projectedTop = window.innerHeight - bottom - totalHeight;
                if (projectedTop >= viewportPadding) {
                  panel.style.top = "auto";
                  panel.style.bottom = `${bottom}px`;
                } else {
                  panel.style.top = `${viewportPadding}px`;
                  panel.style.bottom = "auto";
                }
              } else {
                const top = Math.min(Math.max(triggerRect.bottom + triggerGap, viewportPadding), Math.max(viewportPadding, window.innerHeight - totalHeight - viewportPadding));
                panel.style.top = `${Math.round(top)}px`;
                panel.style.bottom = "auto";
              }
            }
            panel.dataset.positioned = "true";
          }
        });
      }
      function scheduleCommentEmotionPanelNormalize(reposition = false) {
        const delays = [0, 60, 180];
        delays.forEach((delay) => {
          window.setTimeout(() => {
            requestAnimationFrame(() => normalizeCommentEmotionPanel(document, reposition));
          }, delay);
        });
      }
      overwriteCSS(threadStyle, compactStyle, commentsStyle);
      await waitUntil(() => !_2.isNil(document.body)).then(function() {
        if (compactLayout.get()) {
          document.body.toggleAttribute("compact-layout");
        }
      });
      (function setupScrollCollapse() {
        let collapsed = false;
        let lastScrollY = window.scrollY;
        const handle = _2.throttle(function() {
          if (collapsed) return;
          if (navBarHideMode.get() !== "fold") return;
          if (window.scrollY > lastScrollY && window.scrollY > 8) {
            document.documentElement.toggleAttribute("thread-top-collapsed", true);
            collapsed = true;
          }
          lastScrollY = window.scrollY;
        }, 100);
        window.addEventListener("scroll", handle, {
          passive: true
        });
        navBarHideMode.on("setter", (mode) => {
          if (mode !== "fold") {
            document.documentElement.removeAttribute("thread-top-collapsed");
            collapsed = false;
            lastScrollY = window.scrollY;
          }
        });
      })();
      waitUntil(() => !_2.isNil(floatBar.get())).then(function() {
        let settingsPanel;
        const settingsButton = floatBar.add("other", function() {
          var _a, _b;
          if (settingsPanel) {
            (_b = (_a = settingsPanel.instance).unload) == null ? undefined : _b.call(_a);
            return;
          }
          const rect = settingsButton.el.getBoundingClientRect();
          settingsButton.el.classList.add("is-open");
          settingsPanel = renderDialog(_sfc_main$2, {
            toggles: [{
              icon: "favorite",
              name: "收藏",
              defaultValue: function() {
                var _a2;
                return ((_a2 = dom(".j_favor, #j_favthread .p_favthr_main")) == null ? undefined : _a2.innerText) === "收藏" ? false : true;
              }(),
              event() {
                var _a2;
                (_a2 = dom(".j_favor, #j_favthread .p_favthr_main")) == null ? undefined : _a2.click();
              }
            }, {
              icon: "face_6",
              name: "只看楼主",
              defaultValue: function() {
                var _a2;
                return ((_a2 = dom("#lzonly_cntn")) == null ? undefined : _a2.innerText) === "只看楼主" ? false : true;
              }(),
              event() {
                var _a2;
                (_a2 = dom("#lzonly_cntn")) == null ? undefined : _a2.click();
              }
            }, {
              icon: "compare_arrows",
              name: "紧凑布局",
              defaultValue: (() => compactLayout.get())(),
              event() {
                document.body.toggleAttribute("compact-layout");
                compactLayout.set(!compactLayout.get());
              }
            }],
            anchorRect: {
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
              width: rect.width,
              height: rect.height
            }
          }, {
            unloaded() {
              settingsPanel = undefined;
              settingsButton.el.classList.remove("is-open");
            },
            abnormalUnload() {
              settingsPanel = undefined;
              settingsButton.el.classList.remove("is-open");
            }
          });
        }, "module-settings", "menu");
        setFloatButtonTooltip(settingsButton.el, "更多");
        document.body.insertBefore(domrd("div", {
          class: "vue-module-control",
          style: "display: none;"
        }), document.body.firstChild);
      });
      const content = await asyncdom(".content");
      const pbContent = await asyncdom("#pb_content");
      createContents();
      async function createContents() {
        var _a;
        const threadList = await asyncdom("#j_p_postlist");
        threadList.classList.add("content-wrapper");
        let thread2 = threadParser();
        const forumIconLink = thread2.forum.components.iconContainer.children[0].src;
        insertJSX(vue.createVNode("div", {
          "id": "title-wrapper"
        }, [vue.createVNode("h3", {
          "class": "thread-title"
        }, [_2.unescape(_2(PageData.thread.title).split("回复：").last()).replace(/&#039;/g, "'").replace(/&quot;/g, '"')]), vue.createVNode("div", {
          "class": "forum-wrapper-button"
        }, [vue.createVNode("a", {
          "class": "forum-icon-link",
          "href": tiebaAPI.URL_forum(PageData.forum.forum_name),
          "title": `进入${PageData.forum.forum_name}吧`
        }, [vue.createVNode("img", {
          "class": "forum-icon",
          "src": forumIconLink,
          "alt": "吧头像"
        }, null)]), vue.createVNode("div", {
          "class": "button-container"
        }, [vue.createVNode(userView.UserButton, {
          "class": "icon forum-button add-forum-button",
          "noBorder": true,
          "onClick": () => {
            var _a2;
            return (_a2 = dom("#j_head_focus_btn")) == null ? undefined : _a2.click();
          }
        }, {
          default: () => [PageData.user.is_like ? "check" : "add"]
        })])])]), content, pbContent);
        (_a = dom(".sign-in-button")) == null ? undefined : _a.addEventListener("click", function() {
          var _a2;
          (_a2 = dom(".j_signbtn")) == null ? undefined : _a2.click();
        });
        document.addEventListener("DOMContentLoaded", function() {
          threadFloorsObserver.addEvent(function() {
            _2.forEach(dom(".j_jb_ele a", []), (el) => {
              var _a2;
              if (((_a2 = el.lastChild) == null ? undefined : _a2.nodeType) !== Node.TEXT_NODE) {
                el.appendChild(new Text("举报"));
              }
            });
          });
          if (PageData.pager.cur_page === 1 && PageData.thread.reply_num > 1) {
            const firstFloor = dom(".l_post", threadList);
            if (firstFloor) firstFloor.style.borderBottom = "2px solid var(--tieba-theme-fore) !important";
          }
        }, {
          once: true
        });
        threadFloorsObserver.addEvent(function() {
          if (dom(".d_author", []).length === 0) return;
          thread2 = threadParser();
          _2.forEach(dom(".d_post_content_main", threadList, []), (floor, i) => {
            const authorContainer = createAuthorContainer(i);
            floor.insertBefore(authorContainer, floor.firstChild);
          });
          _2.forEach(dom(".d_author", []), (el) => el.remove());
        });
        function createAuthorContainer(index2) {
          const authorContainer = domrd("div", {
            class: "author-container"
          });
          thread2.cotents[index2].profile.nameAnchor.classList.add("anchor");
          authorContainer.appendChild(thread2.cotents[index2].profile.avatar);
          authorContainer.appendChild(thread2.cotents[index2].profile.nameAnchor);
          const badgeContainer = appendJSX(vue.createVNode("div", {
            "class": "badge-container"
          }, null), authorContainer);
          appendJSX(vue.createVNode("div", {
            "class": `floor-badge level-${levelToClass(thread2.cotents[index2].profile.level)}`
          }, [vue.createVNode("div", {
            "class": "badge-level"
          }, [thread2.cotents[index2].profile.level]), vue.createVNode("div", {
            "class": "badge-title"
          }, [thread2.cotents[index2].profile.badgeTitle])]), badgeContainer.root);
          if (thread2.cotents[index2].isLouzhu) appendJSX(vue.createVNode("div", {
            "class": "floor-badge"
          }, [vue.createTextVNode("楼主")]), badgeContainer.root);
          return authorContainer;
        }
        const avatarObserver = new IntersectionObserver(function(entries, observer) {
          _2.forEach(entries, function(entry) {
            if (entry.isIntersecting) {
              const avatar = entry.target.children[0];
              const lazyLink = avatar.getAttribute("data-tb-lazyload");
              if (avatar.src !== lazyLink) {
                if (lazyLink) avatar.src = lazyLink;
                else observer.unobserve(entry.target);
              } else {
                observer.unobserve(entry.target);
              }
            }
          });
        }, {
          root: null,
          rootMargin: "0px",
          threshold: 0.5
        });
        _2.forEach(thread2.cotents, (content2) => {
          avatarObserver.observe(content2.profile.avatar);
        });
        threadFloorsObserver.addEvent(async () => {
          await waitUntil(() => !!PageData.thread.thread_id);
          _2.forEach(dom(".BDE_Image", threadList, []), (el) => {
            const newEl = el.cloneNode(false);
            const postContent = findParent(el, "d_post_content");
            let ancestor = el.parentElement;
            while (ancestor && ancestor !== postContent) {
              if (ancestor instanceof HTMLAnchorElement) {
                ancestor.removeAttribute("href");
                ancestor.removeAttribute("target");
                ancestor.style.cursor = "pointer";
              }
              ancestor = ancestor.parentElement;
            }
            newEl.dataset.pid = _2(postContent == null ? undefined : postContent.id).split("_").last();
            const stop = (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();
            };
            newEl.addEventListener("mousedown", stop, true);
            newEl.addEventListener("auxclick", stop, true);
            newEl.addEventListener("click", async function(e) {
              e.preventDefault();
              e.stopImmediatePropagation();
              if (threadImageQueueScope.get() === "floor") {
                const floorImages = dom(".BDE_Image", postContent, []);
                const pictureList = _2.map(floorImages, (img) => ({
                  original: img.src,
                  thumbnail: img.src
                }));
                const localIndex = _2.findIndex(floorImages, (img) => img === newEl);
                imagesViewer({
                  content: pictureList,
                  defaultIndex: Math.max(0, localIndex)
                });
                return;
              }
              if (!_2.isNil(currentStorage.get(THREAD_IMAGES))) {
                showImage();
                return;
              }
              try {
                await getAllThreadImages({
                  threadId: PageData.thread.thread_id,
                  lzOnly: false
                });
                showImage();
              } catch (err) {
                console.warn("[Tieba-Remix] 拉取帖子图片失败:", err);
              }
              async function showImage() {
                if (_2.isNil(newEl.dataset.index)) {
                  newEl.dataset.index = `${_2.findIndex(await getAllThreadImages({
                  threadId: PageData.thread.thread_id,
                  lzOnly: false
                }), {
                  postId: +(newEl.dataset.pid ?? 0)
                }) + _2.findIndex(dom(".BDE_Image", postContent, []), (img) => img === newEl)}`;
                }
                imagesViewer({
                  content: await getAllThreadImages({
                    threadId: PageData.thread.thread_id,
                    lzOnly: false
                  }),
                  defaultIndex: parseInt(newEl.dataset.index ?? "0", 10)
                });
              }
            });
            el.replaceWith(newEl);
          });
        });
        threadCommentsObserver.addEvent(() => {
          _2.forEach(dom(".lzl_cnt", []), (el) => {
            _2.forEach(el.childNodes, (node) => {
              if (node) node.nodeType === 3 ? node.remove() : undefined;
            });
          });
          requestAnimationFrame(() => normalizeCommentEmotionPanel());
        });
        document.addEventListener("mousedown", (event) => {
          var _a2;
          const target = event.target;
          if (!(target instanceof Element)) return;
          const trigger = target.closest(".j_lzl_p_sm, .lzl_panel_smile");
          if (!trigger) return;
          const panel = (_a2 = trigger.parentElement) == null ? undefined : _a2.querySelector(".lzl_edui_dialog_container");
          if (panel) panel.dataset.positioned = "false";
        }, true);
        document.addEventListener("click", (event) => {
          var _a2;
          const target = event.target;
          if (!(target instanceof Element)) return;
          const trigger = target.closest(".j_lzl_p_sm, .lzl_panel_smile");
          const panelAction = target.closest(".j_emotion, .s_tab_btn, .s_prev, .s_next");
          if (!trigger && !panelAction) return;
          const shouldReposition = !!trigger;
          if (trigger) {
            const panel = (_a2 = trigger.parentElement) == null ? undefined : _a2.querySelector(".lzl_edui_dialog_container");
            if (panel) panel.dataset.positioned = "false";
          }
          scheduleCommentEmotionPanelNormalize(shouldReposition);
        }, true);
        const syncOpenEmotionPanels = () => {
          if (!document.querySelector(".lzl_edui_dialog_container[style*='display: block']")) return;
          requestAnimationFrame(() => normalizeCommentEmotionPanel(document, true));
        };
        window.addEventListener("resize", syncOpenEmotionPanels);
        window.addEventListener("scroll", syncOpenEmotionPanels, true);
      }
      const pagerVNodes = [];
      const insertPager = (parent, position, additionalStyles) => {
        const {
          vnode: pagerVNode
        } = insertJSX(createPager(additionalStyles), parent, position ?? undefined);
        pagerVNodes.push(pagerVNode);
        function createPager(additionalStyles2) {
          const pagerComponent = vue.createVNode(Pager$1, {
            "total": PageData.pager.total_page,
            "current": PageData.pager.cur_page,
            "showPagers": PageData.pager.total_page > 1,
            "pagerChange": function(page) {
              pager.jumpTo(page);
              _2.forEach(pagerVNodes, (pagerVNode2) => {
                pagerVNode2.component.exposeProxy.current = page;
              });
            },
            "style": parseCSSRule({
              width: "100%",
              padding: "0",
              ...additionalStyles2
            })
          }, {
            tailSlot: () => `回帖 ${PageData.thread.reply_num - 1}`
          });
          return pagerComponent;
        }
      };
      insertPager(pbContent, pbContent.firstChild, {
        marginBottom: "24px",
        position: PageData.pager.total_page <= 1 ? "absolute" : "",
        right: PageData.pager.total_page <= 1 ? "48px" : ""
      });
      createTextbox();
      async function createTextbox() {
        await waitUntil(() => !_2.isNil(floatBar.get()));
        await waitUntil(() => !_2.isNil(dom("#ueditor_replace")));
        if (!_2.some(floatBar.buttons(), {
          type: "post"
        })) {
          floatBar.add("post", showEditor, undefined, undefined, 2);
        }
        const postButton = _2.find(floatBar.buttons(), (button) => {
          return button.type === "post";
        });
        postButton == null ? undefined : postButton.el.addEventListener("click", showEditor);
        insertPager(pbContent, pbContent.lastChild, {
          paddingTop: "24px"
        });
        appendJSX(vue.createVNode("div", {
          "id": "thread-jsx-components"
        }, [vue.createVNode(userView.UserButton, {
          "class": "dummy-button",
          "noBorder": true,
          "onClick": showEditor
        }, {
          default: () => [vue.createTextVNode("回复帖子")]
        })]), pbContent);
        function showEditor() {
          const editorBody = dom("#ueditor_replace");
          const ueditor = (editorBody == null ? undefined : editorBody.closest(".edui-container")) ?? editorBody;
          if (ueditor) {
            renderDialog(vue.createVNode(ThreadEditor, {
              "ueditor": ueditor,
              "type": "reply"
            }, null));
          }
        }
      }
    }
    let installed$5 = false;
    function installForumAsideCollapse() {
      if (installed$5) return;
      if (currentPageType() !== "forum") return;
      installed$5 = true;
      const onReady = () => {
        if (!document.documentElement.classList.contains("style-vercel")) return;
        const aside = document.querySelector(".aside");
        if (!aside) return;
        initCollapseAll(aside);
        aside.addEventListener("click", (e) => {
          const target = e.target;
          if (!(target == null ? undefined : target.closest)) return;
          const header = target.closest(".region_header");
          if (!header) return;
          if (e.target.closest("a")) return;
          const region = header.closest(".aside_region");
          if (!region) return;
          const collapsed = region.dataset.collapsed === "true";
          if (collapsed) {
            delete region.dataset.collapsed;
          } else {
            region.dataset.collapsed = "true";
          }
        });
        const observer = new MutationObserver(() => initCollapseAll(aside));
        observer.observe(aside, { childList: true, subtree: true });
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
      } else {
        onReady();
      }
    }
    function initCollapseAll(root) {
      root.querySelectorAll(".aside_region").forEach((region) => {
        if (region.dataset.collapseInit === "true") return;
        region.dataset.collapseInit = "true";
        region.dataset.collapsed = "true";
      });
    }
    let installed$4 = false;
    function installForumAuthorFullId() {
      if (installed$4) return;
      if (currentPageType() !== "forum") return;
      installed$4 = true;
      void (async () => {
        if (!document.documentElement.classList.contains("style-vercel")) return;
        const threadlist = await asyncdom(".threadlist_bright");
        if (!threadlist) return;
        const applyAll = () => {
          const links = threadlist.querySelectorAll(
            ".threadlist_author .frs-author-name"
          );
          if (links.length === 0) return;
          const updates = [];
          for (const a of links) {
            const fullName = extractFullName(a);
            if (!fullName) continue;
            if (a.textContent === fullName) continue;
            updates.push([a, fullName]);
          }
          for (const [a, name] of updates) {
            a.textContent = name;
          }
        };
        applyAll();
        const obs = new MutationObserver(applyAll);
        obs.observe(threadlist, {
          childList: true,
          subtree: true
        });
      })();
    }
    function extractFullName(a) {
      const href = a.getAttribute("href");
      if (href) {
        const match = href.match(/[?&]un=([^&#]+)/);
        if (match) {
          try {
            const decoded = decodeURIComponent(match[1]);
            if (decoded) return decoded;
          } catch {
          }
        }
      }
      const wrap = a.closest(".tb_icon_author");
      const title = wrap == null ? undefined : wrap.getAttribute("title");
      if (title) {
        const m = title.match(/[:：]\s*(.+)$/);
        if (m) {
          const name = m[1].trim();
          if (name) return name;
        }
      }
      return null;
    }
    let installed$3 = false;
    function installForumImageTakeover() {
      if (installed$3) return;
      if (currentPageType() !== "forum") return;
      installed$3 = true;
      document.addEventListener("click", function(e) {
        if (!document.documentElement.classList.contains("style-vercel")) return;
        const target = e.target;
        if (!(target == null ? undefined : target.closest)) return;
        const picLi = target.closest(".threadlist_media > li");
        if (!picLi) return;
        const threadLi = picLi.closest(".j_thread_list[data-tid]");
        if (!threadLi) return;
        const tid = Number(threadLi.dataset.tid);
        if (!Number.isFinite(tid) || tid <= 0) return;
        const mediaList = picLi.parentElement;
        if (!mediaList) return;
        const index2 = Math.max(0, Array.prototype.indexOf.call(mediaList.children, picLi));
        e.preventDefault();
        e.stopPropagation();
        openThreadImages(tid, index2);
      }, { capture: true });
    }
    let installed$2 = false;
    function installForumPinnedFoldWatcher() {
      if (installed$2) return;
      if (currentPageType() !== "forum") return;
      installed$2 = true;
      void (async () => {
        if (!document.documentElement.classList.contains("style-vercel")) return;
        const threadlist = await asyncdom(".threadlist_bright");
        if (!threadlist) return;
        const sync = () => {
          const folderLi = threadlist.querySelector(".thread_top_list_folder");
          if (!folderLi) return;
          const innerThreads = folderLi.querySelectorAll(".thread_top_list > li");
          if (innerThreads.length === 0) {
            folderLi.classList.add("pinned-folded");
            return;
          }
          const allHidden = Array.from(innerThreads).every((t) => t.style.display === "none");
          folderLi.classList.toggle("pinned-folded", allHidden);
        };
        sync();
        const obs = new MutationObserver(sync);
        obs.observe(threadlist, {
          attributes: true,
          attributeFilter: ["style"],
          childList: true,
          subtree: true
        });
      })();
    }
    let installed$1 = false;
    function installThreadFloorTag() {
      if (installed$1) return;
      if (currentPageType() !== "thread") return;
      installed$1 = true;
      const tag = () => {
        document.querySelectorAll(".post-tail-wrap .tail-info").forEach((el) => {
          if (el.classList.contains("vercel-floor-tag")) return;
          const text = (el.textContent ?? "").trim();
          const match = /^(\d+)楼$/.exec(text);
          if (match) {
            el.classList.add("vercel-floor-tag");
            el.dataset.floorNum = match[1];
            const next = el.nextElementSibling;
            if (next instanceof HTMLElement && next.classList.contains("tail-info")) {
              next.classList.add("vercel-time-tag");
            }
          }
        });
      };
      threadFloorsObserver.addEvent(tag);
      tag();
    }
    let installed = false;
    const PROCESSED = "vercelImageGridProcessed";
    const GRID_CLASS = "vercel-image-grid";
    function installThreadImageGrid() {
      if (installed) return;
      if (currentPageType() !== "thread") return;
      if (styleTheme.get() !== "vercel") return;
      installed = true;
      const process = () => {
        document.querySelectorAll(".d_post_content").forEach((content) => {
          if (content.dataset[PROCESSED]) return;
          const units = Array.from(
            content.querySelectorAll(":scope > .BDE_Image, :scope > .replace_div")
          );
          if (units.length >= 2) {
            const groups = [];
            let current = [];
            for (const unit of units) {
              if (current.length === 0) {
                current.push(unit);
                continue;
              }
              const prev = current[current.length - 1];
              if (adjacentByBrOrSpace(prev, unit)) {
                current.push(unit);
              } else {
                if (current.length >= 2) groups.push(current);
                current = [unit];
              }
            }
            if (current.length >= 2) groups.push(current);
            for (const group of groups) wrapIntoGrid(group);
          }
          content.dataset[PROCESSED] = "1";
        });
      };
      threadFloorsObserver.addEvent(process);
      process();
    }
    function adjacentByBrOrSpace(a, b) {
      let node = a.nextSibling;
      while (node && node !== b) {
        const ok = node.nodeName === "BR" || node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() === "";
        if (!ok) return false;
        node = node.nextSibling;
      }
      return node === b;
    }
    function wrapIntoGrid(group) {
      var _a;
      const first = group[0];
      const last = group[group.length - 1];
      const parent = first.parentElement;
      if (!parent) return;
      const wrap = document.createElement("div");
      wrap.className = GRID_CLASS;
      parent.insertBefore(wrap, first);
      let cursor = first;
      while (cursor) {
        const next = cursor.nextSibling;
        const isLast = cursor === last;
        if (cursor.nodeName === "BR" || cursor.nodeType === Node.TEXT_NODE && (cursor.textContent ?? "").trim() === "") {
          (_a = cursor.parentNode) == null ? undefined : _a.removeChild(cursor);
        } else {
          wrap.appendChild(cursor);
        }
        if (isLast) break;
        cursor = next;
      }
    }
    setupLegacyRedirect(bootstrap);
    function bootstrap({ onReady }) {
      setTheme(themeType.get());
      setStyleTheme(styleTheme.get());
      darkPrefers.addEventListener("change", () => setTheme(themeType.get()));
      document.documentElement.toggleAttribute("glass-effect", glassEffect.get());
      document.documentElement.dataset.navBarMode = navBarHideMode.get();
      document.documentElement.dataset.pageType = currentPageType();
      installForumImageTakeover();
      installForumAsideCollapse();
      installForumPinnedFoldWatcher();
      installForumAuthorFullId();
      installThreadFloorTag();
      installThreadImageGrid();
      const cssReady = Promise.all([loadDynamicCSS(), loadMainCSS()]);
      cssReady.then(onReady, onReady);
      Promise.all([
        cssReady,
        index$e(),
        thread(),
        parseUserModules(
          /* @__PURE__ */ Object.assign({ "./modules/easy-jump/index.ts": () => Promise.resolve().then(() => index$d), "./modules/no-login/index.ts": () => Promise.resolve().then(() => index$b), "./modules/notrans-emojis/index.ts": () => Promise.resolve().then(() => index$9), "./modules/portal/index.ts": () => Promise.resolve().then(() => index$7), "./modules/remixed-theme/index.ts": () => Promise.resolve().then(() => index$5), "./modules/shield/index.ts": () => Promise.resolve().then(() => index$g), "./modules/tieba-tags/index.ts": () => Promise.resolve().then(() => index$3), "./modules/toolkit/index.ts": () => Promise.resolve().then(() => index$1) }),
          (module) => {
            AllModules().push(module);
          }
        ),
        document.addEventListener("DOMContentLoaded", function() {
          if (currentPageType() === "thread") {
            threadFloorsObserver.observe();
            threadCommentsObserver.observe();
          }
          if (currentPageType() === "index") {
            if (!pageExtension.get().index)
              legacyIndexFeedsObserver.observe();
          }
          if (currentPageType() === "forum") {
            forumThreadsObserver.observe();
          }
        })
      ]);
      window.addEventListener("load", function() {
        checkUpdateAndNotify();
      });
      waitUntil(() => !_2.isNil(document.body)).then(function() {
        if (!showBottomEditor.get()) {
          document.body.toggleAttribute("hide-bottom-editor", true);
        }
        const syncHtmlScrollLock = () => {
          if (document.body.hasAttribute("no-scrollbar")) {
            document.documentElement.style.overflow = "hidden";
          } else {
            document.documentElement.style.overflow = "";
          }
        };
        new MutationObserver(syncHtmlScrollLock).observe(document.body, {
          attributes: true,
          attributeFilter: ["no-scrollbar"]
        });
        syncHtmlScrollLock();
        document.addEventListener("click", (e) => {
          const target = e.target.closest(".tbui_fbar_top");
          if (target) {
            e.preventDefault();
            e.stopPropagation();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, true);
        waitUntil(() => !_2.isNil(floatBar.get())).then(() => {
          decorateFloatBarTooltips();
        });
      });
      _GM_registerMenuCommand("设置", () => renderDialog(Settings));
      console.info(REMIXED);
    }
    const index$c = {
      id: "easy-jump",
      name: "直链跳转",
      author: "锯条",
      version: "1.0.2",
      brief: "链接跳转避免二次确认",
      description: `自动跳转至分享链接的原始地址，不再进行中转（不处理被严重警告的链接）`,
      scope: /jump2?.bdimg.com\/safecheck\//,
      runAt: "immediately",
      entry: main$5
    };
    async function main$5() {
      afterHead(function() {
        injectCSSRule("html", {
          backgroundColor: "var(--page-background)"
        });
        injectCSSRule("body", {
          display: "none"
        });
      });
      location.href = (await asyncdom(".link")).innerText;
    }
    const index$d = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: index$c
    }, Symbol.toStringTag, { value: "Module" }));
    const index$a = {
      id: "nologin-tieba",
      name: "免登录浏览",
      author: "锯条",
      version: "1.0",
      brief: "免登录浏览贴吧",
      description: `始终伪装为已登录状态，让免登录浏览和已登录基本一致`,
      scope: ["thread"],
      runAt: "DOMLoaded",
      entry: main$4
    };
    function main$4() {
      if (PageData.user.is_login) return;
      PageData.user.is_login = 1;
    }
    const index$b = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: index$a
    }, Symbol.toStringTag, { value: "Module" }));
    const index$8 = {
      id: "notrans-emojis",
      name: "别动我的 emoji😠",
      author: "锯条",
      version: "1.0",
      brief: "拒绝替换我的 emoji",
      description: "原版贴吧会将部分emoji表情替换为旧版，该模块会让这些emoji重新跟随系统样式",
      scope: true,
      runAt: "afterHead",
      entry: main$3
    };
    function main$3() {
      const indexRegExp = new RegExp("(?<=nickemoji\\/).*?(?=.png)", "gi");
      const emojis = [
        "º",
        "◎",
        "▫",
        "◆",
        "♤",
        "♀",
        "♂",
        "ლ",
        "♬",
        "☞",
        "☜",
        "✆",
        "☎",
        "♋",
        "Ω",
        "℃",
        "℉",
        "😄",
        "😍",
        "😘",
        "😚",
        "😜",
        "😳",
        "😁",
        "😞",
        "😢",
        "😂",
        "😫",
        "😨",
        "😱",
        "😡",
        "😷",
        "😲",
        "😈",
        "🐷",
        "🐶",
        "🐑",
        "🐵",
        "🐨",
        "🐴",
        "🐼",
        "🐯",
        "🍪",
        "🍺",
        "🍦",
        "🍭",
        "🍗",
        "🍼",
        "🔯",
        "🍒",
        "👀",
        "🐭",
        "😇",
        "😺",
        "😻",
        "🙀",
        "😿",
        "😹",
        "😾",
        "👹",
        "👺",
        "🌞",
        "🌝",
        "🌚",
        "🌜",
        "🌛",
        "👦",
        "👧",
        "🎎",
        "🌸",
        "🍀",
        "🌹",
        "🌻",
        "🌺",
        "🍁",
        "🌿",
        "🍄",
        "🌵",
        "🌴",
        "🌳",
        "🌰",
        "🌱",
        "🌼",
        "🌐",
        "🌙",
        "🌋",
        "🌌",
        "⛅",
        "⚡",
        "☔",
        "⛄",
        "🌀",
        "🌈",
        "🌊",
        "🔥",
        "✨",
        "🌟",
        "💥",
        "💫",
        "💢",
        "💦",
        "💧",
        "💤",
        "💨",
        "🎀",
        "🌂",
        "💄",
        "💕",
        "💖",
        "💞",
        "💘",
        "💌",
        "💋",
        "💝",
        "🎒",
        "🎓",
        "🎏",
        "🎃",
        "👻",
        "🎅",
        "🎄",
        "🎁",
        "🙈",
        "🐒",
        "💯",
        "👯",
        "💍"
      ];
      const transformed = [
        "1-1.png",
        "1-2.png",
        "1-4.png",
        "1-5.png",
        "1-6.png",
        "1-7.png",
        "1-8.png",
        "1-9.png",
        "1-10.png",
        "1-11.png",
        "1-12.png",
        "1-13.png",
        "1-14.png",
        "1-15.png",
        "1-16.png",
        "1-17.png",
        "1-18.png",
        "1-19.png",
        "1-20.png",
        "1-21.png",
        "1-22.png",
        "1-23.png",
        "1-24.png",
        "1-25.png",
        "1-26.png",
        "1-27.png",
        "1-28.png",
        "1-29.png",
        "1-30.png",
        "1-31.png",
        "1-32.png",
        "1-33.png",
        "1-34.png",
        "1-35.png",
        "2-1.png",
        "2-2.png",
        "2-3.png",
        "2-4.png",
        "2-5.png",
        "2-6.png",
        "2-7.png",
        "2-8.png",
        "2-9.png",
        "2-10.png",
        "2-11.png",
        "2-12.png",
        "2-13.png",
        "2-14.png",
        "2-15.png",
        "2-16.png",
        "2-17.png",
        "2-18.png",
        "2-19.png",
        "2-20.png",
        "2-21.png",
        "2-22.png",
        "2-23.png",
        "2-24.png",
        "2-25.png",
        "2-26.png",
        "2-27.png",
        "2-28.png",
        "2-29.png",
        "2-30.png",
        "2-31.png",
        "2-32.png",
        "2-33.png",
        "2-34.png",
        "2-35.png",
        "3-1.png",
        "3-2.png",
        "3-3.png",
        "3-4.png",
        "3-5.png",
        "3-6.png",
        "3-7.png",
        "3-8.png",
        "3-9.png",
        "3-10.png",
        "3-11.png",
        "3-12.png",
        "3-13.png",
        "3-14.png",
        "3-15.png",
        "3-16.png",
        "3-17.png",
        "3-18.png",
        "3-19.png",
        "3-20.png",
        "3-21.png",
        "3-22.png",
        "3-23.png",
        "3-24.png",
        "3-25.png",
        "3-26.png",
        "3-27.png",
        "3-28.png",
        "3-29.png",
        "3-30.png",
        "3-31.png",
        "3-32.png",
        "3-33.png",
        "3-34.png",
        "3-35.png",
        "4-1.png",
        "4-2.png",
        "4-3.png",
        "4-4.png",
        "4-5.png",
        "4-6.png",
        "4-7.png",
        "4-8.png",
        "4-9.png",
        "4-10.png",
        "4-11.png",
        "4-12.png",
        "4-13.png",
        "4-14.png",
        "4-15.png",
        "4-16.png",
        "4-17.png",
        "4-18.png",
        "4-19.png",
        "4-20.png",
        "4-21.png",
        "4-22.png",
        "4-23.png"
      ];
      threadCommentsObserver.addEvent(() => {
        try {
          _2.forEach(dom(`
                .p_author_name:has(.nicknameEmoji),
                .at:has(.nicknameEmoji),
                .lzl_content_main:has(.nicknameEmoji)
            `, []), (el) => {
            updateEmojis(el);
          });
        } catch (error) {
          _2.forEach(dom(".p_author_name, .at, .lzl_content_main", []), (el) => {
            if (_2.includes(el.classList, "nicknameEmoji")) {
              updateEmojis(el);
            }
          });
        }
      });
      legacyIndexFeedsObserver.addEvent(() => {
        try {
          _2.forEach(dom(`
                .new_list .post_author:has(.nicknameEmoji),
                .userinfo_username:has(.nicknameEmoji)
            `, []), (el) => {
            updateEmojis(el);
          });
        } catch (error) {
          _2.forEach(dom(".newlist .post_author, .userinfo_username", []), (el) => {
            if (_2.includes(el.classList, "nicknameEmoji")) {
              updateEmojis(el);
            }
          });
        }
      });
      forumThreadsObserver.addEvent(() => {
        try {
          _2.forEach(dom(".threadlist_author a:has(.nicknameEmoji)", []), (el) => {
            updateEmojis(el);
          });
        } catch (error) {
          _2.forEach(dom(".threadlist_author a", []), (el) => {
            if (_2.includes(el.classList, "nicknameEmoji")) {
              updateEmojis(el);
            }
          });
        }
      });
      function updateEmojis(elem) {
        const arrIndex = elem.innerHTML.match(indexRegExp);
        arrIndex == null ? undefined : arrIndex.forEach((index2) => {
          const emoji = emojis[transformed.indexOf(`${index2}.png`)];
          const arrInner = elem.innerHTML.split(RegExp(
            `<img[^>]*?${index2}.png(?:[^>]*?)*>`,
            "g"
          ));
          elem.innerHTML = arrInner.join(decodeURIComponent(emoji));
        });
      }
    }
    const index$9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: index$8
    }, Symbol.toStringTag, { value: "Module" }));
    const index$6 = {
      id: "portal",
      name: "传送门",
      author: "锯条",
      version: "1.1.1",
      brief: "为贴子中的b站番号添加跳转链接",
      description: `该模块可以识别贴子中的 av/BV 号并将其转换为超链接`,
      scope: ["thread"],
      runAt: "immediately",
      entry: main$2
    };
    function main$2() {
      const LINKED_CLASS = "linked";
      const avRegExp = new RegExp("(?<!:\\/\\/www.bilibili.com\\/video\\/)av[1-9]\\d*", "gi");
      const BVRegExp = new RegExp("(?<!:\\/\\/www.bilibili.com\\/video\\/)BV[A-Za-z0-9]{10}", "g");
      document.addEventListener("DOMContentLoaded", () => {
        threadCommentsObserver.addEvent(biliPortal);
      });
      function biliPortal() {
        addBiliLinks(".d_post_content");
        addBiliLinks(".lzl_cnt .lzl_content_main");
        function addBiliLinks(selector) {
          _2.forEach(dom(selector, []), (elem) => {
            var _a, _b, _c, _d;
            if (elem.classList.contains(LINKED_CLASS)) return;
            elem.classList.add(LINKED_CLASS);
            if (((_a = elem.textContent) == null ? undefined : _a.toLowerCase().indexOf("av")) !== -1) {
              const avs = (_b = elem.textContent) == null ? undefined : _b.match(avRegExp);
              bindingLinks(avs ?? undefined, true);
            }
            if (((_c = elem.textContent) == null ? undefined : _c.indexOf("BV")) !== -1) {
              const BVs = (_d = elem.textContent) == null ? undefined : _d.match(BVRegExp);
              bindingLinks(BVs ?? undefined);
            }
            function bindingLinks(array, lowerCase = false) {
              if (!array) return;
              const hadHyperLink = [];
              _2.forEach(array, (videoID) => {
                if (hadHyperLink.indexOf(videoID) === -1) {
                  hadHyperLink.push(videoID);
                  const htmlArray = elem.innerHTML.split(
                    RegExp(`(?<!://www.bilibili.com/video/)${videoID}`, "g")
                  );
                  if (lowerCase) videoID = videoID.toLowerCase();
                  const linkedID = `<a href='https://www.bilibili.com/video/${videoID}' target='_blank'>${videoID}</a>`;
                  elem.innerHTML = htmlArray.join(linkedID);
                }
              });
            }
          });
        }
      }
    }
    const index$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: index$6
    }, Symbol.toStringTag, { value: "Module" }));
    const floatBarStyle = '.tbui_aside_float_bar {\n  background-color: transparent !important;\n}\n.tbui_aside_float_bar {\n  bottom: 20px;\n  left: calc(50% + var(--content-max) / 2 + 20px);\n  display: flex;\n  overflow: visible;\n  width: -moz-max-content;\n  width: max-content;\n  flex-direction: column;\n  border-radius: 0;\n  margin-left: 0;\n  gap: 8px;\n}\n[no-scrollbar] .tbui_aside_float_bar {\n  left: calc(50% + var(--content-max) / 2 + 20px - var(--scrollbar-width) / 2);\n}\n.shrink-view .tbui_aside_float_bar {\n  bottom: 0;\n  left: calc(100% - 40px);\n}\n[no-scrollbar].shrink-view .tbui_aside_float_bar {\n  left: calc(100% - 40px - var(--scrollbar-width));\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button {\n  margin: 0 !important;\n  background-color: var(--default-background) !important;\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button {\n  overflow: hidden;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  border-radius: 12px;\n  transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button:hover {\n  border-color: rgba(0, 0, 0, 0.16);\n  transform: translateY(-1px);\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button:active {\n  transform: translateY(0);\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button a {\n  border: none !important;\n  box-shadow: none !important;\n  background: none !important;\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button a {\n  border-radius: 12px;\n  outline: none;\n  transition: color 0.18s ease, background-color 0.18s ease;\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button a:hover {\n  color: var(--tieba-theme-color);\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button a:active {\n  color: var(--tieba-theme-fore);\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button a:focus {\n  box-shadow: none !important;\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button a:focus {\n  outline: none;\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button[style*="visibility: hidden"] {\n  margin-top: -8px !important;\n}\n.tbui_aside_float_bar li.tbui_aside_fbar_button[style*="visibility: hidden"] {\n  height: 0;\n}';
    const _hoisted_1$1 = {
      key: 0,
      class: "menu-separator"
    };
    const _hoisted_2$1 = {
      key: 0,
      class: "icon"
    };
    const _hoisted_3 = { class: "menu-title" };
    const _hoisted_4 = {
      key: 0,
      class: "menu-inner"
    };
    const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
      __name: "dropdown-menu",
      props: {
        menuItems: {},
        blurEffect: { type: Boolean }
      },
      emits: ["RequestClose"],
      setup(__props, { emit: __emit }) {
        const props = __props;
        const emit = __emit;
        vue.onMounted(() => {
          setTimeout(() => {
            window.addEventListener("click", () => {
              setTimeout(() => {
                emit("RequestClose");
              }, 100);
            });
            window.addEventListener("focusin", (ev) => {
              if (!libelemental2.findParent(ev.target, "dropdown-menu")) {
                emit("RequestClose");
              }
            });
          }, 100);
        });
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock("div", {
            class: vue.normalizeClass(["dropdown-menu", _ctx.blurEffect ? "blur-effect" : ""])
          }, [
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.menuItems, (menuItem) => {
              return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
                typeof menuItem === "string" ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$1)) : (vue.openBlock(), vue.createBlock(vue.unref(userView.UserButton), {
                  key: 1,
                  class: "menu-item",
                  "is-anchor": menuItem.href !== undefined,
                  href: menuItem.href ? menuItem.href : "javascript:;",
                  onClick: menuItem.click,
                  target: menuItem.href ? "_blank" : "",
                  "no-border": ""
                }, {
                  default: vue.withCtx(() => [
                    menuItem.icon ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$1, vue.toDisplayString(menuItem.icon), 1)) : vue.createCommentVNode("", true),
                    vue.createElementVNode("div", _hoisted_3, [
                      vue.createTextVNode(vue.toDisplayString(menuItem.title) + " ", 1),
                      menuItem.innerText ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_4, vue.toDisplayString(menuItem.innerText), 1)) : vue.createCommentVNode("", true)
                    ])
                  ]),
                  _: 2
                }, 1032, ["is-anchor", "href", "onClick", "target"]))
              ], 64);
            }), 256))
          ], 2);
        };
      }
    });
    const DropdownMenu = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-caa2e6ca"]]);
    const _hoisted_1 = { id: "nav-container" };
    const _hoisted_2 = { class: "right-container" };
    const _sfc_main = /* @__PURE__ */ vue.defineComponent({
      __name: "nav-bar",
      setup(__props) {
        const navBar = vue.ref();
        const navAvatar = vue.ref();
        const userPortrait = vue.ref("");
        const activeMenu = vue.ref(null);
        const isAutoFolded = vue.ref(false);
        const isRevealActive = vue.ref(false);
        const hideMode = vue.ref(navBarHideMode.get());
        const isMenuReady = vue.ref(hideMode.value === "never");
        navBarHideMode.on("setter", (value) => {
          hideMode.value = value;
        });
        const messageMenu = vue.ref([]);
        const moreMenu = vue.ref([]);
        const userMenu = vue.ref([]);
        const isFolded = vue.computed(() => hideMode.value === "alwaysFold" || hideMode.value === "fold" && isAutoFolded.value);
        vue.watch(isFolded, (folded) => {
          activeMenu.value = null;
          if (folded) {
            isRevealActive.value = false;
            isMenuReady.value = false;
            return;
          }
          isRevealActive.value = false;
          isMenuReady.value = true;
        }, { immediate: true });
        init();
        vue.onMounted(async function() {
          {
            waitUntil(() => userPortrait.value !== "").then(function() {
              if (navAvatar.value)
                navAvatar.value.src = tiebaAPI.URL_profile(userPortrait.value);
            });
          }
        });
        function positionMenu(trigger) {
          const menu = trigger.querySelector(".nav-menu");
          if (!menu || !navBar.value) return;
          const triggerRect = trigger.getBoundingClientRect();
          const navRect = navBar.value.getBoundingClientRect();
          const gap = 4;
          menu.style.top = `${navRect.height + gap}px`;
          menu.style.left = `${triggerRect.left - navRect.left + triggerRect.width / 2 - menu.offsetWidth / 2}px`;
          const gapToMenu = navRect.bottom + gap - triggerRect.bottom;
          trigger.style.setProperty("--trigger-extend-height", `${gapToMenu + menu.offsetHeight}px`);
        }
        function revealNav() {
          if (!isFolded.value || isRevealActive.value) return;
          isRevealActive.value = true;
          isMenuReady.value = false;
        }
        function closeMenus() {
          activeMenu.value = null;
        }
        function hideNav() {
          if (activeMenu.value) return;
          closeMenus();
          if (!isFolded.value) return;
          isRevealActive.value = false;
          isMenuReady.value = false;
        }
        function handleRevealZoneEnter() {
          revealNav();
        }
        function handleRevealZoneLeave(e) {
          if (shouldKeepNavVisible(e.relatedTarget)) return;
          hideNav();
        }
        function handleNavMouseEnter() {
          revealNav();
        }
        function handleNavMouseLeave(e) {
          if (shouldKeepNavVisible(e.relatedTarget)) return;
          hideNav();
        }
        function handleNavTransitionEnd(e) {
          if (e.target !== navBar.value || e.propertyName !== "transform") return;
          if (!isFolded.value) {
            isMenuReady.value = true;
            syncHoveredMenu();
            return;
          }
          if (isRevealActive.value) {
            isMenuReady.value = true;
            syncHoveredMenu();
          }
        }
        function handleMenuTriggerEnter(e, key) {
          if (!isMenuReady.value) return;
          positionMenu(e.currentTarget);
          activeMenu.value = key;
        }
        function handleMenuTriggerLeave(e, key) {
          const nextTarget = e.relatedTarget;
          const menu = getMenuElement(key);
          if (menu && nextTarget && menu.contains(nextTarget)) return;
          if (activeMenu.value === key) {
            activeMenu.value = null;
          }
        }
        function handleMenuPanelEnter(key) {
          activeMenu.value = key;
        }
        function handleMenuPanelLeave(e, key) {
          const nextTarget = e.relatedTarget;
          const trigger = getTriggerElement(key);
          if (trigger && nextTarget && trigger.contains(nextTarget)) return;
          if (activeMenu.value === key) {
            activeMenu.value = null;
          }
          if (shouldKeepNavVisible(nextTarget)) return;
          hideNav();
        }
        function getMenuElement(key) {
          var _a;
          return ((_a = navBar.value) == null ? undefined : _a.querySelector(`.nav-menu[data-menu-key="${key}"]`)) ?? null;
        }
        function getTriggerElement(key) {
          var _a;
          return ((_a = navBar.value) == null ? undefined : _a.querySelector(`.menu-trigger[data-menu-trigger="${key}"]`)) ?? null;
        }
        function syncHoveredMenu() {
          if (!isMenuReady.value || !navBar.value) return;
          const hoveredTrigger = navBar.value.querySelector(".menu-trigger:hover");
          const key = hoveredTrigger == null ? undefined : hoveredTrigger.dataset.menuTrigger;
          if (!hoveredTrigger || !key) return;
          positionMenu(hoveredTrigger);
          activeMenu.value = key;
        }
        function shouldKeepNavVisible(target) {
          const element = target instanceof Element ? target : null;
          if (!element) return false;
          return !!element.closest("#nav-bar, .nav-reveal-zone, .nav-menu");
        }
        async function init() {
          await waitUntil(() => PageData !== undefined).then(() => {
            userPortrait.value = PageData.user.portrait;
            loadNavMenuContent();
          });
          let scrollCleanup;
          vue.watch(hideMode, (mode) => {
            if (scrollCleanup) {
              scrollCleanup();
              scrollCleanup = undefined;
            }
            isAutoFolded.value = false;
            if (mode === "fold") {
              let lastScrollY = window.scrollY;
              const handle = _2.throttle(function() {
                if (window.scrollY > lastScrollY) {
                  isAutoFolded.value = true;
                }
                lastScrollY = window.scrollY;
              }, 100);
              window.addEventListener("scroll", handle);
              scrollCleanup = () => window.removeEventListener("scroll", handle);
            }
          }, { immediate: true });
        }
        async function login() {
          const loginButton = dom(".u_login");
          const directLoginButton = dom("#TANGRAM__PSP_24__submit");
          if (directLoginButton) {
            const confirmDirect = await userView.messageBox({
              title: "快速登录",
              content: "检测到快速登录入口，是否尝试直接登录？",
              type: "okCancel"
            });
            if (confirmDirect === "positive") {
              directLoginButton.click();
            } else {
              regularLogin();
            }
          } else {
            regularLogin();
          }
          function regularLogin() {
            var _a;
            loginButton ? (_a = dom("a", loginButton)) == null ? undefined : _a.click() : cannotLogin();
          }
          function cannotLogin() {
            userView.toast({ message: "未检测到可用的登录入口，请刷新重试", type: "warning" });
          }
        }
        function loadNavMenuContent() {
          messageMenu.value = [
            {
              title: "查看私信",
              href: "/im/pcmsg"
            },
            {
              title: "查看回复",
              href: `/i/sys/jump?u=${userPortrait.value}&type=replyme`
            },
            {
              title: "查看 @",
              href: `/i/sys/jump?u=${userPortrait.value}&type=atme`
            },
            "separator",
            {
              title: "查看好友申请",
              href: `/i/sys/jump?u=${userPortrait.value}&type=friendapply`
            },
            {
              title: "查看新粉丝",
              href: `/i/sys/jump?u=${userPortrait.value}&type=fans`
            },
            "separator",
            {
              title: "我的收藏",
              href: `/i/sys/jump?u=${userPortrait.value}&type=storethread`
            },
            {
              title: "我的通知",
              href: "/sysmsg/index?type=notity"
            }
          ];
          moreMenu.value = [
            {
              title: "账号设置",
              href: "//passport.baidu.com/?center&tpl=tb&aid=6&default_tab=3#3,0"
            },
            {
              title: "贴吧设置",
              href: `/home/profile?un=${PageData.user.name_url}`
            },
            "separator",
            {
              title: "服务中心",
              href: "//tieba.baidu.com/pmc"
            },
            {
              title: "问题反馈",
              href: "//tieba.baidu.com/hermes/feedback"
            }
          ];
          userMenu.value = [
            {
              title: "我的贴吧",
              href: `/home/main?id=${userPortrait.value}&fr=userbar`
            },
            {
              title: "我的收藏",
              href: `/i/sys/jump?un=${PageData.user.user_name}${PageData.user.name_url}&type=storethread&st_mod=userbar&fr=tb0_pb`
            }
          ];
          PageData.user.is_login ? userMenu.value.push("separator", {
            title: "退出登录",
            click() {
              var _a;
              const logoutButton = dom(".u_logout");
              if (logoutButton) {
                (_a = dom("a", logoutButton)) == null ? undefined : _a.click();
              } else {
                userView.toast({ message: "未检测到退出登录入口，请刷新重试。", type: "warning" });
              }
            }
          }) : userMenu.value.push("separator", {
            title: "登录",
            click() {
              login();
            }
          });
        }
        return (_ctx, _cache) => {
          return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
            isFolded.value ? (vue.openBlock(), vue.createElementBlock("div", {
              key: 0,
              class: "nav-reveal-zone",
              onMouseenter: handleRevealZoneEnter,
              onMouseleave: handleRevealZoneLeave
            }, null, 32)) : vue.createCommentVNode("", true),
            vue.createElementVNode("nav", {
              ref_key: "navBar",
              ref: navBar,
              id: "nav-bar",
              class: vue.normalizeClass(["nav-bar remove-default", { fold: isFolded.value, revealed: isRevealActive.value }]),
              onMouseenter: handleNavMouseEnter,
              onMouseleave: handleNavMouseLeave,
              onTransitionend: handleNavTransitionEnd
            }, [
              vue.createElementVNode("div", _hoisted_1, [
                _cache[16] || (_cache[16] = vue.createElementVNode("div", { class: "left-container" }, [
                  vue.createElementVNode("a", {
                    class: "nav-brand",
                    href: "/"
                  }, "百度贴吧")
                ], -1)),
                vue.createElementVNode("div", _hoisted_2, [
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "nav-icon-button menu-trigger",
                    "data-menu-trigger": "message",
                    "no-border": "all",
                    onMouseenter: _cache[2] || (_cache[2] = ($event) => handleMenuTriggerEnter($event, "message")),
                    onMouseleave: _cache[3] || (_cache[3] = ($event) => handleMenuTriggerLeave($event, "message"))
                  }, {
                    default: vue.withCtx(() => [
                      _cache[13] || (_cache[13] = vue.createElementVNode("svg", {
                        class: "nav-svg",
                        xmlns: "http://www.w3.org/2000/svg",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round"
                      }, [
                        vue.createElementVNode("path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
                        vue.createElementVNode("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" })
                      ], -1)),
                      vue.createVNode(DropdownMenu, {
                        class: vue.normalizeClass(["nav-menu", { visible: activeMenu.value === "message" }]),
                        "data-menu-key": "message",
                        "menu-items": messageMenu.value,
                        onMouseenter: _cache[0] || (_cache[0] = ($event) => handleMenuPanelEnter("message")),
                        onMouseleave: _cache[1] || (_cache[1] = ($event) => handleMenuPanelLeave($event, "message")),
                        onRequestClose: closeMenus
                      }, null, 8, ["class", "menu-items"])
                    ]),
                    _: 1
                  }),
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "nav-icon-button menu-trigger",
                    "data-menu-trigger": "more",
                    "no-border": "all",
                    onMouseenter: _cache[6] || (_cache[6] = ($event) => handleMenuTriggerEnter($event, "more")),
                    onMouseleave: _cache[7] || (_cache[7] = ($event) => handleMenuTriggerLeave($event, "more"))
                  }, {
                    default: vue.withCtx(() => [
                      _cache[14] || (_cache[14] = vue.createElementVNode("svg", {
                        class: "nav-svg",
                        xmlns: "http://www.w3.org/2000/svg",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round"
                      }, [
                        vue.createElementVNode("circle", {
                          cx: "12",
                          cy: "12",
                          r: "1"
                        }),
                        vue.createElementVNode("circle", {
                          cx: "19",
                          cy: "12",
                          r: "1"
                        }),
                        vue.createElementVNode("circle", {
                          cx: "5",
                          cy: "12",
                          r: "1"
                        })
                      ], -1)),
                      vue.createVNode(DropdownMenu, {
                        class: vue.normalizeClass(["nav-menu", { visible: activeMenu.value === "more" }]),
                        "data-menu-key": "more",
                        "menu-items": moreMenu.value,
                        onMouseenter: _cache[4] || (_cache[4] = ($event) => handleMenuPanelEnter("more")),
                        onMouseleave: _cache[5] || (_cache[5] = ($event) => handleMenuPanelLeave($event, "more")),
                        onRequestClose: closeMenus
                      }, null, 8, ["class", "menu-items"])
                    ]),
                    _: 1
                  }),
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "nav-icon-button",
                    "no-border": "all",
                    onClick: _cache[8] || (_cache[8] = ($event) => vue.unref(renderDialog)(Settings))
                  }, {
                    default: vue.withCtx(() => _cache[15] || (_cache[15] = [
                      vue.createElementVNode("svg", {
                        class: "nav-svg",
                        xmlns: "http://www.w3.org/2000/svg",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round"
                      }, [
                        vue.createElementVNode("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
                        vue.createElementVNode("circle", {
                          cx: "12",
                          cy: "12",
                          r: "3"
                        })
                      ], -1)
                    ])),
                    _: 1
                  }),
                  vue.createVNode(vue.unref(userView.UserButton), {
                    class: "nav-icon-button menu-trigger avatar-button",
                    "data-menu-trigger": "user",
                    "no-border": "all",
                    onMouseenter: _cache[11] || (_cache[11] = ($event) => handleMenuTriggerEnter($event, "user")),
                    onMouseleave: _cache[12] || (_cache[12] = ($event) => handleMenuTriggerLeave($event, "user"))
                  }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("img", {
                        ref_key: "navAvatar",
                        ref: navAvatar,
                        class: "nav-avatar"
                      }, null, 512),
                      vue.createVNode(DropdownMenu, {
                        class: vue.normalizeClass(["nav-menu", { visible: activeMenu.value === "user" }]),
                        "data-menu-key": "user",
                        "menu-items": userMenu.value,
                        onMouseenter: _cache[9] || (_cache[9] = ($event) => handleMenuPanelEnter("user")),
                        onMouseleave: _cache[10] || (_cache[10] = ($event) => handleMenuPanelLeave($event, "user")),
                        onRequestClose: closeMenus
                      }, null, 8, ["class", "menu-items"])
                    ]),
                    _: 1
                  })
                ])
              ])
            ], 34)
          ], 64);
        };
      }
    });
    const navBarVue = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fd59fd7f"]]);
    const navBarCSS = "#com_userbar {\n  display: none;\n}";
    async function _navBar() {
      _GM_addStyle(navBarCSS);
      const elder = await asyncdom("#com_userbar");
      const navWrapper = vue.createVNode("div", {
        "id": "nav-wrapper",
        "class": "nav-wrapper"
      }, null);
      insertJSX(navWrapper, document.body, elder);
      renderComponent(navBarVue, await asyncdom("#nav-wrapper"));
    }
    const index$4 = {
      id: "remixed-theme",
      name: "Tieba Remix 主题",
      author: "锯条",
      version: "0.3",
      brief: "更现代的主题样式",
      description: `包含新的样式、昼夜主题及其自动切换等功能`,
      scope: true,
      runAt: "immediately",
      entry: main$1
    };
    function main$1() {
      _navBar();
      overwriteCSS(floatBarStyle);
      fadeInElems.push(".tbui_aside_float_bar .svg-container");
      fadeInElems.push(".d_badge_bright .d_badge_lv, .user_level .badge_index");
      fadeInElems.forEach((selector) => {
        injectCSSRule(selector, {
          opacity: "0"
        });
      });
      setCustomBackground();
      document.addEventListener("DOMContentLoaded", () => {
        dom(".post-tail-wrap .icon-jubao", []).forEach((elem) => {
          elem.removeAttribute("src");
          elem.after("举报");
        });
        threadFloorsObserver.addEvent(() => {
          dom(".d_badge_lv", []).forEach((elem) => {
            if (elem.textContent === "") {
              let parent = elem;
              while (!parent.classList.contains("l_badge")) {
                if (parent.parentElement)
                  parent = parent.parentElement;
              }
              parent.style.display = "none";
            }
          });
        });
      });
      window.addEventListener("load", () => {
        fadeInLoad(".tbui_aside_float_bar .svg-container");
        threadFloorsObserver.addEvent(() => {
          const lvlClassHead = "tieba-lvl-";
          const lvlGreen = `${lvlClassHead}green`;
          const lvlBlue = `${lvlClassHead}blue`;
          const lvlYellow = `${lvlClassHead}yellow`;
          const lvlOrange = `${lvlClassHead}orange`;
          dom(
            ".d_badge_bawu1 .d_badge_lv, .d_badge_bawu2 .d_badge_lv, .badge_index",
            []
          ).forEach((elem) => {
            if (elem.className.indexOf(lvlClassHead) !== -1) return;
            const lvl = parseInt(_2.defaults(elem.textContent, "0"));
            if (lvl >= 1 && lvl <= 3) {
              elem.classList.add(lvlGreen);
            } else if (lvl >= 4 && lvl <= 9) {
              elem.classList.add(lvlBlue);
            } else if (lvl >= 10 && lvl <= 15) {
              elem.classList.add(lvlYellow);
            } else if (lvl >= 16) {
              elem.classList.add(lvlOrange);
            }
          });
          fadeInLoad(".d_badge_bright .d_badge_lv, .user_level .badge_index");
        });
      });
    }
    const index$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: index$4
    }, Symbol.toStringTag, { value: "Module" }));
    const index$2 = {
      id: "tieba-tags",
      name: "楼中楼标签",
      author: "锯条",
      version: "2.0.1",
      brief: "优化楼中楼浏览体验",
      description: `为楼中楼的楼主、层主等用户添加特殊标签`,
      scope: ["thread"],
      runAt: "loaded",
      entry: main
    };
    function main() {
      const TAGGED = "is-tagged";
      const TB_TAG = "tag-elem";
      const MY_TAG = "tieba-tags-me";
      const LZ_TAG = "tieba-tags-lz";
      const CZ_TAG = "tieba-tags-cz";
      const louzhu = PageData.thread.author;
      const myPortrait = PageData.user.portrait;
      const myUserName = PageData.user.user_name;
      let louzhuPortrait = getLouzhuPortrait(document);
      (async () => {
        try {
          if (!louzhuPortrait) {
            const response = await fetch(location.href.split("?")[0], {
              mode: "cors",
              credentials: "include"
            });
            if (response.ok) {
              const value = await response.text();
              const fpDOC = new DOMParser().parseFromString(value, "text/html");
              louzhuPortrait = getLouzhuPortrait(fpDOC);
            }
          }
        } catch (err) {
          console.warn("[tieba-tags] 楼主头像回源失败，将仅依赖用户名匹配", err);
        }
        threadCommentsObserver.addEvent(createTagsAll);
      })();
      function getLouzhuPortrait(doc) {
        const j_tags = doc.getElementsByClassName("j_louzhubiaoshi");
        if (j_tags.length > 0) {
          const targetFloor = findParent(j_tags[0], "l_post_bright");
          if (targetFloor) {
            const dataAttr = targetFloor.getAttribute("data-field");
            if (dataAttr) {
              const dataField = JSON.parse(dataAttr);
              return _2.split(dataField.author.portrait, "?")[0];
            }
          }
        }
        return undefined;
      }
      function createTagsAll() {
        _2.forEach(dom(".lzl_cnt .at", []), (elem) => {
          if (elem.classList.contains(TAGGED)) return;
          elem.classList.add(TAGGED);
          let isLouzhu = false;
          let isMe = false;
          const username = elem.getAttribute("username");
          if (userClassify(myUserName, myPortrait)) {
            isMe = true;
            addTag(elem, MY_TAG);
          }
          if (!isMe) {
            if (userClassify(louzhu, louzhuPortrait)) {
              isLouzhu = true;
              addTag(elem, LZ_TAG);
            }
          }
          if (!isMe && !isLouzhu) {
            const floor = findParent(elem, "l_post_bright");
            if (floor) {
              const cengzhuCard = floor.getElementsByClassName("p_author_name")[0];
              const cengzhu = cengzhuCard.textContent;
              if (cengzhu) {
                if (elem.textContent === cengzhu) {
                  addTag(elem, CZ_TAG);
                }
              }
            }
          }
          function userClassify(un, portrait) {
            if (username === un && un !== "") {
              return true;
            } else if (_2.indexOf(["", " "], username) !== -1) {
              const targetPortrait = elem.getAttribute("portrait");
              if (targetPortrait && portrait) {
                if (targetPortrait === portrait) {
                  return true;
                }
              } else {
                return dataClassify();
              }
            } else if (!username) {
              return dataClassify();
            }
            return false;
            function dataClassify() {
              const dataAttr = elem.getAttribute("data-field");
              if (dataAttr) {
                const dataField = JSON.parse(dataAttr.replace(/'/g, '"'));
                if (portrait) {
                  if (dataField.id === portrait) {
                    return true;
                  }
                } else {
                  if (dataField.un === un) {
                    return true;
                  }
                }
              }
              return false;
            }
          }
        });
        function addTag(elem, className) {
          elem.appendChild(
            domrd("div", {
              class: `${TB_TAG} ${className}`
            })
          );
        }
      }
    }
    const index$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: index$2
    }, Symbol.toStringTag, { value: "Module" }));
    const index = {
      id: "toolkit",
      name: "实用工具库",
      author: "锯条",
      version: "1.1",
      brief: "优化原版贴吧体验的一组功能",
      description: "这是一个轻量级的工具库，包含了诸如重新加载错误头像等实用功能。",
      scope: true,
      runAt: "immediately",
      settings: {
        reloadAvatars: {
          title: "重新加载错误头像",
          widgets: [{
            type: "toggle",
            content: `原版贴吧的帖子页面时常会出现加载失败的头像，本功能可以将这些无法正常显示的头像资源链接到正常的 URL`,
            init: () => toolkitToggles.get().reloadAvatars,
            event() {
              toolkitToggles.merge({ reloadAvatars: !toolkitToggles.get().reloadAvatars });
            }
          }]
        }
      },
      entry: function() {
        for (const key in toolkitFeatures) {
          const k = key;
          if (toolkitToggles.get()[k]) toolkitFeatures[k]();
        }
      }
    };
    const toolkitFeatures = {
      /** 重新加载错误头像 */
      reloadAvatars() {
        const observer = new IntersectionObserver(function(entries) {
          _2.forEach(entries, (entry) => {
            if (entry.isIntersecting) {
              const avatar = entry.target;
              if (!avatar.complete) return;
              if (avatar.naturalWidth > 0) {
                avatar.setAttribute("data-loaded", "");
              } else {
                const userCard = findParent(avatar, "j_user_card");
                if (!userCard) return;
                const dataField = userCard.getAttribute("data-field");
                if (!dataField) return;
                const portarit = JSON.parse(dataField.replaceAll(/'/g, '"')).id;
                avatar.src = tiebaAPI.URL_profile(portarit);
                avatar.setAttribute("data-loaded", "");
              }
            }
          });
        }, { threshold: 0 });
        threadCommentsObserver.addEvent(function() {
          const avatars = dom(".lzl_single_post img:not(.BDE_Smiley, [data-loaded])", []);
          avatars.forEach((avatar) => observer.observe(avatar));
        });
      }
    };
    const toolkitToggles = new UserKey("toolkitToggles", {
      reloadAvatars: true
    });
    const index$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
      __proto__: null,
      default: index
    }, Symbol.toStringTag, { value: "Module" }));
  })(_, Vue, UserView, libelemental, marked);

})();