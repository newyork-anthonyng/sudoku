import React from "react";
import apiData from "./api";
import "./App.css";
import classNames from "classnames";

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

  return (
    <div>
      <button onClick={handleClick(1)}>1</button>
      <button onClick={handleClick(2)}>2</button>
      <button onClick={handleClick(3)}>3</button>
      <button onClick={handleClick(4)}>4</button>
      <button onClick={handleClick(5)}>5</button>
      <button onClick={handleClick(6)}>6</button>
      <button onClick={handleClick(7)}>7</button>
      <button onClick={handleClick(8)}>8</button>
      <button onClick={handleClick(9)}>9</button>
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

function App() {
  const [data, setData] = React.useState(() => {
    apiData.squares.forEach((square) => {
      const { x, y, value } = square;

      emptyGrid[x][y] = {
        ...emptyGrid[x][y],
        filled: true,
        value: value,
      };
    });

    return emptyGrid;
  });
  const [selectedSquare, setSelectedSquare] = React.useState();

  const handleNumberSelect = (number) => {
    console.log(number);
  };

  const handleEmptyCellClick = ({ x, y }) => () => {
    setSelectedSquare({ x, y });
  };

  console.log(selectedSquare);

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
              });

              return (
                <div className={squareClass} key={cellIndex}>
                  {filled ? (
                    <div
                      className="square__input--filled"
                      onClick={handleEmptyCellClick({ x, y })}
                    >
                      {value}
                    </div>
                  ) : (
                    <div
                      className="square__input--unfilled"
                      onClick={handleEmptyCellClick({ x, y })}
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
      <NumberPicker onSelect={handleNumberSelect} />
    </div>
  );
}

export default App;
