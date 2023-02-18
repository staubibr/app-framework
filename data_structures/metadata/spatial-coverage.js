'use strict';

import JsonObject from '../../base/json-object.js';

/**
 * Metadata spatial coverage element
 * @module metadata/spatial-coverage
 * @extends JsonObject
 */
export default class SpatialCoverage extends JsonObject { 
	
	get placename() { return this.json["placename"]; }
	
	get extent() { return this.json["extent"]; }
	
	static make(placename, extent) {
		return new SpatialCoverage({
			"placename": placename,
			"extent": extent
		});
	}
}
