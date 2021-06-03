exports.email = (value) => {
    if (typeof (value) !== 'undefined' && typeof (value) === 'string' && value !== null) {
        return value.toLowerCase().trim()
    } else {
        return;
    };
};

exports.unlink = (value) => {
    return JSON.parse(JSON.stringify(value));
}