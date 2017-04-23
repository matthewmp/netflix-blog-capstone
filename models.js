const mongoose = require('mongoose');

const threadSchema = mongoose.Schema({	
	title: {type: String, required: true},
	date: {type: Date, default: Date.now},
	author: {type: String, required: true},
	posts: [
				{					
					content: {type: String, required: true},
					user: {type: String, required: true},
					created: {type: Date, default: Date.now},
					likes: {type: Number},
					comments: [{
						id: {type: mongoose.Schema.Types.ObjectId, auto: true},
						comment: {type: String},
						user: {type: String},
						likes: {type: Number},

					}]
				}
	]
});

	threadSchema.virtual('New_Post').get(function(){
		return this.posts[0];
	})

 	threadSchema.methods.returnPost = function(){
		return {
			id: this._id,
			posts: this.posts[0]
		};
}

const Threads = mongoose.model('moviethreads', threadSchema);

module.exports = {Threads};