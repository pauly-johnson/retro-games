import React, { useState, useEffect, useRef } from 'react';

// Constants for the board
const ROWS = 21;
const COLS = 19;
const TILE = {
  WALL: 0,
  DOT: 1,
  EMPTY: 2,
  POWER: 3,
  GHOST_HOUSE: 4,
};

// Pac-Man and ghost initial positions
const PACMAN_START = { x: 9, y: 17 }; 
const GHOSTS_START = [
  { x: 9, y: 9, color: '#f00', name: 'Blinky' },
  { x: 8, y: 11, color: '#0ff', name: 'Inky' },
  { x: 9, y: 10, color: '#ffb8ff', name: 'Pinky' }, 
  { x: 10, y: 11, color: '#ffb852', name: 'Clyde' },
];

// The original Pac-Man board layout (0=wall, 1=dot, 2=empty, 3=power pellet, 4=ghost house)
const BOARD = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,1,0,1,0,0,0,1,0,0,1,0],
  [0,3,0,0,0,1,0,0,1,0,1,0,0,0,1,0,0,3,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0],
  [0,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,0],
  [0,0,0,0,0,1,0,0,4,4,4,0,0,1,0,0,0,0,0],
  [2,2,2,2,0,1,0,4,4,4,0,1,0,2,2,2,2,2,2],
  [0,0,0,0,0,1,0,4,4,4,0,1,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0],
  [0,3,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,3,0],
  [0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0],
  [2,2,2,2,0,1,1,1,1,2,1,1,1,1,0,2,2,2,2],
  [0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,1,0,0,1,0,1,0,0,0,1,0,0,1,0],
  [0,3,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,3,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

const DIRS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

function isWall(board, x, y) {
  return board[y] && board[y][x] === TILE.WALL;
}

function isValid(board, x, y) {
  return board[y] && board[y][x] !== TILE.WALL && board[y][x] !== undefined;
}

function drawGhost({ x, y, color, name }) {
  // Ghost body
  const cx = x * 24 + 12;
  const cy = y * 24 + 12;
  const body = `M${cx - 10},${cy + 10} Q${cx - 10},${cy - 10} ${cx},${cy - 10} Q${cx + 10},${cy - 10} ${cx + 10},${cy + 10} Q${cx + 5},${cy + 6} ${cx},${cy + 10} Q${cx - 5},${cy + 6} ${cx - 10},${cy + 10} Z`;
  // Eyes
  const eyes = [
    <ellipse key="eyeL" cx={cx - 4} cy={cy - 4} rx={3} ry={4} fill="#fff" />,
    <ellipse key="eyeR" cx={cx + 4} cy={cy - 4} rx={3} ry={4} fill="#fff" />,
    <circle key="pupilL" cx={cx - 4} cy={cy - 2} r={1.2} fill="#00f" />,
    <circle key="pupilR" cx={cx + 4} cy={cy - 2} r={1.2} fill="#00f" />,
  ];
  // Wavy bottom
  const waves = [0, 1, 2, 3].map(i => (
    <circle key={'wave' + i} cx={cx - 7.5 + i * 5} cy={cy + 10} r={2.5} fill={color} />
  ));
  return (
    <g key={name}>
      <path d={body} fill={color} stroke="#fff" strokeWidth={1.5} />
      {eyes}
      {waves}
    </g>
  );
}

function drawBoard(board, pacman, ghosts, mouthOpen, pacDir) {
  // Calculate Pac-Man mouth angle based on direction
  let angle = 0;
  if (pacDir.x === 1) angle = 0; // right
  else if (pacDir.x === -1) angle = Math.PI; // left
  else if (pacDir.y === -1) angle = 1.5 * Math.PI; // up
  else if (pacDir.y === 1) angle = 0.5 * Math.PI; // down
  // Pac-Man mouth
  const mouth = mouthOpen ? 0.35 : 0.08;
  return (
    <svg width={COLS * 24} height={ROWS * 24} style={{ background: '#111', display: 'block', margin: '0 auto' }}>
      {board.map((row, y) =>
        row.map((cell, x) => {
          let fill = '#222';
          if (cell === TILE.WALL) fill = '#0033cc';
          if (cell === TILE.GHOST_HOUSE) fill = '#333';
          return <rect key={x + '-' + y} x={x * 24} y={y * 24} width={24} height={24} fill={fill} />;
        })
      )}
      {board.map((row, y) =>
        row.map((cell, x) => {
          if (cell === TILE.DOT)
            return <circle key={'dot-' + x + '-' + y} cx={x * 24 + 12} cy={y * 24 + 12} r={3} fill="#fff" />;
          if (cell === TILE.POWER)
            return <circle key={'power-' + x + '-' + y} cx={x * 24 + 12} cy={y * 24 + 12} r={7} fill="#fff" />;
          return null;
        })
      )}
      {/* Pac-Man with animated mouth */}
      <path
        d={`M${pacman.x * 24 + 12},${pacman.y * 24 + 12}
          L${pacman.x * 24 + 12 + 10 * Math.cos(angle + mouth * Math.PI)},${pacman.y * 24 + 12 + 10 * Math.sin(angle + mouth * Math.PI)}
          A10,10 0 1,1 ${pacman.x * 24 + 12 + 10 * Math.cos(angle - mouth * Math.PI)},${pacman.y * 24 + 12 + 10 * Math.sin(angle - mouth * Math.PI)}
          Z`}
        fill="#ff0"
        stroke="#ff0"
        strokeWidth={2}
      />
      {/* Ghosts */}
      {ghosts.map(drawGhost)}
    </svg>
  );
}

export default function Pacman() {
  const [board, setBoard] = useState(() => BOARD.map(row => [...row]));
  const [pacman, setPacman] = useState({ ...PACMAN_START });
  const [ghosts, setGhosts] = useState(GHOSTS_START.map(g => ({ ...g })));
  const [dir, setDir] = useState(DIRS.ArrowLeft);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(true);
  const dirRef = useRef(dir);
  const ghostsRef = useRef(ghosts);
  const boardRef = useRef();
  // Responsive SVG size
  const [svgSize, setSvgSize] = useState({ width: 456, height: 504 });

  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { ghostsRef.current = ghosts; }, [ghosts]);

  // Responsive resize handler
  useEffect(() => {
    function handleResize() {
      // Fit to 90vw, max 456px, keep aspect
      const maxW = Math.min(window.innerWidth * 0.95, 456);
      const maxH = Math.min(window.innerHeight * 0.6, 504);
      const scale = Math.min(maxW / (COLS * 24), maxH / (ROWS * 24), 1);
      setSvgSize({ width: COLS * 24 * scale, height: ROWS * 24 * scale });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gameOver || win) return;
    const handleKey = e => {
      if (DIRS[e.key]) setDir(DIRS[e.key]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, win]);

  // Animate mouth open/close
  useEffect(() => {
    if (gameOver || win) return;
    const mouthInterval = setInterval(() => setMouthOpen(m => !m), 100);
    return () => clearInterval(mouthInterval);
  }, [gameOver, win]);

  useEffect(() => {
    if (gameOver || win) return;
    const interval = setInterval(() => {
      setPacman(prev => {
        let nx = prev.x + dirRef.current.x;
        let ny = prev.y + dirRef.current.y;
        // Wrap around
        if (nx < 0) nx = COLS - 1;
        if (nx >= COLS) nx = 0;
        if (ny < 0) ny = ROWS - 1;
        if (ny >= ROWS) ny = 0;
        if (!isValid(board, nx, ny)) {
          nx = prev.x;
          ny = prev.y;
        }
        // Eat dot or power pellet
        setBoard(bd => {
          const newBd = bd.map(r => [...r]);
          if (newBd[ny][nx] === TILE.DOT) setScore(s => s + 10);
          if (newBd[ny][nx] === TILE.POWER) setScore(s => s + 50);
          if (newBd[ny][nx] === TILE.DOT || newBd[ny][nx] === TILE.POWER) newBd[ny][nx] = TILE.EMPTY;
          // Win check
          if (newBd.flat().filter(c => c === TILE.DOT || c === TILE.POWER).length === 0) {
            // Start next level after short delay
            setTimeout(() => {
              setBoard(BOARD.map(row => [...row]));
              setPacman({ ...PACMAN_START });
              setGhosts(GHOSTS_START.map(g => ({ ...g })));
              setDir(DIRS.ArrowLeft);
              // Optionally, increase speed or add level indicator here
            }, 1200);
          }
          return newBd;
        });
        return { x: nx, y: ny };
      });
      // Move ghosts
      setGhosts(gs => gs.map(g => {
        // Simple AI: random valid direction
        const options = Object.values(DIRS).filter(d => isValid(board, g.x + d.x, g.y + d.y));
        const d = options[Math.floor(Math.random() * options.length)] || { x: 0, y: 0 };
        return { ...g, x: g.x + d.x, y: g.y + d.y };
      }));
    }, 180);
    return () => clearInterval(interval);
  }, [board, gameOver, win]);

  // Collision detection
  useEffect(() => {
    if (ghosts.some(g => g.x === pacman.x && g.y === pacman.y)) setGameOver(true);
  }, [ghosts, pacman]);

  function handleRestart() {
    setBoard(BOARD.map(row => [...row]));
    setPacman({ ...PACMAN_START });
    setGhosts(GHOSTS_START.map(g => ({ ...g })));
    setDir(DIRS.ArrowLeft);
    setScore(0);
    setGameOver(false);
    setWin(false);
  }

  // Touch/D-pad controls
  function handleDPad(dirKey) {
    if (DIRS[dirKey]) setDir(DIRS[dirKey]);
  }

  // Touch swipe support (optional, for mobile)
  useEffect(() => {
    let startX = 0, startY = 0;
    function onTouchStart(e) {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }
    function onTouchEnd(e) {
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
          handleDPad(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
        } else if (Math.abs(dy) > 20) {
          handleDPad(dy > 0 ? 'ArrowDown' : 'ArrowUp');
        }
      }
    }
    const svg = boardRef.current;
    if (svg) {
      svg.addEventListener('touchstart', onTouchStart);
      svg.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      if (svg) {
        svg.removeEventListener('touchstart', onTouchStart);
        svg.removeEventListener('touchend', onTouchEnd);
      }
    };
  }, [boardRef]);

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <h2 style={{ color: '#ff0', fontFamily: 'monospace', fontSize: 32 }}>Pac-Man</h2>
      <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 20 }}>Score: {score}</div>
      <div style={{ display: 'inline-block', background: '#111', border: '4px solid #ff0', marginTop: 20, position: 'relative' }}>
        <div style={{ width: svgSize.width, height: svgSize.height }}>
          <svg
            ref={boardRef}
            width={svgSize.width}
            height={svgSize.height}
            viewBox={`0 0 ${COLS * 24} ${ROWS * 24}`}
            style={{ background: '#111', display: 'block', margin: '0 auto', touchAction: 'none' }}
          >
            {/* Board and entities */}
            {drawBoard(board, pacman, ghosts, mouthOpen, dir)}
          </svg>
        </div>
      </div>
      {/* D-pad overlay for touch/mobile, now outside the board */}
      <div
        style={{
          margin: '24px auto 0',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
          touchAction: 'none',
          maxWidth: svgSize.width,
        }}
      >
        <button
          aria-label="Up"
          onTouchStart={() => handleDPad('ArrowUp')}
          onClick={() => handleDPad('ArrowUp')}
          style={dpadBtnStyle('up')}
        >▲</button>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <button
            aria-label="Left"
            onTouchStart={() => handleDPad('ArrowLeft')}
            onClick={() => handleDPad('ArrowLeft')}
            style={dpadBtnStyle('left')}
          >◀</button>
          <div style={{ width: 32 }} />
          <button
            aria-label="Right"
            onTouchStart={() => handleDPad('ArrowRight')}
            onClick={() => handleDPad('ArrowRight')}
            style={dpadBtnStyle('right')}
          >▶</button>
        </div>
        <button
          aria-label="Down"
          onTouchStart={() => handleDPad('ArrowDown')}
          onClick={() => handleDPad('ArrowDown')}
          style={dpadBtnStyle('down')}
        >▼</button>
      </div>
      {gameOver && (
        <div style={{ color: '#f44', fontFamily: 'monospace', fontSize: 24, marginTop: 20 }}>
          <div>Game Over!</div>
          <button onClick={handleRestart} style={{ marginTop: 10, fontSize: 18, padding: '0.5em 1.5em', background: '#ff0', color: '#111', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Restart
          </button>
        </div>
      )}
      {/* No win screen, next level starts automatically */}
      <div style={{ color: '#aaa', marginTop: 20, fontFamily: 'monospace' }}>
        Use arrow keys or D-pad to move. Eat all the dots and avoid the ghosts!
      </div>
    </div>
  );
}

// D-pad button style helper
function dpadBtnStyle(dir) {
  return {
    width: 48,
    height: 48,
    margin: 4,
    fontSize: 32,
    background: '#222',
    color: '#ff0',
    border: '2px solid #ff0',
    borderRadius: 12,
    outline: 'none',
    boxShadow: dir === 'up' || dir === 'down' ? '0 2px 8px #0008' : '2px 0 8px #0008',
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'pointer',
  };
}
