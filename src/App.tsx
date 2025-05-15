import { useState } from "react";
import "./App.css";

type Cell = number;
type Grid = Cell[][];

// 数字に対応する色を定義
const COLORS = [
  "#FFB6C1", // 0: ピンク
  "#87CEEB", // 1: スカイブルー
  "#98FB98", // 2: パステルグリーン
  "#DDA0DD", // 3: プラム
  "#F0E68C", // 4: カーキ
  "#E6E6FA", // 5: ラベンダー
  "#FFA07A", // 6: ライトサーモン
  "#B0C4DE", // 7: ライトスティールブルー
];

// 初期グリッドを生成する関数
const generateInitialGrid = (): Grid => {
  // 各数字の出現回数をカウントする配列
  const numberCounts = Array(8).fill(0);
  const grid: Grid = Array(4)
    .fill(null)
    .map(() => Array(4).fill(0));

  // グリッドを埋める
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      // まだ2回未満の数字を探す
      const availableNumbers = numberCounts
        .map((count, num) => ({ num, count }))
        .filter(({ count }) => count < 2)
        .map(({ num }) => num);

      // 利用可能な数字からランダムに選択
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const selectedNumber = availableNumbers[randomIndex];

      grid[i][j] = selectedNumber;
      numberCounts[selectedNumber]++;
    }
  }

  return grid;
};

function App() {
  const [grid, setGrid] = useState<Grid>(generateInitialGrid);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  // 2x2, 3x3, 4x4のグリッドを90度回転させる関数
  const rotateGrid = (startRow: number, startCol: number, size: number) => {
    const newGrid = grid.map((row) => [...row]);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        newGrid[startRow + j][startCol + size - 1 - i] =
          grid[startRow + i][startCol + j];
      }
    }

    setGrid(newGrid);
    calculateScore(newGrid);
    setMoves((prev) => prev + 1);
  };

  // スコアを計算する関数
  const calculateScore = (currentGrid: Grid) => {
    let newScore = 0;

    // 横方向のチェック
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (currentGrid[i][j] === currentGrid[i][j + 1]) {
          newScore += 1;
        }
      }
    }

    // 縦方向のチェック
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === currentGrid[i + 1][j]) {
          newScore += 1;
        }
      }
    }

    setScore(newScore);
  };

  // リセットボタンのハンドラー
  const handleReset = () => {
    setGrid(generateInitialGrid());
    setScore(0);
    setMoves(0);
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="score">スコア: {score}</div>
        <div className="moves">手数: {moves}</div>
      </div>
      <div className="grid">
        {grid.map((row, i) => (
          <div key={`row-${i}`} className="row">
            {row.map((cell, j) => (
              <div
                key={`cell-${i}-${j}`}
                className="cell"
                style={{ backgroundColor: COLORS[cell] }}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="controls">
        <button type="button" onClick={() => rotateGrid(0, 0, 2)}>
          2x2 左上回転
        </button>
        <button type="button" onClick={() => rotateGrid(0, 2, 2)}>
          2x2 右上回転
        </button>
        <button type="button" onClick={() => rotateGrid(2, 0, 2)}>
          2x2 左下回転
        </button>
        <button type="button" onClick={() => rotateGrid(2, 2, 2)}>
          2x2 右下回転
        </button>
        <button type="button" onClick={() => rotateGrid(0, 0, 3)}>
          3x3 左上回転
        </button>
        <button type="button" onClick={() => rotateGrid(0, 1, 3)}>
          3x3 右上回転
        </button>
        <button type="button" onClick={() => rotateGrid(1, 0, 3)}>
          3x3 左下回転
        </button>
        <button type="button" onClick={() => rotateGrid(1, 1, 3)}>
          3x3 右下回転
        </button>
        <button type="button" onClick={() => rotateGrid(0, 0, 4)}>
          4x4 全体回転
        </button>
        <button type="button" onClick={handleReset} className="reset-button">
          リセット
        </button>
      </div>
    </div>
  );
}

export default App;
