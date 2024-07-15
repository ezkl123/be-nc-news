const express = require('express')
const { sendTopics } = require('./controllers/controllers')

const app = express()

app.get('/api/topics', sendTopics)

app.use((err, req, res, next) => {
    res.status(500).send({msg: 'Internal Server Error'})
})


module.exports = app;
