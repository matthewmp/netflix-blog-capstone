const mongoose = require('mongoose');

const threadSchema = mongoose.Schema({	
	title: {type: String, required: true},
	date: {type: Date, default: Date.now},
	author: {type: String, required: true},
	content: {type: String},
	posts: [{
		content: {type: String, required: true},
		user: {type: String, required: true},
		created: {type: Date, default: Date.now},
		likes: {type: Number, default: 0},
		comments: [{
			comment: {type: String},
			user: {type: String},
			created: {type: Date, default: Date.now},
			likes: {type: Number, default: 0}
		}]
	}]
});

	


threadSchema.methods.getThread = function(){
	return {
		_id: this._id,
		title: this.title,
		date: this.date,
		author: this.author,
		content: this.content,
		posts: this.posts
	};
}




const Threads = mongoose.model('threads', threadSchema);
const Posts  = mongoose.model('posts', threadSchema);
module.exports = {Threads};
