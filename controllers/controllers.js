const { getTopics } = require('../models/models')

function sendTopics(req, res, next) {
    getTopics().then((topics) => {
        res.status(200).send({topics})
    })
    .catch(err => {
        next(err)
    })
}

module.exports = { sendTopics }