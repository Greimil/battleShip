import GameBoard from "./classes/GameBoard.js";
import Player from "./classes/player.js";
import Ship from "./classes/ship.js";
// ─────────────────────────────
// 🔹 Global State
// ─────────────────────────────
let currentOrientation = "horizontal";
let game;
let player;
let shipDragging = "";
let CellsAvilibility = false;
let rotatingship = false;
const createShipState = () => ({
    alreadyOnboard: false,
    prevX: -1,
    PrevY: -1,
    prevOrientation: "horizontal",
});
let ShipSOnboard = {
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
const ShipsContainers = document.querySelectorAll(".imgWrapper");
const board = document.getElementById("board");
const cellContainer = document.createElement("div");
// ─────────────────────────────
// 🔹 Event Listeners Globales
// ─────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    heroSection?.classList.add("activeScreen");
    createCells();
});
document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r")
        toggleOrientation();
});
cellContainer.addEventListener("dragstart", (e) => handleGridDragStart(e));
cellContainer.addEventListener("dragend", () => removeRotateCursor());
startGameBtn?.addEventListener("click", () => {
    heroSection?.classList.toggle("activeScreen");
    gameSection?.classList.toggle("activeScreen");
    initGame();
});
// ─────────────────────────────
// 🔹 Inicialización
// ─────────────────────────────
function initGame() {
    const Ships = createShips(ShipsContainers);
    player = new Player("user", Ships);
    game = new GameBoard(player);
    setupDragEvents();
}
// ─────────────────────────────
// 🔹 Rotación global
// ─────────────────────────────
function toggleOrientation() {
    rotatingship = true;
    currentOrientation =
        currentOrientation === "horizontal" ? "vertical" : "horizontal";
    cellContainer.classList.add("rotateCursor");
    rotatingship = false;
}
function removeRotateCursor() {
    if (!rotatingship)
        cellContainer.classList.remove("rotateCursor");
}
// ─────────────────────────────
// 🔹 Configurar eventos de los barcos
// ─────────────────────────────
function setupDragEvents() {
    ShipsContainers.forEach((ship) => {
        ship.addEventListener("dragstart", (e) => {
            const dragEvent = e;
            const id = dragEvent.currentTarget.id;
            const alreadyPlaced = player.Ships.some((ship) => ship.id === id && ship.positions.length !== 0);
            if (alreadyPlaced)
                return;
            dragEvent.dataTransfer?.setData("text/plain", id);
            shipDragging = id;
        });
    });
}
// ─────────────────────────────
// 🔹 Creación de barcos
// ─────────────────────────────
function createShips(ships) {
    const shipData = {
        SHIP_CARRIER_5: { name: "Portaaviones", length: 5 },
        SHIP_BATTLESHIP_4: { name: "Acorazado", length: 4 },
        SHIP_CRUISER_3: { name: "Crucero", length: 3 },
        SHIP_SUBMARINE_3: { name: "Submarino", length: 3 },
        SHIP_DESTROYER_2: { name: "Destructor", length: 2 },
    };
    return Array.from(ships)
        .filter((s) => s.id in shipData)
        .map((s) => {
        const { name, length } = shipData[s.id];
        return new Ship(s.id, name, length);
    });
}
// ─────────────────────────────
// 🔹 Creación del tablero
// ─────────────────────────────
function createCells() {
    cellContainer.classList.add("cellContainer");
    board?.appendChild(cellContainer);
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `${r}-${c}`;
            cell.dataset.x = r.toString();
            cell.dataset.y = c.toString();
            cell.addEventListener("dragover", handleDragOver);
            cell.addEventListener("drop", handleDrop);
            cellContainer.appendChild(cell);
        }
    }
}
// ─────────────────────────────
// 🔹 Eventos de Drag & Drop
// ─────────────────────────────
function handleGridDragStart(e) {
    const target = e.target;
    if (!target.classList.contains("shipInsidegrid") || !target.dataset.id)
        return;
    const shipKey = target.dataset.id;
    target.src = getShipImage(shipKey, currentOrientation);
    e.dataTransfer?.setData("text/plain", shipKey);
}
function handleDragOver(e) {
    e.preventDefault();
    const [x, y] = getCellPosition(e);
    const shipLength = Number(shipDragging.at(-1));
    CellsAvilibility = game.checkAvailability(x, y, shipLength, currentOrientation);
    changeCellColor(CellsAvilibility, shipLength, x, y);
}
function handleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer?.getData("text/plain");
    if (!data)
        return;
    const [x, y] = getCellPosition(e);
    const shipLength = Number(data.at(-1));
    const url = getShipImage(data, currentOrientation);
    if (!url)
        return;
    Object.assign(ShipSOnboard[data], {
        alreadyOnboard: true,
        prevX: x,
        PrevY: y,
        prevOrientation: currentOrientation,
    });
    moveShip(e, data, x, y, shipLength, url);
    game.printBoard();
}
// ─────────────────────────────
// 🔹 Utilidades
// ─────────────────────────────
function getCellPosition(e) {
    const target = e.target.closest(".cell");
    if (!target)
        return [-1, -1];
    return [Number(target.dataset.x), Number(target.dataset.y)];
}
function clearHighlights() {
    document
        .querySelectorAll(".highlightSuccesCell, .highlighErrorCell")
        .forEach((el) => el.classList.remove("highlightSuccesCell", "highlighErrorCell"));
}
function changeCellColor(available, shipLength, x, y) {
    clearHighlights();
    const dx = currentOrientation === "vertical" ? 1 : 0;
    const dy = currentOrientation === "horizontal" ? 1 : 0;
    const targets = Array.from({ length: shipLength }, (_, i) => document.getElementById(`${x + dx * i}-${y + dy * i}`));
    const allExist = targets.every(Boolean);
    const classToAdd = available && allExist ? "highlightSuccesCell" : "highlighErrorCell";
    targets.forEach((cell) => cell?.classList.add(classToAdd));
}
// ─────────────────────────────
// 🔹 Mover Barco
// ─────────────────────────────
function moveShip(e, shipKey, x, y, shipLength, url) {
    const currentTarget = e.currentTarget;
    if (!currentTarget)
        return;
    let shipImg = document.querySelector(`img[data-id="${shipKey}"]`);
    const orientationClass = currentOrientation === "vertical"
        ? `ship-height-${shipLength}`
        : `ship-len-${shipLength}`;
    if (!shipImg) {
        shipImg = document.createElement("img");
        shipImg.src = url;
        shipImg.dataset.id = shipKey;
        shipImg.classList.add("shipInsidegrid", orientationClass);
        if (CellsAvilibility)
            currentTarget.appendChild(shipImg);
        game.placeShip(x, y, shipLength, currentOrientation, shipKey);
        clearHighlights();
        return;
    }
    shipImg.className = `shipInsidegrid ${orientationClass}`;
    shipImg.src = url;
    shipImg.remove();
    currentTarget.appendChild(shipImg);
    game.clearCell(shipLength, shipKey);
    game.placeShip(x, y, shipLength, currentOrientation, shipKey);
    clearHighlights();
}
// ─────────────────────────────
// 🔹 Obtener imagen según orientación
// ─────────────────────────────
function getShipImage(shipKey, orientation) {
    const shipImages = {
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
