'use strict';

import JsonObject from '../../base/json-object.js';
import Subcomponent from './subcomponent.js';
import Port from './port.js';

/**
 * Metadata coupling element
 * @module metadata/coupling
 * @extends JsonObject
 */
export default class Coupling extends JsonObject { 
	
	get from_model() { return this.json["from model"]; }
	
	set from_model(value) { this.json["from model"] = value; }
	
	get from_port() { return this.json["from port"]; }
	
	set from_port(value) { this.json["from port"] = value; }
	
	get to_model() { return this.json["to model"]; }
	
	set to_model(value) { this.json["to model"] = value; }
	
	get to_port() { return this.json["to port"]; }
	
	set to_port(value) { this.json["to port"] = value; }
	
	toJSON() {
		return {
			"from model": this.from_model instanceof Subcomponent ? this.from_model.id : this.from_model,
			"from port": this.from_port instanceof Port ? this.from_port.name : this.from_port,
			"to model": this.to_model instanceof Subcomponent ? this.to_model.id : this.to_model,
			"to port": this.to_port instanceof Port ? this.to_port.name : this.to_port
		}
	}
	
	static make(from_model, from_port, to_model, to_port) {
		return new Coupling({
			"from model": from_model,
			"from port": from_port,
			"to model": to_model,
			"to port": to_port
		});
	}
}