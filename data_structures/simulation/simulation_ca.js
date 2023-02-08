'use strict';

import Simulation from './simulation.js';
import StateCA from './stateCA.js';

/** 
 * A simulation class specifically for Cell-DEVS simulations
 * @see Simulation
 **/
export default class SimulationCA extends Simulation { 
	
	/** 
	* Gets the simulation 3D dimensions
	* @type {object}
	*/
	get dimensions() {  
		return {
			x: this.max_x,
			y: this.max_y,
			z: this.max_z
		}
	}
	
	/** 
	* Gets the height / width ratio for visual representation
	* @type {number} 
	*/
	get ratio() { return this.max_x / this.max_y; }
		
	/** 
	* Gets the simulation dimensions maximum X coordinate
	* @type {number}
	*/
	get max_x() { return this.structure.model_types[1].max_x }
	
	/** 
	* Gets the simulation dimensions maximum Y coordinate
	* @type {number}
	*/
	get max_y() { return this.structure.model_types[1].max_y }
	
	/** 
	* Gets the simulation dimensions maximum Z coordinate
	* @type {number}
	*/
	get max_z() { return this.structure.model_types[1].max_z }
	
	/** 
	* Gets the simulation model ports
	* @type {Port[]}
	*/
	get ports() {
		// TODO : Is this always 1?? Is there always only one model in Cell-DEVS?
		return this.structure.models[1].ports.filter(p => p.type == "output").map(p => p.name);
	}
	
	/** 
	* Gets the simulation model layer indices
	* @type {number[]}
	*/
	get layers() {
		var layers = [];
		
		for (var i = 0; i < this.max_z; i++) layers.push(i);
		
		return layers;
	}
	
    /**
     * Gets a cell from the selected cells.
     * @param {number[]} id - the cell coordinates.
	 * @return {number[]} the cell coordinates if selected
     */
	get_selected(id) {
		return this.selected.find(s => s[0] == id[0] && s[1] == id[1] && s[2] == id[2]);
	}
		
    /**
     * Returns the initial, zero state for this simulation.
     * @param {Structure} structure - The simulation model structure.
	 * @return {StateCA} the zero state for this simulation
     */
	get_initial_state(structure) {		
		return new StateCA(this.models, this.dimensions);
	}
}