var mongoose = require('mongoose');
var Schema = mongoose.Schema;

EventSchema = new Schema( {
	name:			String,
	owner:			String,
	description: 	String,
	date:			String,
	hour:			String,
	location:		String,
	image1: 		String,
	added_date:{
		type: Date,
		default: Date.now
	}
}),
Event = mongoose.model('Event', EventSchema);

module.exports = Event;