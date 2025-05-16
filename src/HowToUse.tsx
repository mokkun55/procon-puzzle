import React from "react";

const HowToUse: React.FC = () => {
  return (
    <div className="how-to-use">
      <h2>使い方</h2>

      <section>
        <h3>基本操作</h3>
        <ul>
          <li>
            2つのセルをクリックして、その2点を対角線とする正方形を回転させることができます
          </li>
          <li>同じ数字が隣り合うとスコアが加算されます</li>
          <li>「一つ前に戻る」ボタンで直前の操作を取り消すことができます</li>
          <li>「リセット」ボタンでゲームを最初からやり直すことができます</li>
        </ul>
      </section>

      <section>
        <h3>JSONモードの使い方</h3>
        <ol>
          <li>「JSONモード」のチェックボックスをオンにします</li>
          <li>テキストエリアに以下のフォーマットのJSONを入力します：</li>
        </ol>
        <pre className="json-example">
          {`{
  "startsAt": 1743489020,
  "problem": {
    "field": {
      "size": 4,
      "entities": [
        [6, 3, 4, 0],
        [1, 5, 3, 5],
        [2, 7, 0, 6],
        [1, 2, 7, 4]
      ]
    }
  }
}`}
        </pre>
        <p>JSONの各フィールドの説明：</p>
        <ul>
          <li>
            <code>size</code>: マップのサイズ（例：4x4の場合は4）
          </li>
          <li>
            <code>entities</code>: マップの各セルの値を2次元配列で指定
          </li>
          <li>
            <code>startsAt</code>: 現在は使用していません（将来的な機能拡張用）
          </li>
        </ul>
        <p>注意事項：</p>
        <ul>
          <li>
            配列のサイズは必ず<code>size</code>
            で指定した値と一致する必要があります
          </li>
          <li>各数字は0以上の整数である必要があります</li>
          <li>
            JSONモードがオンの時は、通常のマップサイズ選択は無効になります
          </li>
        </ul>
      </section>
    </div>
  );
};

export default HowToUse;
