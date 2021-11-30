'use strict';

import State from "./state.js";

/** 
 * Stores the state of all cells in a CA simulation at a given frame.
 **/
export default class StateCA extends State { 

    /**
     * @param {Model} model - the simulation model for the grid space.
     * @param {object} size - the size of the grid space.
	 * @param {number} size.x - the size of the grid space on the x axis.
	 * @param {number} size.y - the size of the grid space on the y axis.
	 * @param {number} size.z - the size of the grid space on the z axis.
     */
	constructor(model, size) {
		super([model]);
		
		this.size = size;
	}
	
    /**
     * Make a deep clone of the StateCA object.
     * @return {object} the cloned state.
     */
	clone() {
		var clone = new StateCA(this.models, this.size);
		
		clone.index = this.index;
		clone.data = JSON.parse(JSON.stringify(this.data));
		
		return clone;
	}
	
    /**
     * Returns the state value of a cell for the current state.
     * @param {number[]} coord - 3D coordinates of a cell.
	 * @return {object} a state value (usually JSON).
     */
	get_value(coord) {
		return this.data[coord[0]][coord[1]][coord[2]];
	}

    /**
     * Determine a new state by applying a single message to the current state.
     * @param {Message} m - the message to apply to the state.
	 */
	apply_message(m) {		
		for (var f in m.value) this.data[m.x][m.y][m.z][f] = m.value[f];
	}
	
    /**
     * Resets the state to a zero template for all models.
     * @param {Frame} frame - the frame to apply to the state.
	 */
	reset() {
		this.data = [];
		
		// TODO : Is this always 0?? Is there always only one model in Cell-DEVS?
		var m = this.models[0];
		
		for (var x = 0; x < this.size.x; x++) {
			this.data[x] = [];
			
			for (var y = 0; y < this.size.y; y++) {
				this.data[x][y] = [];
				
				for (var z = 0; z < this.size.z; z++) {
					this.data[x][y][z] = m.model_type.get_template_0();
				}
			}
		}
	}
}