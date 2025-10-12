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

  addShip = (id: string, x: number, y: number) => {
    const ship = this.Ships.find((s) => s.id === id);
    if (ship) {
      ship.setPositions(x, y);
    } 
  };


  removeShip = (id: string)=>{
     const ship = this.Ships.find((s) => s.id === id);
    if (ship) {
      ship.removePositions();
    } 
  }


  printShips = () => console.log(this.Ships);
}

export default Player;
