'use strict';

import Section from './section.js';

/** 
 * A configuration class that holds GIS visualization parameters
 **/
export default class GIS extends Section { 
	
	/** 
	* Sets the json configuration for the GIS view. 
	* @type {object} 
	*/
	set json(value) { 
		this._json = value; 
		
		if (this.variables) this.variables.forEach((s, i) => s.index = i); 
	}
	
	/** 
	* Gets the basemap to use for the GIS view. 
	* @type {string} 
	*/
	get basemap() { return this._json.basemap; }
	
	/** 
	* Gets the layers configuration to use for the GIS view. 
	* @type {object[]} 
	*/
	get layers() { return this._json.layers; }
	
	/** 
	* Gets the visual variables to use for the GIS view. 
	* @type {object[]} 
	*/
	get variables() { return this._json.variables; }
	
	/** 
	* Gets the view configuration for the GIS view. 
	* @type {object} 
	*/
	get view() { return this._json.view; }
	
	/** 
	* Gets the styles to use for the GIS view. 
	* @type {object[]} 
	*/
	get styles() { return this._json.styles; }
	
    /**
     * Builds the default json object for the configuration section. 
     */
	default() {
		// TODO: not implemented for GIS section, it just uses the raw json for now.
	}
	
    /**
     * Reads the json configuration provided to the section. Any parameter provided should be optional
	 * and overwrite the default json configuration for the section.
     * @param {object} json - The provided json configuration.
     */
	configure(json) {
		// TODO: not implemented for GIS section, it just uses the raw json for now. 
		this.json = json;
	}
}
