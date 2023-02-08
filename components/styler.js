'use strict';

import Core from '../tools/core.js';
import Evented from '../base/evented.js';

/** 
 * A component that stores and retrieves styles for grids
 **/
export default class Styler extends Evented { 
	
	/**
	 * Gets true if no scales in the styler, false otherwise
	 * @type {boolean}
	 */
	get empty() { return this.scales.length == 0 };
	
	/**
	 * @param {object[]} scales - an array of color scales
	 */	
	constructor(scales) {
		super();
		
		this.scales = scales || [];
	}
	
	/**
	 * Get a color scale by index
	 * @param {number} idx - return scale by index
	 * @return {object} a color scale
	 */	
	get_scale(idx) {
		var scale = this.scales[idx];
		
		if (!scale) throw new Error(`Style #${idx} does not exist.`);
		
		return scale;
	}
	
	/**
	 * Get am individual color from a color scale for a value
	 * @param {object} scale - a color scale
	 * @param {number} value - a numberical value used to retrieve the color
	 * @return {string} a color string
	 */	
	get_color(scale, value) {		
		for (var i = 0; i < scale.buckets.length; i++) {
			var c = scale.buckets[i];
			
			if (value >= c.start && value <= c.end) return `rgb(${c.color.join(",")})`;
		}
	}
}