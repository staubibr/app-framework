'use strict';

export default class Indexed_List extends Array { 

	set fn_key(value) { this._fn_key = value; }
	get fn_key() { return this._fn_key; }

	set index(value) { this._index = value; }
	get index() { return this._index; }

	constructor(fn_key) {
		super();
		
		this.fn_key = fn_key;
		this.index = {};
	}
	
	add(item) {
		var key = this.fn_key(item);
		
		// if (this.has_key(key)) throw new Error("Key is already in index of indexed list.");
		
		if (!this.has_key(key)) {
			this.index[key] = item;
		
			this.push(item);
		}		
		
		return this.index[key];
	}
	
	get(key) {
		return this.index[key] || null;
	}

	has(item) {
		var key = this.fn_key(item);
		
		return this.has_key(key);
	}
	
	has_key(key) {
		return key in this.index;
	}
}