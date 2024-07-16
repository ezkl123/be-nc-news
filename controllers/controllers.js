const { getTopics } = require('../models/models')
const endpoints = require('../endpoints.json')

function sendTopics(req, res, next) {
    getTopics().then((topics) => {
        res.status(200).send({topics})
    })
    .catch(err => {
        next(err)
    })
}

function sendAllEndpoints(req, res, next){
    res.status(200).send(endpoints)
}

module.exports = { sendTopics, sendAllEndpoints }