/**
 * FAWindow API (Single File Version)
 */
const FAWindow = {
    windows: {},
    highestZ: 1000,

    // 1. CSSをJS内で定義し、自動適用する内部関数
    _injectStyles: function() {
        if (document.getElementById('fa-window-styles')) return; // 重複防止
        const style = document.createElement('style');
        style.id = 'fa-window-styles';
        style.innerHTML = `
            .fa-window {
                position: absolute; min-width: 200px; min-height: 100px;
                border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                display: flex; flex-direction: column; resize: both;
                overflow: hidden; z-index: 1000; font-family: sans-serif;
            }
            .fa-header {
                padding: 10px 15px; cursor: move; display: flex;
                justify-content: space-between; align-items: center;
                user-select: none; font-weight: bold;
            }
            .fa-close-btn {
                border: none; width: 26px; height: 26px; border-radius: 50%;
                cursor: pointer; display: flex; align-items: center;
                justify-content: center; font-size: 18px; padding: 0;
                background: rgba(255,255,255,0.2); color: inherit;
            }
            .fa-close-btn:hover { background: rgba(255,255,255,0.4); }
            .fa-body { padding: 15px; flex-grow: 1; overflow: auto; background: inherit; }
        `;
        document.head.appendChild(style);
    },

    // 2. メインの表示関数
    Show: function(id, x, y, headerColor, winColor, content) {
        this._injectStyles(); // 最初にスタイルを注入

        if (this.windows[id]) this.Close(id);

        const win = document.createElement('div');
        win.id = `fa-win-${id}`;
        win.className = 'fa-window';
        win.style.left = `${x}px`;
        win.style.top = `${y}px`;
        win.style.backgroundColor = winColor;
        win.style.zIndex = ++this.highestZ;

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
        this._makeDraggable(win, win.querySelector('.fa-header'));
        
        win.onmousedown = () => { win.style.zIndex = ++this.highestZ; };
    },

    Close: function(id) {
        if (this.windows[id]) {
            this.windows[id].remove();
            delete this.windows[id];
        }
    },

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
        return { id, values: inputData, html: body.innerHTML };
    },

    _isLightColor: function(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return ((r * 299 + g * 587 + b * 114) / 1000) > 128;
    },

    _makeDraggable: function(win, header) {
        let isDragging = false;
        let offset = { x: 0, y: 0 };
        header.onmousedown = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            offset.x = e.clientX - win.offsetLeft;
            offset.y = e.clientY - win.offsetTop;
            win.style.zIndex = ++this.highestZ;
        };
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            win.style.left = (e.clientX - offset.x) + 'px';
            win.style.top = (e.clientY - offset.y) + 'px';
        });
        document.addEventListener('mouseup', () => isDragging = false);
    }
};
