'use strict';

import Core from '../tools/core.js';
import Popup from '../ui/popup.js';

/** 
 * A Yes-No dialog popup box
 **/
export default class YesNo extends Popup { 
	
	/**
	 * Get the dialog message
	 * @type {string}
	 */
	get message() { return this._message; }
	
	/**
	 * Set the dialog message
	 * @type {string}
	 */
	set message(value) { 
		this._message = value; 
		
		this.elems.message.innerHTML = value;
	}
	
	/**
	 * Get the dialog user answer
	 * @type {string}
	 */
	get answer() { return this._answer; }
	
	/**
	 * Set the dialog user answer
	 * @type {string}
	 */
	set answer(value) { this._answer = value; }

	/**
	 * Constructor for the Yes-No dialog element. Follows the widget creation pattern.
	 * Adds it to the document body by default.
	 */	
	constructor() {
		super();
		
		this._message = null;
		this._answer = null;
		
		this.elems.yes.addEventListener("click", ev => {
			this.answer = "yes";
			
			this.hide();
		});
		
		this.elems.no.on("click", ev => {
			this.answer = "no";
			
			this.hide();
		});
	}
	
	/**
	 * Create HTML for select element
	 * @returns {string} HTML for select element
	 */
	html() {
		return "<div handle='popup' class='popup dialog dialog-confirm'>" +
				  "<div class='popup-header'>" +
					  "<h2 class='popup-title' handle='title'>nls(Dialog_Title)</h2>" +
					  "<button class='close' handle='close' title='nls(Popup_Close)'>×</button>" +
				  "</div>" +
				  "<div class='popup-body' handle='body'>" + 
					  "<div handle='message' class='dialog-message'></div>" +
					  "<div class='dialog-buttons'>" + 
						  "<button class='dialog-yes' handle='yes'>nls(Dialog_Yes)</button>" +
						  "<button class='dialog-no' handle='no'>nls(Dialog_No)</button>" +
					  "</div>" +
				  "</div>" +
			   "</div>";
	}
	
	/**
	 * Defines the localized strings used in this component
	 * @param {Nls} nls - The nls object containing the strings
	 */
	localize(nls) {
		nls.add("Dialog_Title", "en", "Confirm");
		nls.add("Dialog_Yes", "en", "Yes");
		nls.add("Dialog_No", "en", "No");
	}
};

Core.templatable("Api.UI.YesNo", YesNo);