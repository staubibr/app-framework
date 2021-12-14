'use strict';

import TypeModel from "./type_model.js";

/** 
 * Model Type class for Cell-DEVS models
 **/
export default class TypeModelCA extends TypeModel {
	
	/** 
	* Gets the grid space dimension for this model type
	* @type {object} 
	* @type {object.x} number - x dimension of the grid space
	* @type {object.y} number - y dimension of the grid space
	* @type {object.z} number - z dimension of the grid space
	*/
	get dim() {  return this._json.dim; }
	
	/** 
	* Sets the grid space dimension for this model type
	* @type {object} 
	* @type {object.x} number - x dimension of the grid space
	* @type {object.y} number - y dimension of the grid space
	* @type {object.z} number - z dimension of the grid space
	*/
	set dim(value) { this._json.dim = value; }
	
	
	/** 
	* Gets the simulation dimensions maximum X coordinate
	* @type {number}
	*/
	get max_x() { return this.dim[0] }
	
	/** 
	* Gets the simulation dimensions maximum Y coordinate
	* @type {number}
	*/
	get max_y() { return this.dim[1] }
	
	/** 
	* Gets the simulation dimensions maximum Z coordinate
	* @type {number}
	*/
	get max_z() { return this.dim[2] }
	
    /**
     * @param {string} id - unique id for the model type
     * @param {string} name - name of the model type
     * @param {string} type - type of model type (atomic or coupled)
     * @param {MessageType} message_type - the message type associated to this model type
     * @param {TypePort[]} ports - the port types associated to this model type
     * @param {Model[]} models - the submodels associated to this model type (only for coupled)
     */
	constructor(id, name, type, message_type, ports, models, metadata, dim) {
		super(id, name, type, message_type, ports, models, metadata);
		
		this.dim = dim || null;
	}
}