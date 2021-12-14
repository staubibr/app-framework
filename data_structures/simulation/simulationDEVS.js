'use strict';

import Dom from '../../tools/dom.js';
import Simulation from './simulation.js';
import StateDEVS from './stateDEVS.js';

/** 
 * A simulation class specifically for DEVS simulations
 * @see Simulation
 **/
export default class SimulationDEVS extends Simulation { 
	
	/** 
	* Gets the SVG diagram for the simulation model
	* @type {string} 
	*/
	get diagram() { return this._diagram; }
	
	/** 
	* Sets the SVG diagram for the simulation model
	* @type {string} 
	*/
	set diagram (value) {  
		this._diagram = value;
	
		this.Emit("NewDiagram", { diagram:this.diagram });
	}
	
	/** 
	* Gets the height / width ratio for visual representation
	* @type {number} 
	*/
	get ratio() {
		var vb = this.diagram.getAttribute("viewBox")
		
		if (!vb) throw new Error("The viewBox attribute must be specified on the svg element.");

		var split = vb.split(" ");
		
		return split[2] / split[3];
	}
	
    /**
     * @param {Structure} structure - The simulation model structure.
     * @param {Frame[]} frames - An array of all the simulation frames.
     * @param {number} nCache - The cache interval.
     * @param {string} diagram - The SVG diagram for the simulation model.
     */
	constructor(structure, frames, nCache, diagram) {
		super(structure, frames, nCache);
		
		if (diagram) this._diagram = this.load_svg(diagram);
	}
	
    /**
     * Returns the initial, zero state for this simulation.
     * @param {Structure} structure - The simulation model structure.
	 * @return {StateCA} the zero state for this simulation
     */
	get_initial_state(structure) {
		return new StateDEVS(this.models, this.size);
	}
	
    /**
     * Loads the SVG diagram string to a dom node.
     * @param {string} diagram - The SVG diagram for the simulation model.
	 * @return {object} the dom node created
     */
	load_svg(svg) {		
		var root = Dom.Create("div", { innerHTML:svg });
		
		return root.children[0];
	}
}