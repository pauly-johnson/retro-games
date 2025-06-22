import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Snake from './Snake';
import Pacman from './Pacman';
import Chess from './Chess';
import Solitaire from './Solitaire';
import Minesweeper from './Minesweeper';
import SpaceInvaders from './SpaceInvaders';
import Crosswords from './Crosswords';
import Sudoku from './Sudoku';
import Checkers from './Checkers';
import ChineseCheckers from './ChineseCheckers';
import TicTacToe from './TicTacToe';
import Battleship from './Battleship';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/pacman" element={<Pacman />} />
        <Route path="/chess" element={<Chess />} />
        <Route path="/solitaire" element={<Solitaire />} />
        <Route path="/minesweeper" element={<Minesweeper />} />
        <Route path="/space-invaders" element={<SpaceInvaders />} />
        <Route path="/crosswords" element={<Crosswords />} />
        <Route path="/sudoku" element={<Sudoku />} />
        <Route path="/checkers" element={<Checkers />} />
        <Route path="/chinese-checkers" element={<ChineseCheckers />} />
        <Route path="/tic-tac-toe" element={<TicTacToe />} />
        <Route path="/battleship" element={<Battleship />} />
      </Routes>
    </Router>
  );
}

export default App;
