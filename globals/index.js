global.jsonResponse = function (res, code, data) {
    return res.status(code).json(data);
};

global.successRes = function(response) {
    return {
        status: 200,
        description: "SUCCESS",
        response
    }
}

global.errorRes = function(response) {
    return {
        status: 500,
        description: "SERVER_ERROR",
        response
    }
}

global.badRes = function(response) {
    return {
        status: 400,
        description: "BAD_REQUEST",
        response
    }
}

global.circleType = function() {
    return ['Family','Friend','Collegue']
}