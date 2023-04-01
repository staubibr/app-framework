'use strict';

import Subcomponent from './subcomponent.js';
import Model from './model.js';

/**
 * Metadata subcomponent-cell element for coupled models
 * @module metadata/subcomponent
 * @extends JsonObject
 */
export default class SubcomponentCell extends Subcomponent { 
	
	constructor(json) {
		super(json);
		
		this.x = json.coords[0];
		this.y = json.coords[1];
		this.z = json.coords[2];
	}
	
	toJSON() {
		return {
			"identifier": this.id,
			"model type": this.type.id,
			"coords": [this.x, this.y, this.z]
		}
	}

	static make(id, type_id, coords) {
		return {
			"identifier": id,
			"model type": type_id,
			"coords": coords
		};
	}
}