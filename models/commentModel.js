const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = mongoose.Schema({	
	comment: {type: String},
	user: {type: String},
	created: {type: Date, default: Date.now},
	likes: {type: Number, default: 0}
});
const Comments  = mongoose.model('comments', commentSchema);
module.exports = {Comments};