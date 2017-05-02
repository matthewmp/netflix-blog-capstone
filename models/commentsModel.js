const mongoose = require('mongoose');


const commentSchema = mongoose.Schema({
	postId: {type: String, required: true},
	comment: {type: String},
	user: {type: String},
	created: {type: Date, default: Date.now},
	likes: {type: Number, default: 0}
});


commentSchema.methods.getComment = function(){
	return {
		_id: this._id,
		postId: this.postId,
		comment: this.comment,
		user: this.user,
		likes: this.likes
	}
}

const Comments = mongoose.model('comments', commentSchema);
module.exports = {Comments};