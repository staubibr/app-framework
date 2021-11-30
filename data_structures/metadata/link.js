'use strict';

/** 
 * A link is an association between two ports on two models
 **/
export default class Link { 
	
	/** 
	* Gets the json object that contains all the link data
	* @type {object} 
	*/
	get json() { return this._json; }
	
	/** 
	* Sets the json object that contains all the link data
	* @type {object} 
	*/
	set json(value) { this._json = value; }
	
	/** 
	* Gets the link origin model
	* @type {Model} 
	*/
	get model_a() { return this._json.model_a; }
	
	/** 
	* Sets the link origin model
	* @type {Model} 
	*/
	set model_a(value) { this._json.model_a = value; }
	
	/** 
	* Gets the link origin port
	* @type {TypePort} 
	*/
	get port_a() { return this._json.port_a; }
	
	/** 
	* Sets the link origin port
	* @type {TypePort} 
	*/
	set port_a(value) { this._json.port_a = value; }
	
	/** 
	* Gets the link destination model
	* @type {Model} 
	*/
	get model_b() {  return this._json.model_b; }
	
	/** 
	* Sets the link destination model
	* @type {Model} 
	*/
	set model_b(value) { this._json.model_b = value; }
	
	/** 
	* Gets the link destination port
	* @type {TypePort} 
	*/
	get port_b() {  return this._json.port_b; }
	
	/** 
	* Sets the link destination port
	* @type {TypePort} 
	*/
	set port_b(value) { this._json.port_b = value; }
	
    /**
     * @param {Model} model_a - the origin model
     * @param {TypePort} model_a - the origin port
     * @param {Model} model_b - the destination model
     * @param {TypePort} model_a - the destination port
     */
	constructor(model_a, port_a, model_b, port_b) {
		this._json = {};
		
		this.model_a = model_a || null;
		this.port_a = port_a || null;
		this.model_b = model_b || null;
		this.port_b = port_b || null;
	}
}