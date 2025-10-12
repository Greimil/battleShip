class Player {
    id;
    name;
    playing = false;
    Ships;
    constructor(name, Ships) {
        this.name = name;
        this.id = crypto.randomUUID();
        this.Ships = Ships;
    }
    addShip = (id, x, y) => {
        const ship = this.Ships.find((s) => s.id === id);
        if (ship) {
            ship.setPositions(x, y);
        }
    };
    removeShip = (id) => {
        const ship = this.Ships.find((s) => s.id === id);
        if (ship) {
            ship.removePositions();
        }
    };
    printShips = () => console.log(this.Ships);
}
export default Player;
