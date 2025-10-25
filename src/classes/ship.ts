class Ship {
  id: string;
  name: string;
  lifes: number;
  positions: number[][] = [];
  hittedPositions: number[][] = [];

  constructor(id: string, name: string, lifes: number) {
    this.id = id;
    this.name = name;
    this.lifes = lifes;
  }

  hit(position: number[]): boolean {
    const isHit = this.positions.some(
      ([x, y]) => x === position[0] && y === position[1]
    );

    if (!isHit) return false;

    const alreadyHit = this.hittedPositions.some(
      ([x, y]) => x === position[0] && y === position[1]
    );
    
    if (alreadyHit) return false;
    this.hittedPositions.push(position);
    this.lifes--;
    return true
  }

  setPositions = (x: number, y: number) => {
    this.positions.push([x, y]);
  };

  removePositions = () => {
    this.positions = [];
  };

  IsSunk(): boolean {
    return this.lifes == 0;
  }

  printShipPosition = () => console.log(this.positions);
}

export default Ship;
