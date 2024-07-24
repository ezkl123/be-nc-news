const { getTopics, getArticlebyId, getAllArticles, getAllComments, addComments, updateArticle, deleteComment, getUsers } = require('../models/models')
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
    const {sort_by, order} = req.query
    return getAllArticles(sort_by, order)
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

function postComments(req, res, next){
    // console.log(req.body)
    const {article_id} = req.params;
    const {username, body} = req.body;
    // console.log(username)
    return addComments(username, body, article_id)
    .then((comment) => {
        res.status(201).send({comment})
    })
    .catch((err) => {
        next(err)
    })
}

function sendUpdatedArticle(req, res, next){
    const {inc_votes} = req.body;
    const {article_id} = req.params;

    return updateArticle(article_id, inc_votes)
    .then((article) => {
        res.status(200).send({article})
    })
    .catch((err) => {
        next(err)
    })
}

function sendDeleteResponse(req, res, next){
    const {comment_id} = req.params;
    return deleteComment(comment_id)
    .then((response) => {
        res.status(204).send({})
    })
    .catch((err) => {
        next(err)
    })
}

function sendUsers(req, res, next){
    return getUsers()
    .then((users) => {
        res.status(200).send({users})
    })
    .catch((err) => {
        next(err);
    })
}

module.exports = { sendTopics, sendAllEndpoints, sendArticleById, sendAllArticles, sendAllComments, postComments, sendUpdatedArticle, sendDeleteResponse, sendUsers }