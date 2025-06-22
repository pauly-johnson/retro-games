import React from 'react';

const games = [
  { name: 'Snake', path: '/snake' },
  { name: 'Pac-Man', path: '/pacman' },
  { name: 'Chess', path: '/chess' },
  { name: 'Solitaire', path: '/solitaire' },
  { name: 'Minesweeper', path: '/minesweeper' },
  { name: 'Space Invaders', path: '/space-invaders' },
  { name: 'Crosswords', path: '/crosswords' },
  { name: 'Sudoku', path: '/sudoku' },
  { name: 'Checkers', path: '/checkers' },
  { name: 'Chinese Checkers', path: '/chinese-checkers' },
  { name: 'Tic Tac Toe', path: '/tic-tac-toe' },
  { name: 'Battleship', path: '/battleship' },
];

export default function Home() {
  return (
    <div className="home">
      <h1>Retro Game Hub</h1>
      <div className="game-list">
        {games.map(game => (
          <a key={game.name} href={game.path} className="game-link">
            {game.name}
          </a>
        ))}
      </div>
    </div>
  );
}
