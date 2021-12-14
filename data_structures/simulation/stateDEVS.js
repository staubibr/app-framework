'use strict';

import State from "./state.js";

/** 
 * Stores the state of all models in the simulation at a given frame.
 **/
export default class StateDEVS extends State { 
		
    /**
     * @param {Model[]} models - An array of all the models in the simulation.
     */
	constructor(models, size) {
		super(models, size);
		
		this.data = {};
		
		this.models.forEach((m) => {
			this.data[m.id] = m.model_type.get_template_0();
		});
	}
	
    /**
     * Make a deep clone of the State object.
     * @return {State} the cloned state.
     */
	clone() {
		var clone = new StateDEVS(this.models);
		
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
     * Determine a new state by applying a single message to the current state.
     * @param {Message} m - the message to apply to the state.
	 */
	apply_message(m) {		
		for (var f in m.value) this.data[m.model.id][f] = m.value[f];
	}
}