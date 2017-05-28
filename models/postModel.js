const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({	
	content: {type: String, required: true},
	user: {type: String, required: true},
	created: {type: Date, default: Date.now},
	likes: {
		users: [String],
		count: {type: Number, default: 0}
	},
	comments: [{ type: Schema.Types.ObjectId, ref: 'comments' }]
});
const Posts  = mongoose.model('posts', postSchema);
module.exports = {Posts};