const mongoose = require('mongoose');
	

const postSchema = mongoose.Schema({
	threadId: {type: mongoose.Schema.Types.ObjectId},
	content: {type: String, required: true},
	user: {type: String, required: true},
	created: {type: Date, default: Date.now},
	likes: {type: Number, default: 0}
});


postSchema.methods.getPost = function(){
	return {
		_id: this._id,
		threadId: this.threadId,
		content: this.content,
		user: this.user,
		created: this.created,
		likes: this.likes
	}
}


const Posts = mongoose.model('posts', postSchema);
module.exports = {Posts};