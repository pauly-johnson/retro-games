import React, { useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const AI_LEVELS = {
  easy: 1,
  medium: 2,
  hard: 3,
};

function randomMove(game) {
  const moves = game.moves();
  return moves[Math.floor(Math.random() * moves.length)];
}

function minimax(game, depth, isMaximizing) {
  if (depth === 0 || game.isGameOver()) {
    return { score: evaluateBoard(game) };
  }
  const moves = game.moves();
  let bestMove = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;
  for (let move of moves) {
    game.move(move);
    const { score } = minimax(game, depth - 1, !isMaximizing);
    game.undo();
    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }
  return { move: bestMove, score: bestScore };
}

function evaluateBoard(game) {
  // Simple material count
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let score = 0;
  const fen = game.fen().split(' ')[0];
  for (let c of fen) {
    if (values[c.toLowerCase()]) {
      score +=
        c === c.toUpperCase() ? values[c.toLowerCase()] : -values[c.toLowerCase()];
    }
  }
  return score;
}

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [aiLevel, setAiLevel] = useState('easy');
  const [status, setStatus] = useState('Your move');
  const gameRef = useRef(game);

  function safeGameMutate(modify) {
    const updated = new Chess(gameRef.current.fen());
    modify(updated);
    setGame(updated);
    setFen(updated.fen());
    gameRef.current = updated;
    updateStatus(updated);
  }

  function onPieceDrop(sourceSquare, targetSquare) {
    let moveMade = false;
    try {
      safeGameMutate(g => {
        // Only add promotion if a pawn is moving to the last rank
        const piece = g.get(sourceSquare);
        let moveObj = { from: sourceSquare, to: targetSquare };
        if (
          piece &&
          piece.type === 'p' &&
          ((piece.color === 'w' && targetSquare[1] === '8') ||
           (piece.color === 'b' && targetSquare[1] === '1'))
        ) {
          moveObj.promotion = 'q';
        }
        let move = null;
        try {
          move = g.move(moveObj);
        } catch (err) {
          // Defensive: ignore chess.js exceptions for invalid moves
          move = null;
        }
        if (move) {
          moveMade = true;
          setTimeout(() => makeAIMove(), 300);
        } else {
          setStatus('Invalid move!');
          setTimeout(() => updateStatus(g), 1200);
        }
      });
    } catch (err) {
      setStatus('Invalid move!');
      setTimeout(() => updateStatus(gameRef.current), 1200);
    }
    return moveMade;
  }

  function makeAIMove() {
    const g = new Chess(gameRef.current.fen());
    if (g.isGameOver()) return;
    let move;
    if (aiLevel === 'easy') {
      move = randomMove(g);
    } else if (aiLevel === 'medium') {
      move = minimax(g, 1, true).move;
    } else {
      move = minimax(g, 2, true).move;
    }
    if (move) {
      g.move(move);
      setGame(g);
      setFen(g.fen());
      gameRef.current = g;
      updateStatus(g);
    }
  }

  function updateStatus(gInst) {
    const g = gInst || gameRef.current;
    if (typeof g.in_checkmate === 'function' && g.in_checkmate()) setStatus('Checkmate!');
    else if (typeof g.in_draw === 'function' && g.in_draw()) setStatus('Draw!');
    else if (typeof g.in_check === 'function' && g.in_check()) setStatus('Check!');
    else setStatus('Your move');
  }

  function handleRestart() {
    const newGame = new Chess();
    setGame(newGame);
    setFen('start');
    setStatus('Your move');
    gameRef.current = newGame;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <h2 style={{ color: '#fff', fontFamily: 'monospace' }}>Chess</h2>
      <div style={{ margin: '10px 0' }}>
        <label style={{ color: '#fff', fontFamily: 'monospace' }}>AI Difficulty: </label>
        <select value={aiLevel} onChange={e => setAiLevel(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={handleRestart} style={{ marginLeft: 16 }}>Restart</button>
      </div>
      <div style={{ display: 'inline-block', border: '4px solid #fff', background: '#222', borderRadius: 8 }}>
        <Chessboard
          id="RetroChessBoard"
          boardWidth={360}
          position={fen}
          onPieceDrop={onPieceDrop}
          boardOrientation="white"
          customBoardStyle={{ backgroundColor: '#222', borderRadius: 8 }}
          customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
          customDarkSquareStyle={{ backgroundColor: '#b58863' }}
        />
      </div>
      <div style={{ color: '#fff', fontFamily: 'monospace', marginTop: 12 }}>{status}</div>
    </div>
  );
}
