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
	city:			String,
	nr_seats:		Number,
	currency:		String,
	prices:			[],
	categories:		[],
	rel_events:		[],
	added_date:{
		type: Date,
		default: Date.now
	}
}),
Event = mongoose.model('Event', EventSchema);

module.exports = Event;