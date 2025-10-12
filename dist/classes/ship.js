class Ship {
    id;
    name;
    lifes;
    positions = [];
    orientation;
    constructor(id, name, lifes) {
        this.id = id;
        this.name = name;
        this.lifes = lifes;
        this.orientation = "horizontal";
    }
    hit(position) {
        if (this.positions.some(([x, y]) => x === position[0] && y === position[1])) {
            this.lifes--;
            this.IsSunk();
        }
    }
    setPositions = (x, y) => {
        this.positions.push([x, y]);
    };
    removePositions = () => {
        this.positions = [];
    };
    IsSunk() {
        return this.lifes == 0;
    }
    printShipPosition = () => console.log(this.positions);
}
export default Ship;
