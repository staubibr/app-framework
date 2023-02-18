'use strict';

import List from '../../base/list.js';
import Model from './model.js';
import ModelCoupled from './model-coupled.js';
import SubcomponentCell from './subcomponent-cell.js';
import Dimensions from './dimensions.js';

/**
 * Metadata coupled grid model element
 * @module metadata/model-grid
 * @extends Model
 */
export default class ModelGrid extends Model { 
	
	get subcomponent() { return this.json["subcomponent"]; }
	
	get dimensions() { return this.json["dimensions"]; }
	
	get state() { return this.json["state"]; }
	
	get index() { return this._index; }
	
    /**
     * @param {object} json - JSON used to initialize the object.
     */
	constructor(json) {
		super(json);
		
		this._index = []
		
		if (!this.subcomponent) this.json["subcomponent"] = [];
		this.json["subcomponent"] = new List(s => s.id, this.subcomponents);
	}
		
	build_index(metadata, type) {		
		var id = 0;
		
		for (var x = 0; x < this.dimensions.x; x++) {
			this.index[x] = [];
			
			for (var y = 0; y < this.dimensions.y; y++) {
				this.index[x][y] = [];
			
				for (var z = 0; z < this.dimensions.z; z++) {
					var cell = SubcomponentCell.make(`c-${id++}`, type, [x,y,z]);
					this.index[x][y][z] = metadata.models.add(this.subcomponent.add(cell));
				}
			}
		}
	}
	
	get_cell(x, y, z) {
		return this.index[x][y][z];
	}
	
	toJSON() {
		return {
			"identifier": this.id,
			"title": this.title,
			"port": this.ports,
			"message type": this.message_type,
			"model type": this.model_type instanceof Model ? this.model_type.id : this.model_type,
			"dimensions": this.dimensions,
			"state": this.state
		}
	}
	
	static make(id, title, state, dimensions) {
		return new ModelGrid({
			"identifier": id,
			"title": title,
			"port": null,
			"message type": [state.message_type],
			"subcomponent": null,
			"state": state,
			"dimensions": dimensions
		});
	}
}