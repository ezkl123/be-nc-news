const express = require('express')
const { sendTopics, sendAllEndpoints, sendArticleById } = require('./controllers/controllers')

const app = express()

app.get('/api/topics', sendTopics)

app.get('/api', sendAllEndpoints)

app.get('/api/articles/:article_id', sendArticleById)

app.all('*', (req, res, next) => {
    res.status(404).send({msg: '404 Not Found'})
})

app.use((err, req, res, next) => {
    if (err.code === '22P02'){
        res.status(400).send({msg: 'Bad Request'})
    }
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({msg: 'Internal Server Error'})
})


module.exports = app;
