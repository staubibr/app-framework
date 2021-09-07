'use strict';

import Entity from "./entity.js";

export default class Tag extends Entity { 
	
    get value() { return this._json.value; };
    set value(value) { this._json.value = value; };
	
	get label() { return this.value; }
	
	constructor(json, complex) {
		super(json);
	}
}