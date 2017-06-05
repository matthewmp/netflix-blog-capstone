const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const threadSchema = mongoose.Schema({	
	title: {type: String, required: true},
	date: {type: Date, default: Date.now},
	author: {type: String, required: true},
	content: {type: String},
	posts: [{ type: Schema.Types.ObjectId, ref: 'posts' }]
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
module.exports = {Threads};
