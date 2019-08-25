var mongoose = require('mongoose');
var Schema = mongoose.Schema;

EventSchema = new Schema( {
	Name: String,
	image1:String,
	image2:String,
	image3:String,
	added_date:{
		type: Date,
		default: Date.now
	}
}),
Event = mongoose.model('Event', EventSchema);

module.exports = Event;