module.exports = {
  // configure the code below with your username, password and mlab database information
  database: process.env.mongodb_URL,
  //database: 'mongodb://localhost:27017/meanauth',    //dev
  secret: 'yoursecret'
}
