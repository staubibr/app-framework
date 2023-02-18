'use strict';

import JsonObject from '../../base/json-object.js';
import MessageType from './message-type.js';

/**
 * Metadata state element for atomic models
 * @module metadata/state
 * @extends JsonObject
 */
export default class State extends JsonObject { 
	
	//get description() { return this.json["description"]; }
	
	get message_type() { return this.json["message type"]; }
	
	set message_type(value) { this.json["message type"] = value; }
	
	get fields() { return this.message_type.field; }
	
    /**
     * @param {object} json - JSON used to initialize the object.
     */
	constructor(json) {
		super(json);
	}
	
	toJSON() {
		return {
			// "description": this.description,
			"message type": this.message_type instanceof MessageType ? this.message_type.id : this.message_type
		}
	}
	
	static make(message_type) {
		return new State({
			"message type": message_type
		});
	}
}