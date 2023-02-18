'use strict';

import JsonObject from '../../base/json-object.js';
import List from '../../base/list.js';
import Field from './field.js';

/**
 * Metadata message type element
 * @module metadata/message-type
 * @extends JsonObject
 */
export default class MessageType extends JsonObject { 
	
	get id() { return this.json["identifier"]; }
	
	get field() { return this.json["field"]; }
	
	get index() { return this._index; }
	
    /**
     * @param {object} json - JSON used to initialize the object.
     */
	constructor(json) {
		super(json);
		
		if (!this.field) this.json["field"] = [];
		this.json["field"] = new List(f => f.name, this.field);
		
		this._index = {};
		
		for (var i = 0; i < this.field.length; i++) this._index[this.field[i].name] = i;
	}
	
	pair(values, fn) {
		for (var i = 0; i < this.field.length; i++) {
			fn(this.field[i], values[i]);
		}
	}
	
	template(values, fn) {
		var t = {};
		
		for (var i = 0; i < this.field.length; i++) {
			t[this.field[i].name] = values[i];
		}
		
		return t;
	}
	
	static make(id, fields) {
		return new MessageType({
			"identifier": id,
			"field": fields
		});
	}
}