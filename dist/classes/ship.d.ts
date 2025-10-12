declare class Ship {
    id: string;
    name: string;
    lifes: number;
    positions: number[][];
    constructor(id: string, name: string, lifes: number);
    hit(position: number[]): void;
    IsSunk(): boolean;
}
export default Ship;
