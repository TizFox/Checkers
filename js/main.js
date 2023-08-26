// b -> Black Base | d -> Black Dama ||| B -> White Base | D -> White Dama
var board = [[], [], [], [], [], [], [], []];

var selectedCellCoords = [];
var currentPlayerWhite = true;
var whiteWin = false;
var blackWin = false;
var nWhitePieces = 0
var nBlackPieces = 0

var moves = [];
var justEat = false;

// ---------------------------------------------------------------------------------------------------- //
class Move {
    constructor(startCoords, eatCoords, endCoords, canEat) {
        this.startCoords = startCoords;
        this.eatCoords = eatCoords;
        this.endCoords = endCoords;
        this.canEat = canEat;
        this.piece = board[startCoords[0]][startCoords[1]];

        var code = 0;
        if (this.startCoords.length > 0 && this.endCoords.length > 0) {
            code = this.startCoords[0] * 10000 + this.startCoords[1] * 1000 + this.endCoords[0] * 100 + this.endCoords[1] * 10 + (canEat ? 1 : 0) * 1;
        } else {
            code = 0;
        }
        this.code = code;
    }
}
class Controll {
    constructor(canMove, canEat) {
        this.hasMoveTiles = canMove;
        this.hasEatTiles = canEat;
    }
}
// ---------------------------------------------------------------------------------------------------- //

function isWhite(i, j) {
    return (i + j) % 2 === 0
}
function isCapital(l) {
    return l === "B" || l === "D";
}
function isEnemy(piece, enemyPiece) {
    return isCapital(piece) != isCapital(enemyPiece);
}

function createBoard(fen) {
    var i = 0;
    var j = 0;
    for (let k = 0; k < fen.length; k++) {
        let char = fen[k];
        if (char === "1" || char === "2" || char === "3" || char === "4" || char === "5" || char === "6" || char === "7" || char === "8") {
            for (let z = 0; z < char; z++) {
                board[i][j] = " ";
                j += 1;
            }
        } else if (char === "/") {
            i += 1;
            j = 0;
        } else {
            if (isCapital(char)) {
                nWhitePieces += 1;
            } else {
                nBlackPieces += 1;
            }
            board[i][j] = char;
            j += 1;
        }
    }
}

window.onload = function () {
    var fenString = "1B1B1B1B/B1B1B1B1/1B1B1B1B/8/8/b1b1b1b1/1b1b1b1b1/b1b1b1b1";
    createBoard(fenString);

    document.body.style.zoom = 0.9;
    loadBoard();
}

function loadBoard() {
    document.getElementById("player").innerHTML = (currentPlayerWhite ? "Blue" : "Red") + " to Play";
    
    // Winner?
    if (nWhitePieces === 0) {
        document.getElementById("who-win").innerHTML = "<h3>Red WIN!</h3>";
        blackWin = true;
    } else if (nBlackPieces === 0) {
        document.getElementById("who-win").innerHTML = "<h3>Blue WIN!</h3>";
        whiteWin = true;
    }
    
    // Set Imgages
    for (let i = 0; i < 8; i++) {
        const row = document.getElementById(`${i+1}`);
        row.innerHTML = "";
        for (let j = 0; j < 8; j++) {
            let classBtn = isWhite(i, j) ? "white-cell" : "black-cell";
            let img = " "
            if (board[i][j] != " ")
                img = `<img class="piece" src="./assets/${isCapital(board[i][j]) ? "WhitePieces" : "BlackPieces"}/${board[i][j]}.png"></img>`;
            else
                img = `<img class="piece" src="./assets/NULL.png"></img>`;
            var coords = [i, j];
            row.innerHTML += `<td><button id="${i}-${j}" class="cell ${classBtn}" onclick="selectCell([${coords}])">${img}</button></td>`;
        }
    }
    // Set Win Colors and Finish the Game
    if (whiteWin || blackWin) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let cell = document.getElementById(`${i}-${j}`);
                let classBtn = isWhite(i, j) ? "white-sad-cell" : "black-sad-cell";
                cell.onclick = function() {};
                cell.className = `cell ${classBtn}`;
            }
        }
    }
}

function selectCell(cellCoords) {
    var cell = document.getElementById(`${cellCoords[0]}-${cellCoords[1]}`);

    // Make the Move
    if (cell.className === "cell white-possible-cell" || cell.className === "cell black-possible-cell") {
        // Move
        for (let k = 0; k < moves.length; k++) {
            if (moves[k].endCoords[0] === cellCoords[0] && moves[k].endCoords[1] === cellCoords[1]) {
                move(moves[k]);
                if (moves[k].code % 2 === 0) {
                    justEat = false;
                } else {
                    justEat = true;
                }
                break;
            }
        }

        // Can Eat More?
        moves = generateMoves(cellCoords, false);
        if (moves.length === 0) {
            justEat = false;
        }

        // Change Player
        if (!justEat) {
            currentPlayerWhite = ! currentPlayerWhite;
        }

        // Reload The Board
        return loadBoard();
    }

    // Reset Other Cell Color
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            var baseclassBtn = isWhite(i, j) ? "white-cell" : "black-cell";
            var otherCell = document.getElementById(`${i}-${j}`);
            otherCell.className = `cell ${baseclassBtn}`;
        }
    }

    // Select Cell
    if (board[cellCoords[0]][cellCoords[1]] != " ") {
        if (currentPlayerWhite === isCapital(board[cellCoords[0]][cellCoords[1]])) {   
            // Set Selected Cell Color
            var selectedClassBtn = "black-selected-cell";
            selectedCellCoords[0] = cellCoords[0];
            selectedCellCoords[1] = cellCoords[1];
            cell.className = `cell ${selectedClassBtn}`;
            
            // Generate Moves
            if (!justEat) {
                moves = generateMoves(cellCoords, true);
            }

            var legalMoves = generateAllMoves(board[cellCoords[0]][cellCoords[1]]);
            // All Piece Blocked
            if (legalMoves.length === 0) {
                if (isCapital(board[cellCoords[0]][cellCoords[1]])) {
                    blackWin = true;
                } else {
                    whiteWin = true;
                }
            }

            // Filter Moves
            var okMoves = [];
            for (let i = 0; i < moves.length; i++) {
                for (let j = 0; j < legalMoves.length; j++) {
                    if (moves[i].code === legalMoves[j].code) {
                        okMoves.push(moves[i]);
                    }
                }
            }
            moves = okMoves;

            // Set Possible Cell Color
            moves.forEach ((m) => {
                var possibleClassBtn = "black-possible-cell";
                var cell = document.getElementById(`${m.endCoords[0]}-${m.endCoords[1]}`);
                cell.className = `cell ${possibleClassBtn}`;
            });
        }
    }
}

function move(m) {
    // Move
    board[m.endCoords[0]][m.endCoords[1]] = board[selectedCellCoords[0]][selectedCellCoords[1]];
    board[selectedCellCoords[0]][selectedCellCoords[1]] = " ";
    // Promote
    if (isCapital(board[m.endCoords[0]][m.endCoords[1]])) {
        if (m.endCoords[0] === 7 && board[m.endCoords[0]][m.endCoords[1]] != "D") {
            board[m.endCoords[0]][m.endCoords[1]] = "D";
        }
    } else {
        if (m.endCoords[0] === 0 && board[m.endCoords[0]][m.endCoords[1]] != "d") {
            board[m.endCoords[0]][m.endCoords[1]] = "d";
        }
    }
    // Eat
    if (m.canEat) {
        var piece = board[m.eatCoords[0]][m.eatCoords[1]];
        board[m.eatCoords[0]][m.eatCoords[1]] = " ";
        if (isCapital(piece)) {
            nWhitePieces -= 1;
        } else {
            nBlackPieces -= 1;
        }
    }
}

function checkPieces(p, baseCoords, offset) {
    var coords = [baseCoords[0] + offset[0], baseCoords[1] + offset[1]]

    if (coords[0] > 7 || coords[0] < 0 || coords[1] > 7 || coords[1] < 0) {
        return new Controll(false, false);
    }
    
    otherPiece = board[coords[0]][coords[1]];
    if (otherPiece != " ") {
        // Check if can Eat
        if (isEnemy(p, otherPiece)) {
            var eatCoords = [coords[0] + offset[0], coords[1] + offset[1]];
            if (eatCoords[0] > 7 || eatCoords[0] < 0 || eatCoords[1] > 7 || eatCoords[1] < 0) {
                return new Controll(false, false);
            }
            var piece = board[eatCoords[0]][eatCoords[1]];
            if (piece === " ") {
                // Can't Move and Can Eat
                return new Controll(false, true);
            }
        }
        // Can't Move and Can't Eat
        return new Controll(false, false);
    }
    // Can Move and Can't Eat
    return new Controll(true, false);
}

function generateMoves(coordinates, canMove) {
    var eatMoves = [];
    var moveMoves = [];
    var piece = board[coordinates[0]][coordinates[1]];
    var checkMove;

    // Black Base and Half Dama
    if (piece === "b" || piece === "d" || piece === "D") {
        checkMove = checkPieces(piece, coordinates, [-1, +1]);
        if (checkMove.hasMoveTiles && canMove) {
            moveMoves.push(new Move(coordinates, [], [coordinates[0] - 1, coordinates[1] + 1], false));
        } else if (checkMove.hasEatTiles) {
            eatMoves.push(new Move(coordinates, [coordinates[0] - 1, coordinates[1] + 1], [coordinates[0] - 2, coordinates[1] + 2], true));
        }

        checkMove = checkPieces(piece, coordinates, [-1, -1]);
        if (checkMove.hasMoveTiles && canMove) {
            moveMoves.push(new Move(coordinates, [], [coordinates[0] - 1, coordinates[1] - 1], false));
        } else if (checkMove.hasEatTiles) {
            eatMoves.push(new Move(coordinates, [coordinates[0] - 1, coordinates[1] - 1], [coordinates[0] - 2, coordinates[1] - 2], true));
        }
    }
    // White Base and Half Dama
    if (piece === "B" || piece === "d" || piece === "D") {
        checkMove = checkPieces(piece, coordinates, [+1, +1]);
        if (checkMove.hasMoveTiles && canMove) {
            moveMoves.push(new Move(coordinates, [], [coordinates[0] + 1, coordinates[1] + 1], false));
        } else if (checkMove.hasEatTiles) {
            eatMoves.push(new Move(coordinates, [coordinates[0] + 1, coordinates[1] + 1], [coordinates[0] + 2, coordinates[1] + 2], true));
        }

        checkMove = checkPieces(piece, coordinates, [+1, -1]);
        if (checkMove.hasMoveTiles && canMove) {
            moveMoves.push(new Move(coordinates, [], [coordinates[0] + 1, coordinates[1] - 1], false));
        } else if (checkMove.hasEatTiles) {
            eatMoves.push(new Move(coordinates, [coordinates[0] + 1, coordinates[1] - 1], [coordinates[0] + 2, coordinates[1] - 2], true));
        }
    }

    if (eatMoves.length > 0) {
        return eatMoves;
    } else if (moveMoves.length > 0) {
        return moveMoves;
    } else {
        return [];
    }
}

function generateAllMoves(color) {
    // Generate All Moves
    var moves = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (isCapital(board[i][j]) === isCapital(color)) {
                var pieceMoves = generateMoves([i, j], true);
                moves = moves.concat(pieceMoves);
            }
        }
    }
    
    // Differentiate Moves
    var damaEat = [];
    var eatMoves = [];
    var moveMoves = [];
    for (let k = 0; k < moves.length; k++) {
        if (moves[k].canEat) {
            if (moves[k].piece === "D" || moves[k].piece === "d") {
                damaEat.push(moves[k]);
            } else {
                eatMoves.push(moves[k]);
            }
        } else {
            moveMoves.push(moves[k]);
        }
    }

    // Return Move Hierarchy
    if (damaEat.length > 0) {
        return damaEat;
    } else if (eatMoves.length > 0) {
        return eatMoves;
    } else if (moveMoves.length > 0) {
        return moveMoves;
    } else {
        return [];
    }
}
