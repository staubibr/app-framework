'use strict';

export default class Contributor { 
	
    get id() { return this._json.id; };
    set id(value) { this._json.id = value; };
	
    get json() { return this._json; }
    set json(value) { this._json = value; }

	get label() { throw new Error("label getter must be implemented.") }
	
	constructor(json) {		
		this.json = json;
 	}
}

