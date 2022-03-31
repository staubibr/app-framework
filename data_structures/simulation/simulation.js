'use strict';

import Evented from '../../base/evented.js';
import IndexedList from '../../base/list.js';
import Cache from './cache.js';

/** 
 * The Simulation object contains all the data and metadata required to visually
 * represent and animate the simulation trace. Its main components are the structure
 * object which contains all information related to the model and the frames 
 * which contain all the messages for the simulation trace.
 * @see Structure, Frame, Message
 **/
export default class Simulation extends Evented { 
	
	/** 
	* Gets the simulation model structure
	* @type {Structure} 
	*/
	get structure() { return this._structure; }
	
	/** 
	* Gets the simulation name
	* @type {string} 
	*/
	get name() { return this.structure.info.name; }
	
	/** 
	* Gets the simulation type (DEVS, Cell-DEVS, GIS-DEVS)
	* @type {string} 
	*/
	get type() { return this.structure.info.type; }
	
	/** 
	* Gets the simulation models
	* @type {Model[]} 
	*/
	get models() { return this.structure.models; }
	
	/** 
	* Gets the time for the state of the simulation
	* @type {string} 
	*/
	get timestep() { return this.state.index; }
	
	/** 
	* Gets the current state of the simulation
	* @type {State} 
	*/
	get state() { return this._state; }
	
	/** 
	* Sets the current state of the simulation
	* @type {State} 
	*/
	set state(value) { this._state = value; }
	
	/** 
	* Gets the cache for the simulation
	* @type {Cache} 
	*/
	get cache() { return this._cache; }

	/** 
	* Gets currently selected models in the simulation
	* @type {Model[]} 
	*/
	get selected() { return this._selected; }
	
	/** 
	* Gets all frames in the simulation
	* @type {Frame[]} 
	*/
	get frames() { return this._frames; }

	/** 
	* Gets the current frame of the simulation
	* @type {Frame} 
	*/
	get current_frame() { return this.frames[this.timestep]; }
	
	/** 
	* Gets the first frame of the simulation
	* @type {Frame} 
	*/
	get first_frame() { return this.frames[0]; }
	
	/** 
	* Gets the last frame of the simulation
	* @type {Frame} 
	*/
	get last_frame() { return this.frames[this.frames.length - 1]; }
	
	/** 
	* Gets the height / width ratio for visual representation
	* @type {number} 
	*/
	get ratio() { 
		throw new Error("get ratio must be defined in child simulation class.");
	}
	
	/** 
	* Gets the size of the simulation (number of models)
	* @type {number} 
	*/
	get size() {
		return this.models.length;
	}

    /**
     * @param {Structure} structure - The simulation model structure.
     * @param {Frame[]} frames - An array of all the simulation frames.
     * @param {number} nCache - The cache interval.
     */
	constructor(structure, frames) {
		super();
		
		this._structure = structure
		this._state = this.get_initial_state(structure);
		this._selected = [];
		
		this._frames = new IndexedList(f => f.time);
		
		for (var i = 0; i < frames.length; i++) this.frames.add(frames[i]);
	}
	
	initialize(nCache) {
		this._cache = new Cache(nCache, this.frames, this.state);
		
		for (var i = 0; i < this.frames.length; i++) {
			this.frames[i].difference(this.state);
			this.state.apply_messages(this.frames[i]);
		}
		
		this._state = this.cache.first();
	}
	
    /**
     * Returns the model corresponding to the id provided.
     * @param {string} id - the id for the model to retrieve.
	 * @return {Model} the model instance corresponding to the id provided.
     */
	get_model(id) {
		return this.structure.get_model(id);
	}
	
    /**
     * Returns the port corresponding to the model id and port name provided.
     * @param {string} model_id - the id for the port's model.
     * @param {string} port_name - the name of the port to retrieve.
	 * @return {TypePort} the port corresponding to the model id and port name provided.
     */
	get_port(model_id, port_name) {
		return this.structure.get_port(model_id, port_name);
	}
	
    /**
     * Returns the state of the model for the frame at the position identified by the index provided.
     * @param {number} index - the position of the frame for which to retrieve the state.
	 * @return {State} the state corresponding to frame identified by the index provided.
     */
	get_state(index) {
		if (index == this.frames.length - 1) return this.cache.last();
		
		if (index == 0) return this.cache.first();
		
		var cached = this.cache.get_closest(index);
		
		for (var j = cached.index + 1; j <= index; j++) {
			cached.forward(this.frames[j]);
		}
		
		return cached;
	}
	
    /**
     * Moves the simulation state to frame at the position identified by the index provided.
     * @param {number} index - the index of the frame to move to.
     */
	go_to_frame(index) {
		this.state = this.get_state(index);
		
		this.emit("jump", { state:this.state, i: index });
	}
	
    /**
     * Moves the simulation state to the next frame.
     */
	go_to_next_frame() {
		var frame = this.frames[this.timestep + 1];
		
		this.state.forward(frame);
		
		this.emit("move", { frame : frame, direction:"next" });
	}
	
    /**
     * Moves the simulation state to the previous frame.
     */
	go_to_previous_frame() {
		var frame = this.frames[this.state.index].reverse();
		
		this.state.backward(frame);
		
		this.emit("move", { frame : frame, direction:"previous"});
	}
	
    /**
     * Gets a model from the selected models.
     * @param {Model} model - the model to retrieve.
	 * @return {Model} the model in the selection if present
     */
	get_selected(model) {
		return this.selected.find(s => s == model);
	}
	
    /**
     * Gets the model index from the selected models.
     * @param {Model} model - the model for which to retrieve the index.
	 * @return {number} the model index from the selected models
     */
	get_selected_index(model) {
		return this.selected.indexOf(this.get_selected(model));
	}
	
    /**
     * Determine whether a model is currently selected
     * @param {Model} model - the model to verify.
	 * @return {boolean} true if the model is selected, false otherwise
     */
	is_selected(model) {
		return !!this.get_selected(model);
	}
	
    /**
     * Add a model to the currently selected models
     * @param {Model} model - the model to select.
     */
	select(model) {
		var item = this.get_selected(model);
		
		// Already selected
		if (item) return;
		
		this.selected.push(model);
		
		this.emit("selected", { model:model, selected:true });
	}
	
	
    /**
     * Remove a model from the currently selected models
     * @param {Model} model - the model to deselect.
     */
	deselect(model) {
		var idx = this.get_selected_index(model);
		
		// Already not selected
		if (idx == -1) return;
		
		this.selected.splice(idx, 1);
		
		this.emit("selected", { model:model, selected:false });
	}
}