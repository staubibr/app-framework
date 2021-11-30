'use strict';

/** 
* A class that contains contextual information about the simulation
*/
export default class Info { 
	
	/** 
	* Gets the json object that contains all the info
	* @type {object} 
	*/
	get json() { return this._json; }
	
	/** 
	* Sets the json object that contains all the info
	* @type {object} 
	*/
	set json(value) { this._json = value; }
	
	/** 
	* Gets the name of the simulation
	* @type {string} 
	*/
	get name() { return this._json.name; }
	
	/** 
	* Sets the name of the simulation
	* @type {string} 
	*/
	set name(value) { this._json.name = value; }
	
	/** 
	* Gets the name of the simulator used
	* @type {string} 
	*/
	get simulator() { return this._json.simulator; }
	
	/** 
	* Sets the name of the simulator used
	* @type {string} 
	*/
	set simulator(value) { this._json.simulator = value; }
	
	/** 
	* Gets the type of simulation (DEVS, Cell-DEVS, GIS-DEVS)
	* @type {string} 
	*/
	get type() {  return this._json.type; }
	
	/** 
	* Sets the type of simulation (DEVS, Cell-DEVS, GIS-DEVS)
	* @type {string} 
	*/
	set type(value) { this._json.type = value; }
	
    /**
     * @param {string} name - name of the model type
     * @param {string} simulator - the name of the simulator used
     * @param {type} type - the type of simulation (DEVS, Cell-DEVS, GIS-DEVS)
     */
	constructor(name, simulator, type) {
		this._json = {};
		
		this.name = name || null;
		this.simulator = simulator || null;
		this.type = type || null;
	}
}