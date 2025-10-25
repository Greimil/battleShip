import GameBoard from "./classes/GameBoard.js";
import GameManager from "./classes/GameManger.js";
import Player from "./classes/player.js";
import Ship from "./classes/ship.js";

// ─────────────────────────────
// 🔹 Types
// ─────────────────────────────
type ShipKey =
  | "SHIP_CARRIER_5"
  | "SHIP_BATTLESHIP_4"
  | "SHIP_CRUISER_3"
  | "SHIP_SUBMARINE_3"
  | "SHIP_DESTROYER_2";

type Orientation = "horizontal" | "vertical";

// ─────────────────────────────
// 🔹 Global State
// ─────────────────────────────
let currentOrientation: Orientation = "horizontal";
let PlayerGame: GameBoard;
let player: Player;
let cpuGame: GameBoard;
let cpu: Player;
let gameManager: GameManager;
let shipDragging = "";
let CellsAvilibility = false;
let rotatingship = false;

const createShipState = () => ({
  alreadyOnboard: false,
  prevX: -1,
  PrevY: -1,
  prevOrientation: "horizontal" as Orientation,
});

let shipSOnboard: Record<ShipKey, ReturnType<typeof createShipState>> = {
  SHIP_CARRIER_5: createShipState(),
  SHIP_BATTLESHIP_4: createShipState(),
  SHIP_CRUISER_3: createShipState(),
  SHIP_SUBMARINE_3: createShipState(),
  SHIP_DESTROYER_2: createShipState(),
};

// ─────────────────────────────
// 🔹 HTML Elements
// ─────────────────────────────
const heroSection = document.getElementById("heroSection");
const gameSection = document.getElementById("gameSection");
const startGameBtn = document.getElementById("StartGamebtn");
const initGameBtn = document.getElementById("ini_game");
const ShipsContainers = document.querySelectorAll(".imgWrapper");
const regular_board = document.getElementById("board");
const attack_board = document.getElementById("board-attack");
const cellContainer_reg = document.createElement("div");
const cellContainer_attack = document.createElement("div");
const resetgamebtn = document.getElementById("resetGame");
const toolTip = document.querySelector(".intruccions");
const mainH2 = document.getElementById("mainH2");
const screenIndicator = document.getElementById("screenIndicator");
const logo = document.querySelector(".logo");
const optionsContainer = document.querySelector(
  ".optionsContainer"
) as HTMLElement | null;
const btnVolumen = document.querySelector(".btnControl") as HTMLImageElement;
const canyonSound = new Audio("./src/assets/sound/cannonEfect.mp3");
const bgMusic = new Audio("./src/assets/sound/bgMusic.mp3");
const vollevels = [0.6, 0.3, 0];
let currentVol = 0;

// const cell = document.querySelectorAll("cell")

// ─────────────────────────────
// 🔹 Event Listeners Globales
// ─────────────────────────────

btnVolumen?.addEventListener("click", () => {
  currentVol = (currentVol + 1) % vollevels.length;
  bgMusic.volume = vollevels[currentVol];
  
  console.log(bgMusic.volume)

  if (bgMusic.volume === 0) {
    btnVolumen.src = "./src/assets/volumenOff.png";
  } else if (bgMusic.volume < 0.6) {
    btnVolumen.src = "./src/assets/volumenMid.png";
  } else {
    btnVolumen.src = "./src/assets/volumeControl.png";
  }
});

logo?.addEventListener("click", () => {
  gameSection?.classList.remove("activeScreen");
  heroSection?.classList.add("activeScreen");
});

initGameBtn?.addEventListener("click", (e) => {
 
  startgame() 
});

resetgamebtn?.addEventListener("click", () => {
  resetGame();
});

document.addEventListener("DOMContentLoaded", () => {
  heroSection?.classList.add("activeScreen");

  if (regular_board) {
    createCells(cellContainer_reg, regular_board, "regular");
  }

  if (attack_board) {
    createCells(cellContainer_attack, attack_board, "attack");
  }

 
});

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") toggleOrientation();
});

cellContainer_reg.addEventListener("dragstart", (e) => {
  handleGridDragStart(e);
});

cellContainer_reg.addEventListener("dragend", () => removeRotateCursor());

startGameBtn?.addEventListener("click", () => {
  heroSection?.classList.toggle("activeScreen");
  gameSection?.classList.toggle("activeScreen");
  initGame();
   bgMusic.loop = true;
  bgMusic.volume = 0.3;
  bgMusic.play(); 
});

// ─────────────────────────────
// 🔹 Inicialización
// ─────────────────────────────
function initGame(): void {
  const shipsPlayer = createShips(ShipsContainers);
  const shipsCpu = createShips(ShipsContainers);
  player = new Player("user", shipsPlayer);
  PlayerGame = new GameBoard(player);
  cpu = new Player("cpu", shipsCpu);
  cpuGame = new GameBoard(cpu);
  cpuGame.placeShipRandomly(shipsCpu);

  cpuGame.printBoard();

  gameManager = new GameManager(PlayerGame, cpuGame);

  setupDragEvents();
}

// ─────────────────────────────
// 🔹 Rotación global
// ─────────────────────────────
function toggleOrientation() {
  rotatingship = true;
  currentOrientation =
    currentOrientation === "horizontal" ? "vertical" : "horizontal";
  cellContainer_reg.classList.add("rotateCursor");
  rotatingship = false;
}

function removeRotateCursor() {
  if (!rotatingship) cellContainer_reg.classList.remove("rotateCursor");
}

// ─────────────────────────────
// 🔹 Configurar eventos de los barcos
// ─────────────────────────────
function setupDragEvents(): void {
  ShipsContainers.forEach((ship) => {
    ship.addEventListener("dragstart", (e) => {
      const dragEvent = e as DragEvent;
      const id = (dragEvent.currentTarget as HTMLElement).id;

      const alreadyPlaced = player.Ships.some(
        (ship) => ship.id === id && ship.positions.length !== 0
      );
      // debugger
      if (alreadyPlaced) return;

      dragEvent.dataTransfer?.setData("text/plain", id);

      shipDragging = id;
    });
  });
}

// ─────────────────────────────
// 🔹 Creación de barcos
// ─────────────────────────────
function createShips(ships: NodeListOf<Element>): Ship[] {
  const shipData: Record<ShipKey, { name: string; length: number }> = {
    SHIP_CARRIER_5: { name: "Portaaviones", length: 5 },
    SHIP_BATTLESHIP_4: { name: "Acorazado", length: 4 },
    SHIP_CRUISER_3: { name: "Crucero", length: 3 },
    SHIP_SUBMARINE_3: { name: "Submarino", length: 3 },
    SHIP_DESTROYER_2: { name: "Destructor", length: 2 },
  };

  return Array.from(ships)
    .filter((s): s is HTMLElement => s.id in shipData)
    .map((s) => {
      const { name, length } = shipData[s.id as ShipKey];
      return new Ship(s.id as ShipKey, name, length);
    });
}

// ─────────────────────────────
// 🔹 Creación del tablero
// ─────────────────────────────
function createCells(
  cellContainer: HTMLElement,
  board: HTMLElement,
  boardType: "regular" | "attack"
): void {
  cellContainer.classList.add("cellContainer");
  board?.appendChild(cellContainer);

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = `${r}-${c}`;
      cell.dataset.x = r.toString();
      cell.dataset.y = c.toString();

      if (boardType === "regular") {
        cell.addEventListener("dragover", handleDragOver);
        cell.addEventListener("drop", handleDrop);
      } else {
        cell.addEventListener("click", (e) => handlePlayerAttack(e));
      }

      cellContainer.appendChild(cell);
    }
  }
}

function handlePlayerAttack(e: Event) {
  const target = e.target as HTMLElement;
  let x = Number(target.getAttribute("data-x"));
  let y = Number(target.getAttribute("data-y"));
  // debugger
  gameManager.handlePlayerClick(x, y, updateMessages, changeCellStatus);
}

// ─────────────────────────────
// 🔹 Eventos de Drag & Drop
// ─────────────────────────────
function handleGridDragStart(e: DragEvent) {
  const target = e.target as HTMLImageElement;
  if (!target.classList.contains("shipInsidegrid") || !target.dataset.id)
    return;

  const shipKey = target.dataset.id as ShipKey;

  target.src = getShipImage(shipKey, currentOrientation);
  e.dataTransfer?.setData("text/plain", shipKey);
}

function handleDragOver(e: DragEvent): void {
  e.preventDefault();

  const [x, y] = getCellPosition(e);

  let shipLength = Number(shipDragging.at(-1));
  CellsAvilibility = PlayerGame.checkAvailability(
    x,
    y,
    shipLength,
    currentOrientation
  );

  changeCellColor(CellsAvilibility, shipLength, x, y);
}

function handleDrop(e: DragEvent): void {
  e.preventDefault();

  const data = e.dataTransfer?.getData("text/plain") as ShipKey;
  if (!data) return;

  const [x, y] = getCellPosition(e);
  const shipLength = Number(data.at(-1));
  const url = getShipImage(data, currentOrientation);
  if (!url) return;

  moveShip(e, data, x, y, shipLength, url);
}

// ─────────────────────────────
// 🔹 Utilidades
// ─────────────────────────────
function getCellPosition(e: Event): [number, number] {
  const target = (e.target as HTMLElement).closest<HTMLElement>(".cell");
  if (!target) return [-1, -1];

  return [Number(target.dataset.x), Number(target.dataset.y)];
}

function clearHighlights(): void {
  document
    .querySelectorAll(".highlightSuccesCell, .highlighErrorCell")
    .forEach((el) =>
      el.classList.remove("highlightSuccesCell", "highlighErrorCell")
    );
}

function changeCellColor(
  available: boolean,
  shipLength: number,
  x: number,
  y: number
): void {
  clearHighlights();
  const dx = currentOrientation === "vertical" ? 1 : 0;
  const dy = currentOrientation === "horizontal" ? 1 : 0;

  const targets = Array.from({ length: shipLength }, (_, i) =>
    document.getElementById(`${x + dx * i}-${y + dy * i}`)
  );

  const allExist = targets.every(Boolean);
  const classToAdd =
    available && allExist ? "highlightSuccesCell" : "highlighErrorCell";

  targets.forEach((cell) => cell?.classList.add(classToAdd));
}

// ─────────────────────────────
// 🔹 Mover Barco
// ─────────────────────────────

function moveShip(
  e: DragEvent,
  shipKey: ShipKey,
  x: number,
  y: number,
  shipLength: number,
  url: string
) {
  const currentTarget = e.currentTarget as HTMLElement | null;
  if (!currentTarget) return;

  const placed = placeShipOnBoard(
    shipKey,
    x,
    y,
    shipLength,
    currentOrientation
  );

  if (!placed) {
    clearHighlights();
    return;
  }

  updateShipImage(shipKey, url, shipLength, currentOrientation, currentTarget);

  clearHighlights();
}

// ─────────────────────────────
// 🔹 Obtener imagen según orientación
// ─────────────────────────────
function getShipImage(shipKey: ShipKey, orientation: Orientation): string {
  const shipImages: Record<ShipKey, { horizontal: string; vertical: string }> =
    {
      SHIP_CARRIER_5: {
        horizontal: "./src/assets/topDowView/portaviones.png",
        vertical: "./src/assets/topDowView/portavionesV.png",
      },
      SHIP_BATTLESHIP_4: {
        horizontal: "./src/assets/topDowView/Acorazado.png",
        vertical: "./src/assets/topDowView/AcorazadoV.png",
      },
      SHIP_CRUISER_3: {
        horizontal: "./src/assets/topDowView/crucero.png",
        vertical: "./src/assets/topDowView/cruceroV.png",
      },
      SHIP_SUBMARINE_3: {
        horizontal: "./src/assets/topDowView/submarino.png",
        vertical: "./src/assets/topDowView/submarinoV.png",
      },
      SHIP_DESTROYER_2: {
        horizontal: "./src/assets/topDowView/destructor.png",
        vertical: "./src/assets/topDowView/destructorV.png",
      },
    };
  return shipImages[shipKey]?.[orientation] ?? "";
}

function resetGame() {
  (Object.keys(shipSOnboard) as ShipKey[]).forEach((key) => {
    shipSOnboard[key] = createShipState();
  });

  Array.from(cellContainer_reg.children).forEach((cell) => {
    Array.from(cell.children).forEach((child) => cell.removeChild(child));
  });

  PlayerGame.resetGame();
}

function placeShipOnBoard(
  shipKey: ShipKey,
  x: number,
  y: number,
  shipLength: number,
  orientation: Orientation
): boolean {
  const placed = PlayerGame.placeShip(x, y, shipLength, orientation, shipKey);

  if (shipSOnboard[shipKey].alreadyOnboard == true && placed) {
    PlayerGame.clearCell(shipLength, shipKey);
  }

  if (placed) {
    Object.assign(shipSOnboard[shipKey], {
      alreadyOnboard: true,
      prevX: x,
      PrevY: y,
      prevOrientation: currentOrientation,
    });
  }

  return placed;
}

function updateShipImage(
  shipKey: ShipKey,
  url: string,
  shipLength: number,
  orientation: Orientation,
  targetCell: HTMLElement
) {
  let shipImg = document.querySelector(
    `img[data-id="${shipKey}"]`
  ) as HTMLImageElement | null;

  const orientationClass =
    orientation === "vertical"
      ? `ship-height-${shipLength}`
      : `ship-len-${shipLength}`;

  if (!shipImg) {
    shipImg = document.createElement("img");
    shipImg.dataset.id = shipKey;
    shipImg.classList.add("shipInsidegrid", orientationClass);
    shipImg.src = url;
    targetCell.appendChild(shipImg);
    return;
  }

  shipImg.className = `shipInsidegrid ${orientationClass}`;
  shipImg.src = url;

  shipImg.remove();
  targetCell.appendChild(shipImg);
}

function setupStyles() {
  
  const hasShipsPlaced = Object.values(shipSOnboard).some(
    ship => ship.alreadyOnboard === true
  );

  if (!hasShipsPlaced) {
    if (screenIndicator) {
      screenIndicator.textContent =
        "Tienes que agregar los barcos al tablero antes de continuar!";
    }
    return; 
  }

  toolTip?.classList.remove("visible");

  if (resetgamebtn) resetgamebtn.textContent = "Reiniciar partida";
  if (attack_board) attack_board.classList.add("board-attackVisible");
  if (regular_board) regular_board.style.left = "0";
  if (screenIndicator)
    screenIndicator.textContent = "Haz click en una celda para atacarla";
  if (mainH2) mainH2.textContent = "¡Ataca a tu oponente!";
  if (initGameBtn) initGameBtn.style.display = "none";
  if (optionsContainer) optionsContainer.style.display = "none";
}


type MessageFn = (res: string, isPlayerHuman?: boolean) => void;

function updateMessages(res: string, isPlayerHuman: boolean = false) {
  if (!screenIndicator) return;

  const messages: Record<string, { text: string; type: string }> = {
    hit: { text: "¡Buen tiro! Has acertado un barco enemigo.", type: "hit" },
    miss: { text: "Fallaste el disparo, turno de la CPU.", type: "miss" },
    already: {
      text: "Ya habías intentado ese lugar, prueba otro.",
      type: "already",
    },
    win: {
      text: "🎉 ¡Victoria! Has hundido toda la flota enemiga.",
      type: "win",
    },
    error: { text: "⛔ No es tu turno todavía.", type: "error" },
    "cpu hit": {
      text: "💥 La CPU ha impactado uno de tus barcos.",
      type: "hit",
    },
    "cpu miss": { text: "La CPU falló su disparo, es tu turno.", type: "miss" },
    "cpu win": { text: "💀 La CPU ha ganado la partida.", type: "cpu-win" },
    "cpu already": {
      text: "La CPU disparó en una posición repetida.",
      type: "already",
    },
  };

  const messageObj = messages[res] || {
    text: "Movimiento no reconocido.",
    type: "error",
  };

  // Fade-out
  screenIndicator.style.opacity = "0";

  setTimeout(() => {
    screenIndicator.textContent = messageObj.text;

    // Limpiar clases previas
    screenIndicator.classList.remove(
      "hit",
      "miss",
      "win",
      "cpu-win",
      "error",
      "already"
    );

    // Aplicar clase de color según tipo
    console.log(messageObj.type);
    screenIndicator.classList.add(messageObj.type);

    // Fade-in
    screenIndicator.style.opacity = "1";
  }, 500); // fade-out duration
}

function changeCellStatus(
  x: number,
  y: number,
  hit: boolean,
  boardToChange: "cpu" | "player"
) {
  const cell = document.querySelector(
    `#${
      boardToChange === "player" ? "board" : "board-attack"
    } [data-x="${x}"][data-y="${y}"]`
  );
  const span = document.createElement("span");
  span.classList.add("spanCell");

  
  canyonSound.play();
  canyonSound.volume = 1
  if (cell) {
    span.textContent = hit ? "💥" : "•";
    cell.appendChild(span);
  } else {
    console.error("Error Celda no encontrada");
  }
}

function startgame() {
  setupStyles();
}
