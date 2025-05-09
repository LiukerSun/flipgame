'use client';

import { useState, useCallback, useEffect } from 'react';
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import Link from 'next/link';

type CellState = 'white' | 'orange';

export const Tutorial = () => {
  const [size, setSize] = useState(3);
  const [initialState, setInitialState] = useState<CellState[]>([]);
  const [demoState, setDemoState] = useState<CellState[]>([]);
  const [firstRowClicks, setFirstRowClicks] = useState<boolean[]>([]);
  const [autoClicks, setAutoClicks] = useState<boolean[]>([]);

  const initializeBoard = useCallback((boardSize: number) => {
    const totalCells = boardSize * boardSize;
    const newState = Array(totalCells).fill('white').map(() => Math.random() < 0.5 ? 'white' : 'orange');
    setInitialState(newState);
    setDemoState(newState);
    setFirstRowClicks(Array(boardSize).fill(false));
    setAutoClicks(Array(totalCells).fill(false));
  }, []);

  const generateRandomBoard = useCallback(() => {
    initializeBoard(size);
  }, [size, initializeBoard]);

  const resetBoard = useCallback(() => {
    setDemoState([...initialState]);
    setFirstRowClicks(Array(size).fill(false));
    setAutoClicks(Array(size * size).fill(false));
  }, [initialState, size]);

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    initializeBoard(newSize);
  };

  // 初始化时生成随机棋盘
  useEffect(() => {
    initializeBoard(size);
  }, [size, initializeBoard]);

  const handleDemoClick = (index: number) => {
    if (index >= size) return; // 只允许点击第一行
    
    const newFirstRowClicks = [...firstRowClicks];
    newFirstRowClicks[index] = !newFirstRowClicks[index];
    setFirstRowClicks(newFirstRowClicks);
    
    // 从初始状态开始重新计算
    const newState = [...initialState];
    const newAutoClicks = Array(size * size).fill(false);
    
    // 应用第一行的点击
    for (let j = 0; j < size; j++) {
      if (newFirstRowClicks[j]) {
        // 影响当前格子
        newState[j] = newState[j] === 'white' ? 'orange' : 'white';
        // 影响左边格子
        if (j > 0) newState[j-1] = newState[j-1] === 'white' ? 'orange' : 'white';
        // 影响右边格子
        if (j < size-1) newState[j+1] = newState[j+1] === 'white' ? 'orange' : 'white';
        // 影响下面的格子
        if (j + size < size * size) newState[j+size] = newState[j+size] === 'white' ? 'orange' : 'white';
      }
    }
    
    // 计算其他行需要点击的位置
    for (let i = 1; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const currentIndex = i * size + j;
        if (newState[currentIndex - size] === 'white') { // 如果上面是白色，就需要点击
          newAutoClicks[currentIndex] = true;
          // 影响当前格子
          newState[currentIndex] = newState[currentIndex] === 'white' ? 'orange' : 'white';
          // 影响左边格子
          if (j > 0) newState[currentIndex-1] = newState[currentIndex-1] === 'white' ? 'orange' : 'white';
          // 影响右边格子
          if (j < size-1) newState[currentIndex+1] = newState[currentIndex+1] === 'white' ? 'orange' : 'white';
          // 影响上面的格子
          newState[currentIndex-size] = newState[currentIndex-size] === 'white' ? 'orange' : 'white';
          // 影响下面的格子
          if (i < size-1) newState[currentIndex+size] = newState[currentIndex+size] === 'white' ? 'orange' : 'white';
        }
      }
    }
    
    setDemoState(newState);
    setAutoClicks(newAutoClicks);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">翻转棋盘算法教程</h1>
        <Link href="/">
          <PulsatingButton>
            返回游戏
          </PulsatingButton>
        </Link>
      </div>
      
      <div className="space-y-8">
        <div className="p-6 rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">首行方程法详解</h2>
          <div className="space-y-4">
            <p>这是一种解决翻转棋盘问题的直观方法。核心思想是：如果我们确定了第一行的点击方式，那么后面每一行的点击方式都是被迫的。</p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">为什么这个方法有效？</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>每个格子只需要点击0次或1次（点击2次等于没点）</li>
                <li>点击一个格子会影响上下左右的格子</li>
                <li>要让上一行的格子变成橙色，下一行的点击方式是唯一确定的</li>
                <li>第一行有n个格子，所以只有2ⁿ种可能性需要尝试</li>
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-4">交互式演示</h3>
              <div className="flex gap-8">
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <label className="text-sm font-medium">棋盘大小：</label>
                      <select 
                        value={size} 
                        onChange={(e) => handleSizeChange(Number(e.target.value))}
                        className="border rounded px-2 py-1"
                      >
                        {[3,4,5,6,7,8].map(n => (
                          <option key={n} value={n}>{n}x{n}</option>
                        ))}
                      </select>
                    </div>
                    <PulsatingButton onClick={generateRandomBoard}>
                      随机生成新棋盘
                    </PulsatingButton>
                    <PulsatingButton onClick={resetBoard}>
                      重置当前棋盘
                    </PulsatingButton>
                  </div>
                  <div 
                    className="grid gap-1 bg-gray-200"
                    style={{
                      gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                      width: 'min(60vw, 500px)',
                      height: 'min(60vw, 500px)'
                    }}
                  >
                    {demoState.map((cell, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleDemoClick(idx)}
                        className={`
                          aspect-square transition-colors relative
                          ${cell === 'white' ? 'bg-white' : 'bg-orange-500'}
                          ${idx < size ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'}
                        `}
                      >
                        {idx < size && firstRowClicks[idx] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                        {idx >= size && autoClicks[idx] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">操作说明</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>选择棋盘大小（{size}x{size}）来尝试不同规模的问题</li>
                      <li>点击&quot;随机生成新棋盘&quot;可以获得新的初始状态</li>
                      <li>点击&quot;重置当前棋盘&quot;可以回到当前初始状态</li>
                      <li>点击第一行的格子来尝试不同的点击组合</li>
                      <li>蓝色圆点表示你点击的格子</li>
                      <li>绿色圆点表示其他行必须点击的格子</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">当前状态分析</h4>
                    <div className="space-y-2 text-sm">
                      <p>第一行点击：{firstRowClicks.map((click, i) => click ? i + 1 : '').filter(Boolean).join(', ') || '无'}</p>
                      <p>其他行自动点击：{autoClicks.map((click, i) => click ? i + 1 : '').filter(Boolean).join(', ') || '无'}</p>
                      <p>总点击次数：{firstRowClicks.filter(Boolean).length + autoClicks.filter(Boolean).length}</p>
                      <p>是否完成：{demoState.every(cell => cell === 'orange') ? '是' : '否'}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">解题过程</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>先确定第一行的点击位置</li>
                      <li>观察第一行点击后，哪些格子变成了白色</li>
                      <li>下一行必须点击那些&quot;上方为白色&quot;的格子</li>
                      <li>重复这个过程，直到最后一行</li>
                      <li>如果最后所有格子都是橙色，说明找到了一个解</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 