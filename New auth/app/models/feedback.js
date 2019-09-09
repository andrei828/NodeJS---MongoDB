var mongoose = require('mongoose');
var Schema = mongoose.Schema;

FeedbackSchema = new Schema( {
    rating: Number,
    description: String,
    added_date:{
		type: Date,
		default: Date.now
	}
}),
Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;