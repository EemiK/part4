const Blog = require('../models/blog')

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

module.exports = {
    initialBlogs, nonExistingId, blogsInDb
}