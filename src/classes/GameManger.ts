import GameBoard from "./GameBoard";
import Player from "./player";

type MessageFn = (msg: string, isPlayerHuman?: boolean) => void;
type changeCellStatus = (x: number, y: number ,hit:boolean, boardToChange: "cpu" | "player") => void

class GameManager {
  playerBoard: GameBoard;
  cpuBoard: GameBoard;
  isUserPlaying: boolean;
  hittedCoords: Map<string, boolean> = new Map();

  // Memoria de ataques de la CPU
  cpuMemory = {
    lastHit: null as { x: number; y: number } | null,
    firstHit: null as { x: number; y: number } | null,
    direction: null as "horizontal" | "vertical" | null,
  };

  constructor(player: GameBoard, cpu: GameBoard) {
    this.playerBoard = player;
    this.cpuBoard = cpu;
    this.isUserPlaying = true;
  }

  startGame() {
    this.isUserPlaying = true;
    this.hittedCoords.clear();
    this.cpuMemory = { lastHit: null, firstHit: null, direction: null };
  }

  handlePlayerClick(
    x: number, 
    y: number, 
    printMessage: MessageFn, 
    changeCellStatus: changeCellStatus
  ) {
    if (!this.isUserPlaying) {
      printMessage("error", true);
      return;
    }

    const result = this.playerAttack(x, y);

    // Mostrar resultado del jugador
    printMessage(result, true);
    changeCellStatus(x, y, result === "hit", "cpu");

    // Verificar victoria antes de turno CPU
    if (this.cpuBoard.totalShips === 0) {
      printMessage("win", true);
      return;
    }

    if (result === "miss") {
      this.isUserPlaying = false;

      // Esperar 500ms para que el mensaje del fallo se vea antes del turno de la CPU
      setTimeout(() => {
        this.cpuTurn(printMessage, changeCellStatus);
      }, 500);
    }
  }

  playerAttack(x: number, y: number): string {
    return this.cpuBoard.receiveAttack(x, y);
  }

  cpuTurn(printMessage: MessageFn, changeCellStatus: changeCellStatus) {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const cpuLoop = async () => {
      // Delay inicial antes de comenzar el turno
      await delay(1500);

      let result: string;

      do {
        result = await this.cpuAttack(changeCellStatus);

        // Mapear resultado a los códigos que espera updateMessages
        const resCode = result === "hit" ? "cpu hit" :
                        result === "miss" ? "cpu miss" :
                        result === "already" ? "cpu already" :
                        result;

        printMessage(resCode, false);

        // Espera un poco antes del siguiente ataque si acierta
        await delay(700);

        if (result === "miss") {
          this.isUserPlaying = true;
          break;
        }

        if (this.playerBoard.totalShips === 0) {
          printMessage("cpu win", false);
          break;
        }

      } while (result === "hit");
    };

    cpuLoop();
  }

  async cpuAttack(changeCellStatus: changeCellStatus): Promise<string> {
    const boardSize = 10;
    let x: number, y: number;
    let key: string;
    let tries = 0;

    const { lastHit, direction, firstHit } = this.cpuMemory;

    // 🔹 Si hay un barco en curso, seguimos atacando en la misma línea
    if (lastHit) {
      if (direction) {
        // Continuar en línea según dirección
        const nextTarget = direction === "horizontal"
          ? { x: lastHit.x + 1, y: lastHit.y }
          : { x: lastHit.x, y: lastHit.y + 1 };

        x = nextTarget.x;
        y = nextTarget.y;
      } else {
        // Primer hit: todavía no sabemos la dirección
        const neighbors = [
          { x: lastHit.x + 1, y: lastHit.y },
          { x: lastHit.x - 1, y: lastHit.y },
          { x: lastHit.x, y: lastHit.y + 1 },
          { x: lastHit.x, y: lastHit.y - 1 },
        ];

        const available = neighbors.filter(n => {
          const nKey = `${n.x}-${n.y}`;
          return n.x >= 0 && n.y >= 0 && n.x < boardSize && n.y < boardSize && !this.hittedCoords.has(nKey);
        });

        if (available.length === 0) {
          // Sin vecinos disponibles → volver a aleatorio
          ({ x, y } = this.cpuBoard.generateRandomPlacement());
        } else {
          ({ x, y } = available[0]);
        }
      }
    } else {
      // Sin hit previo → disparo aleatorio
      ({ x, y } = this.cpuBoard.generateRandomPlacement());
    }

    key = `${x}-${y}`;

    // Evitar repetir celdas o salir del tablero
    while ((this.hittedCoords.has(key) || x < 0 || y < 0 || x >= boardSize || y >= boardSize) && tries < 100) {
      ({ x, y } = this.cpuBoard.generateRandomPlacement());
      key = `${x}-${y}`;
      tries++;
    }

    // Pausa antes de disparar
    await new Promise(resolve => setTimeout(resolve, 700));

    const res = this.playerBoard.receiveAttack(x, y);
    changeCellStatus(x, y, res === "hit", "player");
    this.hittedCoords.set(key, true);

    if (res === "hit") {
      if (!this.cpuMemory.firstHit) {
        this.cpuMemory.firstHit = { x, y }; // Guardar el primer hit del barco
      }

      if (lastHit && !this.cpuMemory.direction) {
        this.cpuMemory.direction =
          firstHit!.x === x ? "vertical" : "horizontal";
      }

      this.cpuMemory.lastHit = { x, y };
    } else {
      // Fallo → si había dirección o lastHit, resetear memoria de barco actual
      if (this.cpuMemory.direction || this.cpuMemory.lastHit) {
        this.cpuMemory.lastHit = null;
        this.cpuMemory.firstHit = null;
        this.cpuMemory.direction = null;
      }
    }

    // Si no hay más barcos → limpiar memoria
    if (this.playerBoard.totalShips === 0) {
      this.cpuMemory = { lastHit: null, firstHit: null, direction: null };
    }

    return res;
  }
}

export default GameManager;
