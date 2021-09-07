'use strict';

import Entity from "./entity.js";

export default class Experiment extends Entity { 
	
    get project_name() { return this._json.project_name; };
    get name() { return this._json.name; };
    get description() { return this._json.description; };
    get date_created() { return this._json.date_created; };
    get author() { return this._json.author; };
    get top_model_type() { return this._json.top_model_type; };
	
    set project_name(value) { this._json.project_name = value; };
    set name(value) { this._json.name = value; };
    set description(value) { this._json.description = value; };
    set date_created(value) { this._json.date_created = value; };
    set author(value) { this._json.author = value; };
    set top_model_type(value) { this._json.top_model_type = value; };
	
	get label() { return this.name; }
		
	constructor(json, complex) {
		super(json);
		
		json.date_created = new Date(json.date_created);
	}
}