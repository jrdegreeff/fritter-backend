function viewThreadById(fields) {
    fetch(`/api/thread?freet=${fields.freetId}`)
        .then(showResponse)
        .catch(showResponse);
}
