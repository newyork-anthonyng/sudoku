import React from "react";
import classNames from "classnames";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import useAsync from "./useAsyncHook";

function fetchGame(gameId) {
  const GAME_URL = `http://localhost:3001/games/${gameId}`;
  return fetch(GAME_URL)
    .then((res) => res.json())
    .then((res) => res.grid);
}

const emptyGrid = new Array(9);

for (let i = 0; i < emptyGrid.length; i++) {
  emptyGrid[i] = new Array(9);

  for (let j = 0; j < emptyGrid[i].length; j++) {
    emptyGrid[i][j] = { filled: false, value: undefined, x: i, y: j };
  }
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

  const socket = React.useRef();
  React.useEffect(() => {
    socket.current = io("ws://localhost:3001");
  }, []);

  const [selectedSquare, setSelectedSquare] = React.useState();
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    run,
    setData,
  } = useAsync({
    data: [],
  });

  React.useEffect(() => {
    run(fetchGame(gameId));
  }, []);

  const handleNumberSelect = (number) => {
    if (!selectedSquare) return;
    if (selectedSquare.filled) return;

    const newGrid = data.slice();
    const { x: selectedRowIndex, y: selectedColumnIndex } = selectedSquare;

    socket.current.emit(
      "number_select",
      JSON.stringify({ ...selectedSquare, value: number })
    );

    const selectedRow = newGrid[selectedRowIndex].slice();

    selectedRow[selectedColumnIndex] = {
      ...selectedRow[selectedColumnIndex],
      value: number,
    };

    newGrid[selectedRowIndex] = selectedRow;

    setData(newGrid);
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
        {data.map((row, rowIndex) => {
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
                        className="square__input square__input--unfilled"
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
