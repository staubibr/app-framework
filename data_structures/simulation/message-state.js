'use strict';

import Message from './message.js';

/** 
 * The message state class contains the data for the state of a model.
 **/
export default class MessageState extends Message { 
		
	get templated_string() { return JSON.stringify(this.templated); }
	
    /**
     * @param {Model} model - the model associated to the state message
     * @param {object} value - the message value
     */
	constructor(model, value) {
		super(model, value);
		
		// prev is only set when initializing the whole simulation since the 
		// full trace must be rebuilt to know the  previous state value.
		this.prev = null;
		
		this.templated = this.model.state.message_type.template(this.value);
	}
	
	pair(fn) {
		this.model.state.message_type.pair(this.value, fn);
	}
	
	get_value(field) {
		var i = this.model.state.message_type.index[field];
		
		return this.value[i];
	}
	
	get_previous_value(field) {
		var i = this.model.state.message_type.index[field];
		
		this.prev.value[i];
	}
}