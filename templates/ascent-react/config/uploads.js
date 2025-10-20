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

  // Store uploads in public directory for development
  dirpath: '.tmp/public/uploads',

  // Maximum file size (5MB for images)
  maxBytes: 5 * 1024 * 1024
}
