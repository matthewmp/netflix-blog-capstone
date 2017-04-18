const mongoose = require('mongoose');

const threadSchema = mongoose.Schema({
	//id: {type: mongoose.Schema.Types.ObjectId, auto: true},
	title: {type: String, required: true},
	date: {type: Date, default: Date.now},
	author: {type: String, required: true},
	posts: [
				{
					id: {type: mongoose.Schema.Types.ObjectId, auto: true},
					content: {type: String, required: true},
					user: {type: String, required: true},
					created: {type: Date, default: Date.now},
					likes: {type: Number},
					comments: [{
							//id: {type: mongoose.Schema.Types.ObjectId, auto: true},
						comment: {type: String},
						user: {type: String},
						likes: {type: Number},

					}]
				}
	]
})

const Threads = mongoose.model('moviethreads', threadSchema);

module.exports = {Threads};