'use strict';

import Evented from '../../base/evented.js';

/** 
 * A base class for configuration sections 
 * @see Diagram, GIS, Grid, Playback
 **/
export default class Section extends Evented { 

	/** 
	* Gets the configuration section as json
	* @type {object} 
	*/
	get json() { return this._json; }
	
	/** 
	* Sets the configuration section as json
	* @type {object} 
	*/
	set json(value) { this._json = value; }
	
    /**
     * @param {object} json - the configuration data as json
     */
	constructor(json) {
		super();
		
		this.json = {};
		
		this.default();
		
		if (json) this.configure(json);
	}	
	
    /**
     * Builds the default json object for the configuration section. Must be implemented by the 
	 * child class. Otherwise, it throws an error.
     */
	default() {
		throw new Error("The default function must be inherited by the configuration section.");
	}
	
    /**
     * Reads the json configuration provided to the section. Any parameter provided should be optional
	 * and overwrite the default json configuration for the section.
     * @param {object} json - The provided json configuration.
     */
	configure(json) {
		throw new Error("The configure function must be inherited by the configuration section.");
	}
	
    /**
     * Triggers a change event on the configuration section
     * @param {string} property - The name of the changed property
     */
	trigger(property) {
		this.emit("change", { property:property });
		this.emit(`change:${property}`, { property:property });
	}
	
    /**
     * Sets a parameter on the configuration section. Triggers a change event.
	 * @param {string} property - The name of the changed property
	 * @param {object} value - The value to set on the property.
     */
	set(property, value) {
		this[property] = value;
		
		this.trigger(property, value);
	}
	
    /**
     * Returns the configuration section as json
	 * @return {object} the configuration section as json
     */
	to_json() {
		return this.json;
	}
	
    /**
     * Returns the configuration section as json. Required for JSON.stringify
	 * @return {object} the configuration section as json
     */
	toJSON() {
		return this.to_json();
	}
}
