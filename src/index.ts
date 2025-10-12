import GameBoard from "./classes/GameBoard.js";
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

// ─────────────────────────────
// 🔹 Global State
// ─────────────────────────────
let currentOrientation: "horizontal" | "vertical" = "horizontal";
let isDragging: boolean = false;
let game: GameBoard;
let player: Player;
let shipDragging: string;
let CellsAvilibility: boolean;
let rotatingship: boolean = false;
let ShipSOnboard = {
  SHIP_CARRIER_5: {
    alreadyOnboard: false,
    prevX: -1,
    PrevY: -1,
    prevOrientation: "horizontal",
  },

  SHIP_BATTLESHIP_4: {
    alreadyOnboard: false,
    prevX: -1,
    PrevY: -1,
    prevOrientation: "horizontal",
  },

  SHIP_CRUISER_3: {
    alreadyOnboard: false,
    prevX: -1,
    PrevY: -1,
    prevOrientation: "horizontal",
  },

  SHIP_SUBMARINE_3: {
    alreadyOnboard: false,
    prevX: -1,
    PrevY: -1,
    prevOrientation: "horizontal",
  },

  SHIP_DESTROYER_2: {
    alreadyOnboard: false,
    prevX: -1,
    PrevY: -1,
    prevOrientation: "horizontal",
  },
};

// ─────────────────────────────
// 🔹 HTML Elements
// ─────────────────────────────
const heroSection = document.getElementById("heroSection");
const gameSection = document.getElementById("gameSection");
const startGameBtn = document.getElementById("StartGamebtn");
const ShipsContainers = document.querySelectorAll(".imgWrapper");
const board = document.getElementById("board");
const optionsbuttons = document.querySelectorAll(".optionsbutons button");
const cellContainer = document.createElement("div");

// ─────────────────────────────\
// 🔹 Event Listeners Globales
// ─────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  heroSection?.classList.add("activeScreen");
  createCells();
});

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "R" || e.key == "r") {
    rotatingship = true;
    currentOrientation =
      currentOrientation == "horizontal" ? "vertical" : "horizontal";
    cellContainer.classList.add("rotateCursor");
    rotatingship = false;
  }
});

cellContainer.addEventListener("dragstart", (e) => {
  const target = e.target as HTMLImageElement;
  const dragEvent = e as DragEvent;

  if (target.classList.contains("shipInsidegrid") && target.dataset["id"]) {
    const shipKey = target.dataset["id"] as ShipKey;
    const newSrc = getShipImage(shipKey, currentOrientation);
    target.src = newSrc;
    dragEvent.dataTransfer?.setData("text/plain", shipKey);
  }
});

cellContainer.addEventListener("dragend", (e) => {
  if (
    rotatingship == false &&
    cellContainer.classList.contains("rotateCursor")
  ) {
    cellContainer.classList.remove("rotateCursor");
  }
});

startGameBtn?.addEventListener("click", () => {
  heroSection?.classList.toggle("activeScreen");
  gameSection?.classList.toggle("activeScreen");
  initGame(); // ← Inicia todo aquí
});

// ─────────────────────────────
// 🔹 Inicialización del juego (enfoque mixto)
// ─────────────────────────────
function initGame(): void {
  const Ships: Ship[] = CreateShips(ShipsContainers);
  player = new Player("user", Ships);
  game = new GameBoard(player);
  setupDragEvents();
}

// ─────────────────────────────
// 🔹 Configurar eventos de los barcos
// ─────────────────────────────
function setupDragEvents(): void {
  ShipsContainers.forEach((ship) => {
    ship.addEventListener("dragstart", (e: Event) => {
      const dragEvent = e as DragEvent;
      const id = (dragEvent.currentTarget as HTMLElement).id;

      if (player.Ships.find((ship) => ship.id == id)?.positions.length != 0)
        return;

      isDragging = true;

      if (dragEvent.dataTransfer) {
        dragEvent.dataTransfer.setData("text/plain", id);
        shipDragging = id;
      }
    });
  });
}

// ─────────────────────────────
// 🔹 Creación de barcos
// ─────────────────────────────
function CreateShips(ships: NodeListOf<Element>): Ship[] {
  const Ships: Ship[] = [];

  ships.forEach((ship) => {
    switch (ship.id) {
      case "SHIP_CARRIER_5":
        Ships.push(new Ship("SHIP_CARRIER_5", "Portaaviones", 5));
        break;
      case "SHIP_BATTLESHIP_4":
        Ships.push(new Ship("SHIP_BATTLESHIP_4", "Acorazado", 4));
        break;
      case "SHIP_CRUISER_3":
        Ships.push(new Ship("SHIP_CRUISER_3", "Crucero", 3));
        break;
      case "SHIP_SUBMARINE_3":
        Ships.push(new Ship("SHIP_SUBMARINE_3", "Submarino", 3));
        break;
      case "SHIP_DESTROYER_2":
        Ships.push(new Ship("SHIP_DESTROYER_2", "Destructor", 2));
        break;
    }
  });

  return Ships;
}

// ─────────────────────────────
// 🔹 Creación del tablero
// ─────────────────────────────
function createCells(): void {
  let cell;
  cellContainer.classList.add("cellContainer");
  board?.appendChild(cellContainer);

  for (let r: number = 0; r <= 9; r++) {
    for (let c: number = 0; c <= 9; c++) {
      cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = `${r}-${c}`;
      cell.setAttribute("data-x", r.toString());
      cell.setAttribute("data-y", c.toString());

      cell.addEventListener("dragover", handledragover);
      cell.addEventListener("drop", handleDrop);

      cellContainer.appendChild(cell);
    }
  }
}

// ─────────────────────────────
// 🔹 Eventos de Drag & Drop
// ─────────────────────────────
function handledragover(e: DragEvent): void {
  e.preventDefault();

  const positions = getCellPosition(e)[0];
  const x = positions[0];
  const y = positions[1];
  const shipLength = Number(shipDragging[shipDragging.length - 1]);

  CellsAvilibility = game.checkAvailability(
    x,
    y,
    shipLength,
    currentOrientation
  );

  changeCellColor(CellsAvilibility, shipLength, x, y);
}

function handleDrop(e: DragEvent): void {
  e.preventDefault();
  if (!e.dataTransfer) return;

  const data = e.dataTransfer.getData("text/plain");
  const shipKey = data as ShipKey;

  const positions = getCellPosition(e)[0];
  const [x, y] = positions;

  // Longitud del barco a partir del nombre (último número del string)
  const shipLength = Number(data[data.length - 1]);

  // Obtener la URL correspondiente a la orientación actual
  const url = getShipImage(shipKey, currentOrientation);
  if (!url) return;

  // Actualizar estado del barco en memoria
  const ship = ShipSOnboard[shipKey];
  ship.alreadyOnboard = true;
  ship.prevX = x;
  ship.PrevY = y;
  ship.prevOrientation = currentOrientation;

  // Colocar el barco en el tablero
  moveShip(e, shipKey, x, y, shipLength, url);
  game.printBoard();
}



// ─────────────────────────────
// 🔹 Utilidades varias
// ─────────────────────────────
function getCellPosition(e: Event): number[][] {
  const positions: number[][] = [];
  const target = e.target as HTMLElement | null;
  if (!target) return positions;

  if (target.dataset.x && target.dataset.y) {
    positions.push([Number(target.dataset.x), Number(target.dataset.y)]);
    return positions;
  }

  const cell = target.closest<HTMLElement>(".cell");
  if (cell && cell.dataset.x && cell.dataset.y) {
    positions.push([Number(cell.dataset.x), Number(cell.dataset.y)]);
  }

  return positions;
}

function clearHighlights(): void {
  document
    .querySelectorAll(".highlightSuccesCell, .highlighErrorCell")
    .forEach((el) =>
      el.classList.remove("highlightSuccesCell", "highlighErrorCell")
    );
}

function changeCellColor(
  availability: boolean,
  shipLength: number,
  x: number,
  y: number,
  placeShip: boolean = false
): void {
  clearHighlights();

  const dx = currentOrientation === "vertical" ? 1 : 0;
  const dy = currentOrientation === "horizontal" ? 1 : 0;

  const targets: { el: HTMLElement | null; nx: number; ny: number }[] = [];
  for (let i = 0; i < shipLength; i++) {
    const nx = x + dx * i;
    const ny = y + dy * i;
    const el = document.getElementById(`${nx}-${ny}`);
    targets.push({ el, nx, ny });
  }

  const allExist = targets.every((t) => t.el !== null);
  const classToAdd =
    availability && allExist ? "highlightSuccesCell" : "highlighErrorCell";

  targets.forEach((t) => {
    if (!t.el) return;
    t.el.classList.remove("highlightSuccesCell", "highlighErrorCell");
    t.el.classList.add(classToAdd);
  });
}

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

  // Obtener la imagen existente del barco
  let shipImg = document.querySelector(
    `img[data-id="${shipKey}"]`
  ) as HTMLImageElement | null;

  // Si no existe, crearla
  if (!shipImg) {
    shipImg = document.createElement("img");
    shipImg.classList.add(
      "shipInsidegrid",
      currentOrientation === "vertical"
        ? `ship-height-${shipLength}`
        : `ship-len-${shipLength}`
    );

    shipImg.dataset.id = shipKey;

    // Guardar las rutas de imagen para cada orientación

    shipImg.src = url;

    if (CellsAvilibility) {
      currentTarget.appendChild(shipImg);
      CellsAvilibility = false;
    }

    ShipSOnboard[shipKey].alreadyOnboard = true;
    game.placeShip(x, y, shipLength, currentOrientation, shipKey);
    clearHighlights();
    return;
  }

  // Actualizar rotación y fuente según orientación

  if (
    shipImg.classList.contains(`ship-len-${shipLength}`) &&
    currentOrientation == "vertical"
  ) {
    shipImg.classList.remove(`ship-len-${shipLength}`);
    shipImg.classList.add(`ship-height-${shipLength}`);
  }

  if (
    shipImg.classList.contains(`ship-height-${shipLength}`) &&
    currentOrientation == "horizontal"
  ) {
    shipImg.classList.remove(`ship-height-${shipLength}`);
    shipImg.classList.add(`ship-len-${shipLength}`);
  }

  shipImg.src = url;

  // Reubicar en el nuevo target
  shipImg.remove();
  currentTarget.appendChild(shipImg);

  // Actualizar lógica del juego
  game.clearCell(shipLength, shipKey);
  game.placeShip(x, y, shipLength, currentOrientation, shipKey);
  clearHighlights();
}

function getShipImage(
  shipKey: ShipKey,
  orientation: "horizontal" | "vertical"
): string {
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

  const ship = shipImages[shipKey];
  if (!ship) return "";
  return orientation === "horizontal" ? ship.horizontal : ship.vertical;
}
