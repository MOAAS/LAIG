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
    console.log(board)
    sendPrologRequest('validMovesPLS(' + JSON.stringify(board) +  ')', (response) => {
        console.log(response)
        //console.log(response.replace('[', '[[').replace(']', ']]').replaceAll(',', '],[').replaceAll('-', ','))
        onLoad(JSON.parse(response))
    });
}