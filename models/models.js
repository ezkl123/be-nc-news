const db = require('../db/connection')

function getTopics(){
    return db.query('SELECT * FROM topics')
    .then(({rows}) => {
        console.log(rows[0])
        return rows;
    })
}

module.exports = { getTopics }