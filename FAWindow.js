/**
 * FAWindow API
 * 複数ウィンドウの生成・管理・状態取得を行うライブラリ
 */
const FAWindow = {
    windows: {},
    highestZ: 1000,

    Show: function(id, x, y, headerColor, winColor, content) {
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
        return { id, html: body.innerHTML, values: inputData };
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
        };
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            win.style.left = (e.clientX - offset.x) + 'px';
            win.style.top = (e.clientY - offset.y) + 'px';
        });
        document.addEventListener('mouseup', () => isDragging = false);
    }
};