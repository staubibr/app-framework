'use strict';

import JsonObject from '../../base/json-object.js';
import Model from './model.js';

/**
 * Metadata subcomponent element for coupled models
 * @module metadata/subcomponent
 * @extends JsonObject
 */
export default class Subcomponent extends JsonObject { 
	
	get id() { return this.json["identifier"]; }
	
	get model_type() { return this.json["model type"]; }
	
	set model_type(value) { this.json["model type"] = value; }
	
	get port() { return this.model_type.port; }
	
	get state() { return this.model_type.state ?? null; }
	
	get message_type() { return this.model_type.message_type; }
	
	get subcomponent() { return this.model_type.subcomponent ?? null; }
	
	get coupling() { return this.model_type.coupling ?? null; }
		
	toJSON() {
		return {
			"identifier": this.id,
			"model type": this.model_type instanceof Model ? this.model_type.id : this.model_type
		}
	}
	
	static make(id, model_type) {
		return new Subcomponent({
			"identifier": id,
			"model type": model_type
		});
	}
}