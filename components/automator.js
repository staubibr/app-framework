'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Component from '../base/component.js';

/**
 * A base class used to link a simulation with a widget
 */
export default class Automator extends Component { 
	/**                              
	 * Get the simulation object
	 */	
	get simulation() { return this._simulation; }
	
	/**                              
	 * Get the widget linked to the simulation
	 */	
	get widget() { return this._widget; }

	/**
	 * @param {Widget} widget - a widget to link to the simulation
	 * @param {Simulation} simulation - a simulation object
	 */	
	constructor(widget, simulation) {
		super();
		
		this._simulation = simulation;
		this._widget = widget;
		this._handles = [];
	}

	/**
	 * Adds handled events to the automator
	 * @param {object[]} handles - an array of event handles
	 */	
	handle(handles) {
		this._handles = this._handles.concat(handles);
	}

	/**
	 * Destroys the automator component. Deattach all handlers.
	 */	
	destroy() {
		this.widget.root.remove();
		
		this._handles.forEach((h) => {
			h.target.off(h.type, h.callback);
		});
		
		this._simulation = null;
		this._widget = null;
		this._handles = null;
	}

	/**
	 * Redraws the widget, must be inherited and overwritten
	 */	
	redraw() {
		
	}
};