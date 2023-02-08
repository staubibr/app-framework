'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Select from './select.js';

/** 
 * A replacement for a multi select component
 **/
export default class List extends Select {
	
	/**
	 * Constructor for the list element. Follows the widget creation pattern.
	 * @param {object} container - div container
	 */	
	constructor(container) {
		super(container);
	}
	
	/**
	 * Create HTML for select element
	 * @returns {string} HTML for select element
	 */
	html() {
		return '<select handle="root" multiple></select>';
	}
};

Core.templatable("Api.UI.List", List);