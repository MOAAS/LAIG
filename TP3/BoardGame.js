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
    }

    update(t) {

    }

    start() {             
/*
        let shinyGreen =  this.graph.materials['shinyGreen'];
        let grayDiffuse =  this.graph.materials['graydiff'];
        let toggleMaterial = function(piece) {
            if (piece.material == shinyGreen)
                piece.material = grayDiffuse
            else piece.material = shinyGreen;
        }

        */

        let piece4 = new Component(
            this.scene, 
            [new MySphere(this.scene, 100, 100,2)], 
            new TransformationGroup([
                new Translation(15,0,0),
                new Scale(2,2,2),
            ]).getMatrix(),
            null,
            this.graph.materials['browndiff']
        );

        this.scene.addPickable(new Pickable(piece4, () => sendPrologRequest('quit', null)))
        
        //this.scene.addPickable(new Pickable(piece1, () => toggleMaterial(piece1)))
        //this.scene.addPickable(new Pickable(piece2, () => toggleMaterial(piece2)))
        //this.scene.addPickable(new Pickable(piece3, () => toggleMaterial(piece3)))



        getNewBoard((cellArray) => this.createBoard(cellArray));


    }

    createBoard(cellArray) {
        this.boardWidth = cellArray[0].length;
        this.boardHeight = cellArray.length;

       // console.log(cellArray)
        this.board = [];
        for (let i = 0; i < cellArray.length; i++) {
            this.board.push([]);
            for (let j = 0; j < cellArray[i].length; j++) {
                let piece = this.makePiece(cellArray[i][j], j, i);
                this.board[i].push(piece)
                if (piece != null)
                    this.scene.addPickable(piece);
            }
        }
        getValidMoves(this.toCellArray(), (response) => console.log(response));
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

    pieceAt(x, y) {
        if (x <= 0 || y <= 0 || x > this.boardWidth || y > this.boardHeight)
            return null;
        return this.board[y][x];
    }

    calculate3Dposition(x, y) {
        const pieceSpacing = 1.25;
        let offset = (y % 2) ? pieceSpacing / 2 : 0;

        return new Translation((x + 0.5 - this.boardWidth  / 2.0) * pieceSpacing + offset, 0, (y + 0.5 - this.boardHeight / 2.0) * pieceSpacing)
    }

    makePiece(value, x, y) {
        let component;
        switch(value) {
            case 0: return null;
            case 1: component = this.piece1; break;
            case 2: component = this.piece2; break; 
            case 3: component = this.piece3; break;
            default: console.log("ERROR: Make piece called with value = " + value); throw Error();
        }
        
        return new Pickable(new Component(this.scene, [component], this.calculate3Dposition(x, y).getMatrix()), () => this.pickedPiece(x, y));
    }

    pieceValue(piece) {
        //console.log(piece);
        if (piece == null)
            return 0;
        else if (piece.component.children[0] == this.piece1)
            return 1;
        else if (piece.component.children[0] == this.piece2)
            return 2;
        else if (piece.component.children[0] == this.piece3)
            return 3;
        else console.log("ERROR: Piece value called with piece = " + piece);
    }

    pickedPiece(x, y) {        
        console.log(`Picked piece at ${x} ${y}: ${this.pieceValue(this.board[y][x])}`);
    }

}
