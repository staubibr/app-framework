'use strict';

import List from '../../base/list.js';
import Model from './model.js';
import Subcomponent from './subcomponent.js';
import Coupling from './coupling.js';

/**
 * Metadata coupled model element
 * @module metadata/model-coupled
 * @extends Model
 */
export default class ModelCoupled extends Model { 
	
	get subcomponent() { return this.json["subcomponent"]; }
	
	get coupling() { return this.json["coupling"]; }
	
	get state() { return this.json["state"]; }
	
    /**
     * @param {object} json - JSON used to initialize the object.
     */
	constructor(json) {
		super(json);
		
		if (!this.subcomponent) this.json["subcomponent"] = [];
		this.json["subcomponent"] = new List(s => s.id, this.subcomponents);
		
		if (!this.coupling) this.json["coupling"] = [];
	}
	
	static make(id, title) {
		return new ModelCoupled({
			"identifier": id,
			"title": title,
			"port": null,
			"message type": null,
			"subcomponent": null,
			"coupling": null
		});
	}
}