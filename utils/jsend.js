//Si es exitoso.
const sendSuccess = (res, data, statusCode = 200) => {
    res.status(statusCode).json({ status: "success", data });
};

//Si ocurre un fallo.
const sendFail = (res, message, statusCode = 400) => {
    res.status(statusCode).json({ status: "fail", data: { message } });
};

//Si ocurre un error.
const sendError = (res, message = "Internal Server Error", statusCode = 500) => {
    res.status(statusCode).json({ status: "error", message });
};

module.exports = { sendSuccess, sendFail, sendError };