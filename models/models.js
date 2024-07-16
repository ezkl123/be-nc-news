const db = require('../db/connection')

function getTopics(){
    return db.query('SELECT * FROM topics')
    .then(({rows}) => {
        return rows;
    })
}

function getArticlebyId(article_id){
    return db.query('SELECT * FROM articles WHERE article_id = $1', [article_id])
    .then(({rows}) => {
        if (rows.length === 0){
            return Promise.reject({
                status: 404,
                msg: 'Not Found'
            })
        }
        return rows[0]
    })
    // .catch((err) => {
    //     return err;
    // })
}

//not sure how to access endpoint keys, seems to list numbers going up to 700 when i console.log. just console.logging endpoints gives the correct object from the file though.
//not sure what kind of error codes to test for at what point - is 400 only for param queries?
//what is the difference between db connection in setup-dbs in the package.json and the connection file?

module.exports = { getTopics, getArticlebyId }