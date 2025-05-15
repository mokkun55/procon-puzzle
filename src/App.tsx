import { useState } from "react";
import "./App.css";

type Cell = number;
type Grid = Cell[][];
type Position = { row: number; col: number } | null;

// 回転の統計情報の型を定義
type RotationStats = {
  size2: number;
  size3: number;
  size4: number;
};

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
  const [firstClick, setFirstClick] = useState<Position>(null);
  const [rotationStats, setRotationStats] = useState<RotationStats>({
    size2: 0,
    size3: 0,
    size4: 0,
  });

  // 2点間の距離を計算する関数
  const calculateDistance = (pos1: Position, pos2: Position): number => {
    if (!pos1 || !pos2) return 0;
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
  };

  // 2点が対角線上にあるかチェックする関数
  const isDiagonal = (pos1: Position, pos2: Position): boolean => {
    if (!pos1 || !pos2) return false;
    return Math.abs(pos1.row - pos2.row) === Math.abs(pos1.col - pos2.col);
  };

  // 2x2, 3x3, 4x4のグリッドを90度回転させる関数
  const rotateGrid = (startRow: number, startCol: number, size: number) => {
    const newGrid = grid.map((row) => [...row]);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        newGrid[startRow + j][startCol + size - 1 - i] =
          grid[startRow + i][startCol + j];
      }
    }

    // 回転の統計情報を更新
    setRotationStats((prev) => ({
      ...prev,
      [`size${size}`]: prev[`size${size}` as keyof RotationStats] + 1,
    }));

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
    setRotationStats({
      size2: 0,
      size3: 0,
      size4: 0,
    });
  };

  // セルがクリックされたときのハンドラー
  const handleCellClick = (row: number, col: number) => {
    if (!firstClick) {
      // 最初のクリック
      setFirstClick({ row, col });
    } else {
      // 2回目のクリック
      const secondClick = { row, col };

      // 同じセルをクリックした場合は選択をキャンセル
      if (firstClick.row === row && firstClick.col === col) {
        setFirstClick(null);
        return;
      }

      // 対角線上にあるかチェック
      if (isDiagonal(firstClick, secondClick)) {
        const distance = calculateDistance(firstClick, secondClick);
        const size = distance / 2 + 1;

        // サイズが2,3,4のいずれかであることを確認
        if (size === 2 || size === 3 || size === 4) {
          // 回転の開始位置を計算
          const startRow = Math.min(firstClick.row, secondClick.row);
          const startCol = Math.min(firstClick.col, secondClick.col);

          // グリッドの範囲内かチェック
          if (startRow + size <= 4 && startCol + size <= 4) {
            rotateGrid(startRow, startCol, size);
          }
        }
      }

      // 選択をリセット
      setFirstClick(null);
    }
  };

  // セルの背景色を計算する関数
  const getCellStyle = (row: number, col: number) => {
    const baseStyle = { backgroundColor: COLORS[grid[row][col]] };

    if (firstClick && firstClick.row === row && firstClick.col === col) {
      return {
        ...baseStyle,
        border: "3px solid #4CAF50",
        transform: "scale(0.95)",
      };
    }

    return baseStyle;
  };

  // セルのキーボードイベントハンドラー
  const handleKeyPress = (
    event: React.KeyboardEvent,
    row: number,
    col: number
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      handleCellClick(row, col);
    }
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="stats">
          <div className="score">スコア: {score}</div>
          <div className="moves">手数: {moves}</div>
          <div className="rotation-stats">
            <div>2x2回転: {rotationStats.size2}回</div>
            <div>3x3回転: {rotationStats.size3}回</div>
            <div>4x4回転: {rotationStats.size4}回</div>
          </div>
        </div>
      </div>
      <div className="grid">
        {grid.map((row, i) => (
          <div key={`row-${i}-${row.join("-")}`} className="row">
            {row.map((cell, j) => (
              <button
                key={`cell-${i}-${j}-${cell}`}
                className="cell"
                style={getCellStyle(i, j)}
                onClick={() => handleCellClick(i, j)}
                onKeyPress={(e) => handleKeyPress(e, i, j)}
                type="button"
                aria-label={`セル ${i + 1}-${j + 1}: 値 ${cell}`}
              >
                {cell}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="controls">
        <button type="button" onClick={handleReset} className="reset-button">
          リセット
        </button>
      </div>
    </div>
  );
}

export default App;
