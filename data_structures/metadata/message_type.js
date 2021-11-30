'use strict';

/** 
* Contains all information required to interpret a simulation output or state message. 
*/
export default class MessageType { 

	/** 
	* Gets the unique id for this message type
	* @type {number} 
	*/
	get id() { return this._json.id; }
	
	/** 
	* Sets the unique id for this message type
	* @type {number} 
	*/
	set id(value) { this._json.id = value; }
	
	/** 
	* Gets the name for this message type
	* @type {string} 
	*/
	get name() {  return this._json.name; }
	
	/** 
	* Sets the name for this message type
	* @type {string} 
	*/
	set name(value) { this._json.name = value; }
	
	/** 
	* Gets the template for this message type. The template is a POJO object with place holders
	* to be filled by the message values. It is used to structure values associated to a message
	* @type {object} 
	*/
	get template() {  return this._json.template; }
	
	/** 
	* Sets the template for this message type. The template is a POJO object with place holders
	* to be filled by the message values. It is used to structure values associated to a message
	* @type {object} 
	*/
	set template(value) { this._json.template = value; }
	
	/** 
	* Gets the message description. The description describes the content of the message.
	* @type {string} 
	*/
	get description() {  return this._json.description; }
	
	/** 
	* Sets the message description. The description describes the content of the message.
	* @type {string} 
	*/
	set description(value) { this._json.description = value; }
	
    /**
     * @param {string} id - the unique id for this message type
     * @param {string} name - the name for this message type
     * @param {string} template - the template for this message type. The template is a POJO object 
	 *				   with place holders to be filled by the message values. It is used to structure
	 *  			   values associated to a message
     * @param {string} description - the message description
     */
	constructor(id, name, template, description) {
		this._json = {}
		
		this.id = id || null;
		this.name = name || null;
		this.template = template || null;
		this.description = description || null;
	}
}