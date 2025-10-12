import Player from "./player";
import Ship from "./ship";

class GameBoard {
  id: string;
  board: string[][] = [];
  Player: Player;

  constructor(Player: Player) {
    this.id = crypto.randomUUID();
    this.board = Array.from({ length: 10 }, () => Array(10).fill("#"));
    this.Player = Player;
  }

  checkAvailability = (
    x: number,
    y: number,
    shipLength: number,
    orientation: string
  ): boolean => {
    if (this.board[x][y] != "#") return false;

    if (orientation === "vertical") {
      for (let i = 0; i < shipLength; i++) {
        if (x + i >= this.board.length) return false;

        if (this.board[x + i][y] != "#") return false;
      }
    } else {
      for (let i = 0; i < shipLength; i++) {
        if (y + i >= this.board[0].length) return false;

        if (this.board[x][y + i] != "#") return false;
      }
    }

    return true;
  };

  placeShip = (
    x: number,
    y: number,
    shipLength: number,
    orientation: string,
    id: string
  ) => {
    if (!this.checkAvailability(x, y, shipLength, orientation)) return;

    let i = 0;
    while (i < shipLength) {
      if (orientation == "horizontal") {
        this.board[x][y + i] = "@";
        this.Player.addShip(id, x, y + i);
      } else {
        this.board[x + i][y] = "@";
        this.Player.addShip(id, x + i, y);
      }
      i++;
    }
  };

  clearCell = (shipLength: number, id: string) => {
    let ship: Ship = this.Player.Ships.find((ship) => ship.id == id)!;
    let prevX: number = ship.positions[0][0];
    let PrevY: number = ship.positions[0][1];
    let prevOrientation: "horizontal" | "vertical" = "horizontal";

    if (ship.positions.length >= 2) {
      const [firstX, firstY] = ship.positions[0];
      const [secondX, secondY] = ship.positions[1];

      if (firstX !== secondX) {
        prevOrientation = "vertical";
      } else {
        prevOrientation = "horizontal";
      }
    }

    if (!this.checkAvailability(prevX, PrevY, shipLength, prevOrientation)) {
      let i = 0;

      while (i < shipLength) {
        if (prevOrientation == "horizontal") {
          this.board[prevX][PrevY + i] = "#";
        } else {
          this.board[prevX + i][PrevY] = "#";
        }
        i++;
      }
      this.Player.removeShip(id);

    }
  };

  printBoard = () => console.table(this.board);
}

export default GameBoard;
