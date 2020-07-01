let today = new Date();

exports.getDate = function () {
    let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return day = today.toLocaleDateString('en-US', options);
}

exports.getDay = function () {
    let options = {
        weekday: 'long',
    };

    return day = today.toLocaleDateString('en-US', options);
}