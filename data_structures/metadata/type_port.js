'use strict';

import Type from "./type.js";

/** 
 * Port Type class, used for both input and output ports on models
 **/
export default class TypePort extends Type { 
	
    /**
     * @param {string} name - name of the port type
     * @param {string} type - type of port type (input or output)
     * @param {MessageType} message_type - the message type associated to this port type
     */
	constructor(name, type, message_type) {
		super(name, type, message_type);
	}
}