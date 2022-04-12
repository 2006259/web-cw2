import mongoose from 'mongoose'
import crypto from 'crypto'

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true
		//required: 'Name is required'
	},
	email: {
		index: true,
		type: String,
		trim: true,
		unique: true,
		match: [/.+\@.+\..+/, 'Please fill a valid email address'],
		required: 'Email is required'
	},
	hashed_password: {
		type: String,
		required: "Password is required"
	},
	salt: String,
	updated: Date,
		created: {
		type: Date,
		default: Date.now
	}
})

UserSchema.methods.authenticate = function(plainText) {
	return this.encryptPassword(plainText) === this.hashed_password
}


UserSchema.methods.encryptPassword = function(password) {
	if (!password) return ''
	try {
		return crypto
			.createHmac('sha256', this.salt)
			.update(password)
			.digest('hex')
	} catch (err) {
		return ''
	}
}
	
UserSchema.methods.makeSalt = function() {
	return Math.round((new Date().valueOf() * Math.random())) + ''
}

UserSchema.path('hashed_password').validate(function(v) {
	if (this._password && this._password.length < 6) {
		this.invalidate('password', 'Password must be at least 6 characters.')
	}
	if (this.isNew && !this._password) {
		this.invalidate('password', 'Password is required')
	}
}, null)

const User = new mongoose.model('User', UserSchema);
User.createIndexes();

UserSchema
	.virtual('password')
	.set(function(password) {
		this._password = password
		this.salt = this.makeSalt();
		//this.salt = Math.round((new Date().valueOf() * Math.random())) + '';
		this.hashed_password = this.encryptPassword(password)
	})
	.get(function() {
		return this._password
	})

export default User