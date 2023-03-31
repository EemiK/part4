const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item
    }

    return blogs.map(x => x.likes).reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    let favorite = { likes: 0 }

    blogs.forEach(blog => {
        favorite.likes < blog.likes
            ? favorite = blog
            : favorite

    })

    return favorite
}

const mostBlogs = (blogs) => {
    const count = []

    blogs.forEach(blog => {
        const names = count.map(x => x.author)

        if (names.indexOf(blog.author) != -1) {
            count[names.indexOf(blog.author)].blogs += 1
        } else {
            count.push({ author: blog.author, blogs: 1 })
        }
    })

    return count.reduce((prev, current) => {
        return prev.blogs > current.blogs ? prev : current
    })

}

const mostLikes = (blogs) => {
    const count = []

    blogs.forEach(blog => {
        const names = count.map(x => x.author)

        if (names.indexOf(blog.author) != -1) {
            count[names.indexOf(blog.author)].likes += blog.likes
        } else {
            count.push({ author: blog.author, likes: blog.likes })
        }
    })

    return count.reduce((prev, current) => {
        return prev.likes > current.likes ? prev : current
    })

}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}