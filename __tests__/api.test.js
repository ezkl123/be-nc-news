const request = require('supertest')
const app = require('../app')
const testData = require('../db/data/test-data/index')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const endpoints = require('../endpoints.json')

beforeEach(() => {
    return seed(testData)
})

afterAll(() => {
    db.end()
})

describe('GET /api/topics testing', () => {
    test('each object in the array should contain the properties: slug, description.', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
            const topics = response.body.topics
            expect(topics.length).toBe(3)
            topics.forEach((topic) => {
                expect(topic).toMatchObject({slug: expect.any(String),
                    description: expect.any(String)
                });
            })
        })
    })
})

describe('GET /api testing', () => {
    test('returns with a 200 status code along with a nested object of endpoint objects', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {
            expect(response._body).toMatchObject(endpoints)
        })
    })
})

describe('GET /api/articles/:article_id', () => {
    test('returns a 200 status code with an article object with the corresponding id', () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then((response) => {
            // console.log(response.body.article)
            expect(response.body.article).toEqual({
                article_id: expect.any(Number),
                title: expect.any(String),
                topic: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String)
              })
        })
    })

    test('returns 400 Bad Request and the message "Not Found" when invalid parameter is inputted', () => {
        return request(app)
        .get('/api/articles/not-a-number')
        .expect(400)
        .then((response) => {
            const error = response.body.msg;
            expect(error).toBe('Bad Request')
        })
    })

    test('returns 404 Not Found when a valid id is inputted that has empty content', () => {
        return request(app)
        .get('/api/articles/99')
        .expect(404)
        .then((response) => {
            const error = response.body.msg
            expect(error).toBe('Not Found')
        })
    });
})

describe('GET /api/articles', () => {
    test('should return 200 and an array where each article object has all the relevant properties', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((response) => {
            const articles = response.body.articles
            expect(articles.length).toBe(13)
            articles.forEach((article) => {
                expect(article).toMatchObject({
                    author: expect.any(String),
                    title: expect.any(String),
                    article_id: expect.any(Number),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(Number)
                });
            })
        })
    })
    test("returns 200 and returns an array of articles sorted by valid category and order", () => {
        return request(app)
          .get("/api/articles?sort_by=title&order=asc")
          .expect(200)
          .then((response) => {
            const articles = response.body.articles
            expect(articles.length).toBe(13);
            expect(articles).toBeSortedBy("title", { ascending: true });
        });
    });
    test("returns 200 and responds with articles ordered by created_at by default", () => {
        return request(app)
          .get("/api/articles?sort_by=created_at")
          .expect(200)
          .then((response) => {
            const articles = response.body.articles
            expect(articles.length).toBe(13);
            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
    });
    test("returns 400 and returns an error when sort_by is invalid", () => {
        return request(app)
          .get("/api/articles?sort_by=invalid_input_column")
          .expect(400)
          .then((response) => {
            const msg = response.body.msg
            expect(msg).toBe("Bad Request");
          });
    });
    test("returns 400 and returns Bad Request when order is invalid", () => {
        return request(app)
          .get("/api/articles?order=invalid_order")
          .expect(400)
          .then((response) => {
            const msg = response.body.msg
            expect(msg).toBe("Bad Request");
          });
    });
})

describe('/api/articles/:article_id/comments testing', () => {
    test('returns a 200 status and an array of comments for an article accessed by a valid id', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then((response) => {
            const comments = response.body.comments;
            comments.forEach((comment) => {
                expect(comment).toMatchObject({
                    comment_id: expect.any(Number),
                    votes: expect.any(Number),
                    created_at: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    article_id: expect.any(Number)
                })
            })
        })
    })

    test('returned comment array should have the most recent comments first', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then((response) => {
            const comments = response.body.comments;
            expect(comments).toBeSortedBy('created_at', {descending: true})
        })
    })

    test('returns 200 with the message "There are no comments about this article" when article_id is valid and the article exists but no comments are in the array', () => {
        return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('There are no comments about this article')
        })
    })

    test('returns 400 Bad Request when invalid article_id is inputted', () => {
        return request(app)
        .get('/api/articles/twenty/comments')
        .expect(400)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad Request')
        })
    })

    test('returns 404 Not Found when article_id is valid but the article does not exist', () => {
        return request(app)
        .get('/api/articles/99/comments')
        .expect(404)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Not Found')
        })
    })
})

describe('POST /api/articles/:article_id/comments', () => {
    test('returns 201 with the posted comment', () => {
        return request(app)
        .post('/api/articles/2/comments')
        .send({
            username: 'butter_bridge',
            body: 'What a cool article'
        })
        .expect(201)
        .then((response) => {
            const comment = response.body.comment[0];
            expect(comment.body).toBe('What a cool article')
        })
    })

    test('if username is missing, returns 400 with the error message: "Please enter a valid username"', () => {
        return request(app)
        .post('/api/articles/2/comments')
        .send({
            username: undefined,
            body: 'What a cool article'
        })
        .expect(400)
        .then((response) => {
            const error = response.body.msg;
            expect(error).toBe('Please enter a valid username')
        })
    })

    test('if body is missing, returns 400 with the error message: "Please enter a valid username"', () => {
        return request(app)
        .post('/api/articles/2/comments')
        .send({
            username: 'butter_bridge',
            body: undefined
        })
        .expect(400)
        .then((response) => {
            const error = response.body.msg;
            expect(error).toBe('Please enter a valid comment')
        })
    })

    test('returns 400 Bad Request when invalid article_id is inputted', () => {
        return request(app)
        .post('/api/articles/twenty/comments')
        .send({
            username: 'butter_bridge',
            body: 'What a cool article'
        })
        .expect(400)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad Request')
        })
    })

    test('returns 404 Not Found when article_id is valid but the article does not exist', () => {
        return request(app)
        .post('/api/articles/99/comments')
        .send({
            username: 'butter_bridge',
            body: 'What a cool article'
        })
        .expect(404)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Article Not Found')
        })
    })

    test("if the username is valid but doesn't exist, returns 404 with the message 'Username not found'.", () => {
        return request(app)
        .post('/api/articles/2/comments')
        .send({
            username: 'Hammad',
            body: 'What a cool article'
        })
        .expect(404)
        .then((response) => {
            const error = response.body.msg;
            expect(error).toBe('Username does not exist')
        })
    })
})

describe('PATCH /api/articles/:article_id', () => {
    test('returns 200 with the updated number of votes in the article', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({
            inc_votes: 100
        })
        .expect(200)
        .then((response) => {
            const article = response.body.article;
            const input = article.votes - 100;
            expect(input).toBe(article.votes - 100)
        })
    })

    test('returns 400 Bad Request when inc_votes is inputted', () => {
        return request(app)
        .patch('/api/articles/twenty')
        .send({
            inc_votes: 'one hundred'
        })
        .expect(400)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad Request')
        })
    })

    test('returns 400 Bad Request when invalid article_id is inputted', () => {
        return request(app)
        .patch('/api/articles/twenty')
        .send({
            inc_votes: 100
        })
        .expect(400)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad Request')
        })
    })

    test('returns 404 Not Found when article_id is valid but the article does not exist', () => {
        return request(app)
        .patch('/api/articles/99')
        .send({
            inc_votes: 100
        })
        .expect(404)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Article Not Found')
        })
    })
})

describe('DELETE /api/comments/:comment_id', () => {
    test('returns 204 when a comment is successfully deleted', () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
        .then((response) => {
            expect(response.statusCode).toBe(204)
        })
    })

    test('returns 404 Not Found when comment_id is valid but the comment does not exist', () => {
        return request(app)
        .delete('/api/comments/99')
        .expect(404)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Comment Not Found')
        })
    })

    test('returns 400 Bad Request when invalid comment_id is input', () => {
        return request(app)
        .delete('/api/comments/twenty')
        .expect(400)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad Request')
        })
    })
})

describe('GET api/users testing', () => {
    test('returns 200 and an array of users with the properties of uername, name and avatar_url when successfule', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then((response) => {
            const users = response.body.users;
            users.forEach((user) => {
                expect(user).toMatchObject({
                    username: expect.any(String),
                    name: expect.any(String),
                    avatar_url: expect.any(String)
                })
            })
        })
    })
    test('returns 400 when url path is incorrect', () => {
        return request(app)
        .get('/notARoute')
        .expect(400)
        .then((response) => {
            const msg = response.body.msg;
            expect(msg).toBe('Bad Request')
        })
    })
})

describe('GET api/articles(sorting queries) testing', () => {
    test('returns 200 for sort_by and returns the articles sorted by the relevant column', () => {
        return request(app)
        .get('/api/articles/sort_by')
    })
})