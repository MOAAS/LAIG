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
        this.replaying = false;

        this.currentPlayer = 0;

        this.gameStates = {
            IDLE: 1,
            PLAYING: 2,
            P1_WON: 3,
            P2_WON: 4,
            TIE: 5,            
        };
        this.gameState = this.gameStates.IDLE;

        this.modes = {
            HUMAN_HUMAN: 1,
            CPU_HUMAN: 2,
            HUMAN_CPU: 3,
            CPU_CPU: 4
        }

       // this.gameEnvironment = new GameEnvironment(this.scene, this.graph, this)
        this.replayButton = new ToggleButton(this.scene, this.graph, new Translation(8, 0, -3).getMatrix(), () => this.replay())
        this.showValidMovesButton = new SimpleButton(this.scene, this.graph, new Translation(8, 0, 0).getMatrix(), () => this.showValidMoves())
        this.undoButton = new SimpleButton(this.scene, this.graph, new Translation(8, 0, 3).getMatrix(), () => this.undoMove())
        this.mode1button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, -2.25), new Scale(0.8, 0.8, 0.8)]).getMatrix(), () => this.changeMode(1))
        this.mode2button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, -0.75), new Scale(0.8, 0.8, 0.8)]).getMatrix(), () => this.changeMode(2))
        this.mode3button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, 0.750), new Scale(0.8, 0.8, 0.8)]).getMatrix(), () => this.changeMode(3))
        this.mode4button = new ToggleButton(this.scene, this.graph, new TransformationGroup([new Translation(11, 0, 2.25), new Scale(0.8, 0.8, 0.8)]).getMatrix(), () => this.changeMode(4))
        this.modebuttons = [this.mode1button, this.mode2button, this.mode3button, this.mode4button];
        
        this.changeMode(this.modes.HUMAN_HUMAN)
    }

    update(t) {
        // Replay button
        if (this.gameState == this.gameStates.PLAYING || this.gameState == this.gameStates.IDLE)
            this.replayButton.disable()
        else this.replayButton.enable();        
        if (!this.replaying)
            this.replayButton.toggleUp()

        // Undo button
        if (!this.interactable || this.moveList.length == 0 || (this.moveList.length == 1 && this.mode == this.modes.CPU_HUMAN)) 
           this.undoButton.disable();
        else this.undoButton.enable()

        // Show valid moves button
        if (!this.interactable) 
           this.showValidMovesButton.disable();
        else this.showValidMovesButton.enable()

        if (this.interactable || this.gameState != this.gameStates.PLAYING)
            this.modebuttons.forEach(button => button.enable())
        else this.modebuttons.forEach(button => button.disable())
    }

    changeMode(mode) {
        let modeButton = this.modebuttons[mode - 1];
        this.modebuttons.forEach(button => {
            if(button != modeButton)
                button.toggleUp()
        });
        modeButton.toggleDown();
        this.mode = mode;
        console.log("mode " + this.mode)
        this.start();
    }

    replay() {
        if (this.gameState == this.gameStates.PLAYING)
            return console.log("Currently in-game!")
        if (this.replaying)
            return console.log("Already replaying!")
    
        this.interactable = false;
        this.replaying = true;

        this.player1.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));
        this.player2.forEach(piece => setTimeout(() => piece.reverseAnimation(), Math.random() * 750));

        setTimeout(() => {
            this.clearBoard();
            this.createBoard(this.initialBoard);
        }, 3000)


        let timePerMove = 750;
        for (let i = 0, turn = 1; i < this.moveList.length; i++, turn = turn % 2 + 1) {
            setTimeout(() => {
                let x = this.moveList[i][0], y = this.moveList[i][1];
                this.animatePieceCapture(x, y, turn);

                if (turn == 1)
                    this.player1.push(this.pieceAt(x, y));
                else this.player2.push(this.pieceAt(x, y))
            }, i * timePerMove + 4000)    
        }
        setTimeout(() => this.replaying = false, timePerMove * this.moveList.length + 7500)
    }

    start() {
        this.interactable = false;
        this.clearBoard();
        this.gameState = this.gameStates.PLAYING
        this.currentPlayer = 0;
        getNewBoard((cellArray) => {
            this.createBoard(cellArray)
            getValidMoves(this.toCellArray(), (moves) => {
                this.validMoves = moves;
                this.advanceTurn();
            })
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

    createBoard(cellArray) {
        this.initialBoard = cellArray;
        this.boardWidth = cellArray[0].length;
        this.boardHeight = cellArray.length;

        for (let i = 0; i < cellArray.length; i++) {
            this.board.push([]);
            for (let j = 0; j < cellArray[i].length; j++) {
                let piece = this.makePiece(cellArray[i][j], j, i);
                this.board[i].push(piece)
                if (piece != null)
                    this.graph.addPickable(piece, () => this.onPickedPiece(j, i));
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
            let piece = this.pieceAt(move[0], move[1]);
            setTimeout(() => {
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
        if (!this.interactable) {
            console.log("Not a human's turn!");
            return;
        }
        
        if (!this.isValidMove(x,y)) {
            console.log(`Invalid move (${x} ${y})`);
            this.pieceAt(x, y).setAnimation(this.graph.animations['invalidmove']);            
            return;
        }

        this.performMove(x, y);
        console.log(`Picked piece at (${x}, ${y}): Value = ${this.pieceValue(this.board[y][x])}`);

    }

    canUndo() {
        if (!this.interactable)
            return false;
        if (this.moveList.length == 0)
            return false;
        if (this.moveList.length == 1 && this.mode == this.modes.CPU_HUMAN) 
            return false;
        return true;
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
            this.currentPlayer = 2;
        }
        else {
            lastPiece = this.player1.pop();
            this.currentPlayer = 1;
        }

        this.board[y][x] = lastPiece;
        lastPiece.setOnPick(() => this.onPickedPiece(x, y));
        lastPiece.reverseAnimation();        

        this.interactable = false;
        getValidMoves(this.toCellArray(), (moves) => {
            this.validMoves = moves;
            this.interactable = true;
            if (this.isCpuTurn())
                this.undoMove();
        })
    }

    performMove(x, y)  {
        this.animatePieceCapture(x, y, this.currentPlayer)

        // Change game structure

        let pickedPiece = this.pieceAt(x, y);
        pickedPiece.setOnPick(() => {});

        if (this.currentPlayer == 1)
            this.player1.push(pickedPiece);
        else this.player2.push(pickedPiece)
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

    animatePieceCapture(x, y, numPieces) {
        let picked = this.pieceAt(x, y);

        let currPosition = this.calculateTileposition(x, y);
        let dest =  this.calculatePieceStackPosition(numPieces, this.pieceValue(picked))
        let movement = new Translation(dest.x - currPosition.x, dest.y - currPosition.y, dest.z - currPosition.z)

        picked.setAnimation(new MyAnimation([
            new KeyFrame(1,
                new AnimTranslation(movement.x / 2, movement.y / 2 + 8, movement.z / 2),
                new AnimRotation(Math.PI * 6,0,0),
                new AnimScale(1,1,1)
            ),
            new KeyFrame(2,
                new AnimTranslation(movement.x, movement.y, movement.z),
                new AnimRotation(Math.PI * 12,0,0),
                new AnimScale(1,1,1)
            ),
        ], 1))
    }

    advanceTurn() {
        switch (this.currentPlayer) {
            case 0: this.currentPlayer = 1; break;
            case 1: this.currentPlayer = 2; break;
            case 2: this.currentPlayer = 1; break;
            default: console.log("Invalid current player: " + this.currentPlayer); return;
        }

       // this.updateCamera();

        if (this.isCpuTurn()) {
            getCPUMove(this.toCellArray(), this.toPieceValueArray(this.player1), this.toPieceValueArray(this.player2), this.currentPlayer, (move) => {
                this.performMove(move[0], move[1])
            })
        }
        else this.interactable = true;
    }

    updateCamera() {
        if (this.currentPlayer == 1)
            this.graph.getRootComponent().setAnimation(this.graph.animations['cameraswitchtoP1'])
        else this.graph.getRootComponent().setAnimation(this.graph.animations['cameraswitchtoP2'])
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
            case 0: this.gameState = this.gameStates.TIE; break;
            case 1: this.gameState = this.gameStates.P1_WON; break;
            case 2: this.gameState = this.gameStates.P2_WON; break;
            default: console.log("Invalid winner: " + winner); break;
        }
        console.log("GAME OVER, WINNER = " + winner);
    }

}
