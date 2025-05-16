import { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import HowToUse from "./HowToUse";

type Cell = number;
type Grid = Cell[][];
type Position = { row: number; col: number } | null;

// 回転の統計情報の型を定義
type RotationStats = {
  [key: string]: number; // 動的な回転サイズに対応
};

// 問題の型定義を追加
type Problem = {
  field: {
    size: number;
    entities: number[][];
  };
};

// HSVからRGBへの変換関数
const hsvToRgb = (h: number, s: number, v: number): string => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// 色を生成する関数
const generateColors = (count: number): string[] => {
  const colors: string[] = [];
  const hueStep = 360 / count;
  const saturation = 0.7; // 彩度
  const value = 0.9; // 明度

  for (let i = 0; i < count; i++) {
    const hue = i * hueStep;
    colors.push(hsvToRgb(hue, saturation, value));
  }

  return colors;
};

// 初期グリッドを生成する関数
const generateInitialGrid = (size: number): Grid => {
  // マスの総数に応じて数字の種類を計算
  const totalCells = size * size;
  const numberOfTypes = Math.floor(totalCells / 2);

  // 各数字の出現回数をカウントする配列
  const numberCounts = Array(numberOfTypes).fill(0);
  const grid: Grid = Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));

  // グリッドを埋める
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
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
  const [mapSize, setMapSize] = useState(4); // マップサイズの状態
  const [grid, setGrid] = useState<Grid>(() => generateInitialGrid(mapSize));
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [firstClick, setFirstClick] = useState<Position>(null);
  const [rotationStats, setRotationStats] = useState<RotationStats>({});
  // グリッドの履歴を保持するstate
  const [gridHistory, setGridHistory] = useState<Grid[]>([]);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);
  const [rotationStatsHistory, setRotationStatsHistory] = useState<
    RotationStats[]
  >([]);
  // JSON入力用のstateを追加
  const [jsonInput, setJsonInput] = useState<string>("");
  const [isJsonMode, setIsJsonMode] = useState<boolean>(false);
  const [showHowToUse, setShowHowToUse] = useState(false);

  // 現在のマップサイズに応じた色を生成
  const currentColors = useMemo(() => {
    const numberOfTypes = Math.floor((mapSize * mapSize) / 2);
    return generateColors(numberOfTypes);
  }, [mapSize]);

  // 回転可能なサイズを計算する関数
  const getValidRotationSizes = useCallback((size: number): number[] => {
    const validSizes: number[] = [];
    for (let i = 2; i <= size; i++) {
      validSizes.push(i);
    }
    return validSizes;
  }, []);

  // 回転の統計情報を初期化する関数
  const initializeRotationStats = useCallback(
    (size: number) => {
      const stats: RotationStats = {};
      for (const s of getValidRotationSizes(size)) {
        stats[`size${s}`] = 0;
      }
      return stats;
    },
    [getValidRotationSizes]
  );

  // マップサイズが変更されたときの処理
  useEffect(() => {
    setGrid(generateInitialGrid(mapSize));
    setScore(0);
    setMoves(0);
    setRotationStats(initializeRotationStats(mapSize));
    setGridHistory([]);
    setScoreHistory([]);
    setRotationStatsHistory([]);
  }, [mapSize, initializeRotationStats]);

  // 一つ前に戻る関数
  const handleUndo = () => {
    if (gridHistory.length === 0) return;

    const previousGrid = gridHistory[gridHistory.length - 1];
    const previousScore = scoreHistory[scoreHistory.length - 1];
    const previousRotationStats =
      rotationStatsHistory[rotationStatsHistory.length - 1];

    setGrid(previousGrid);
    setScore(previousScore);
    setRotationStats(previousRotationStats);
    setMoves((prev) => prev - 1);

    // 履歴から最後の要素を削除
    setGridHistory((prev) => prev.slice(0, -1));
    setScoreHistory((prev) => prev.slice(0, -1));
    setRotationStatsHistory((prev) => prev.slice(0, -1));
  };

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

    // 現在の状態を履歴に保存
    setGridHistory((prev) => [...prev, grid]);
    setScoreHistory((prev) => [...prev, score]);
    setRotationStatsHistory((prev) => [...prev, rotationStats]);

    // 回転の統計情報を更新
    setRotationStats((prev) => ({
      ...prev,
      [`size${size}`]: (prev[`size${size}`] || 0) + 1,
    }));

    setGrid(newGrid);
    calculateScore(newGrid);
    setMoves((prev) => prev + 1);
  };

  // スコアを計算する関数
  const calculateScore = (currentGrid: Grid) => {
    let newScore = 0;

    // 横方向のチェック
    for (let i = 0; i < mapSize; i++) {
      for (let j = 0; j < mapSize - 1; j++) {
        if (currentGrid[i][j] === currentGrid[i][j + 1]) {
          newScore += 1;
        }
      }
    }

    // 縦方向のチェック
    for (let i = 0; i < mapSize - 1; i++) {
      for (let j = 0; j < mapSize; j++) {
        if (currentGrid[i][j] === currentGrid[i + 1][j]) {
          newScore += 1;
        }
      }
    }

    setScore(newScore);
  };

  // リセットボタンのハンドラー
  const handleReset = () => {
    setGrid(generateInitialGrid(mapSize));
    setScore(0);
    setMoves(0);
    setRotationStats(initializeRotationStats(mapSize));
    // 履歴もリセット
    setGridHistory([]);
    setScoreHistory([]);
    setRotationStatsHistory([]);
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

        // 有効な回転サイズかチェック
        if (getValidRotationSizes(mapSize).includes(size)) {
          // 回転の開始位置を計算
          const startRow = Math.min(firstClick.row, secondClick.row);
          const startCol = Math.min(firstClick.col, secondClick.col);

          // グリッドの範囲内かチェック
          if (startRow + size <= mapSize && startCol + size <= mapSize) {
            rotateGrid(startRow, startCol, size);
          }
        }
      }

      // 選択をリセット
      setFirstClick(null);
    }
  };

  // セルのサイズを計算する関数
  const getCellSize = useCallback(() => {
    // 画面の幅に基づいて適切なセルサイズを計算
    const maxWidth = window.innerWidth * 0.9; // 画面幅の90%を最大値とする
    const cellSize = Math.min(60, Math.floor(maxWidth / mapSize));
    return cellSize;
  }, [mapSize]);

  // セルのスタイルを計算する関数
  const getCellStyle = (row: number, col: number) => {
    const cellSize = getCellSize();
    const baseStyle = {
      backgroundColor: currentColors[grid[row][col]],
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      fontSize: `${Math.max(12, cellSize * 0.4)}px`,
    };

    if (firstClick && firstClick.row === row && firstClick.col === col) {
      return {
        ...baseStyle,
        border: "3px solid #4CAF50",
        transform: "scale(0.95)",
      };
    }

    return baseStyle;
  };

  // グリッドのスタイルを計算する関数
  const getGridStyle = useCallback(() => {
    const cellSize = getCellSize();
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${mapSize}, ${cellSize}px)`,
      gap: "2px",
      padding: "10px",
      backgroundColor: "#e9ecef",
      borderRadius: "8px",
      margin: "0 auto",
    };
  }, [mapSize, getCellSize]);

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

  // JSONからマップを生成する関数
  const generateMapFromJson = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      const problem = data.problem as Problem;

      if (!problem?.field?.size || !problem?.field?.entities) {
        throw new Error("Invalid JSON format");
      }

      const size = problem.field.size;
      const entities = problem.field.entities;

      // サイズの検証
      if (
        size !== entities.length ||
        entities.some((row) => row.length !== size)
      ) {
        throw new Error("Invalid grid size");
      }

      setMapSize(size);
      setGrid(entities);
      setScore(0);
      setMoves(0);
      setRotationStats(initializeRotationStats(size));
      setGridHistory([]);
      setScoreHistory([]);
      setRotationStatsHistory([]);
    } catch (error) {
      alert(`無効なJSONフォーマットです: ${(error as Error).message}`);
    }
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="stats">
          <div className="score">スコア: {score}</div>
          <div className="moves">手数: {moves}</div>
          <div className="rotation-stats">
            {getValidRotationSizes(mapSize).map((size) => (
              <div key={size}>
                {size}x{size}回転: {rotationStats[`size${size}`] || 0}回
              </div>
            ))}
          </div>
          <div className="map-size-control">
            <label>
              マップサイズ:
              <select
                value={mapSize}
                onChange={(e) => setMapSize(Number(e.target.value))}
                disabled={isJsonMode}
              >
                {[4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24].map(
                  (size) => (
                    <option key={size} value={size}>
                      {size}x{size}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>
          <div className="json-control">
            <label>
              <input
                type="checkbox"
                checked={isJsonMode}
                onChange={(e) => setIsJsonMode(e.target.checked)}
              />
              JSONモード
            </label>
            {isJsonMode && (
              <div className="json-input">
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="JSONを入力してください"
                  rows={5}
                />
                <button
                  onClick={() => generateMapFromJson(jsonInput)}
                  className="json-button"
                  type="button"
                >
                  マップを生成
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowHowToUse(!showHowToUse)}
            className="how-to-use-button"
          >
            {showHowToUse ? "使い方を隠す" : "使い方を表示"}
          </button>
        </div>
      </div>
      {showHowToUse && <HowToUse />}
      <div className="grid" style={getGridStyle()}>
        {grid.map((row, i) =>
          row.map((cell, j) => (
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
          ))
        )}
      </div>
      <div className="controls">
        <button
          type="button"
          onClick={handleUndo}
          className="undo-button"
          disabled={gridHistory.length === 0}
        >
          一つ前に戻る
        </button>
        <button type="button" onClick={handleReset} className="reset-button">
          リセット
        </button>
      </div>
    </div>
  );
}

export default App;
