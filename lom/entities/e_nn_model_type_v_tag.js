'use strict';

import Entity from "./entity.js";

export default class NNModelTypeVTag extends Entity { 
	
    get model_type_id() { return this._json.model_type_id; };
    get tag_id() { return this._json.tag_id; };
	
    set model_type_id(value) { this._json.model_type_id = value; };
    set tag_id(value) { this._json.tag_id = value; };
	
	get label() { return null; }
	
	constructor(json, complex) {
		super(json);
	}
}