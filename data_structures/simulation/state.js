'use strict';

/** 
 * Stores the state of all models in the simulation at a given frame.
 **/
export default class State { 
	
    /**
	 * The state class holds the last state messages for all models in the simulation.
     * @param {Model[]} models - An array of all the models in the simulation.
     */
	constructor(models) {
		this.position = -1;
		this.models = models;
		this.messages = [];
		
		// for (var i = 0; i < models.length; i++) this.messages[models[i].id] = null;
	}
	
    /**
     * Make a deep clone of the State object.
     * @return {State} the cloned state.
     */
	clone() {
		var clone = new State(this.models);
		
		for (var i = 0; i < this.models.length; i++) {
			var m = this.models[i];
			
			clone.messages[m.position] = this.messages[m.position];
		}
		
		clone.position = this.position;
		
		return clone;
	}
	
    /**
     * Returns the state value of a model for the current state.
     * @param {Model} model - a model instance for which to retrieve the state value.
	 * @return {object} a state value (usually JSON).
     */
	get_message(model) {
		return this.messages[model.position] || null;
	}
	
    /**
     * Determine a new state by applying all the messages for the provided frame.
     * @param {Frame} frame - the frame to apply to the state.
	 */
	apply_frame(frame) {
		this.position++;
		
		for (var i = 0; i < frame.state_messages.length; i++) {
			var message = frame.state_messages[i];
			this.messages[message.model.position] = message;
		}
	}
	
	rollback_frame(frame) {
		this.position--;

		for (var i = 0; i < frame.state_messages.length; i++) {
			var message = frame.state_messages[i];
			this.messages[message.model.position] = message.prev;
		}
	}
}