'use strict';

import State from './state.js';
import List from '../../base/list.js';

/** 
 * The Cache object contains an array of states of the simulation at a specified interval. 
 * It is used to navigate the simulation trace more efficiently with the playback bar.
 **/
export default class Cache { 

	/** 
	* Gets the number of cached states.
	* @type {number} 
	*/
	get length() { return this.states.length; }
	
    /**
     * @param {number} interval - The interval between cached states (1 cached state out of interval value).
     * @param {Subcomponent[]} models - The list of models in the simulation
     */
	constructor(interval, models) {
		this.states = [new State(models)];
		this.interval = interval;
	}
	
	add_frame(frame, position) {
		if (position % this.interval == 1) this.states.push(this.last().clone());
		
		this.last().apply_frame(frame);
	}
	
    /**
     * Return the cached state closest to the position of the frame indicated by index.
	 * @param {number} index - position of the state to find the closest cached state.
     * @return {State} the closest state to the position of the frame indicated by index.
     */
	get_closest(position) {
		var diff = position % this.interval;
		
		return this.get_state((position - diff) / this.interval);
	}
	
    /**
     * Return the cached state at position index from the cache.
	 * @param {number} index - position of the cached state to find
     * @return {State} the cached state at position index.
     */
	get_state(position) {
		return this.states[position];
	}
	
	
    /**
     * Return the first cached state.
     * @return {State} the first cached state.
     */
	first() {
		return this.get_state(0);
	}
	
    /**
     * Return the last cached state.
     * @return {State} the last cached state.
     */
	last() {
		return this.get_state(this.length - 1);
	}
}