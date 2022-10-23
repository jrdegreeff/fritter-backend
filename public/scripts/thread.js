function viewThreadById(fields) {
    fetch(`/api/threads?freetId=${fields.freetId}`)
        .then(showResponse)
        .catch(showResponse);
}
