function viewFollowsByUser(fields) {
    fetch(`/api/follows?username=${fields.username}`)
        .then(showResponse)
        .catch(showResponse);
}

function follow(fields) {
    fetch('/api/follows', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
        .then(showResponse)
        .catch(showResponse);
}

function unfollow(fields) {
    fetch(`/api/follows/${fields.username}`, {method: 'DELETE'})
        .then(showResponse)
        .catch(showResponse);
}
