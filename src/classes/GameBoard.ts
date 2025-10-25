import Player from "./player";
import Ship from "./ship";

class GameBoard {
  id: string;
  board: string[][] = [];
  Player: Player;
  totalShips: number = 5;

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
    orientation: "horizontal" | "vertical",
    id: string
  ): boolean => {
    const boardSize = 10;

    if (
      (orientation === "horizontal" && y + shipLength > boardSize) ||
      (orientation === "vertical" && x + shipLength > boardSize)
    ) {
      return false;
    }

    if (!this.checkAvailability(x, y, shipLength, orientation)) {
      return false;
    }

    const positions: [number, number][] = [];
    for (let i = 0; i < shipLength; i++) {
      if (orientation === "horizontal") positions.push([x, y + i]);
      else positions.push([x + i, y]);
    }

    for (const [px, py] of positions) {
      const ok = this.Player.addShip(id, px, py);
      if (!ok) return false;
    }

    for (const [px, py] of positions) {
      this.board[px][py] = "@";
    }

    return true;
  };

  clearCell = (shipLength: number, id: string) => {
    const ship = this.Player.Ships.find((s) => s.id === id);
    if (!ship || ship.positions.length === 0) return;

    const [firstX, firstY] = ship.positions[0];
    let orientation: "horizontal" | "vertical" = "horizontal";

    if (ship.positions.length >= 2) {
      const [secondX, secondY] = ship.positions[1];
      orientation = firstX !== secondX ? "vertical" : "horizontal";
    }

    for (let i = 0; i < shipLength; i++) {
      if (orientation === "horizontal") {
        this.board[firstX][firstY + i] = "#";
      } else {
        this.board[firstX + i][firstY] = "#";
      }
    }

    ship.positions = ship.positions.slice(shipLength);
  };

  resetGame = () => {
    this.board = Array.from({ length: 10 }, () => Array(10).fill("#"));

    this.Player.Ships.forEach((ship) => {
      ship.removePositions();
    });
  };

  receiveAttack(x: number, y: number): string {
    const cell = this.board[x][y];
    const shipToCheck = this.Player.Ships.find((ship) =>
      ship.positions.some(([shipX, shipY]) => shipX === x && shipY === y)
    );

    if (cell === "@") {
      this.board[x][y] = "X";
      shipToCheck?.hit([x, y]);

      if (shipToCheck?.IsSunk()) this.totalShips--;

      return "hit";
    } else if (cell === "#") {
      this.board[x][y] = "O";
      return "miss";
    } else {
      return "already";
    }
  }

  placeShipRandomly(ships: Ship[]) {
    let i = 0;
    let placed: boolean;

    while (i < ships.length) {
      let { x, y, orientation } = this.generateRandomPlacement();
      placed = this.placeShip(x, y, ships[i].lifes, orientation, ships[i].id);
      if (placed) i++;
    }
  }

  generateRandomPlacement() {
    let orientation: "horizontal" | "vertical" =
      Math.floor(Math.random() * 100) > 50 ? "horizontal" : "vertical";

    let x: number = Math.floor(Math.random() * 10);
    let y: number = Math.floor(Math.random() * 10);

    return { x, y, orientation };
  }

  printBoard = () => {
    console.log("soy el board del usuario: ", this.Player.name);
    console.table(this.board);
  };
}

export default GameBoard;
