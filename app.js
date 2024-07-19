const express = require('express')
const { sendTopics, sendAllEndpoints, sendArticleById, sendAllArticles, sendAllComments, postComments, sendUpdatedArticle, sendDeleteResponse } = require('./controllers/controllers')

const app = express()

app.use(express.json())

app.get('/api/topics', sendTopics)

app.get('/api', sendAllEndpoints)

app.get('/api/articles/:article_id', sendArticleById)

app.get('/api/articles', sendAllArticles)

app.get('/api/articles/:article_id/comments', sendAllComments)

app.post('/api/articles/:article_id/comments', postComments)

app.patch('/api/articles/:article_id', sendUpdatedArticle)

app.delete('/api/comments/:comment_id', sendDeleteResponse)

app.use((err, req, res, next) => {
    if (err.status && err.msg){
        res.status(err.status).send({msg: err.msg})
    } else {
        next(err);
    }
})

app.use((err, req, res, next) => {
    if (err.code === '22P02'){
        res.status(400).send({msg: 'Bad Request'})
    } else {
        next(err)
    }
})

app.use((err, req, res, next) => {
    if (err.code === '23503'){
        res.status(404).send({msg: 'Username does not exist'})
    } else {
        next(err)
    }
})

app.use((err, req, res, next) => {
    // console.log(err);
    res.status(500).send({msg: 'Internal Server Error'})
})

module.exports = app;
