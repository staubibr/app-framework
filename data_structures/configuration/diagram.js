'use strict';

import Section from './section.js';

/** 
 * A configuration class that holds diagram visualization parameters
 **/
export default class Diagram extends Section { 
	
	/** 
	* Gets the width for the diagram. 
	* @type {number} 
	*/
	get width() { return this._json.width; }
	
	/** 
	* Gets the height for the diagram. 
	* @type {number} 
	*/
	get height() { return this._json.height; }
	
	/** 
	* Gets whether the aspect ratio should be preserved for the diagram.
	* @type {boolean} 
	*/
	get aspect() { return this._json.aspect; }
		
	/** 
	* Sets the width for the diagram. 
	* @type {number} 
	*/
	set width(value) { this._json.width = value; }
	
	/** 
	* Sets the height for the diagram. 
	* @type {number} 
	*/
	set height(value) { this._json.height = value; }
	
	/** 
	* Sets whether the aspect ratio should be preserved for the diagram.
	* @type {boolean} 
	*/
	set aspect(value) { this._json.aspect = value; }
		
    /**
     * Returns the diagram size considering the  width, height and optionally, the aspect ratio
	 * @param {Simulation} simulation - The simulation object
	 * @return the diagram size { width, height }
	 */
	diagram_size(simulation) {		
		return { 
			width : this.width, 
			height : this.aspect ? this.width / simulation.ratio : this.height 
		}
	}
	
    /**
     * Builds the default json object for the configuration section. 
     */
	default() {
		this.json.width = 600;
		this.json.height = 400;
		this.json.aspect = true;
		this.json.click = false;
	}
	
    /**
     * Reads the json configuration provided to the section. Any parameter provided should be optional
	 * and overwrite the default json configuration for the section.
     * @param {object} json - The provided json configuration.
     */
	configure(json) {		
		if (json.width != undefined) this.json.width = json.width;
		if (json.height != undefined) this.json.height = json.height;
		if (json.aspect != undefined) this.json.aspect = json.aspect;
		if (json.click != undefined) this.json.click = json.click;
	}
}