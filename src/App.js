import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Sudoku from "./Sudoku";
import HomePage from "./HomePage";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/games/:gameId">
          <Sudoku />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
