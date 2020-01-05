
function animateRestart(board, tilePositionCalc) {
    let totalPieces = countTotalPieces(board);

    // Animates a game restart
    // -> Move: All pieces stacks up in the edge of the board, one at a time
    // -> Crush: All the pieces are crushed down into one
    // -> Scale: The piece grows larger and goes to the center of the board, at Y = 15
    let moveInterval = 0.1;
    let moveDuration = 1;
    let crushDuration = 0.8;
    let scaleToCenterDuration = 2;
    
    let pieceNo = 0;
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            let piece = board[y][x];
            if (piece == null)
                continue;

            // Receives the tilePosCalculator function so that 
            // it knows where the piece at X,Y previously was
            let currPosition = tilePositionCalc(x, y);
            let dest =  new Translation(-7.5, 0.26 * pieceNo, 0)

            // calculate its position on the tower
            let movement = new Translation(dest.x - currPosition.x, dest.y - currPosition.y, dest.z - currPosition.z) 

            let finalScale = Math.random() * 5 + 1;
    
            piece.setAnimation(new MyAnimation([
                new DefaultKeyFrame(pieceNo * moveInterval),
                new KeyFrame(pieceNo * moveInterval + moveDuration / 2,
                    new AnimTranslation(movement.x / 2, movement.y / 2 + 6, movement.z / 2),
                    new AnimRotation(0,0,0),
                    new AnimScale(1,1,1)
                ),
                new KeyFrame(pieceNo * moveInterval + moveDuration,
                    new AnimTranslation(movement.x, movement.y, movement.z),
                    new AnimRotation(0,0,0),
                    new AnimScale(1,1,1)
                ),
                // When all are on top
                new KeyFrame(moveDuration + (totalPieces * moveInterval),
                    new AnimTranslation(movement.x, movement.y, movement.z),
                    new AnimRotation(0,0,0),
                    new AnimScale(1,1,1)
                ),               
                // Crush 
                new KeyFrame(moveDuration + crushDuration + (totalPieces * moveInterval),
                    new AnimTranslation(movement.x, movement.y - 0.26 * pieceNo, movement.z),
                    new AnimRotation(0,0,0),
                    new AnimScale(1,1,1)
                ),
                // Scale
                new KeyFrame(scaleToCenterDuration + moveDuration + crushDuration + (totalPieces * moveInterval),
                    new AnimTranslation(movement.x + 7.5, movement.y - 0.26 * pieceNo + 15, movement.z),
                    new AnimRotation(0,0,0),
                    new AnimScale(finalScale, finalScale, finalScale)
                )
            ], 1))
            pieceNo++;    
        }
    }
    return moveDuration + crushDuration + scaleToCenterDuration + totalPieces * moveInterval;
}

function countTotalPieces(board) {
    // Counts the number of pieces on board
    // that is, Every element that's not null
    let count = 0;
    for (let y = 0; y < board.length; y++)
        for (let x = 0; x < board[y].length; x++)
            if (board[y][x] != null)
                count++;
    return count;
}

function animatePieceCapture(piece, currPosition, dest) {
    // Animates a piece capture
    // Receives a piece, current position and destination, as transformation
    // Calculates movement
    let movement = new Translation(dest.x - currPosition.x, dest.y - currPosition.y, dest.z - currPosition.z)

    // Animation will be an arc animation, with a spin rotation at the same time
    // After 1 second it will be at the top, halfway, and another second to drop to the destination
    piece.setAnimation(new MyAnimation([
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

function animatePieceDrop(piece, dest) {
    // Drops a piece to it's destination
    let startPos = new Translation(0, 15, 0);
    let animIni = new Translation(startPos.x - dest.x, startPos.y - dest.y, startPos.z - dest.z)
    
    // Starts at (0,15,0), with a random scale from 1 to 5
    // Drops to the floor after 0.6s
    // Scales down in 0.2s and moves to the correct position in the board in the same timeframe
    let scale = Math.random() * 5 + 1
    piece.setAnimation(new MyAnimation([
        new KeyFrame(0,
            new AnimTranslation(animIni.x, animIni.y, animIni.z),
            new AnimRotation(0,0,0),
            new AnimScale(scale,scale,scale)
        ),
        new KeyFrame(0.6,
            new AnimTranslation(animIni.x, 0, animIni.z),
            new AnimRotation(0,0,0),
            new AnimScale(scale,scale,scale)
        ),
        new KeyFrame(0.8,
            new AnimTranslation(0, 0, 0),
            new AnimRotation(0,0,0),
            new AnimScale(1,1,1)
        ),
    ], 1))
    piece.update(new Date().getTime())
}
