const db = require('../db/connection')

function getTopics(){
    return db.query('SELECT * FROM topics')
    .then(({rows}) => {
        return rows;
    })
}

//not sure how to access endpoint keys, seems to list numbers going up to 700 when i console.log. just console.logging endpoints gives the correct object from the file though.
//not sure what kind of error codes to test for at what point - is 400 only for param queries?
//what is the difference between db connection in setup-dbs in the package.json and the connection file?

module.exports = { getTopics, }