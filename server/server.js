import config from './../config/config.js'
import app from './express.js'
import mongoose from 'mongoose'

app.listen(config.port, (err) => {
	if (err) {
		console.log(err)
	}
	console.info('Server started on port %s.', config.port)
})


// Connection URL
mongoose.Promise = global.Promise
mongoose.connect(config.mongoUri, { dbName: "users" })
mongoose.connection.on('error', err => {
	throw new Error(`unable to connect to database: ${config.mongoUri}`)
})