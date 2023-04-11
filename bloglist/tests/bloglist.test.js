const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')

let token = null
let user = null

beforeAll(async () => {
    await User.deleteMany({})
    user = await helper.user.save()
    token = jwt.sign({ username: helper.user.username, id: user.id }, process.env.SECRET)
})

beforeEach(async () => {
    await Blog.deleteMany({})

    const lastBlog = Blog({
        title: "eemis",
        author: "Eemi",
        url: "eemis.com",
        user: user
    })

    const blogObjects = helper.initialBlogs
        .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

    await lastBlog.save()
})

describe('when there is initially some blogs saved', () => {
    test('blogs are returned as json', async () => {

        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    })

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')

        const contents = response.body.map(r => r.author)
        expect(contents).toContain('EemiK')
    })
})

describe('viewing a specific blog', () => {
    test('blog has key id', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const blogToView = blogsAtStart[0]

        expect(blogToView.id).toBeDefined()
    })

    test('a specific blog can be viewed', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const blogToView = blogsAtStart[0]

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(resultBlog.body).toEqual(blogToView)
    })
})

describe('addition of a new blog', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'how to add a new blog',
            author: 'test',
            url: 'https://www.test.com/',
            likes: 28628
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)


        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 2)

        const authors = blogsAtEnd.map(n => n.author)
        expect(authors).toContain('test')
    })

    test('missing likes default to zero', async () => {
        const newBlog = {
            title: 'how to add a new blog',
            author: 'test',
            url: 'https://www.test.com/'
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)

        const blogsAtEnd = await helper.blogsInDb()

        const blogToInspect = blogsAtEnd.find(blog => blog.author === 'test')
        expect(blogToInspect.likes).toBe(0)
    })

    test('blog missing title or url handled right', async () => {
        const missingTitle = {
            author: 'fs',
            url: 'https://www.test.com/'
        }

        const missingUrl = {
            title: 'fullstack',
            author: 'fs'
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(missingTitle)
            .expect(400)

        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(missingUrl)
            .expect(400)
    })

    test('fails with status 401 without a token', async () => {
        const newBlog = {
            title: 'last test',
            author: 'fs',
            url: 'https://www.test.com/'
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })
})

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[blogsAtStart.length - 1]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(
            helper.initialBlogs.length
        )

        const authors = blogsAtEnd.map(b => b.author)

        expect(authors).not.toContain(blogToDelete.author)
    })
})

describe('updating of a blog', () => {
    test('add one like to a post', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const toUpdate = blogsAtStart[0]

        await api
            .put(`/api/blogs/${toUpdate.id}`)
            .send({ likes: toUpdate.likes + 1 })
            .expect(200)

        const blogsAtEnd = await helper.blogsInDb()

        const blogToView = blogsAtEnd[0]

        expect(blogToView.likes).toBe(toUpdate.likes + 1)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})