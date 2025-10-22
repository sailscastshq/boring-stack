/**
 * File Upload Settings
 * (sails.config.uploads)
 *
 * These options tell Sails where (and how) to store uploaded files.
 *
 *  > This file is mainly useful for configuring how file uploads in your
 *  > work during development; for example, when lifting on your laptop.
 *  > For recommended production settings, see `config/env/production.js`
 *
 * For all available options, see:
 * https://sailsjs.com/config/uploads
 */

module.exports.uploads = {
  /***************************************************************************
   *                                                                          *
   * Store uploaded files in .tmp/public/uploads so they are publicly        *
   * accessible during development. In production, you would typically        *
   * use a cloud storage service like S3, CloudFront, or similar.             *
   *                                                                          *
   ***************************************************************************/

  // Maximum file size (5MB for images)
  maxBytes: 5 * 1024 * 1024,
  // dirpath: '.tmp/uploads',
  adapter: require('skipper-s3'),
  /**
   * Amazon S3
   */
  // key: process.env.S3_ACCESS_KEY,
  // secret: process.env.S3_SECRET_KEY,
  // bucket: process.env.S3_BUCKET

  /**
   * Cloudflare R2
   */
  key: process.env.R2_ACCESS_KEY,
  secret: process.env.R2_SECRET_KEY,
  bucket: process.env.R2_BUCKET,
  endpoint: process.env.R2_ENDPOINT

  /**
   * DigitalOcean Spaces
   */

  // https://cloud.digitalocean.com/account/api/spaces
  // key: process.env.SPACES_ACCESS_KEY,
  // secret: process.env.SPACES_SECRET_KEY,
  // bucket: process.env.SPACES_BUCKET,
  // endpoint: process.env.SPACES_ENDPOINT
}
