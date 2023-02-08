'use strict';

import Evented from '../../base/evented.js';
import Diagram from './diagram.js';
import Grid from './grid.js';
import GIS from './gis.js';
import Playback from './playback.js';

/** 
 * A configuration class that holds all basic visualization parameters
 **/
export default class Configuration extends Evented { 

	/** 
	* Gets the diagram section
	* @type {object} 
	*/
	get diagram() { return this._diagram; }

	/** 
	* Sets the diagram section
	* @type {object} 
	*/
	set diagram(value) { this._diagram = value; }

	/** 
	* Gets the grid section
	* @type {object} 
	*/
	get grid() { return this._grid; }

	/** 
	* Sets the grid section
	* @type {object} 
	*/
	set grid(value) { this._grid = value; }

	/** 
	* Gets the GIS section
	* @type {object} 
	*/
	get gis() { return this._gis; }

	/** 
	* Sets the GIS section
	* @type {object} 
	*/
	set gis(value) { this._gis = value; }

	/** 
	* Gets the playback section
	* @type {object} 
	*/
	get playback() { return this._playback; }

	/** 
	* Sets the playback section
	* @type {object} 
	*/
	set playback(value) { this._playback = value; }
	
    /**
     * @param {simulation} simulation - the simulation object
     * @param {object} viz - the visualization configuration as json
     * @param {object} style - the style configuration as json
     */
	constructor(simulation, viz, style) {
		super();
		
		this.json = {};
		
		this.configure(viz, simulation);
		
		if (this.grid && style) this.grid.styles = style;
		
		if (this.diagram && !simulation.diagram) {
			throw new Error("Diagram not found for DEVS simulation. Please provide a diagram.svg file and reload the simulation.");
		}
	}
		
    /**
     * Reads the json configuration provided to the section. Any parameter provided should be optional
	 * and overwrite the default json configuration for the section.
     * @param {object} json - The provided json configuration.
     * @param {Simulation} simulation - The simulation object, certain default values are derived from it.
     */
	configure(json, simulation) {
		var type = this.get_type(json, simulation);
		
		this.playback = new Playback(json && json.playback);
		
		if (type == "Cell-DEVS") this.grid = new Grid(json && json.grid, simulation);
		
		if (type == "DEVS") this.diagram = new Diagram(json && json.diagram);
		
		if (type == "GIS-DEVS") this.gis = new GIS(json && json.gis);
	}
	
    /**
     * Returns the configuration as file object
     */
	to_file() {
		var content = JSON.stringify(this);
		
		return new File([content], "visualization.json", { type:"application/json", endings:'native' });
	}
	
    /**
     * Returns the configuration section as json
	 * @return {object} the configuration section as json
     */
	to_json() {
		var json = {};
		
		if (this.playback) json.playback = this.playback.to_json();
		if (this.diagram) json.diagram = this.diagram.to_json();
		if (this.grid) json.grid = this.grid.to_json();
		if (this.gis) json.gis = this.gis.to_json();
		
		return json;
	}
	
    /**
     * Returns the configuration section as json. Required for JSON.stringify
	 * @return {object} the configuration section as json
     */
	toJSON() {
		return this.to_json();
	}
	
    /**
     * Returns the type of simulation for the configuration object.
	 * @return {string} the type of configuration
     */
	get_type(json, simulation) {
		if (json && json.grid) return "Cell-DEVS";
		if (json && json.gis) return "GIS-DEVS";
		if (json && json.diagram) return "DEVS";
		
		if (simulation.type == "Cell-DEVS") return "Cell-DEVS";
		if (simulation.type == "GIS-DEVS") return "GIS-DEVS";
		if (simulation.type == "DEVS") return "DEVS";
		
		throw new Error("Unable to determine simulation type.");
	}
}
