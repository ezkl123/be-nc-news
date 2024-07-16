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
            console.log(response.body)
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