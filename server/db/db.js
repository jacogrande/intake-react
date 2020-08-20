const db = {};

/**
 * Function that verifies administrator credentials
 * @param {string} admin_key the secret administrator key to access certain functionality
 */
db.checkCredentials = (admin_key) => {
  if (process.env.NODE_ENV === 'dev') {
    if (admin_key === 'beese_churger') {
      return true;
    }
  } else if (process.env.NODE_ENV === 'production') {
    if (admin_key === process.env.ADMIN_KEY) {
      return true;
    }
  }
  return false;
};

module.exports = db;
