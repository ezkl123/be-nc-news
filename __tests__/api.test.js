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
                article_id: 1,
                title: 'Living in the shadow of a great man',
                topic: 'mitch',
                author: 'butter_bridge',
                body: 'I find this existence challenging',
                created_at: '2020-07-09T20:11:00.000Z',
                votes: 100,
                article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
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
    })
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
    test('returns 200 with the posted comment', () => {
        return request(app)
        .post('/api/articles/2/comments')
        .send({
            username: 'butter_bridge',
            body: 'What a cool article'
        })
        .expect(200)
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