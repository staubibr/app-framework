'use strict';

/** 
 * A Type used for both Port Types and Model Types. The main objective of this class
 * is to hold a message type to reconstruct either output or state messages.
 * @see MessageType
 **/
export default class Type { 

	/** 
	* Gets the name of the type
	* @type {string} 
	*/
	get name() { return this._json.name; }
	
	/** 
	* Sets the name of the type
	* @type {string} 
	*/
	set name(value) { this._json.name = value; }
	
	/** 
	* Gets the subtype of the type object. This can be input, output, atomic or
    * coupled, depending on the specialization class.
	* @type {string} 
	*/
	get type() {  return this._json.type; }
	
	/** 
	* Sets the subtype of the type object. This can be input, output, atomic or
    * coupled, depending on the specialization class.
	* @type {string} 
	*/
	set type(value) { this._json.type = value; }
	
	/** 
	* Gets the message type associated to the type
	* @type {MessageType} 
	*/
	get message_type() { return this._json.message_type; }
	
	/** 
	* Sets the message type associated to the type
	* @type {MessageType} 
	*/
	set message_type(value) { this._json.message_type = value; }
	
	/** 
	* Gets the message type template associated to the type
	* @type {object} 
	*/
	get template() { return this.message_type.template; }
	
	/** 
	* Sets the message type template associated to the type
	* @type {object} 
	*/
	set template(value) { this.message_type.template = value; }
	
    /**
     * @param {string} name - name of the model type
     * @param {string} type - the subtype of the type object. This can be input, 
	 * output, atomic or coupled, depending on the specialization class.
     * @param {MessageType} message_type - the message type associated to the type
     */
	constructor(name, type, message_type) {
		this._json = {}
		
		this.name = name || null;
		this.type = type || null;
		this.message_type = message_type || null;
	}
	
    /**
     * Applies the data template to an array of values
     * @param {string[]} values - the values to template
	 * @return {object} the values templated as an object 
     */
	apply_template(values) {
		if (!this.message_type || !this.template) return values;
		
		if (this.template.length != values.length) {
			throw new Error("length mismatch between message type fields and message content. Check that your output function returns a comma delimited string the same length as your message_type fields property. ");			
		}
		var out = {};
		
		for (var i = 0; i < this.template.length; i++) {
			var f = this.template[i];
			var v = values[i];
			
			if (v != "") out[f] = isNaN(v) ? v : +v;
		}
		
		return out;
	}
	
    /**
     * Get an empty templated object 
	 * @return {object} templated 0 values
     */
	get_template_0() {
		if (!this.message_type || !this.template) return 0;
		
		var d = {};
		
		this.template.forEach(f => d[f] = 0);
		
		return d;
	}
}