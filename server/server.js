import config from './../config/config'
import app from './express'
import mongoose from 'mongoose'

// Connection URL
mongoose.Promise = global.Promise
mongoose.connect(config.mongoUri, { dbName: "users" })
mongoose.connection.on('error', err => {
  throw new Error(`unable to connect to database: ${config.mongoUri} ` + err)
})

app.listen(config.port, (err) => {
  console.info('Database is at %s.', config.mongoUri)
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
})
