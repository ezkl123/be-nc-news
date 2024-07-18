const { getTopics, getArticlebyId, getAllArticles, getAllComments } = require('../models/models')
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

function sendArticleById(req, res, next){
    const {article_id} = req.params;

    return getArticlebyId(article_id)
    .then((article) => {
        res.status(200).send({article})
    })
    .catch((err) => {
        if (err.status && err.msg){
            res.status(err.status).send({msg: err.msg});
        }
        else next(err);
    })

}

function sendAllArticles(req, res, next){
    return getAllArticles()
    .then((articles) => {
        res.status(200).send({articles})
    })
    .catch((err) => {
        next(err)
    })
}

function sendAllComments(req, res, next){
    const {article_id} = req.params;
    getAllComments(article_id)
    .then((comments) => {
        if (comments === 'There are no comments about this article'){
            const msg = comments
            res.status(200).send({msg})
        }
        res.status(200).send({comments})
    })
    .catch((err) => {
        next(err)
    })
}

module.exports = { sendTopics, sendAllEndpoints, sendArticleById, sendAllArticles, sendAllComments }