'use strict';

import Section from './section.js';

/** 
 * A configuration class that holds playback parameters for visualization
 **/
export default class Playback extends Section { 
	
	/** 
	* Gets the speed for the playback. In frames per second. 
	* @type {number} 
	*/
	get speed() { return this._json.speed; }
	
	/** 
	* Gets the loop flag for the playback. True if the simulation should loop.
	* @type {boolean} 
	*/
	get loop() { return this._json.loop; }
	
	/** 
	* Gets the number of frames between cached frames.
	* @type {number} 
	*/
	get cache() {  return this._json.cache; }
	
	/** 
	* Sets the speed for the playback. In frames per second. 
	* @type {number} 
	*/
	set speed(value) { this._json.speed = value; }
	
	/** 
	* Sets the loop flag for the playback. True if the simulation should loop.
	* @type {boolean} 
	*/
	set loop(value) { this._json.loop = value; }
	
	/** 
	* Sets the number of frames between cached frames.
	* @type {number} 
	*/
	set cache(value) { this._json.cache = value; }
	
    /**
     * Builds the default json object for the configuration section. 
     */
	default() {
		this.json.speed = 10;
		this.json.loop = false;
		this.json.cache = 10;
	}
	
    /**
     * Reads the json configuration provided to the section. Any parameter provided should be optional
	 * and overwrite the default json configuration for the section.
     * @param {object} json - The provided json configuration.
     */
	configure(json) {
		if (json.speed != undefined) this.json.speed = json.speed;
		if (json.loop != undefined) this.json.loop = json.loop;
		if (json.cache != undefined) this.json.cache = json.cache;
	}
}
