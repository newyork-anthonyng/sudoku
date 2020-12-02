import React from "react";
import apiData from "./api";
import "./App.css";

const emptyGrid = new Array(9);
for (let i = 0; i < emptyGrid.length; i++) {
  emptyGrid[i] = new Array(9);
  emptyGrid[i].fill({ filled: false, value: undefined });
}

function App() {
  const [data, setData] = React.useState(() => {
    apiData.squares.forEach((square) => {
      const { x, y, value } = square;

      emptyGrid[x][y] = {
        filled: true,
        value: value,
      };
    });

    return emptyGrid;
  });

  const handleNumberChange = (rowIndex, cellIndex) => (event) => {
    const newGrid = data.slice();
    newGrid[rowIndex] = newGrid[rowIndex].slice();
    newGrid[rowIndex][cellIndex] = {
      ...newGrid[rowIndex][cellIndex],
      value: event.target.value,
    };
    setData(newGrid);
  };

  return (
    <div className="container">
      {data.map((row, rowIndex) => {
        return (
          <div className="row" key={rowIndex}>
            {row.map((cell, cellIndex) => {
              return (
                <div className="square" key={cellIndex}>
                  {cell.filled ? (
                    cell.value
                  ) : (
                    <input
                      className="square__input"
                      type="number"
                      onChange={handleNumberChange(rowIndex, cellIndex)}
                      value={cell.value || ""}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default App;
