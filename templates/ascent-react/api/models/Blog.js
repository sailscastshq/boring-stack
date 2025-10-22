/**
 * Blog.js
 *
 * @description :: A model definition for blog posts stored as markdown files.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: 'content',
  attributes: {
    slug: {
      type: 'string',
      unique: true
    },
    title: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true
    },
    publishedOn: {
      type: 'string',
      required: true
    },
    content: {
      type: 'string',
      required: true
    }
  }
}
