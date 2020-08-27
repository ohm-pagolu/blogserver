const MongoClient = require('mongodb').MongoClient

var state = {
  db: null,
}

exports.connect = function(done) {
  if (state.db) return done()

  const client = new MongoClient('mongodb://localhost:27017/', { useUnifiedTopology: true });
  client.connect(function(err,db) {
    if (err){
        console.log("Can't connect to database!");
    }
    else {
        console.log("Connected to database!");
        state.db = db;
    }
    done();
  });
};

exports.get = function() {
  return state.db
}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}