
//TODO: Accept Data attribute with route
function makeGetRequest(route) {
    if(!route) {
        console.error("XHR get fn: The route parameter is required");
        return;
    }

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', route, true);

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

module.exports = {
    get: makeGetRequest
}