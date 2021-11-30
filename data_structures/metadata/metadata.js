'use strict';

/** 
* A class that contains contextual information about a model
*/
export default class Metadata {

	/** 
	* Gets the model author
	* @type {string} 
	*/
	get author() {  return this._json.author; }
	
	/** 
	* Sets the model author
	* @type {string} 
	*/
	set author(value) { this._json.author = value; }
	
	/** 
	* Gets the model creation date
	* @type {string} 
	*/
	get created() { return this._json.created; }
	
	/** 
	* Sets the model creation date
	* @type {string} 
	*/
	set created(value) { this._json.created = value; }
	
	/** 
	* Gets the model description
	* @type {string} 
	*/
	get description() { return this._json.description; }
	
	/** 
	* Sets the model description
	* @type {string} 
	*/
	set description(value) { this._json.description = value; }
	
	/** 
	* Gets the tags associated to the model. Tags are used to organize models in topics.
	* @type {string} 
	*/
	get tags() { return this._json.tags; }
	
	/** 
	* Sets the tags associated to the model. Tags are used to organize models in topics.
	* @type {string} 
	*/
	set tags(value) { this._json.tags = value; }
	
    /**
     * @param {string} author - the model author
     * @param {string} created - the model creation date
     * @param {string} description - the model description
     * @param {string[]} tags - the tags associated to the model
     */
	constructor(author, created, description, tags) {		
		this._json = {}
		
		this.author = author || null;
		this.created = created || null;
		this.description = description || null;
		this.tags = tags || [];
	}
}