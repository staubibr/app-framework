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
	get dimensions() {  return this._dimensions; }
	
	/** 
	* Gets the height / width ratio for visual representation
	* @type {number} 
	*/
	get ratio() { return this.dimensions.x / this.dimensions.y; }
	
	/** 
	* Gets the simulation dimensions maximum X coordinate
	* @type {number}
	*/
	get max_x() { return this.dimensions.x }
	
	/** 
	* Gets the simulation dimensions maximum Y coordinate
	* @type {number}
	*/
	get max_y() { return this.dimensions.y }
	
	/** 
	* Gets the simulation dimensions maximum Z coordinate
	* @type {number}
	*/
	get max_z() { return this.dimensions.z }
	
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
		
	initialize(structure) {		
		this._dimensions = {
			x: structure.model_types[1].dim[0],
			y: structure.model_types[1].dim[1],
			z: structure.model_types[1].dim[2]
		}
		
		this.state = new StateCA(this.models[1], this.dimensions);
	}
}