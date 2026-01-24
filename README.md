# FAWindow API

JavaScriptで簡単に「動かせる・重なる・状態が取れる」ウィンドウを表示するAPIライブラリ。

## 使い方
1. `https://cdn.jsdelivr.net/gh/FAorigami/fa-window-api/FAWindow.js`または`https://cdn.jsdelivr.net/gh/FAorigami/fa-window-api/FAWindow.js?v=001`、`https://cdn.jsdelivr.net/gh/FAorigami/fa-window-api@main/FAWindow.js`のどれかを読み込む。
2. 以下のコードで表示：
```javascript
FAWindow.Show(
    'Settings',      // ID（タイトルバーにも表示されます）
    100,             // 初期位置 X (px)
    100,             // 初期位置 Y (px)
    '#2c3e50',       // ヘッダーの背景色
    '#ffffff',       // 本体の背景色
    '<div>設定内容をここに記述</div>' // コンテンツ (HTML可)
);
```

## ウィンドウの状態・入力値を取得する
ウィンドウ内の入力フォーム（input, select, textarea）の値や、現在の位置・サイズをまとめて取得できます。
```
const state = FAWindow.GetState('Settings');

if (state) {
    console.log(state.values); // { name属性(またはID): 入力値 }
    console.log(state.rect);   // { width, height, top, left ... }
    console.log(state.html);   // 現在のボディ内のHTML
}
```

## ウィンドウを閉じる
```
FAWindow.Close('Settings');
```

## API リファレンス
```
メソッド     引数                                            説明
Show         id, x, y, headerColor, winColor, content      ウィンドウを生成・表示。
GetState     id                                            指定したIDの入力値、HTML、位置サイズ情報を返却。
Close        id                                            指定したIDのウィンドウをDOMから削除。
```

## デザインのカスタマイズ
各要素には以下のCSSクラスが付与されています。
詳細なデザイン変更はCSSで上書き可能です。
```
.fa-window: ウィンドウ全体のコンテナ
.fa-header: タイトルバー（ドラッグハンドル）
.fa-body: コンテンツ表示エリア
.fa-close-btn: 閉じるボタン（×）
```

## 実装例：フォームの処理
```
/**
 * データの保存処理を行う関数
 * ウィンドウ内のボタンから呼び出されます。
 */
function saveData() {
    // 'UserForm' というIDのウィンドウの状態（入力値など）を取得
    const data = FAWindow.GetState('UserForm');
    
    // data.values オブジェクトから input の name 属性で指定した値を取得
    if (data && data.values && data.values.username) {
        alert('保存された名前: ' + data.values.username);
    } else {
        alert('名前が入力されていないか、取得に失敗しました。');
    }
}

// ページ読み込み完了後に実行
window.onload = () => {
    // ウィンドウ内に表示する HTML コンテンツ
    // ※ script タグを文字列として含めても実行されないため、ロジックは外に記述します。
    const content = `
        <div style="padding: 10px;">
            <p>ユーザー名を入力してください</p>
            <input type="text" name="username" id="u_input" style="color: #333;">
            <button onclick="saveData()">保存</button>
        </div>
    `;
    FAWindow.Show('UserForm', 50, 50, '#e67e22', '#fff', content);
};
```
