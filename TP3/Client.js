function sendPrologRequest(requestString, onSuccess, onError, port)
{
    var requestPort = port || 8081
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

    if (onSuccess == null)
        request.onload = function(data){console.log("Request successful. Reply: " + data.target.response);}
    else request.onload = function(data) { onSuccess(data.target.response) }
    request.onerror = onError || function(){console.log("Error waiting for response");};

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

function getNewBoard(onLoad) {
    sendPrologRequest('start', (response) => { 
        onLoad(JSON.parse(response.split('-')[0]));
    });
}

function getValidMoves(board, onLoad) {
    sendPrologRequest('validMovesPLS(' + JSON.stringify(board) +  ')', (response) => {
        response = response.replace('[', '[[');
        response = response.replace(']', ']]');
        response = response.replace(/,/g, '],[');
        response = response.replace(/-/g, ',');
        let moves = JSON.parse(response);
        moves.forEach(move => { move[0]--; move[1]--; });
        onLoad(moves)
    });
}

function isGameOver(board, player1, player2, onYes, onNo) {
    let game = JSON.stringify(board) + '-[' + JSON.stringify(player1) + ',' + JSON.stringify(player2) + ']';
    sendPrologRequest('isGameOver(' + game +  ')', (response) => {
        let parsed = JSON.parse(response);
        if (parsed[0] == 1) {
            onYes(parsed[1])
        }
        else onNo();
    });
}

function getCPUMove(board, player1, player2, playerToMove, onLoad) {
    let game = JSON.stringify(board) + '-[' + JSON.stringify(player1) + ',' + JSON.stringify(player2) + ']';
    sendPrologRequest('movePLS(' + game +  ',' + playerToMove + ')', (response) => {
        let move = JSON.parse('[' + response.replace('-', ',') + ']')
        onLoad([move[0]-1, move[1]-1]);
    });
}
