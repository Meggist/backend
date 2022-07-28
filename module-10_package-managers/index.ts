import moment = require('moment');

function getDay(date) {
    return moment(date).day();
}

export = getDay;