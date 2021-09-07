'use strict';

import Entity from "./entity.js";

export default class FileType extends Entity { 
	
    get description() { return this._json.description; };
    get extension() { return this._json.extension; };
	
    set description(value) { this._json.description = value; };
    set extension(value) { this._json.extension = value; };
	
	get label() { return null; }
	
	constructor(json, complex) {
		super(json);
	}
}