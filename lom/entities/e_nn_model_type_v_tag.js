'use strict';

import Entity from "./entity.js";
import Tag from "./e_tag.js";

export default class NNModelTypeVTag extends Entity { 
	
    get model_type_id() { return this._json.model_type_id; };
    get tag_id() { return this._json.tag_id; };
    get tag() { return this._json.tag; };
	
    set model_type_id(value) { this._json.model_type_id = value; };
    set tag_id(value) { this._json.tag_id = value; };
    set tag(value) { this._json.tag = value; };
	
	get label() { return null; }
	
	constructor(json, complex) {
		super(json);
		
		if (complex) {
			json.tag = new Tag(json.tag, false);
		}
	}
}