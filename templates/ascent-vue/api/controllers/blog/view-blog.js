module.exports = {
  friendlyName: 'View blog',

  description: 'Display blog listing page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    const blogPosts = await Blog.find({
      select: ['title', 'description', 'publishedOn', 'slug']
    })

    blogPosts.sort((a, b) => new Date(b.publishedOn) - new Date(a.publishedOn))

    return {
      page: 'blog',
      props: {
        appName: sails.config.custom.appName,
        blogPosts
      }
    }
  }
}
