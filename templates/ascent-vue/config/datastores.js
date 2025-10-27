/**
 * Datastores
 * (sails.config.datastores)
 *
 * A set of datastore configurations which tell Sails where to fetch or save
 * data when you execute built-in model methods like `.find()` and `.create()`.
 *
 *  > This file is mainly useful for configuring your development database,
 *  > as well as any additional one-off databases used by individual models.
 *  > Ready to go live?  Head towards `config/env/production.js`.
 *
 * For more information on configuring datastores, check out:
 * https://sailsjs.com/config/datastores
 */

module.exports.datastores = {
  /***************************************************************************
   *                                                                          *
   * Your app's default datastore.                                            *
   *                                                                          *
   * Sails apps use SQLite by default via the `sails-sqlite` adapter.        *
   * This provides a production-ready database for development that supports  *
   * transactions, foreign keys, and advanced features needed by the app.     *
   *                                                                          *
   * To use a different database, follow the directions below or check out:   *
   * https://docs.sailscasts.com/boring-stack/database                        *
   *                                                                          *
   * (For production configuration, see `config/env/production.js`.)          *
   *                                                                          *
   ***************************************************************************/

  default: {
    /***************************************************************************
     *                                                                          *
     * Default SQLite configuration for development and production.             *
     * For other databases (PostgreSQL, MySQL, MongoDB), see:                  *
     * https://docs.sailscasts.com/boring-stack/database                        *
     *                                                                          *
     ***************************************************************************/
    adapter: 'sails-sqlite',
    url: 'db/local.sqlite'
  },
  content: {
    adapter: 'sails-content'
  }
}
