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
	categories:		[],
	added_date:{
		type: Date,
		default: Date.now
	}
}),
Event = mongoose.model('Event', EventSchema);
// price[], price_type, nr_seats, rel_events[], city
module.exports = Event;