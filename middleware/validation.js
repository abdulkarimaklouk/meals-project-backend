const { body } = require("express-validator");

const validationSChema = (fields) => {
    let arrFields = [];
    let fun = (field) => {
        return body(field).notEmpty().withMessage(`${field} field cannot be empty`);
    }
    for (let i = 0; i < fields.length; i++) {
        arrFields.push(fun(fields[i]));
    }
    return arrFields;
}


module.exports = {
    validationSChema
};