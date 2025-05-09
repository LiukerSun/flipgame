'use client';

import { useState } from 'react';
import { PulsatingButton } from "@/components/magicui/pulsating-button";

type CellState = 'white' | 'orange';

export const Chessboard = () => {
  const [size, setSize] = useState(3);
  const [isCreated, setIsCreated] = useState(false);
  const [cells, setCells] = useState<CellState[]>([]);
  const [minClicks, setMinClicks] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentClicks, setCurrentClicks] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [initialCells, setInitialCells] = useState<CellState[]>([]);
  const [solutionCells, setSolutionCells] = useState<boolean[]>([]);
  const [showSolution, setShowSolution] = useState(false);

  const handleSizeSelect = (newSize: number) => {
    setSize(newSize);
  };

  const getRandomCells = (length: number) => {
    return Array.from({ length }, () => Math.random() < 0.5 ? 'white' : 'orange');
  };

  const getMinClicksForState = (cellStates: CellState[]): { clicks: number, solution: number[] } | null => {
    const initialState = cellStates.map(cell => cell === 'orange' ? 1 : 0);
    const n = size;
    const totalCells = n * n;

    // 首行方程法求解
    const solveByFirstRow = () => {
      // 记录每个位置的状态
      const state = [...initialState];
      
      // 第一行的所有可能性
      const firstRowPossibilities = 1 << n;
      let minClicks = Infinity;
      let finalSolution = null;

      // 枚举第一行的所有可能性
      for (let mask = 0; mask < firstRowPossibilities; mask++) {
        // 临时状态和解
        const tempState = [...state];
        const tempSolution = new Array(totalCells).fill(0);
        
        // 设置第一行的点击
        for (let j = 0; j < n; j++) {
          if ((mask & (1 << j)) !== 0) {
            tempSolution[j] = 1;
            // 更新第一行的状态
            if (j > 0) tempState[j-1] = tempState[j-1] === 1 ? 0 : 1;
            tempState[j] = tempState[j] === 1 ? 0 : 1;
            if (j < n-1) tempState[j+1] = tempState[j+1] === 1 ? 0 : 1;
            if (n > 1) tempState[j+n] = tempState[j+n] === 1 ? 0 : 1;
          }
        }

        // 根据第一行确定其他行的点击
        for (let i = 1; i < n; i++) {
          for (let j = 0; j < n; j++) {
            // 如果上一行的格子是白色，需要点击当前位置
            if (tempState[(i-1)*n + j] === 0) {
              tempSolution[i*n + j] = 1;
              // 更新状态
              if (j > 0) tempState[i*n + j-1] = tempState[i*n + j-1] === 1 ? 0 : 1;
              tempState[i*n + j] = tempState[i*n + j] === 1 ? 0 : 1;
              if (j < n-1) tempState[i*n + j+1] = tempState[i*n + j+1] === 1 ? 0 : 1;
              if (i < n-1) tempState[(i+1)*n + j] = tempState[(i+1)*n + j] === 1 ? 0 : 1;
            }
          }
        }

        // 检查最后一行是否全为橙色
        let isValid = true;
        for (let j = 0; j < n; j++) {
          if (tempState[(n-1)*n + j] === 0) {
            isValid = false;
            break;
          }
        }

        // 如果是有效解且点击次数更少，更新最优解
        if (isValid) {
          const clicks = tempSolution.reduce((sum, val) => sum + val, 0);
          if (clicks < minClicks) {
            minClicks = clicks;
            finalSolution = [...tempSolution];
          }
        }
      }

      return finalSolution;
    };

    const solution = solveByFirstRow();
    
    if (solution === null) return null;
    
    return {
      clicks: solution.reduce((sum, val) => sum + val, 0),
      solution: solution
    };
  };

  const generateValidBoard = () => {
    let attempts = 0;
    const maxAttempts = 100;
    let newCells: CellState[];
    let clicks: number | null;
    let solution: boolean[] | null;

    do {
      newCells = getRandomCells(size * size);
      const result = getMinClicksForState(newCells);
      clicks = result ? result.clicks : null;
      solution = result ? result.solution.map(val => val === 1) : null;
      attempts++;
    } while ((clicks === null || clicks === 0) && attempts < maxAttempts);

    if (attempts === maxAttempts) {
      newCells = Array(size * size).fill('white');
      newCells[0] = 'orange';
      const result = getMinClicksForState(newCells);
      clicks = result ? result.clicks : null;
      solution = result ? result.solution.map(val => val === 1) : null;
    }

    return { cells: newCells, minClicks: clicks, solution };
  };

  const handleCreate = async () => {
    setIsGenerating(true);
    setIsCreated(true);
    setCurrentClicks(0);
    setIsCompleted(false);
    setShowSolution(false);

    setTimeout(() => {
      const { cells: validCells, minClicks: requiredClicks, solution } = generateValidBoard();
      setCells(validCells);
      setInitialCells([...validCells]);
      setMinClicks(requiredClicks);
      setSolutionCells(solution || []);
      setIsGenerating(false);
    }, 0);
  };

  const handleRestart = () => {
    setIsCreated(false);
    setSize(3);
    setCells([]);
    setMinClicks(null);
    setCurrentClicks(0);
    setIsCompleted(false);
    setShowSolution(false);
  };

  const handleRandomize = () => {
    if (!isCreated) return;
    setIsGenerating(true);
    setCurrentClicks(0);
    setIsCompleted(false);
    setShowSolution(false);

    setTimeout(() => {
      const { cells: validCells, minClicks: requiredClicks, solution } = generateValidBoard();
      setCells(validCells);
      setInitialCells([...validCells]);
      setMinClicks(requiredClicks);
      setSolutionCells(solution || []);
      setIsGenerating(false);
    }, 0);
  };

  const handleRetry = () => {
    if (!isCreated || !initialCells.length) return;
    setCells([...initialCells]);
    setCurrentClicks(0);
    setIsCompleted(false);
    setShowSolution(false);
  };

  const handleCellClick = (index: number) => {
    if (!isCreated || isCompleted) return;

    const newCells = [...cells];
    const toggleColor = (idx: number) => {
      if (idx >= 0 && idx < cells.length) {
        newCells[idx] = newCells[idx] === 'white' ? 'orange' : 'white';
      }
    };

    // 获取当前行和列
    const row = Math.floor(index / size);
    const col = index % size;

    // 切换当前格子
    toggleColor(index);

    // 切换上方格子
    if (row > 0) {
      toggleColor(index - size);
    }

    // 切换下方格子
    if (row < size - 1) {
      toggleColor(index + size);
    }

    // 切换左边格子
    if (col > 0) {
      toggleColor(index - 1);
    }

    // 切换右边格子
    if (col < size - 1) {
      toggleColor(index + 1);
    }

    setCells(newCells);
    setCurrentClicks(prev => prev + 1);

    // 检查是否所有格子都变成橙色
    if (newCells.every(cell => cell === 'orange')) {
      setIsCompleted(true);
    }
  };

  return (
    <div className="flex items-start gap-8 p-4">
      <div className="flex flex-col items-center gap-4">
        {!isCreated ? (
          <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold text-gray-700">选择棋盘大小：</div>
            <div className="grid grid-cols-2 gap-4">
              {[3, 4, 5, 6].map((boardSize) => (
                <PulsatingButton
                  key={boardSize}
                  onClick={() => handleSizeSelect(boardSize)}
                  className={`w-24 ${size === boardSize ? 'border-blue-500 border-2' : 'border-gray-300'}`}
                >
                  {boardSize} x {boardSize}
                </PulsatingButton>
              ))}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-semibold mb-2">游戏规则</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>点击一个格子会改变该格子及其上下左右相邻格子的颜色</li>
                <li>白色格子变橙色，橙色格子变白色</li>
                <li>目标是将所有格子变成橙色</li>
                <li>每个关卡都有最少点击次数的解法</li>
                <li>挑战自己用最少的步数完成游戏！</li>
              </ul>
            </div>
            <PulsatingButton
              onClick={handleCreate}
              disabled={isGenerating}
              className="w-full mt-4 disabled:bg-blue-300"
            >
              {isGenerating ? '生成中...' : '创建棋盘'}
            </PulsatingButton>
            <a
              href="/tutorial"
              className="text-blue-500 hover:text-blue-700 text-center mt-2"
            >
              查看算法教程
            </a>
          </div>
        ) : (
          <div className="flex gap-4">
            <PulsatingButton
              onClick={handleRestart}
              disabled={isGenerating}
            >
              重新选择棋盘
            </PulsatingButton>
            <PulsatingButton
              onClick={handleRandomize}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '随机刷新'}
            </PulsatingButton>
            <PulsatingButton
              onClick={handleRetry}
              disabled={isGenerating}
            >
              重玩本局
            </PulsatingButton>
          </div>
        )}

        {isGenerating && (
          <div className="text-blue-500">
            正在生成符合要求的棋盘...
          </div>
        )}

        {isCreated && !isGenerating && (
          <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded-lg shadow-md min-w-[200px]">
            <h2 className="text-xl font-bold text-gray-800">游戏统计</h2>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-gray-600">当前点击次数</span>
                <span className="text-2xl font-bold text-blue-600">{currentClicks}</span>
              </div>
              {minClicks !== null && (
                <div className="flex flex-col">
                  <span className="text-gray-600">最少需要点击</span>
                  <span className="text-2xl font-bold text-green-600">{minClicks}</span>
                  {currentClicks > minClicks && !isCompleted && (
                    <span className="text-sm text-orange-500 mt-1">
                      已超过最少点击次数 {currentClicks - minClicks} 步
                    </span>
                  )}
                </div>
              )}
              <div className="mt-4">
                <PulsatingButton
                  onClick={() => setShowSolution(!showSolution)}
                  className="w-full"
                >
                  {showSolution ? '隐藏提示' : '显示提示'}
                </PulsatingButton>
                {showSolution && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>蓝色圆点表示建议点击的位置</p>
                    <p>这些位置组成了最优解之一</p>
                  </div>
                )}
              </div>
              {isCompleted && (
                <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
                  恭喜！你已完成挑战！
                  {currentClicks === minClicks && (
                    <div className="mt-1 text-sm font-semibold">
                      太棒了！你用最少的步数完成了挑战！
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isCreated && !isGenerating && (
        <div className="grid gap-[1px] bg-gray-300"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            width: 'min(60vw, 500px)',
            height: 'min(60vw, 500px)'
          }}>
          {cells.map((cellState, index) => (
            <div
              key={index}
              onClick={() => handleCellClick(index)}
              className={`aspect-square transition-colors relative ${
                isCompleted
                  ? 'bg-orange-500 cursor-not-allowed'
                  : `${cellState === 'white' ? 'bg-white' : 'bg-orange-500'} cursor-pointer hover:opacity-90`
              }`}
            >
              {showSolution && solutionCells[index] && !isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 