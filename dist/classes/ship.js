class Ship {
    constructor(id, name, lifes) {
        this.positions = [];
        this.setPositions = (x, y) => {
            this.positions.push([x, y]);
        };
        this.removePositions = () => {
            this.positions = [];
        };
        this.printShipPosition = () => console.log(this.positions);
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
    IsSunk() {
        return this.lifes == 0;
    }
}
export default Ship;
