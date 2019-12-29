
function animateRestart(board, tilePositionCalc) {
    let totalPieces = countTotalPieces(board);

    let moveInterval = 0.1;
    let moveDuration = 1;
    let crushDuration = 0.8;

    let pieceNo = 0;
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            let piece = board[y][x];
            if (piece == null)
                continue;

            let currPosition = tilePositionCalc(x, y);
            let dest =  new Translation(Math.random() * 0.2 - 7.5, 0.26 * pieceNo, Math.random() * 0.2)
            let movement = new Translation(dest.x - currPosition.x, dest.y - currPosition.y, dest.z - currPosition.z)
    
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
                new KeyFrame(moveDuration + crushDuration * 0.9 + (totalPieces * moveInterval),
                    new AnimTranslation(movement.x, movement.y, movement.z),
                    new AnimRotation(0,0,0),
                    new AnimScale(0.1,1,0.1)
                ),
                new KeyFrame(moveDuration + crushDuration + (totalPieces * moveInterval),
                    new AnimTranslation(movement.x, movement.y, movement.z),
                    new AnimRotation(0,0,0),
                    new AnimScale(0,0,0)
                ),
            ], 1))
            pieceNo++;    
        }
    }
    return moveDuration + crushDuration + totalPieces * (moveInterval);
}

function countTotalPieces(board) {
    let count = 0;
    for (let y = 0; y < board.length; y++)
        for (let x = 0; x < board[y].length; x++)
            if (board[y][x] != null)
                count++;
    return count;
}

function animatePieceCapture(piece, currPosition, dest) {
    let movement = new Translation(dest.x - currPosition.x, dest.y - currPosition.y, dest.z - currPosition.z)

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
    let startPos = new Translation(0, 15, 0);
    let animIni = new Translation(startPos.x - dest.x, startPos.y - dest.y, startPos.z - dest.z)

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
