'use strict';

import JsonObject from '../../base/json-object.js';
import List from '../../base/list.js';
import MessageType from './message-type.js';

/**
 * Metadata elements common to both atomic and coupled models
 * @module metadata/model
 * @extends JsonObject
 */
export default class Model extends JsonObject { 
	
	get id() { return this.json["identifier"]; }
	
	get title() { return this.json["title"]; }
	
	//get alternative() { return this.json["alternative"]; }
	
	//get creator() { return this.json["creator"]; }
	
	//get contributor() { return this.json["contributor"]; }
	
	//get language() { return this.json["language"]; }
	
	//get description() { return this.json["description"]; }
	
	//get subject() { return this.json["subject"]; }
	
	//get spatial_coverage() { return this.json["spatial coverage"]; }
	
	//get temporal_coverage() { return this.json["temporal coverage"]; }
	
	//get license() { return this.json["license"]; }
	
	//get created() { return this.json["created"]; }
	
	//get modified() { return this.json["modified"]; }
	
	//get behavior() { return this.json["behavior"]; }
	
	get port() { return this.json["port"]; }
	
	get message_type() { return this.json["message type"]; }
	
    /**
     * @param {object} json - JSON used to initialize the object.
     */
	constructor(json) {
		super(json);
		
		if (!this.port) this.json["port"] = [];
		this.json["port"] = new List(p => p.name, this.ports);
		
		if (!this.message_type) this.json["message type"] = [];
		this.json["message type"] = new List(m => m.id, this.message_type);
	}
	
	static make(id, title) {
		return new Model({
			"identifier": id,
			"title": title,
			"port": null,
			"message type": null
		});
	}
}