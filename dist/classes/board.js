class GameBoard {
    constructor(Player) {
        this.board = [];
        this.id = crypto.randomUUID();
        this.board = Array.from({ length: 10 }, () => Array(10).fill(0));
        this.Players = Player;
    }
}
export {};
