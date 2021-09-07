'use strict';

import Entity from "./entity.js";

export default class Contributor extends Entity { 
	
    get first_name() { return this.json.first_name; };
    get last_name() { return this.json.last_name; };
    get middle_name() { return this.json.middle_name; };
    get email() { return this.json.email; };
    get affiliation() { return this.json.affiliation; };
    get creation_date() { return this.json.creation_date; };
	
    set first_name(value) { this.json.first_name = value; };
    set last_name(value) { this.json.last_name = value; };
    set middle_name(value) { this.json.middle_name = value; };
    set email(value) { this.json.email = value; };
    set affiliation(value) { this.json.affiliation = value; };
    set creation_date(value) { this.json.creation_date = value; };
	
	get label() { return this.full_name; }
	
	get full_name() {
		var name = [this.first_name];
		
		if (this.middle_name && this.middle_name.length > 0) name.push(this.middle_name);
		
		name.push(this.last_name);
		
		return name.join(" ");
	}
	
	constructor(json, complex) {
		super(json);
		
		json.creation_date = new Date(json.creation_date);
 	}
}

