'use strict';

/** 
 * Model class to hold an instance of a model type. A model instance is an association between
 * a unique id and a model type.
 **/
export default class Model { 
	
	/** 
	* Gets the unique id for this model
	* @type {string} 
	*/
	get id() { return this._json.id; }
	
	/** 
	* Sets the unique id for this model
	* @type {string} 
	*/
	set id(value) { this._json.id = value; }
	
	/** 
	* Gets the model type for this model
	* @type {TypeModel} 
	*/
	get model_type() { return this._json.model_type; }
	
	/** 
	* Sets the model type for this model
	* @type {TypeModel} 
	*/
	set model_type(value) { this._json.model_type = value; }
	
	/** 
	* Gets the name for this model
	* @type {string} 
	*/
	get name() { return this.model_type.name; }
	
	/** 
	* Sets the name for this model
	* @type {string} 
	*/
	set name(value) { this.model_type.name = value; }
	
	/** 
	* Gets the type for this model (atomic or coupled)
	* @type {TypeModel} 
	*/
	get type() { return this.model_type.type; }
	
	/** 
	* Sets the type for this model (atomic or coupled)
	* @type {TypeModel} 
	*/
	set type(value) { this.model_type.type = value; }
	
	/** 
	* Gets the template for this model (usually json object)
	* @type {object} 
	*/
	get template() { return this.model_type.template; }
	
	/** 
	* Sets the template for this model (usually json object)
	* @type {object} 
	*/
	set template(value) { this.model_type.template = value; }
	
	/** 
	* Gets the ports for this model
	* @type {TypePort[]} 
	*/
	get ports() { return this.model_type.ports; }
	
	/** 
	* Gets the links for this model
	* @type {Link[]} 
	*/
	get links() { return this._json._links; }
	
	/** 
	* Sets the links for this model
	* @type {Link[]} 
	*/
	set links(value) { 
		this._json._links = [];
		
		value.forEach(l => this.add_link(l));
	}
	
    /**
     * @param {string} id - unique id for the model type
     * @param {TypeModel} model_type - model type for this model
     * @param {Link[]} Links - the message type associated to this model type
     */
	constructor(id, model_type, links) {		
		this._json = {};
		
		this.id = id || null;
		this.model_type = model_type || null;
		this.links = links || [];
	}
	
    /**
     * Returns the port corresponding to the port name provided.
     * @param {string} name - the name of the port to retrieve.
	 * @return {TypePort} the port corresponding to the port name provided.
     */
	get_port(name) {
		return this.model_type.get_port(name);
	}
	
    /**
     * Adds a link to the model
     * @param {Link} link - the link to add
	 * @return {Link} the link added
     */
	add_link(link) {
		this.links.push(link);
		
		return link;
	}
	
    /**
     * Returns all outgoing links from a port
     * @param {TypePort} port - the port for which to retrieve outgoing links
	 * @return {Link[]} the outgoing links from the port provided
     */
	get_port_links(port) {
		return this.links.filter(l => l.port_a.name == port.name);
	}
	
    /**
     * Applies the data template to an array of values
     * @param {string[]} values - the values to template
	 * @return {object} the values templated as an object 
     */
	apply_template(values) {
		return this.model_type.apply_template(values);
	}
	
    /**
     * Get an empty templated object 
	 * @return {object} templated 0 values
     */
	get_template_0() {
		this.model_type.get_template_0();
	}
}