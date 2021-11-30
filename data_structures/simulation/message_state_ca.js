'use strict';

import Message from './message.js';

export default class MessageStateCA extends Message {
	
	get model() { return this.coord; }
	
	get coord() { return this._coord; }
	
	get id() { return this.coord.join("-"); }
	
	get x() { return this.coord[0]; }

	get y() { return this.coord[1]; }
	
	get z() { return this.coord[2]; }
	
	constructor(coord, value) {
		super(value);
		
		this._coord = coord;
	}
	
	reverse() {		
		// TODO: Only place where we use GetDiff I think.		
		return new MessageStateCA(this.coord, this.get_diff());
	}
}