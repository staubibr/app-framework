'use strict';

import JsonObject from '../../base/json-object.js';

/**
 * Simulation scenario data structure
 * @module scenario/scenario
 * @extends JsonObject
 */
export default class Scenario extends JsonObject { 
	
	get instances() { return this.json["instances"]; }
	
	get couplings() { return this.json["couplings"]; }
	
    /**
     * @param {object} json - JSON used to initialize the object.
     */
	constructor(json) {
		super(json);
		
		if (this.instances) this.json["instances"] = this.instances.map(j => new InstanceSet(j));
		if (this.couplings) this.json["couplings"] = this.couplings.map(j => new CouplingSet(j));
	}
}