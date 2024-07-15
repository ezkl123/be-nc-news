const request = require('supertest')
const app = require('../app')
const testData = require('../db/data/test-data/index')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')

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
            console.log(response.body)
            const topics = response.body.topics
            expect(topics.length).toBe(3)
            topics.forEach((topic) => {
                expect(topic).toMatchObject(({slug: expect.any(String),
                    description: expect.any(String)
                }));
            })
        })
    })
    test('returns a 404 internal server error if the endpoint is not correct', () => {
        return request(app)
        .get('/notARoute')
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe('404 Not Found')
        })
    })
})