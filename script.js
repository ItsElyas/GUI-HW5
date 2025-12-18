
var ScrabbleTiles = [];
ScrabbleTiles["A"] = { "value": 1, "original-distribution": 9, "number-remaining": 9 };
ScrabbleTiles["B"] = { "value": 3, "original-distribution": 2, "number-remaining": 2 };
ScrabbleTiles["C"] = { "value": 3, "original-distribution": 2, "number-remaining": 2 };
ScrabbleTiles["D"] = { "value": 2, "original-distribution": 4, "number-remaining": 4 };
ScrabbleTiles["E"] = { "value": 1, "original-distribution": 12, "number-remaining": 12 };
ScrabbleTiles["F"] = { "value": 4, "original-distribution": 2, "number-remaining": 2 };
ScrabbleTiles["G"] = { "value": 2, "original-distribution": 3, "number-remaining": 3 };
ScrabbleTiles["H"] = { "value": 4, "original-distribution": 2, "number-remaining": 2 };
ScrabbleTiles["I"] = { "value": 1, "original-distribution": 9, "number-remaining": 9 };
ScrabbleTiles["J"] = { "value": 8, "original-distribution": 1, "number-remaining": 1 };
ScrabbleTiles["K"] = { "value": 5, "original-distribution": 1, "number-remaining": 1 };
ScrabbleTiles["L"] = { "value": 1, "original-distribution": 4, "number-remaining": 4 };
ScrabbleTiles["M"] = { "value": 3, "original-distribution": 2, "number-remaining": 2 };
ScrabbleTiles["N"] = { "value": 1, "original-distribution": 6, "number-remaining": 6 };
ScrabbleTiles["O"] = { "value": 1, "original-distribution": 8, "number-remaining": 8 };
ScrabbleTiles["P"] = { "value": 3, "original-distribution": 2, "number-remaining": 2 };
ScrabbleTiles["Q"] = { "value": 10, "original-distribution": 1, "number-remaining": 1 };
ScrabbleTiles["R"] = { "value": 1, "original-distribution": 6, "number-remaining": 6 };
ScrabbleTiles["S"] = { "value": 1, "original-distribution": 4, "number-remaining": 4 };
ScrabbleTiles["T"] = { "value": 1, "original-distribution": 6, "number-remaining": 6 };
ScrabbleTiles["U"] = { "value": 1, "original-distribution": 4, "number-remaining": 4 };
ScrabbleTiles["V"] = { "value": 4, "original-distribution": 2, "number-remaining": 2 };
ScrabbleTiles["W"] = { "value": 4, "original-distribution": 2, "number-remaining": 2 };
ScrabbleTiles["X"] = { "value": 8, "original-distribution": 1, "number-remaining": 1 };
ScrabbleTiles["Y"] = { "value": 4, "original-distribution": 2, "number-remaining": 2 };
ScrabbleTiles["Z"] = { "value": 10, "original-distribution": 1, "number-remaining": 1 };
ScrabbleTiles["_"] = { "value": 0, "original-distribution": 2, "number-remaining": 2 };

let totalScore = 0;
let boardState = new Array(15).fill(null); // Tracks tiles for the board

// Shows wich tiles are bonus words and letters for the multiplier
const bonusSquares = {
    2: { type: 'word', mult: 2 },  
    6: { type: 'letter', mult: 2 },
    8: { type: 'letter', mult: 2 }, 
    12: { type: 'word', mult: 2 } 
};

$(document).ready(function() {
    initGame();

    $("#newHand").click(function() {
        shuffleHand();
    });

    $("#Submit").click(submitWord);
    $("#Restart").click(restartGame);
});

function initGame() {
    createBoardSlots();
    refillRack();
}

//Creates the board slots and makes them draggable
function createBoardSlots() {
    const $board = $("#board-slots");
    $board.empty();

    for (let i = 0; i < 15; i++) {
        let $slot = $('<div>').addClass('board-slot').attr('data-index', i);

        $slot.droppable({
            accept: ".tile",
            tolerance: "pointer",
            drop: handleTileDrop
        });

        $board.append($slot);
    }
    //Allows them to be draggeck back from the borad and to the rack
    $("#rack-slots").droppable({
        accept: ".tile",
        drop: function(event, ui) {
            let tileId = ui.draggable.attr("id");
            removeTileFromBoardLogic(tileId);
            $(this).append(ui.draggable);
            ui.draggable.css({top: 0, left: 0, position: 'relative'});
            updateScore();
        }
    });
}

//Makes sure that there are always 7 tiles
function refillRack() {
    let currentCount = $("#rack-slots .tile").length;
    let needed = 7 - currentCount; 

    for (let i = 0; i < needed; i++) {
        let letter = getRandomTile();
        if (letter) {
            addTileToRack(letter);
        }
    }
}
//Pulls a random letter from the pool and reduces its remaining count
function getRandomTile() {
    let availableLetters = [];
    for (let key in ScrabbleTiles) {
        if (ScrabbleTiles[key]["number-remaining"] > 0) {
            availableLetters.push(key);
        }
    }
    if (availableLetters.length === 0) return null;

    let randomIndex = Math.floor(Math.random() * availableLetters.length);
    let letter = availableLetters[randomIndex];
    ScrabbleTiles[letter]["number-remaining"]--;
    return letter;
}

//generates a random letter and its remaining count and grabs the letter fomr the tile folder and grabs the png
function addTileToRack(letter) {
    let uniqueId = "tile-" + letter + "-" + Math.floor(Math.random() * 10000);
    let imgPath = `graphics_data/Scrabble_Tiles/Scrabble_Tile_${letter}.jpg`;
    if(letter === "_") imgPath = "graphics_data/Scrabble_Tiles/Scrabble_Tile_Blank.jpg";

    let $img = $('<img>')
        .attr('src', imgPath)
        .attr('id', uniqueId)
        .addClass('tile')
        .attr('data-letter', letter)
        .attr('data-value', ScrabbleTiles[letter].value);

    $img.draggable({
        revert: "invalid",
        cursor: "move",
        zIndex: 1000,
        start: function() {
            $(this).draggable("option", "revert", "invalid");
        }
    });

    $("#rack-slots").append($img);
}

function shuffleHand() {
    $("#rack-slots .tile").each(function() {
        let letter = $(this).data('letter');
        ScrabbleTiles[letter]["number-remaining"]++;
        $(this).remove();
    });
    refillRack();
    $("#message-area").text("New hand dealt!");
}

//Handles the tile snapping 
function handleTileDrop(event, ui) {
    let $slot = $(this);
    let $tile = ui.draggable;
    let index = $slot.data('index');

    if (boardState[index] !== null) {
        $tile.draggable('option', 'revert', true);
        return;
    }

    let isBoardEmpty = boardState.every(slot => slot === null);
    let leftUsed = (index > 0 && boardState[index - 1] !== null);
    let rightUsed = (index < 14 && boardState[index + 1] !== null);

    if (!isBoardEmpty && !leftUsed && !rightUsed) {
        $tile.draggable('option', 'revert', true);
        $("#message-area").text("Tiles must be placed next to existing letters!");
        return;
    }

    $tile.position({ of: $slot, my: 'center center', at: 'center center' });
    $slot.append($tile);
    $tile.css({top: 0, left: 0, position: 'absolute'});

    let id = $tile.attr('id');
    removeTileFromBoardLogic(id);
    boardState[index] = { letter: $tile.data('letter'), value: parseInt($tile.data('value')), id: id };
    
    $("#message-area").text("");
    updateScore();
}
//When tile is moves it cleans the board state
function removeTileFromBoardLogic(tileId) {
    for (let i = 0; i < 15; i++) {
        if (boardState[i] && boardState[i].id === tileId) {
            boardState[i] = null;
        }
    }
}

function updateScore() {
    let word = "";
    let score = 0;
    let wordMultiplier = 1;

    for (let i = 0; i < 15; i++) {
        let tile = boardState[i];
        if (tile) {
            word += tile.letter;
            let letterVal = tile.value;
            

            if (bonusSquares[i]) {
                if (bonusSquares[i].type === 'letter') {
                    letterVal *= bonusSquares[i].mult;
                } else if (bonusSquares[i].type === 'word') {
                    wordMultiplier *= bonusSquares[i].mult;
                }
            }
            score += letterVal;
        }
    }

    score *= wordMultiplier;
    $("#currentWord").text(word);
    $("#currentScore").text(score);
}

function submitWord() {
    let currentVal = parseInt($("#currentScore").text());
    let lettersOnBoard = boardState.filter(x => x !== null).length;

    if (lettersOnBoard < 2) {
        $("#message-area").text("Word must be at least 2 letters.");
        return;
    }

    totalScore += currentVal; 
    $("#totalScore").text(totalScore);
    
    for (let i = 0; i < 15; i++) {
        if (boardState[i]) {
            $("#" + boardState[i].id).remove();
            boardState[i] = null;
        }
    }

    $("#currentScore").text(0);
    $("#currentWord").text("");
    refillRack();
    $("#message-area").text("Word Submitted!");
}

function restartGame() {
    location.reload();
}