'use strict';

/** 
 * Stores the state of all models in the simulation at a given frame.
 **/
export default class State { 
	
	/** 
	* Gets the current position of the current state within the simulation frames.
	* @type {number} 
	*/
	get index() { return this._index; }
	/** 
	* Sets the current position of the current state within the simulation frames.
	* @type {number} 
	*/
	set index(value) { this._index = value; }
	
	/** 
	* Gets the current state values for all models.
	* @type {object} 
	*/
	get data() { return this._data; }
	
	/** 
	* Sets the current state values for all models.
	* @type {object} 
	*/
	set data(value) { this._data = value; }
	
	/** 
	* Gets all the models in the simulation.
	* @type {object[]} 
	*/
	get models() { return this._models; }
	
	/** 
	* Sets all the models in the simulation.
	* @type {object[]} 
	*/
	set models(value) { this._models = value; }
	
	/** 
	* Gets the number of models in the simulation
	* @type {number} 
	*/
	get size() { return this._size; }
	
	/** 
	* Sets the number of models in the simulation
	* @type {number} 
	*/
	set size(value) { this._size = value; }
	
    /**
     * @param {Model[]} models - An array of all the models in the simulation.
     */
	constructor(models) {
		this.index = -1;
		this.data = null;
		this.models = models || [];
		this.size = this.models.length;
	}
	
    /**
     * Make a deep clone of the State object.
     * @return {State} the cloned state.
     */
	clone() {
		var clone = new State(this.models);
		
		clone.index = this.index;
		clone.data = JSON.parse(JSON.stringify(this.data));

		return clone;
	}
	
    /**
     * Returns the state value of a model for the current state.
     * @param {Model} model - a model instance for which to retrieve the state value.
	 * @return {object} a state value (usually JSON).
     */
	get_value(model) {		
		return this.data[model.id] || null;
	}
	
    /**
     * Determine a new state by applying all the messages for the provided frame.
     * @param {Frame} frame - the frame to apply to the state.
	 */
	apply_messages(frame) {
		for (var i = 0; i < frame.state_messages.length; i++) {
			this.apply_message(frame.state_messages[i]);
		}
	}

    /**
     * Determine a new state by applying a single message to the current state.
     * @param {Message} m - the message to apply to the state.
	 */
	apply_message(m) {		
		for (var f in m.value) this.data[m.model.id][f] = m.value[f];
	}
	
    /**
     * Advance to the next state by applying all messages in a frame.
     * @param {Frame} frame - the frame to apply to the state.
	 */
	forward(frame) {
		this.apply_messages(frame);
		
		this.index++;
	}
	
    /**
     * Return to the previous state by applying all messages in a frame. The frame must be reversed prior to this operation.
     * @param {Frame} frame - the frame to apply to the state.
	 */
	backward(frame) {
		this.apply_messages(frame);
		
		this.index--;
	}
	
    /**
     * Resets the state to a zero template for all models.
     * @param {Frame} frame - the frame to apply to the state.
	 */
	reset() {
		this.data = {};
		
		this.models.forEach((m) => {
			this.data[m.id] = m.model_type.get_template_0();
		});
	}
}