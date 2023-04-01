'use strict';

/** 
 * The Frame object contains output and state messages for a given frame. 
 * Frames are added or removed from the simulation state to move forward or 
 * backward respectively.
 **/
export default class Frame { 

    /**
     * @param {string} time - The time representation for the frame.
     */
	constructor(time) {
		this.time = time;
		
		this.messages = [];
		this.output_messages = [];
		this.state_messages = [];
		this.previous_messages = [];
	}
	
    /**
     * Add an output message to the frame .
	 * @param {Message} message - message to add.
     * @return {Message} the added message.
     */
	add_output_message(message) {		
		this.output_messages.push(message);
		
		return message;
	}
	
    /**
     * Add an state message to the frame .
	 * @param {Message} message - message to add.
     * @return {Message} the added message.
     */
	add_state_message(message) {
		this.state_messages.push(message);
		
		return message;
	}
	
	add_previous_message(message) {
		this.previous_messages.push(message);
		
		return message;
	}
	
	link_previous(state) {
		for (var i = 0; i < this.state_messages.length; i++) { 
			var m = this.state_messages[i].model;
		
			this.add_previous_message(state.get_message(m));
		}
	}
}