'use strict';

/** 
 * The message class contains the data that a model outputs or the state of the model.
 **/
export default class Message { 
	
    /**
     * @param {object} value - the message value.
     * @param {string} diff - the message value's difference with the previous state 
     */
	constructor(model, value) {
		this.model = model; 
		this.value = value;
	}
}
