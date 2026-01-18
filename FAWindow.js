/**
 * FAWindow API - Final Version
 */

const FAWindow = {
    windows: {},
    highestZ: 1000,

    _injectStyles: function() {
        if (document.getElementById('fa-window-styles')) return;
        const style = document.createElement('style');
        style.id = 'fa-window-styles';
        style.innerHTML = `
            .fa-window {
                position: absolute !important; 
                min-width: 200px !important; 
                min-height: 100px !important;
                border-radius: 12px !important; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.25) !important;
                display: flex !important; 
                flex-direction: column !important; 
                resize: both !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: hidden !important; 
                z-index: 1000; 
                font-family: sans-serif !important;
                transition: opacity 0.2s !important;
                box-sizing: border-box !important;
                border: none !important;
            }
            .fa-header {
                padding: 10px 15px !important; 
                cursor: move !important; 
                display: flex !important;
                justify-content: space-between !important; 
                align-items: center !important;
                user-select: none !important; 
                font-weight: bold !important;
                box-sizing: border-box !important;
                margin: 0 !important;
            }
            .fa-close-btn {
                border: none !important; 
                width: 28px !important; 
                height: 28px !important; 
                border-radius: 50% !important;
                cursor: pointer !important; 
                display: flex !important; 
                align-items: center !important;
                justify-content: center !important; 
                font-size: 18px !important; 
                padding: 0 !important;
                margin: 0 !important;
                background: rgba(255,255,255,0.2) !important; 
                color: inherit !important;
                line-height: 1 !important;
                outline: none !important;
            }
            .fa-close-btn:hover { 
                background: rgba(255,255,255,0.4) !important; 
            }
            .fa-body { 
                padding: 15px !important; 
                flex-grow: 1 !important; 
                overflow: auto !important; 
                background: inherit !important; 
                box-sizing: border-box !important;
                margin: 0 !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * ウィンドウを表示する
     * @param {string} id - 識別子（タイトルにもなります）
     * @param {number} x - 表示位置X (px)
     * @param {number} y - 表示位置Y (px)
     * @param {string} headerColor - タイトルバーの色 (Hex/RGB)
     * @param {string} winColor - 本体の背景色 (Hex/RGB)
     * @param {string} content - 表示内容 (HTML可)
     */
    Show: function(id, x, y, headerColor, winColor, content) {
        this._injectStyles();

        // 既存の同じIDがあれば削除して再生成
        if (this.windows[id]) this.Close(id);

        const win = document.createElement('div');
        win.id = `fa-win-${id}`;
        win.className = 'fa-window';
        win.style.left = `${x}px`;
        win.style.top = `${y}px`;
        win.style.backgroundColor = winColor;
        win.style.zIndex = ++this.highestZ;

        // タイトルバーの文字色の自動判定
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
     * ウィンドウの状態（入力値、HTML、現在の位置・サイズ）を取得する
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
            rect: win.getBoundingClientRect() // 位置とサイズの詳細
        };
    },

    // 明るさ判定の内部メソッド
    _isLightColor: function(color) {
        const hex = color.replace('#', '');
        if (hex.length < 6) return true;
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return ((r * 299 + g * 587 + b * 114) / 1000) > 128;
    },

    // ドラッグ処理の内部メソッド
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
            win.style.zIndex = ++this.highestZ; // クリックで最前面へ
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
    }
};

// グローバルに登録
window.FAWindow = FAWindow;
