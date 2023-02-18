'use strict';

import Model from './model.js';
import State from './state.js';

/**
 * Metadata atomic model element
 * @module metadata/model-atomic
 * @extends Model
 */
export default class ModelAtomic extends Model { 
	
	//get time() { return this.json["time"]; }
	
	get state() { return this.json["state"]; }
	
	static make(id, title, state) {
		return new ModelAtomic({
			"identifier": id,
			"title": title,
			"port": null,
			"message type": [state.message_type],
			"state": state
		});
	}
}