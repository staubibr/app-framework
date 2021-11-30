'use strict';

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
	* Gets interval between cached states.
	* @type {number} 
	*/
	get interval() { return this._interval; }

	/** 
	* Sets interval between cached states.
	* @type {number} 
	*/
	set interval(value) { this._interval = value; }
	
	/** 
	* Gets an array of states containing the cached states.
	* @type {State[]} 
	*/
	get states() { return this._states; }
	
	/** 
	* Gets an array of states containing the cached states.
	* @type {State[]} 
	*/
	set states(value) { this._states = value; }
	
    /**
     * @param {number} interval - The interval between cached states (1 cached state out of interval value).
     * @param {Frame[]} frames - An array of frame containing all the frames in the simulation.
     * @param {State} zero - An empty state object, valid for the simulation structure.
     */
	constructor(interval, frames, zero) {
		this.interval = interval;
		
		this.states = [];
		
		var state = zero;
		
		for (var i = 0; i < frames.length; i++) {
			state.forward(frames[i]);
			
			if (i % interval === 0) this.add_state(state);
		}
		
		if (i % interval != 0) this.add_state(state);
	}
	
    /**
     * Return the cached state closest to the position of the frame indicated by index.
	 * @param {number} index - position of the state to find the closest cached state.
     * @return {State} the closest state to the position of the frame indicated by index.
     */
	get_closest(index) {
		var diff = index % this.interval;
		
		return this.get_state((index - diff) / this.interval);
	}
	
    /**
     * Adds a cached state to the cache.
	 * @param {State} state - the state to add to the cache.
     */
	add_state(state) {
		this.states.push(state.clone());
	}
	
    /**
     * Return the cached state at position index from the cache.
	 * @param {number} index - position of the cached state to find
     * @return {State} the cached state at position index.
     */
	get_state(index) {
		return this.states[index].clone();
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