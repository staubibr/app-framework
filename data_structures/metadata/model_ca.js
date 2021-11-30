'use strict';

import Model from './model.js';

/** 
 * Model class for Cell-DEVS model instances. 
 **/
export default class ModelCA extends Model { 
	
	/** 
	* Gets the dimensions for this model
	* @type {object} 
	* @type {object.x} number - x dimension of the grid space
	* @type {object.y} number - y dimension of the grid space
	* @type {object.z} number - z dimension of the grid space
	*/
	get dim() {  return this.model_type.dim; }
	
    /**
     * @param {string} id - unique id for the model type
     * @param {TypeModel} model_type - model type for this model
     * @param {Link[]} Links - the message type associated to this model type
     */
	constructor(id, model_type, links) {
		super(id, model_type, links);
	}
}