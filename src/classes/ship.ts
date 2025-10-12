class Ship {
  id: string;
  name: string;
  lifes: number;
  positions: number[][] = [];
  orientation: string

  constructor(id: string, name: string, lifes: number) {
    this.id = id;
    this.name = name;
    this.lifes = lifes;
    this.orientation = "horizontal"
  }

  hit(position: number[]): void {
    if (
      this.positions.some(([x, y]) => x === position[0] && y === position[1])
    ) {
      this.lifes--;
      this.IsSunk();
    }
  }

  setPositions = (x: number, y: number) => {
    this.positions.push([x, y]);
  };

  removePositions = () => {
    this.positions = []
  }


  IsSunk(): boolean {
    return this.lifes == 0;
  }


  printShipPosition = () => console.log(this.positions)
}

export default Ship;
