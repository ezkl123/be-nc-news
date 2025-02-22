const db = require('../db/connection')
const format = require('pg-format')

function getTopics(){
    return db.query('SELECT * FROM topics')
    .then(({rows}) => {
        return rows;
    })
}

function getArticlebyId(article_id){
    return db.query(`SELECT
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.body,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.article_id) AS comment_count
        FROM 
            articles
        LEFT JOIN 
            comments ON comments.article_id = articles.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;`, [article_id])
    .then(({rows}) => {
        if (rows.length === 0){
            return Promise.reject({
                status: 404,
                msg: 'Not Found'
            })
        }

        rows[0].comment_count = Number(rows[0].comment_count)
        return rows[0]
    })
}

function getAllArticles(sortBy = 'created_at', order = 'desc', topic){
    const sortByQueries = ['article_id', 'title', 'topic', 'author', 'created_at', 'votes', 'comment_count'];

    const orderQueries = ['asc', 'desc'];

    const topicQueries = ['mitch', 'cat']

    if (topic !== undefined){
        if (!topicQueries.includes(topic)){
            return Promise.reject({
                status: 400,
                msg: 'Bad Request'
            })
        }
        return db.query(`SELECT * FROM articles WHERE articles.topic = $1;`, [topic])
        .then(({rows}) => {
            return rows;
        })
    }


    if (!sortByQueries.includes(sortBy) || !orderQueries.includes(order)){
        return Promise.reject({
            status: 400,
            msg:'Bad Request'
        })
    }

    return db.query(`
        SELECT
            articles.author,
            articles.title,
            articles.article_id,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url,
            COUNT(comment_id) AS comment_count
        FROM
            articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY
            articles.article_id
        ORDER BY
            articles.${sortBy} ${order};`
    ).then((response) => {
        const rows = response.rows
        rows.forEach((article) => {
            article.comment_count = Number(article.comment_count)
        })
        return rows;
    })


}

function getAllComments(article_id){
    if (isNaN(article_id)){
        return Promise.reject({
            status: 400,
            msg: 'Bad Request'
        })
    }
    return db.query(`SELECT * FROM articles 
        WHERE articles.article_id = $1`, [article_id])
    .then(({rows}) => {
        const articles = rows;
        if (articles.length === 0){
            return Promise.reject({
                status: 404,
                msg: 'Not Found'
            })
        }
        return db.query(`SELECT comment_id, votes, created_at, author, body, article_id FROM comments
            WHERE article_id = $1
            ORDER BY created_at DESC`, [article_id])
        .then(({rows}) => {
            if (rows.length === 0){
                return Promise.resolve('There are no comments about this article')
            }
            return rows;
        })
    })
}

function addComments(username, body, articleId){
    return db.query('SELECT * FROM articles WHERE article_id = $1', [articleId])
    .then(({rows}) => {
        if (rows.length === 0){
            return Promise.reject({
                status: 404,
                msg: 'Article Not Found'
            })
        }
        if (username === undefined || body === undefined){
            if (username){
                return Promise.reject({
                    status: 400,
                    msg: 'Please enter a valid comment'
                })
            }
    
            if (body){
                return Promise.reject({
                    status: 400,
                    msg: 'Please enter a valid username'
                })
            }
        }
        return db.query(`INSERT INTO 
            comments 
            (body,
            article_id,
            author) VALUES ($1, $2, $3) RETURNING*;`, [body, articleId, username])
        .then(({rows}) => {
            // console.log(rows)
            return rows;
        })
    })
    
}

function updateArticle(articleId, incVotes){
    if (isNaN(articleId) || isNaN(incVotes)){
        return Promise.reject({
            status: 400,
            msg: 'Bad Request'
        })
    }
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [articleId])
    .then(({rows}) => {
        if (rows.length === 0){
            return Promise.reject({
                status: 404,
                msg: 'Article Not Found'
            })
        }
        const article = rows[0];
        const updatedVotes = article.votes + incVotes
        return db.query('UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING*;', [updatedVotes, articleId])
        .then(({rows}) => {
            const updatedArticle = rows[0];
            return updatedArticle;
        })
    })
}

function deleteComment(comment_id){
    return db.query('SELECT * FROM comments WHERE comment_id >= $1', [comment_id])
    .then(({rows}) => {
        if (rows.length === 0){
            return Promise.reject({
                status: 404,
                msg: 'Comment Not Found'
            })
        }

        return db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
        .then(({}) => {
            return {};
        })
    })
}

function getUsers(){
    return db.query('SELECT * FROM users')
    .then(({rows}) => {
        const users = rows;

        return rows;
    })
}


module.exports = { getTopics, getArticlebyId, getAllArticles, getAllComments, addComments, updateArticle, deleteComment, getUsers }