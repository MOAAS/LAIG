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
        this.replayButton = new ToggleButton(this.scene, this.graph, new Translation(8, 0, -4), () => this.replay())
        this.showValidMovesButton = new SimpleButton(this.scene, this.graph, new Translation(8, 0, -1.35), () => this.showValidMoves())
        this.undoButton = new SimpleButton(this.scene, this.graph, new Translation(8, 0, 1.35), () => this.undoMove())
        this.mode1button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, -4.25), new Scale(0.8, 0.8, 0.8)]), () => this.changeMode(1))
        this.mode2button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, -2.75), new Scale(0.8, 0.8, 0.8)]), () => this.changeMode(2))
        this.mode3button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, -1.250), new Scale(0.8, 0.8, 0.8)]), () => this.changeMode(3))
        this.mode4button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, 0.25), new Scale(0.8, 0.8, 0.8)]), () => this.changeMode(4))
        this.modebuttons = [this.mode1button, this.mode2button, this.mode3button, this.mode4button];
        
        this.easybutton = new ToggleButton(this.scene, this.graph, new Translation(11, 0, 3), () => { this.difficulty = 0; this.easybutton.disable(); this.hardbutton.enable(); this.hardbutton.toggleUp() })
        this.hardbutton = new ToggleButton(this.scene, this.graph, new Translation(11, 0, 4.5), () => { this.difficulty = 1; this.hardbutton.disable(); this.easybutton.enable(); this.easybutton.toggleUp() })
        this.hardbutton.press();

        this.restartbutton = new SimpleButton(this.scene, this.graph, new Translation(8, 0, 4), () => this.restart()) 
    }

    makeTimers() {
        this.player1timer = new GameTimer(this.scene, this.graph, new Translation(-9, 0, 4))
        this.player2timer = new GameTimer(this.scene, this.graph, new Translation(-9, 0, -4))
        this.wincounter = new GameCounter(this.scene, this.graph, new Translation(-9, 0, 0))

        this.graph.addComponent(this.player1timer);
        this.graph.addComponent(this.player2timer);
        this.graph.addComponent(this.wincounter);
    }

    update(t) {
        // Replay button
        if (this.gameState == this.gameStates.OVER) {
            this.replayButton.enable()
            this.restartbutton.enable()
        }
        else {
            this.replayButton.disable();       
            this.restartbutton.disable()
        } 

        // Undo button
        if (!this.interactable || this.moveList.length == 0 || (this.moveList.length == 1 && this.mode == this.modes.CPU_HUMAN)) 
           this.undoButton.disable();
        else this.undoButton.enable()

        // Show valid moves button
        if (!this.interactable) 
           this.showValidMovesButton.disable();
        else this.showValidMovesButton.enable()

        if (this.interactable || this.gameState == this.gameStates.OVER || this.gameState == this.gameStates.IDLE)
            this.modebuttons.forEach(button => button.enable())
        else this.modebuttons.forEach(button => button.disable())

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

        // For each player piece, copies its transformation matrix and animation state to the new piece
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

        this.player1 = copyPlayer(this.player1, P1PieceValues);
        this.player2 = copyPlayer(this.player2, P2PieceValues);

        // Reposition camera
        this.updateCamera();

        // setup buttons and timers... todo
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
        let modeButton = this.modebuttons[mode - 1];
        this.modebuttons.forEach(button => {
            if(button != modeButton)
                button.toggleUp()
        });
        modeButton.toggleDown();

        // Changes mode        
        this.mode = mode;

        // Starts the game
        this.start()
    }

    replay() {
        // Replays allowed only if the game has ended
        if (this.gameState != this.gameStates.OVER)
            return console.log("Cannot replay!")

        this.gameState = this.gameStates.REPLAYING
        this.interactable = false;
        this.player1.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));
        this.player2.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));

        setTimeout(() => {
            this.clearBoard();
            this.createBoard(this.initialBoard, false);
        }, 3000)


        let timePerMove = 750;
        for (let i = 0, turn = 1; i < this.moveList.length; i++, turn = turn % 2 + 1) {
            setTimeout(() => {
                let x = this.moveList[i][0], y = this.moveList[i][1];
                this.animateCapture(x, y, turn);

                if (turn == 1)
                    this.player1.push(this.pieceAt(x, y));
                else this.player2.push(this.pieceAt(x, y))
            }, i * timePerMove + 4000)    
        }
        setTimeout(() => {
            this.gameState = this.gameStates.OVER;
            this.replayButton.toggleUp()
        }, timePerMove * this.moveList.length + 5000)
    }

    restart() {
        this.gameState = this.gameStates.RESTARTING;
        this.player1.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));
        this.player2.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));

        setTimeout(() => {
            this.clearBoard();
            this.createBoard(this.initialBoard, false);
            let totalDuration = animateRestart(this.board, (x, y) => this.calculateTileposition(x,y));
            setTimeout( () => { this.start(); }, totalDuration * 1000);
        }, 3000)

    }

    start() {
        this.interactable = false;
        this.moveList = [];
        this.gameState = this.gameStates.PLAYING
        this.currentPlayer = 0;
        this.player1timer.reset(5, 0);
        this.player2timer.reset(5, 0);

        this.updateCamera();
        
        getNewBoard((cellArray) => {
            this.clearBoard();
            this.createBoard(cellArray, true)
            setTimeout( () => {
                getValidMoves(this.toCellArray(), (moves) => {
                    this.validMoves = moves;
                    this.advanceTurn();
                })
            }, 1000);
        });
    }

    clearBoard() {
        this.player1.forEach(piece => this.graph.removeComponentFromRoot(piece));
        this.player2.forEach(piece => this.graph.removeComponentFromRoot(piece));
        this.board.forEach(row => {
            row.forEach(piece => this.graph.removeComponentFromRoot(piece))
        });
        this.player1 = [];
        this.player2 = [];
        this.board = [];
    }

    createBoard(cellArray, animate) {
        this.board = [];
        this.initialBoard = cellArray;
        if (cellArray.length == 0) {
            this.boardWidth = 0;
            this.boardHeipght = 0;
            return;
        }

        this.boardWidth = cellArray[0].length;
        this.boardHeight = cellArray.length;

        for (let i = 0; i < cellArray.length; i++) {
            this.board.push([]);
            for (let j = 0; j < cellArray[i].length; j++) {
                let piece = this.makePiece(cellArray[i][j], j, i);
                this.board[i].push(piece)
                if (piece == null)
                    continue;
                this.graph.addPickable(piece, () => this.onPickedPiece(j, i));
                if (animate)
                    animatePieceDrop(piece, this.calculateTileposition(j, i));
            }
        }
    }
    

    toCellArray() {
        let cells = [];
        for (let i = 0; i < this.board.length; i++) {
            cells.push([])
            for (let j = 0; j < this.board[i].length; j++)
                cells[i].push(this.pieceValue(this.board[i][j]))
        }
        return cells;
    }

    toPieceValueArray(player) {
        let pieceValues = [];
        player.forEach((piece) => pieceValues.push(this.pieceValue(piece)))
        return pieceValues;
    }

    makePiece(value, x, y) {
        let piece;
        switch(value) {
            case 0: return null;
            case 1: piece = this.piece1; break;
            case 2: piece = this.piece2; break; 
            case 3: piece = this.piece3; break;
            default: console.log("ERROR: makePiece called with value = " + value); throw Error();
        }
        
        return new Component(this.scene, [piece], this.calculateTileposition(x, y).getMatrix())
    }

    pieceValue(piece) {
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
        if (x < 0 || y < 0 || x >= this.boardWidth || y >= this.boardHeight)
            return null;
        return this.board[y][x];
    }

    showValidMoves() {
        if (!this.interactable)
            return console.log("Not a human's turn!")
        this.validMoves.forEach((move) => {
            setTimeout(() => {
                let piece = this.pieceAt(move[0], move[1]);
                if (piece == null)
                    return;
                piece.setAnimation(this.graph.animations['jumping'])
            }, Math.random() * 500)
        })
    }

    isValidMove(x, y) {
        for (let i = 0; i < this.validMoves.length; i++) {
            if (this.validMoves[i][0] == x && this.validMoves[i][1] == y)
                return true;
        }
        return false;
    }

    pieceCount(playerPieces, value) {
        let count = 0;
        playerPieces.forEach((piece) => {
            if (this.pieceValue(piece) == value)
                count++;
        });  
        return count;
    }


    calculateTileposition(x, y) {
        const pieceSpacing = 1.25;
        let offset = (y % 2) ? 0 : pieceSpacing / 2; // y par -> chega para a direita
        return new Translation((x + 0.5 - this.boardWidth  / 2.0) * pieceSpacing + offset, 0, (y + 0.5 - this.boardHeight / 2.0) * pieceSpacing)
    }

    calculatePieceStackPosition(player, value) {
        switch (player) {
            case 1: return new Translation((value - 2) * 1.5 + Math.random() / 5, 0.26 * this.pieceCount(this.player1, value), 8 + Math.random() / 5);      
            case 2: return new Translation((value - 2) * 1.5 + Math.random() / 5, 0.26 * this.pieceCount(this.player2, value), -8 + Math.random() / 5);      
            default: console.log("Invalid player number: " + player); return null;
        }
    }

    onPickedPiece(x, y) {
        if (!this.interactable)
            return console.log("Not a human's turn!");

        if (!this.isValidMove(x,y)) {
            console.log(`Invalid move (${x} ${y})`);
            if (this.pieceAt(x, y) == null)
                return console.log(`Piece at (${x} ${y}) does not exist`)
            this.pieceAt(x, y).setAnimation(this.graph.animations['invalidmove']);            
            return;
        }

        console.log(`Picked piece at (${x}, ${y}): Value = ${this.pieceValue(this.board[y][x])}`);
        this.performMove(x, y);

    }

    undoMove() {
        if (!this.interactable)
            return console.log("Not a human's turn!");
        if (this.moveList.length == 0)
            return console.log("No moves were made yet!");
        if (this.moveList.length == 1 && this.mode == this.modes.CPU_HUMAN) 
            return console.log("CPU has made the only move!");


        let lastMove = this.moveList.pop();
        let x = lastMove[0], y = lastMove[1];

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
        if (this.mode == this.modes.HUMAN_HUMAN)
            this.rotateCamera();

        this.board[y][x] = lastPiece;
        lastPiece.setOnPick(() => this.onPickedPiece(x, y));
        lastPiece.reverseAnimation();        

        this.interactable = false;
        getValidMoves(this.toCellArray(), (moves) => {
            this.validMoves = moves;
            this.interactable = true;
            if (this.currentPlayer == 1)
                this.player1timer.resume();
            else this.player2timer.resume()
            if (this.isCpuTurn())
                this.undoMove();
        })
    }

    performMove(x, y)  {
        this.animateCapture(x, y, this.currentPlayer)

        // Change game structure

        let pickedPiece = this.pieceAt(x, y);
        pickedPiece.setOnPick(() => {});

        if (this.currentPlayer == 1) {
            this.player1.push(pickedPiece);
            this.player1timer.pause();
        }
        else {
            this.player2.push(pickedPiece)
            this.player2timer.pause();
        }

        this.board[y][x] = null;
        this.moveList.push([x,y])        

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
        let picked = this.pieceAt(x, y);
        let currPosition = this.calculateTileposition(x, y);
        let dest =  this.calculatePieceStackPosition(numPieces, this.pieceValue(picked))
        animatePieceCapture(picked, currPosition, dest)
    }

    advanceTurn() {
        switch (this.currentPlayer) {
            case 0: this.currentPlayer = 1; break;
            case 1: this.currentPlayer = 2; break;
            case 2: this.currentPlayer = 1; break;
            default: console.log("Invalid current player: " + this.currentPlayer); return;
        }

        if (this.mode == this.modes.HUMAN_HUMAN && this.moveList.length != 0)
            this.rotateCamera();

        if (this.currentPlayer == 1)
            this.player1timer.resume();
        else this.player2timer.resume()

        if (this.isCpuTurn()) {
            getCPUMove(this.toCellArray(), this.toPieceValueArray(this.player1), this.toPieceValueArray(this.player2), this.currentPlayer, this.difficulty, (move) => {
                this.performMove(move[0], move[1])
            })
        }
        else this.interactable = true;
    }

    rotateCamera() {
        if (this.currentPlayer == 1)
            this.scene.animateCameraOrbit(-Math.PI, CGFcameraAxisID.Y, 1);
        else this.scene.animateCameraOrbit(Math.PI, CGFcameraAxisID.Y, 1)
    }

    isCpuTurn() {
        switch (this.mode) {
            case this.modes.CPU_CPU: return true;
            case this.modes.CPU_HUMAN: return this.currentPlayer == 1;
            case this.modes.HUMAN_CPU:  return this.currentPlayer == 2;
            case this.modes.HUMAN_HUMAN: return false;
        }
    }


    setGameOver(winner) {
        switch (winner) {
            case 0: console.log("Tie!"); break;       
            case 1: console.log("P1 won!"); this.wincounter.addP1win(); break;
            case 2: console.log("P2 won!"); this.wincounter.addP2win(); break;
            default: console.log("Invalid winner: " + winner); break;
        }

        this.gameState = this.gameStates.OVER;
        this.interactable = false;
        this.scene.setCamera('SpectatorCamera', true);
    }

    updateCamera() {
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
