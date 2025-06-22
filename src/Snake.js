import React, { useState, useEffect, useRef } from 'react';

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const SPEED = 120;
const RETRO_COLORS = {
  bg: '#222',
  snake: '#0f0',
  food: '#ff0',
  border: '#0ff',
};

function getRandomFood(snake) {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    if (!snake.some(seg => seg.x === newFood.x && seg.y === newFood.y)) break;
  }
  return newFood;
}

export default function Snake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const moveRef = useRef(direction);
  const gameOverRef = useRef(false);
  const [svgSize, setSvgSize] = useState({ width: 400, height: 400 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

  useEffect(() => {
    moveRef.current = direction;
  }, [direction]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    const handleKey = e => {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowUp':
          if (moveRef.current.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (moveRef.current.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (moveRef.current.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (moveRef.current.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const newHead = {
          x: prevSnake[0].x + moveRef.current.x,
          y: prevSnake[0].y + moveRef.current.y,
        };
        // Check collision
        if (
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE ||
          prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }
        let newSnake;
        if (newHead.x === food.x && newHead.y === food.y) {
          newSnake = [newHead, ...prevSnake];
          setFood(getRandomFood(newSnake));
          setScore(s => s + 1);
        } else {
          newSnake = [newHead, ...prevSnake.slice(0, -1)];
        }
        return newSnake;
      });
    }, SPEED);
    return () => clearInterval(interval);
  }, [food, gameOver]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 700);
      const maxW = Math.min(window.innerWidth * 0.95, 400);
      const maxH = Math.min(window.innerHeight * 0.65, 400);
      const scale = Math.min(maxW / (BOARD_SIZE * 24), maxH / (BOARD_SIZE * 24), 1);
      setSvgSize({ width: BOARD_SIZE * 24 * scale, height: BOARD_SIZE * 24 * scale });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleRestart() {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
  }

  function handleTouch(dir) {
    if (gameOver) return;
    if (dir === 'up' && moveRef.current.y !== 1) setDirection({ x: 0, y: -1 });
    if (dir === 'down' && moveRef.current.y !== -1) setDirection({ x: 0, y: 1 });
    if (dir === 'left' && moveRef.current.x !== 1) setDirection({ x: -1, y: 0 });
    if (dir === 'right' && moveRef.current.x !== -1) setDirection({ x: 1, y: 0 });
  }

  // Move handleDPad definition above the return so it's always defined
  function handleDPad(key) {
    if (gameOver) return;
    switch (key) {
      case 'ArrowUp':
        if (moveRef.current.y !== 1) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (moveRef.current.y !== -1) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (moveRef.current.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (moveRef.current.x !== -1) setDirection({ x: 1, y: 0 });
        break;
      default:
        break;
    }
  }

  // Responsive touch button style
  const touchBtnStyle = {
    width: '10vw',
    maxWidth: 40,
    minWidth: 24,
    height: '10vw',
    maxHeight: 40,
    minHeight: 24,
    fontSize: '2.5vw',
    maxFontSize: 20,
    minFontSize: 12,
    background: RETRO_COLORS.bg,
    color: RETRO_COLORS.border,
    border: `2px solid ${RETRO_COLORS.border}`,
    borderRadius: 8,
    margin: 2,
    outline: 'none',
    cursor: 'pointer',
    touchAction: 'none',
    boxShadow: '0 2px 8px #0008',
    transition: 'background 0.2s, color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  function drawBoard(snake, food, direction, gameOver) {
    return (
      <>
        {/* Draw grid */}
        {[...Array(BOARD_SIZE)].map((_, y) =>
          [...Array(BOARD_SIZE)].map((_, x) => (
            <rect
              key={x + '-' + y}
              x={x * 24}
              y={y * 24}
              width={24}
              height={24}
              fill={RETRO_COLORS.bg}
              stroke="#333"
              strokeWidth={0.5}
            />
          ))
        )}
        {/* Draw food */}
        <rect
          x={food.x * 24}
          y={food.y * 24}
          width={24}
          height={24}
          fill={RETRO_COLORS.food}
        />
        {/* Draw snake */}
        {snake.map((seg, i) => (
          <rect
            key={i}
            x={seg.x * 24}
            y={seg.y * 24}
            width={24}
            height={24}
            fill={RETRO_COLORS.snake}
            stroke={RETRO_COLORS.border}
            strokeWidth={i === 0 ? 2 : 1}
          />
        ))}
      </>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: 10, padding: '2vw' }}>
      <h2 style={{ color: RETRO_COLORS.border, fontFamily: 'monospace', fontSize: 32 }}>Snake</h2>
      {isMobile ? (
        <>
          <div style={{ color: RETRO_COLORS.food, fontFamily: 'monospace', fontSize: 20 }}>Score: {score}</div>
          <div style={{ display: 'inline-block', background: RETRO_COLORS.bg, border: `4px solid ${RETRO_COLORS.border}`, marginTop: 20 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <svg
                width={svgSize.width}
                height={svgSize.height}
                viewBox={`0 0 ${BOARD_SIZE * 24} ${BOARD_SIZE * 24}`}
                style={{ display: 'block', background: RETRO_COLORS.bg, maxWidth: '95vw', height: 'auto', touchAction: 'none' }}
              >
                {drawBoard(snake, food, direction, gameOver)}
              </svg>
            </div>
          </div>
          {/* D-pad below board for mobile */}
          <div style={{ marginTop: 24, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button onClick={() => handleTouch('up')} style={touchBtnStyle} aria-label="Up">▲</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button onClick={() => handleTouch('left')} style={touchBtnStyle} aria-label="Left">◀</button>
              <div style={{ width: '8vw', minWidth: 16, maxWidth: 32 }} />
              <button onClick={() => handleTouch('down')} style={touchBtnStyle} aria-label="Down">▼</button>
              <div style={{ width: '8vw', minWidth: 16, maxWidth: 32 }} />
              <button onClick={() => handleTouch('right')} style={touchBtnStyle} aria-label="Right">▶</button>
            </div>
          </div>
        </>
      ) : (
        // Desktop: score and D-pad on sides
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 24 }}>
          {/* Score left */}
          <div style={{ minWidth: 120, color: RETRO_COLORS.food, fontFamily: 'monospace', fontSize: 24, textAlign: 'right' }}>
            <div>Score:</div>
            <div style={{ fontSize: 32, color: RETRO_COLORS.snake, fontWeight: 'bold' }}>{score}</div>
          </div>
          {/* Board center */}
          <div style={{ display: 'inline-block', background: RETRO_COLORS.bg, border: `4px solid ${RETRO_COLORS.border}`, position: 'relative' }}>
            <div style={{ width: svgSize.width, height: svgSize.height }}>
              <svg
                width={svgSize.width}
                height={svgSize.height}
                viewBox={`0 0 ${BOARD_SIZE * 24} ${BOARD_SIZE * 24}`}
                style={{ background: RETRO_COLORS.bg, display: 'block', margin: '0 auto', touchAction: 'none' }}
              >
                {drawBoard(snake, food, direction, gameOver)}
              </svg>
            </div>
          </div>
          {/* D-pad right */}
          <div style={{ minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none', touchAction: 'none' }}>
            <button aria-label="Up" onClick={() => handleDPad('ArrowUp')} style={touchBtnStyle}>▲</button>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <button aria-label="Left" onClick={() => handleDPad('ArrowLeft')} style={touchBtnStyle}>◀</button>
              <div style={{ width: 32 }} />
              <button aria-label="Right" onClick={() => handleDPad('ArrowRight')} style={touchBtnStyle}>▶</button>
            </div>
            <button aria-label="Down" onClick={() => handleDPad('ArrowDown')} style={touchBtnStyle}>▼</button>
          </div>
        </div>
      )}
      {gameOver && (
        <div style={{ color: '#f44', fontFamily: 'monospace', fontSize: 24, marginTop: 20 }}>
          <div>Game Over!</div>
          <button onClick={handleRestart} style={{ marginTop: 10, fontSize: 18, padding: '0.5em 1.5em', background: RETRO_COLORS.border, color: RETRO_COLORS.bg, border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Restart
          </button>
        </div>
      )}
      <div style={{ color: '#aaa', marginTop: 20, fontFamily: 'monospace' }}>
        Use arrow keys to move. Eat food to grow. Don&apos;t hit the wall or yourself!
      </div>
    </div>
  );
}
