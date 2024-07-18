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

describe.only('GET /api/articles', () => {
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
            const comments = response.comments;
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
})

describe('General error testing (404 status code)', () => {
    test('returns a 404 Not Found message if endpoint input is invalid', () => {
        return request(app)
        .get('/notARoute')
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe('404 Not Found')
        })
    })
})