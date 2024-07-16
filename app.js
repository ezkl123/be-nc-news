const express = require('express')
const { sendTopics, sendAllEndpoints } = require('./controllers/controllers')

const app = express()

app.get('/api/topics', sendTopics)

app.get('/api', sendAllEndpoints)

app.all('*', (req, res, next) => {
    res.status(404).send({msg: '404 Not Found'})
})

app.use((err, req, res, next) => {
    res.status(500).send({msg: 'Internal Server Error'})
})


module.exports = app;
