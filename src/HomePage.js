import React, { useState } from "react";
import { Redirect } from "react-router-dom";

const NEW_GAME_URL = `${process.env.REACT_APP_API_URL}/games/new`;
function fetchNewGame() {
  return fetch(NEW_GAME_URL).then((res) => res.json());
}

const FETCH_STATUS = {
  idle: Symbol("idle"),
  pending: Symbol("pending"),
  resolved: Symbol("resolved"),
  rejected: Symbol("rejected"),
};

function HomePage() {
  const [fetchStatus, setFetchStatus] = useState(FETCH_STATUS.idle);
  const [gameId, setGameId] = useState();

  async function handleNewGameClick() {
    setFetchStatus(FETCH_STATUS.pending);

    const response = await fetchNewGame();
    setGameId(response.id);
    setFetchStatus(FETCH_STATUS.resolved);
  }

  if (fetchStatus === FETCH_STATUS.idle) {
    return (
      <div>
        <button onClick={handleNewGameClick}>New Game</button>
      </div>
    );
  }

  if (fetchStatus === FETCH_STATUS.pending) {
    return (
      <div>
        <p>Creating new game...</p>
      </div>
    );
  }

  if (fetchStatus === FETCH_STATUS.resolved) {
    return (
      <div>
        <Redirect to={`games/${gameId}`} />
      </div>
    );
  }
}

export default HomePage;
