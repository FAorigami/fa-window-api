/**
 * FAWindow API - Complete Integrated Version
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
                min-width: 200px; min-height: 100px;
                border-radius: 12px !important; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.25) !important;
                display: flex !important; 
                flex-direction: column !important; 
                resize: both;
                overflow: hidden !important; 
                z-index: 1000; 
                font-family: sans-serif;
                box-sizing: border-box;
            }
            .fa-header {
                padding: 10px 15px !important; 
                cursor: move !important; 
                display: flex !important;
                justify-content: space-between !important; 
                align-items: center !important;
                user-select: none; 
                font-weight: bold;
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
                background: rgba(255,255,255,0.2) !important; 
                color: inherit !important;
                line-height: 1 !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .fa-close-btn:hover { background: rgba(255,255,255,0.4) !important; }
            .fa-body { 
                padding: 15px !important; 
                flex-grow: 1 !important; 
                overflow: auto !important; 
                background: inherit !important; 
            }
        `;
        document.head.appendChild(style);
    },

    Show: function(id, x, y, headerColor, winColor, content) {
        this._injectStyles(); // スタイル注入を確実に行う

        if (this.windows[id]) this.Close(id);

        const win = document.createElement('div');
        win.id = `fa-win-${id}`;
        win.className = 'fa-window';
        win.style.left = x + 'px';
        win.style.top = y + 'px';
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
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
    }
};
window.FAWindow = FAWindow;
