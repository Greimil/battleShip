class Ship {
    id;
    name;
    lifes;
    positions = [];
    hittedPositions = [];
    constructor(id, name, lifes) {
        this.id = id;
        this.name = name;
        this.lifes = lifes;
    }
    hit(position) {
        const isHit = this.positions.some(([x, y]) => x === position[0] && y === position[1]);
        if (!isHit)
            return false;
        const alreadyHit = this.hittedPositions.some(([x, y]) => x === position[0] && y === position[1]);
        if (alreadyHit)
            return false;
        this.hittedPositions.push(position);
        this.lifes--;
        return true;
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
