class Player {
    constructor(name, Ships) {
        this.playing = false;
        this.addShip = (id, x, y) => {
            const ship = this.Ships.find((s) => s.id === id);
            if (ship) {
                ship.setPositions(x, y);
            }
        };
        this.removeShip = (id) => {
            const ship = this.Ships.find((s) => s.id === id);
            if (ship) {
                ship.removePositions();
            }
        };
        this.printShips = () => console.log(this.Ships);
        this.name = name;
        this.id = crypto.randomUUID();
        this.Ships = Ships;
    }
}
export default Player;
