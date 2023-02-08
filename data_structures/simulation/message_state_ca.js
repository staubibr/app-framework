'use strict';

import Message from './message.js';

/** 
 * The message state CA class contains the data for the state of a CA model.
 **/
export default class MessageStateCA extends Message {
	
	/** 
	* Gets the message model
	* @type {Model} 
	*/
	get model() { return this.coord; }
	
	/** 
	* Gets the message cell coordinates [x,y,z]
	* @type {number[]} 
	*/
	get coord() { return this._coord; }
	
	/** 
	* Gets the message id (coordinates joined with "-")
	* @type {string} 
	*/
	get id() { return this.coord.join("-"); }
	
	/** 
	* Gets the message cell X coordinate
	* @type {number} 
	*/
	get x() { return this.coord[0]; }

	/** 
	* Gets the message cell Y coordinate
	* @type {number} 
	*/
	get y() { return this.coord[1]; }
	
	/** 
	* Gets the message cell Z coordinate
	* @type {number} 
	*/
	get z() { return this.coord[2]; }
	
    /**
     * @param {number[]} coord - the message cell coordinates [x,y,z]
     * @param {object} value - the message value
     */
	constructor(coord, value) {
		super(value);
		
		this._coord = coord;
	}
	
    /**
     * Reverses the message. Used to move backwards in the simulation
	 * @return {MessageStateCA} the reversed message.
     */
	reverse() {		
		// TODO: Only place where we use GetDiff I think.		
		return new MessageStateCA(this.coord, this.diff);
	}
}