class BoardGame {
    constructor(scene, graph) {
        this.scene = scene;
        this.graph = graph;
        this.board = []
        this.boardWidth = 0;
        this.boardHeight = 0;
        this.player1 = [];
        this.player2 = [];

        this.piece1 = this.graph.components['piece1']
        this.piece2 = this.graph.components['piece2']
        this.piece3 = this.graph.components['piece3']

        this.initialBoard = [];
        this.moveList = [];
        this.validMoves = [];

        this.interactable = false;
        this.currentPlayer = 0;

        this.gameStates = {
            IDLE: 1,
            PLAYING: 2,
            OVER: 3,          
            REPLAYING: 4,          
            RESTARTING: 5          
        };
        this.gameState = this.gameStates.IDLE;

        this.modes = {
            HUMAN_HUMAN: 1,
            CPU_HUMAN: 2,
            HUMAN_CPU: 3,
            CPU_CPU: 4
        }

        this.makeButtons();
        this.makeTimers();
    }

    makeButtons() {
        // Makes the interactable buttons that will be next to the board
        // Button constructor already adds the components to graph

        this.replayButton = new ToggleButton(this.scene, this.graph, new Translation(8, 0, -4), () => this.replay())
        this.showValidMovesButton = new SimpleButton(this.scene, this.graph, new Translation(8, 0, -1.35), () => this.showValidMoves())
        this.undoButton = new SimpleButton(this.scene, this.graph, new Translation(8, 0, 1.35), () => this.undoMove())

        // modes: Human VS Human, CPU vs Human .. etc
        this.mode1button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, -4.25), new Scale(0.8, 0.8, 0.8)]), () => this.changeMode(1))
        this.mode2button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, -2.75), new Scale(0.8, 0.8, 0.8)]), () => this.changeMode(2))
        this.mode3button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, -1.250), new Scale(0.8, 0.8, 0.8)]), () => this.changeMode(3))
        this.mode4button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, 0.25), new Scale(0.8, 0.8, 0.8)]), () => this.changeMode(4))
        this.modebuttons = [this.mode1button, this.mode2button, this.mode3button, this.mode4button];
        
        // CPU Difficulty toggle buttons, hard button is already pressed
        this.easybutton = new ToggleButton(this.scene, this.graph, new Translation(11, 0, 3), () => { this.difficulty = 0; this.easybutton.disable(); this.hardbutton.enable(); this.hardbutton.toggleUp() })
        this.hardbutton = new ToggleButton(this.scene, this.graph, new Translation(11, 0, 4.5), () => { this.difficulty = 1; this.hardbutton.disable(); this.easybutton.enable(); this.easybutton.toggleUp() })
        this.hardbutton.press();
        this.hardbutton.disable();

        // Button for rematch
        this.restartbutton = new SimpleButton(this.scene, this.graph, new Translation(8, 0, 4), () => this.restart()) 
    }

    makeTimers() {
        // Makes the two player timers and game counter
        this.player1timer = new GameTimer(this.scene, this.graph, new Translation(-9, 0, 4))
        this.player2timer = new GameTimer(this.scene, this.graph, new Translation(-9, 0, -4))
        this.wincounter = new GameCounter(this.scene, this.graph, new Translation(-9, 0, 0))

        // Adds the components to graph
        this.graph.addComponent(this.player1timer);
        this.graph.addComponent(this.player2timer);
        this.graph.addComponent(this.wincounter);
    }

    update(t) {
        // Check if Replay button is clickable
        if (this.gameState == this.gameStates.OVER) {
            this.replayButton.enable()
            this.restartbutton.enable()
        }
        else {
            this.replayButton.disable();       
            this.restartbutton.disable()
        } 

        // Check if Undo button is clickable
        if (!this.interactable || this.moveList.length == 0 || (this.moveList.length == 1 && this.mode == this.modes.CPU_HUMAN)) 
           this.undoButton.disable();
        else this.undoButton.enable()

        // Check if Show valid moves button is clickable
        if (!this.interactable) 
           this.showValidMovesButton.disable();
        else this.showValidMovesButton.enable()

        // Check if mode buttons are clickable
        if (this.interactable || this.gameState == this.gameStates.OVER || this.gameState == this.gameStates.IDLE)
            this.modebuttons.forEach(button => button.enable())
        else this.modebuttons.forEach(button => button.disable())

        // Check if timers have ended. If time's up, opponent wins.
        if (this.gameState == this.gameStates.PLAYING && this.player1timer.isOver())
            this.setGameOver(2)
        else if (this.gameState == this.gameStates.PLAYING && this.player2timer.isOver())
            this.setGameOver(1)
    }

    toNewGraph(graph) {      
        // Keeping current game state but change to the new graph
        // Saves old states
        let oldboard = this.board;
        let P1PieceValues = this.toPieceValueArray(this.player1);
        let P2PieceValues = this.toPieceValueArray(this.player2);

        // Converts board to cell array of arrays
        let cellArray = this.toCellArray();
        // Changes graph and piece components
        this.graph = graph;
        this.piece1 = this.graph.components['piece1']
        this.piece2 = this.graph.components['piece2']
        this.piece3 = this.graph.components['piece3']

        // Creates a board with the new components, materials, etc
        this.createBoard(cellArray, false);
        
        // Copies all the animation states from the old board (pieces that were moving, etc)
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x] == null)
                    continue;
                this.board[y][x].copyAnimationStateFrom(oldboard[y][x]);
            }
        }

        // For each player piece of oldPlayer:
        // - Copies its transformation matrix to the new piece
        // - Copies its animation state to the new piece
        // - Adds piece to graph as a pickable with no function
        let copyPlayer = (oldPlayer, pieceValues) => {
            let newPlayer = [];
            for (let i = 0; i < oldPlayer.length; i++) {
                let piece = oldPlayer[i];
                let pieceValue = pieceValues[i]
                let newPiece = this.makePiece(pieceValue, 0, 0);
                newPiece.transformationMatrix = piece.transformationMatrix;
                newPiece.copyAnimationStateFrom(piece);
                newPlayer.push(newPiece);
                this.graph.addPickable(newPiece, () => {})
            }
            return newPlayer;
        }

        // Runs previous function for P1 and P2 arrays 
        // so that materials, textures, etc are changed but animation state and transformation matrix is kept
        // transformation matrix needs to be kept in order to know board position
        this.player1 = copyPlayer(this.player1, P1PieceValues);
        this.player2 = copyPlayer(this.player2, P2PieceValues);

        // Reposition camera (depending on current player)
        this.updateCamera();

        // Notify timers and buttons that they should use new graph from now on 
        // Also changes materials, textures, etc. 
        // Adds components to graph too
        this.player1timer.toNewGraph(this.graph);
        this.player2timer.toNewGraph(this.graph);
        this.wincounter.toNewGraph(this.graph);

        this.replayButton.toNewGraph(this.graph)
        this.showValidMovesButton.toNewGraph(this.graph)
        this.undoButton.toNewGraph(this.graph)
        this.mode1button.toNewGraph(this.graph)
        this.mode2button.toNewGraph(this.graph)
        this.mode3button.toNewGraph(this.graph)
        this.mode4button.toNewGraph(this.graph)
        this.easybutton.toNewGraph(this.graph)
        this.hardbutton.toNewGraph(this.graph)
        this.restartbutton.toNewGraph(this.graph) 
    }


    changeMode(mode) {
        // Toggles all mode buttons
        // Selected mode button goes down, others go up
        let modeButton = this.modebuttons[mode - 1];
        this.modebuttons.forEach(button => {
            if(button != modeButton)
                button.toggleUp()
        });
        modeButton.toggleDown();

        // Changes mode        
        this.mode = mode;

        // Starts / Restarts the game
        this.start()
    }

    replay() {
        // Replays allowed only if the game has ended
        if (this.gameState != this.gameStates.OVER)
            return console.log("Cannot replay!")

        // Changes state and interactable flag so user does not mess anything up
        this.gameState = this.gameStates.REPLAYING
        this.interactable = false;

        // For each player piece, reverses the animation
        // This will cause all pieces to go back to their place in the board
        // Random delay is used (0-0.75s) so it feels more natural
        this.player1.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));
        this.player2.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));

        // After 3 seconds, clears board and instantly creates new one with original pieces
        // This will have no visual effect but is meant to ensure all variables are properly set
        // like in the beggining of the game    
        setTimeout(() => {
            this.clearBoard();
            this.createBoard(this.initialBoard, false);
        }, 3000)


        let timePerMove = 750;
        // Every 0.75s a piece will move
        // Order is already stated in the move list
        for (let i = 0, turn = 1; i < this.moveList.length; i++, turn = turn % 2 + 1) {
            // Turn will indicate current player
            // Player arrays are refilled in case a replay must be seen again after this one
            // 4s delay to wait for the previous actions
            setTimeout(() => {
                let x = this.moveList[i][0], y = this.moveList[i][1];
                this.animateCapture(x, y, turn);

                if (turn == 1)
                    this.player1.push(this.pieceAt(x, y));
                else this.player2.push(this.pieceAt(x, y))
            }, i * timePerMove + 4000)    
        }

        // 0.75s * numMoves later, replay ends and game state is restored
        setTimeout(() => {
            this.gameState = this.gameStates.OVER;
            this.replayButton.toggleUp()
        }, timePerMove * this.moveList.length + 5000)
    }

    restart() {
        // Changes state so user does not mess anything up        
        this.gameState = this.gameStates.RESTARTING;

        // For each player piece, reverses the animation
        // This will cause all pieces to go back to their place in the board
        // Random delay is used (0-0.75s) so it feels more natural
        this.player1.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));
        this.player2.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));

        // After 3 seconds, clears board and instantly creates new one with original pieces
        // This will have no visual effect but is meant to set up all the variables for the restarting animation
        // this.start() is called when the restart animation is done, which will then actually get a new board
        setTimeout(() => {
            this.clearBoard();
            this.createBoard(this.initialBoard, false);
            let totalDuration = animateRestart(this.board, (x, y) => this.calculateTileposition(x,y));
            setTimeout( () => { this.start(); }, totalDuration * 1000);
        }, 3000)

    }

    start() {
        // Changes state and interactable flag so user does not mess anything up
        this.interactable = false;
        this.gameState = this.gameStates.PLAYING

        // Empties move list and sets current player to 0 -> No player's turn yet
        this.moveList = [];
        this.currentPlayer = 0;

        // Timers are reset to 5 minutes and 0 seconds
        this.player1timer.reset(5, 0);
        this.player2timer.reset(5, 0);

        // Reposition camera (depending on current player)
        this.updateCamera();
        

        // Asks server for a new random board. 
        // Receives an array of arrays of integers, replacing the current board with that one.        
        getNewBoard((cellArray) => {
            this.clearBoard();
            this.createBoard(cellArray, true)
            this.initialBoard = cellArray;
            // Waits a second for the create board animation to play,
            // Then asks the server for the valid move list, based on the current board
            // When they arrive, saves the list and advances the turn
            setTimeout( () => {
                getValidMoves(this.toCellArray(), (moves) => {
                    this.validMoves = moves;
                    this.advanceTurn();
                })
            }, 1000);
        });
    }

    clearBoard() {
        // Clears the board on the screen, by removing the pieces from the graph
        // This includes player pieces and board pieces
        this.player1.forEach(piece => this.graph.removeComponentFromRoot(piece));
        this.player2.forEach(piece => this.graph.removeComponentFromRoot(piece));
        this.board.forEach(row => {
            row.forEach(piece => this.graph.removeComponentFromRoot(piece))
        });

        // Also clears game structures (players and board)
        this.player1 = [];
        this.player2 = [];
        this.board = [];
    }

    createBoard(cellArray, animate) {
        // Calculates width and height right away for later uses
        // If board has no height, returns
        this.board = [];
        if (cellArray.length == 0) {
            this.boardWidth = 0;
            this.boardHeight = 0;
            return;
        }
        this.boardWidth = cellArray[0].length;
        this.boardHeight = cellArray.length;

        // Iterates through the 2D matrix
        for (let i = 0; i < cellArray.length; i++) {
            this.board.push([]);
            for (let j = 0; j < cellArray[i].length; j++) {
                // For each cell (X, Y), gets its value (0, 1, 2 or 3) 
                // Makes a Component based on the coordinates and value
                let piece = this.makePiece(cellArray[i][j], j, i);
                this.board[i].push(piece)

                // Piece == null means that the cell value is 0 (no piece)
                if (piece == null)
                    continue;

                // Adds to scene graph, and if animate == true, also sets a drop animation (meant for game start)
                this.graph.addPickable(piece, () => this.onPickedPiece(j, i));
                if (animate)
                    animatePieceDrop(piece, this.calculateTileposition(j, i));
            }
        }
    }
    

    toCellArray() {
        // Converts board to cell array (array of array of integers)
        // Used mostly for communication with server
        // For each cell gets the piece value (0, 1, 2 or 3) and adds to array of arrays
        let cells = [];
        for (let i = 0; i < this.board.length; i++) {
            cells.push([])
            for (let j = 0; j < this.board[i].length; j++)
                cells[i].push(this.pieceValue(this.board[i][j]))
        }
        return cells;
    }

    toPieceValueArray(player) {
        // Same as toCellArray but for a player array
        let pieceValues = [];
        player.forEach((piece) => pieceValues.push(this.pieceValue(piece)))
        return pieceValues;
    }

    makePiece(value, x, y) {
        // Makes a piece (Component) of specified value and coordinates
        // If value is 0, returns null

        // Gets the component model to use for the piece, depending on the value
        let piece; 
        switch(value) {
            case 0: return null;
            case 1: piece = this.piece1; break;
            case 2: piece = this.piece2; break; 
            case 3: piece = this.piece3; break;
            default: console.log("ERROR: makePiece called with value = " + value); throw Error();
        }


        // Already calculates Transformation matrix        
        return new Component(this.scene, [piece], this.calculateTileposition(x, y).getMatrix())
    }

    pieceValue(piece) {
        // Converts component to piece value, by checking its child component
        // Null piece is equivalent to value 0
        if (piece == null)
            return 0;
        else if (piece.children[0] == this.piece1)
            return 1;
        else if (piece.children[0] == this.piece2)
            return 2;
        else if (piece.children[0] == this.piece3)
            return 3;
        else console.log("ERROR: Piece value called with piece = " + piece);
    }

    pieceAt(x, y) {
        // Gets piece on the specified coordinates
        // Returns null if (X, Y) is out of bounds
        if (x < 0 || y < 0 || x >= this.boardWidth || y >= this.boardHeight)
            return null;
        return this.board[y][x];
    }

    showValidMoves() {
        // Only allowed when a human is to play
        // Otherwise, the player might mess up the logic
        if (!this.interactable)
            return console.log("Not a human's turn!")

        // Sets an animation for each piece in the valid move list
        // Random delay is used (0-0.5s) so it feels more natural
        this.validMoves.forEach((move) => {
            setTimeout(() => {
                // Gets piece on the coordinates of the move
                // move is of the format [X, Y]
                let piece = this.pieceAt(move[0], move[1]);

                // Checks if piece is null in case something went wrong
                // Otherwise set the animation
                if (piece == null)
                    return;
                piece.setAnimation(this.graph.animations['jumping'])
            }, Math.random() * 500)
        })
    }

    isValidMove(x, y) {
        // Checks if move in [X, Y] is valid by checking if it's contained in the valid moves list.
        // Returns true if move is valid, false otherwise
        for (let i = 0; i < this.validMoves.length; i++) {
            if (this.validMoves[i][0] == x && this.validMoves[i][1] == y)
                return true;
        }
        return false;
    }

    pieceCount(playerPieces, value) {
        // Counts the number of pieces a player has of a certain value
        // Used here only for visual purposes
        let count = 0;
        playerPieces.forEach((piece) => {
            if (this.pieceValue(piece) == value)
                count++;
        });  
        return count;
    }


    calculateTileposition(x, y) {
        // Calculates 3D transformation for a specified board position 
        const pieceSpacing = 1.25;
        // If Y is even, add an offset to the right
        // Will add the misalignment needed for hexagonal pattern
        let offset = (y % 2) ? 0 : pieceSpacing / 2; 

        // (x + 0.5 - this.boardWidth  / 2.0) will center the board on (0, 0, 0)
        return new Translation((x + 0.5 - this.boardWidth  / 2.0) * pieceSpacing + offset, 0, (y + 0.5 - this.boardHeight / 2.0) * pieceSpacing)
    }

    calculatePieceStackPosition(player, value) {
        // Calculates 3D transformation for the next piece 
        // that will be put on top of a specified player stack 
        // Randomizes x and z position so it feels more natural
        switch (player) {
            case 1: return new Translation((value - 2) * 1.5 + Math.random() / 5, 0.26 * this.pieceCount(this.player1, value), 8 + Math.random() / 5);      
            case 2: return new Translation((value - 2) * 1.5 + Math.random() / 5, 0.26 * this.pieceCount(this.player2, value), -8 + Math.random() / 5);      
            default: console.log("Invalid player number: " + player); return null;
        }
    }

    onPickedPiece(x, y) {
        // Function called when piece at (x,y) is picked
        // Must be a human's turn 
        if (!this.interactable)
            return console.log("Not a human's turn!");

        // If move is not valid, adds an animation and returns
        // Also checks if piece exists, in case something wrong happened
        if (!this.isValidMove(x,y)) {
            console.log(`Invalid move (${x} ${y})`);
            if (this.pieceAt(x, y) == null)
                return console.log(`Piece at (${x} ${y}) does not exist`)
            this.pieceAt(x, y).setAnimation(this.graph.animations['invalidmove']);            
            return;
        }

        console.log(`Picked piece at (${x}, ${y}): Value = ${this.pieceValue(this.board[y][x])}`);
        
        // Performs the move, by changing the game structure and setting the animations
        this.performMove(x, y);
    }

    undoMove() {
        // Undoes the last move, or the last two if CPU game
        // Must be a human's turn and at least 1 move must have been made (2 if CPU_HUMAN mode)
        if (!this.interactable)
            return console.log("Not a human's turn!");
        if (this.moveList.length == 0)
            return console.log("No moves were made yet!");
        if (this.moveList.length == 1 && this.mode == this.modes.CPU_HUMAN) 
            return console.log("CPU has made the only move!");


        // Gets the last move from the moveList, and removes it from there
        // Also separates the coordinates
        let lastMove = this.moveList.pop();
        let x = lastMove[0], y = lastMove[1];

        // Checks which player picked last turn and removes the last piece from their array
        // Also pauses the respective timer
        let lastPiece;
        if (this.currentPlayer == 1) {
            lastPiece = this.player2.pop();
            this.player1timer.pause();
            this.currentPlayer = 2;
        }
        else {
            lastPiece = this.player1.pop();
            this.currentPlayer = 1;
            this.player2timer.pause();
        }

        // Rotates the camera, if the functionality is to be used
        if (this.mode == this.modes.HUMAN_HUMAN)
            this.rotateCamera();

        // Puts the piece back in the board structure, and reverses the animation 
        // so visually it goes back to the board too
        this.board[y][x] = lastPiece;
        lastPiece.reverseAnimation();        
        
        // Puts the onPick function back again
        lastPiece.setOnPick(() => this.onPickedPiece(x, y));

        // Disables interaction while JS waits for the server
        // Asks the server for the valid move list, based on the current board
        this.interactable = false;
        getValidMoves(this.toCellArray(), (moves) => {
            // When they arrive, saves the list, reenables interaction, resumes timers
            this.validMoves = moves;
            this.interactable = true;
            if (this.currentPlayer == 1)
                this.player1timer.resume();
            else this.player2timer.resume()
            // If it's CPU's turn, undoes another move so that player can actually undo his move
            // (note that undo is not available on CPU vs CPU)
            if (this.isCpuTurn())
                this.undoMove();
        })
    }

    performMove(x, y)  {
        // First animates the capture of the piece
        // this does not change the game structure
        this.animateCapture(x, y, this.currentPlayer)

        // Change game structure
        // Gets the picked piece and removes the onPick functoin
        let pickedPiece = this.pieceAt(x, y);
        pickedPiece.setOnPick(() => {});

        // adds piece to respective player and pauses his timer
        if (this.currentPlayer == 1) {
            this.player1.push(pickedPiece);
            this.player1timer.pause();
        }
        else {
            this.player2.push(pickedPiece)
            this.player2timer.pause();
        }

        // Removes the piece from board structure
        this.board[y][x] = null;

        // Adds move coordinates to move list
        this.moveList.push([x,y])        

        // Disables interaction while JS waits for the server
        // Asks the server if game has ended, by sending current game board and both player pieces
        this.interactable = false;
        isGameOver(this.toCellArray(), this.toPieceValueArray(this.player1), this.toPieceValueArray(this.player2),
            (winner) => this.setGameOver(winner), // If game over, set Winner
            () => { // If not, gets the valid moves and continues
                getValidMoves(this.toCellArray(), (moves) => {
                    this.validMoves = moves;
                    this.advanceTurn();
                })
            }
        )
    }

    animateCapture(x, y, numPieces) {
        // Gets the piece in the specified coordinates
        let picked = this.pieceAt(x, y);
        // Calculates 3D position, 3D destination, and animates the movement
        // numPieces is the amount of pieces in the player stack
        let currPosition = this.calculateTileposition(x, y);
        let dest =  this.calculatePieceStackPosition(numPieces, this.pieceValue(picked))
        animatePieceCapture(picked, currPosition, dest)
    }

    advanceTurn() {
        // Current player change
        // 0 -> 1, 1 -> 2, 2 -> 1. 
        switch (this.currentPlayer) {
            case 0: this.currentPlayer = 1; break;
            case 1: this.currentPlayer = 2; break;
            case 2: this.currentPlayer = 1; break;
            default: console.log("Invalid current player: " + this.currentPlayer); return;
        }

        // Rotates camera unless game has just started
        if (this.mode == this.modes.HUMAN_HUMAN && this.moveList.length != 0)
            this.rotateCamera();

        // Resumes current player's timer
        if (this.currentPlayer == 1)
            this.player1timer.resume();
        else this.player2timer.resume()

        // Checks if it's CPU's turn based on mode and current player.
        // If it is, gets a move from the server and performs it
        // If it's not, reenables user interaction so he can play
        if (this.isCpuTurn()) {
            getCPUMove(this.toCellArray(), this.toPieceValueArray(this.player1), this.toPieceValueArray(this.player2), this.currentPlayer, this.difficulty, (move) => {
                this.performMove(move[0], move[1])
            })
        }
        else this.interactable = true;
    }

    rotateCamera() {
        // Rotates the camera on the Y axis by -180 degrees
        // If player 2's turn, rotates on the opposite direction      
        if (this.currentPlayer == 1)
            this.scene.animateCameraOrbit(-Math.PI, CGFcameraAxisID.Y, 1);
        else this.scene.animateCameraOrbit(Math.PI, CGFcameraAxisID.Y, 1)
    }

    isCpuTurn() {
        // Checks the mode and current player to determine whether or not it's CPU's turn        
        switch (this.mode) {
            case this.modes.CPU_CPU: return true;
            case this.modes.CPU_HUMAN: return this.currentPlayer == 1;
            case this.modes.HUMAN_CPU:  return this.currentPlayer == 2;
            case this.modes.HUMAN_HUMAN: return false;
        }
    }


    setGameOver(winner) {
        // Adds a win to the wincounter, unless it's a tie
        switch (winner) {
            case 0: console.log("Tie!"); break;       
            case 1: console.log("P1 won!"); this.wincounter.addP1win(); break;
            case 2: console.log("P2 won!"); this.wincounter.addP2win(); break;
            default: console.log("Invalid winner: " + winner); break;
        }

        // Changes state and interactable flag so user does not mess anything up
        this.gameState = this.gameStates.OVER;
        this.interactable = false;

        // Changes camera back to free look
        this.scene.setCamera('SpectatorCamera', true);
    }

    updateCamera() {
        // Sets scene camera depending on the current mode
        // For the Human VS Human mode, also changes the position of the camera 
        // based on the cameras defined in the scene graph and current player
        // Used for when the scene switches or game starts
        switch (this.mode) {
            case this.modes.CPU_CPU: this.scene.setCamera('SpectatorCamera', true); break;
            case this.modes.CPU_HUMAN: this.scene.setCamera('P2Camera', false); break;
            case this.modes.HUMAN_CPU:  this.scene.setCamera('P1Camera', false); break;
            case this.modes.HUMAN_HUMAN: 
                this.scene.setCamera('RotatableCamera', false);
                if (this.currentPlayer == 2)
                    this.graph.views['RotatableCamera'].position = this.graph.views['P2Camera'].position
                else this.graph.views['RotatableCamera'].position = this.graph.views['P1Camera'].position
                break;
        }

    }
}
