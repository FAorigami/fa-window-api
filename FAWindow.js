/**
 * FAWindow API - Combined JS & CSS
 * Repository: https://github.com/FAorigami/fa-window-api
 */

const FAWindow = {
    windows: {},
    highestZ: 1000,

    // スタイルを自動注入する内部メソッド
    _injectStyles: function() {
        if (document.getElementById('fa-window-styles')) return;
        const style = document.createElement('style');
        style.id = 'fa-window-styles';
        style.innerHTML = `
            .fa-window {
                position: absolute; min-width: 200px; min-height: 100px;
                border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                display: flex; flex-direction: column; resize: both;
                overflow: hidden; z-index: 1000; font-family: sans-serif;
                transition: opacity 0.2s;
            }
            .fa-header {
                padding: 10px 15px; cursor: move; display: flex;
                justify-content: space-between; align-items: center;
                user-select: none; font-weight: bold;
            }
            .fa-close-btn {
                border: none; width: 28px; height: 28px; border-radius: 50%;
                cursor: pointer; display: flex; align-items: center;
                justify-content: center; font-size: 18px; padding: 0;
                background: rgba(255,255,255,0.2); color: inherit;
                line-height: 1;
            }
            .fa-close-btn:hover { background: rgba(255,255,255,0.4); }
            .fa-body { padding: 15px; flex-grow: 1; overflow: auto; background: inherit; }
        `;
        document.head.appendChild(style);
    },

    /**
     * ウィンドウを表示する
     * @param {string} id - 識別子
     * @param {number} x - 表示位置X
     * @param {number} y - 表示位置Y
     * @param {string} headerColor - タイトルバーの色 (Hex)
     * @param {string} winColor - ウィンドウの背景色 (Hex)
     * @param {string} content - 表示内容 (HTML可)
     */
    Show: function(id, x, y, headerColor, winColor, content) {
        this._injectStyles();

        // 既存の同じIDがあれば削除
        if (this.windows[id]) this.Close(id);

        const win = document.createElement('div');
        win.id = `fa-win-${id}`;
        win.className = 'fa-window';
        win.style.left = `${x}px`;
        win.style.top = `${y}px`;
        win.style.backgroundColor = winColor;
        win.style.zIndex = ++this.highestZ;

        // 文字色の自動判定
        const isLight = this._isLightColor(headerColor);
        const textColor = isLight ? '#000' : '#fff';

        win.innerHTML = `
            <div class="fa-header" style="background-color: ${headerColor}; color: ${textColor};">
                <span>${id}</span>
                <button class="fa-close-btn" onclick="FAWindow.Close('${id}')">×</button>
            </div>
            <div class="fa-body">${content}</div>
        `;

        document.body.appendChild(win);
        this.windows[id] = win;

        // 各種イベント設定
        this._makeDraggable(win, win.querySelector('.fa-header'));
        win.onmousedown = () => { win.style.zIndex = ++this.highestZ; };
    },

    /**
     * ウィンドウを閉じる
     */
    Close: function(id) {
        if (this.windows[id]) {
            this.windows[id].remove();
            delete this.windows[id];
        }
    },

    /**
     * ウィンドウの状態を取得する
     */
    GetState: function(id) {
        const win = this.windows[id];
        if (!win) return null;
        const body = win.querySelector('.fa-body');
        const inputs = body.querySelectorAll('input, textarea, select');
        const inputData = {};
        inputs.forEach(el => {
            const key = el.name || el.id || 'unnamed';
            inputData[key] = el.value;
        });
        return { 
            id: id, 
            values: inputData, 
            html: body.innerHTML,
            rect: win.getBoundingClientRect() // 現在の位置・サイズ
        };
    },

    _isLightColor: function(color) {
        const hex = color.replace('#', '');
        if (hex.length < 6) return true;
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return ((r * 299 + g * 587 + b * 114) / 1000) > 128;
    },

    _makeDraggable: function(win, header) {
        let isDragging = false;
        let offset = { x: 0, y: 0 };
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            win.style.left = (e.clientX - offset.x) + 'px';
            win.style.top = (e.clientY - offset.y) + 'px';
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.onmousedown = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            offset.x = e.clientX - win.offsetLeft;
            offset.y = e.clientY - win.offsetTop;
            win.style.zIndex = ++this.highestZ;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
    }
};

// グローバルスコープへの書き出し (CDN利用時などのため)
window.FAWindow = FAWindow;
