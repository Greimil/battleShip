import Ship from "./ship.js";

class Player {
  id: string;
  name: string;
  playing: boolean = false;
  Ships: Ship[];
  constructor(name: string, Ships: Ship[]) {
    this.name = name;
    this.id = crypto.randomUUID();
    this.Ships = Ships;
  }

  addShip = (id: string, x: number, y: number): boolean => {
    const ship = this.Ships.find((s) => s.id === id);

    if (!ship) return false;

    if (ship) {
      ship.setPositions(x, y);
    }

    return true;
  };

  removeShip = (id: string): boolean => {
    const ship = this.Ships.find((s) => s.id === id);

    if (!ship) return false;

    if (ship) {
      ship.removePositions();
    }

    return true;
  };

  printShips = () => console.log(this.Ships);
}

export default Player;
