const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'Eemin blog',
        author: 'EemiK',
        url: 'https://eemiblog.com',
        likes: 283748
    },
    {
        title: 'Emman blog',
        author: 'EmmaP',
        url: 'https://emmablog.com',
        likes: 384738
    }
]

const user = new User({
    username: "testing",
    password: "testing"
})

const nonExistingId = async () => {
    const blog = new Blog({ author: 'toberemoved' })
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs,
    nonExistingId,
    blogsInDb,
    usersInDb,
    user
}