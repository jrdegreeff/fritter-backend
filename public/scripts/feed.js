function getFeedByName(fields) {
    fetch(`/api/feeds/${fields.name}`)
        .then(showResponse)
        .catch(showResponse);
}

function createFeed(fields) {
    fetch('/api/feeds', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
        .then(showResponse)
        .catch(showResponse);
}

function updateFeed(fields) {
    fetch(`/api/feeds/${fields.name}`, {method: 'PATCH', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
        .then(showResponse)
        .catch(showResponse);
}

function deleteFeed(fields) {
    fetch(`/api/feeds/${fields.name}`, {method: 'DELETE'})
        .then(showResponse)
        .catch(showResponse);
}
