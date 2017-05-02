const mongoose = require('mongoose');

const threadSchema = mongoose.Schema({	
	title: {type: String, required: true},
	date: {type: Date, default: Date.now},
	author: {type: String, required: true},
	content: {type: String}
});

	


threadSchema.methods.getThread = function(){
	return {
		_id: this._id,
		title: this.title,
		date: this.date,
		author: this.author,
		content: this.content
	};
}


const Threads = mongoose.model('threads', threadSchema);
module.exports = {Threads};
