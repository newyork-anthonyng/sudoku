import React from "react";
import classNames from "classnames";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import useAsync from "./useAsyncHook";

function fetchGame(gameId) {
  const GAME_URL = `${process.env.REACT_APP_API_URL}/games/${gameId}`;
  return fetch(GAME_URL)
    .then((res) => res.json())
    .then((res) => res.grid);
}

function updateBackend(gameId, selectedSquare) {
  const GAME_URL = `${process.env.REACT_APP_API_URL}/games/${gameId}`;
  return fetch(GAME_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(selectedSquare),
  }).then((a) => a.json());
}

function NumberPicker(props) {
  const handleClick = (number) => () => {
    props.onSelect(number);
  };

  const containerClass = classNames("number-picker", {
    "number-picker--disabled": props.disabled,
  });
  const buttonClass = classNames("number-picker__button", {
    "number-picker__button--disabled": props.disabled,
  });

  return (
    <div className={containerClass}>
      <button className={buttonClass} onClick={handleClick(1)}>
        1
      </button>
      <button className={buttonClass} onClick={handleClick(2)}>
        2
      </button>
      <button className={buttonClass} onClick={handleClick(3)}>
        3
      </button>
      <button className={buttonClass} onClick={handleClick(4)}>
        4
      </button>
      <button className={buttonClass} onClick={handleClick(5)}>
        5
      </button>
      <button className={buttonClass} onClick={handleClick(6)}>
        6
      </button>
      <button className={buttonClass} onClick={handleClick(7)}>
        7
      </button>
      <button className={buttonClass} onClick={handleClick(8)}>
        8
      </button>
      <button className={buttonClass} onClick={handleClick(9)}>
        9
      </button>
    </div>
  );
}

function isSquareHighlighted(
  { x: selectedSquareX, y: selectedSquareY } = {},
  { x: currentSquareX, y: currentSquareY } = {}
) {
  return (
    selectedSquareX === currentSquareX || selectedSquareY === currentSquareY
  );
}

function Sudoku() {
  const { gameId } = useParams();
  const gridRef = React.useRef([]);

  function createNewGrid(originalGrid, move) {
    const newGrid = originalGrid.slice();
    const { x: selectedRowIndex, y: selectedColumnIndex, value } = move;

    const selectedRow = newGrid[selectedRowIndex].slice();

    const newSquare = {
      ...selectedRow[selectedColumnIndex],
      value,
    };
    selectedRow[selectedColumnIndex] = newSquare;

    newGrid[selectedRowIndex] = selectedRow;

    return newGrid;
  }

  const socket = React.useRef();
  React.useEffect(() => {
    socket.current = io(process.env.REACT_APP_WEB_SOCKET_URL);

    socket.current.on("new_message", handleSocketMessages);
  }, []);

  const [selectedSquare, setSelectedSquare] = React.useState();
  const {
    data: grid,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    run,
    setData,
  } = useAsync({
    data: [{}],
  });

  const handleSocketMessages = (move) => {
    const newGrid = createNewGrid(gridRef.current, move);

    setData(newGrid);
    gridRef.current = newGrid;
  };

  React.useEffect(() => {
    run(fetchGame(gameId)).then((response) => {
      gridRef.current = response;
    });
  }, []);

  const handleNumberSelect = (number) => {
    if (!selectedSquare) return;
    if (selectedSquare.filled) return;

    const newSquare = {
      ...selectedSquare,
      value: number,
    };
    const newGrid = createNewGrid(grid, newSquare);

    setData(newGrid);
    gridRef.current = newGrid;
    updateBackend(gameId, newSquare);
  };

  const handleDeleteSelect = () => {
    const newSquare = {
      ...selectedSquare,
      value: 0,
    };
    const newGrid = createNewGrid(grid, newSquare);

    setData(newGrid);
    gridRef.current = newGrid;
    updateBackend(gameId, newSquare);
  };

  const handleEmptyCellClick = ({ x, y, filled }) => () => {
    setSelectedSquare({ x, y, filled });
  };

  if (isIdle || isLoading) {
    return <p>Loading game...</p>;
  }

  if (isError) {
    return (
      <div>
        Something went wrong...<pre>{JSON.stringify(error)}</pre>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container">
        <div className="grid">
          {grid.map((row, rowIndex) => {
            return (
              <div className="row" key={rowIndex}>
                {row.map(({ value, filled, x, y }, cellIndex) => {
                  const isHighlighted = isSquareHighlighted(selectedSquare, {
                    x,
                    y,
                  });

                  const squareClass = classNames("square", {
                    "square--highighted": isHighlighted,
                    "square--selected":
                      selectedSquare &&
                      x === selectedSquare.x &&
                      y === selectedSquare.y,
                  });

                  const squareInputClass = classNames(
                    "square__input",
                    "square__input--unfilled",
                    {
                      "square__input--filled-by-user": value !== 0,
                    }
                  );

                  return (
                    <div className={squareClass} key={cellIndex}>
                      {filled ? (
                        <div
                          className="square__input square__input--filled"
                          onClick={handleEmptyCellClick({ x, y, filled })}
                        >
                          {value}
                        </div>
                      ) : (
                        <div
                          className={squareInputClass}
                          onClick={handleEmptyCellClick({ x, y, filled })}
                        >
                          {value || " "}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div>
          <button
            onClick={handleDeleteSelect}
            disabled={
              typeof selectedSquare === "undefined" || selectedSquare.filled
            }
          >
            Delete
          </button>
        </div>
        <NumberPicker
          onSelect={handleNumberSelect}
          disabled={
            typeof selectedSquare === "undefined" || selectedSquare.filled
          }
        />
      </div>
    );
  }
}

export default Sudoku;
