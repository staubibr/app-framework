'use strict';

import Configuration from './configuration.js';

/** 
 * A configuration class that holds diagram visualization parameters
 **/
export default class ConfigurationDiagram extends Configuration { 
	
	get type() { return "diagram"; }
	
	/** 
	* Gets the width for the diagram. 
	* @type {number} 
	*/
	get width() { return this.json.width; }
		
	/** 
	* Sets the width for the diagram. 
	* @type {number} 
	*/
	set width(value) { this.json.width = value; }
	
	/** 
	* Gets the height for the diagram. 
	* @type {number} 
	*/
	get height() { return this.json.height; }
	
	/** 
	* Sets the height for the diagram. 
	* @type {number} 
	*/
	set height(value) { this.json.height = value; }
	
	/** 
	* Gets whether the aspect ratio should be preserved for the diagram.
	* @type {boolean} 
	*/
	get aspect() { return this.json.aspect; }
	
	/** 
	* Sets whether the aspect ratio should be preserved for the diagram.
	* @type {boolean} 
	*/
	set aspect(value) { this.json.aspect = value; }
	
	/** 
	* Gets the SVG diagram for this visualization.
	* @type {boolean} 
	*/
	get diagram() { return this.json.diagram; }
	
	/** 
	* Sets the SVG diagram for the simulation model
	* @type {string} 
	*/
	set diagram (value) {  
		this.json.diagram = value;
	
		this.emit("new-diagram", { diagram:this.diagram });
	}
    /**
     * @param {simulation} simulation - the simulation object
     * @param {object} viz - the visualization configuration as json
     * @param {object} style - the style configuration as json
     */
	constructor(json) {
		super(json);
		
		this.width = this.width ?? 600;
		this.height = this.height ?? 400;
		this.aspect = this.aspect ?? true;
	}
}