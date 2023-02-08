'use strict';

import Section from './section.js';

/** 
 * A configuration class that holds GRID visualization parameters for CA models
 **/
export default class Grid extends Section { 
	
	/** 
	* Gets the number of columns for the grid. 
	* @type {number} 
	*/
	get columns() { return this._json.columns; }
	
	/** 
	* Gets the width for the grid. 
	* @type {number} 
	*/
	get width() { return this._json.width; }
	
	/** 
	* Gets the height for the grid. 
	* @type {number} 
	*/
	get height() { return this._json.height; }
	
	/** 
	* Gets the spacing between layers of the grid, in pixels. 
	* @type {number} 
	*/
	get spacing() { return this._json.spacing; }
	
	/** 
	* Gets Indicates whether the grid should be drawn
	* @type {boolean} 
	* @unused
	*/
	get show_grid() { return this._json.showGrid; }
	
	/** 
	* Gets whether the aspect ratio should be preserved for each grid layer.
	* @type {boolean} 
	*/
	get aspect() { return this._json.aspect; }
	
	/** 
	* Gets the layers configuration for the grid. 
	* @type {object[]} 
	*/
	get layers() { return this._json.layers; }
	
	/** 
	* Gets the styles configuration for the grid. 
	* @type {object[]} 
	*/
	get styles() { return this._json.styles; }
	
	/** 
	* Sets the number of columns for the grid. 
	* @type {number} 
	*/
	set columns(value) { this._json.columns = value; }
	
	/** 
	* Sets the width for the grid. 
	* @type {number} 
	*/
	set width(value) { this._json.width = value; }
	
	/** 
	* Sets the height for the grid. 
	* @type {number} 
	*/
	set height(value) { this._json.height = value; }
	
	/** 
	* Sets the spacing between layers of the grid, in pixels. 
	* @type {number} 
	*/
	set spacing(value) { this._json.spacing = value; }
	
	/** 
	* Sets Indicates whether the grid should be drawn
	* @type {boolean} 
	* @unused
	*/
	set show_grid(value) { this._json.showGrid = value; }
	
	/** 
	* Sets whether the aspect ratio should be preserved for each grid layer.
	* @type {boolean} 
	*/
	set aspect(value) { this._json.aspect = value; }
	
	/** 
	* Sets the layers configuration for the grid. 
	* @type {object[]} 
	*/
	set layers(value) { this._json.layers = value; }
	
	/** 
	* Sets the styles configuration for the grid. 
	* @type {object[]} 
	*/
	set styles(value) { this._json.styles = value; }
	
	constructor(json, simulation) {
		super(json);
		
		if (!simulation) return;
		
		if (this.layers.length == 0) {
			this.layers = this.default_layers(simulation.max_z, simulation.ports);
			this.columns = this.default_columns(this.layers);
		}
	}
	
    /**
     * Builds the default json object for the configuration section. 
     */
	default() {
		this.json.columns = 1;
		this.json.width = 350;
		this.json.height = 350;
		this.json.spacing = 10;
		this.json.showGrid = false;
		this.json.aspect = true;
		this.json.layers = [];
		this.json.styles = [];
	}
	
    /**
     * Builds the default layers array for the configuration section. 
     * @param {object} maxZ - The number of layers on the cell-space.
     * @param {string[]} ports - The name of the ports to draw on the layer.
	 * @return {object[]} an array of default layer configurations
     */
	default_layers(maxZ, ports) {
		var layers = [];
		
		for (var i = 0; i < maxZ; i++) {
			ports.forEach(p => {				
				layers.push({ z:i, ports:[p], style:0, position:layers.length });
			});
		}
		
		return layers;
	}
	
    /**
     * Determine the default number of columns to use to draw the simulation. 
     * @param {object[]} layers - an array of layer configurations.
	 * @return {number} the default number of columns to use to draw the simulation. 
     */
	default_columns(layers) {		
		return layers.length > 3 ? 3 : layers.length;	
	}
	
    /**
     * Reads the json configuration provided to the section. Any parameter provided should be optional
	 * and overwrite the default json configuration for the section.
     * @param {object} json - The provided json configuration.
     */
	configure(json) {
		if (json.columns != undefined) this.json.columns = json.columns;
		if (json.width != undefined) this.json.width = json.width;
		if (json.height != undefined) this.json.height = json.height;
		if (json.spacing != undefined) this.json.spacing = json.spacing;
		if (json.aspect != undefined) this.json.aspect = json.aspect;
		if (json.showGrid != undefined) this.json.showGrid = json.showGrid;
		if (json.layers != undefined) this.json.layers = json.layers;
		if (json.styles != undefined) this.json.styles = json.styles;
	}	
	
	
    /**
     * Adds a style to the grid configuration.
     * @param {object[]} buckets - An array of classification buckets { start:number, end:number, color:[number,number,number]}.
     * @return {object} the style object 
	 * @todo style object should be made into a class
	 */
	add_style(buckets) {
		var style = { buckets:buckets };
		
		this.styles.push(style);
		
		return style;
	}
	
    /**
     * Removes a style from the grid configuration.
     * @param {object} style - The style object to remove from the grid configuration.
	 * @todo style object should be made into a class
	 */
	remove_style(style) {
		var i = this.styles.indexOf(style);
		
		this.styles.splice(i, 1);
		
		this.layers.forEach(l => {
			if (l.style == i) l.style = 0;
		});
	}
	
    /**
     * Adds a layer to the grid configuration. A layer configuration determines how the layer will be drawn.
     * @param {number} z - The z value for the layer to draw.
     * @param {string[]} ports - An array of port names that will be drawn on the layer
     * @param {number} style - The index of the style used to draw the layer.
	 * @return {object} the layer configuration added
	 */
	add_layer(z, ports, style) {
		var layer = { z:z, ports:ports, style:style, position:this.layers.length }
		
		this.layers.push(layer);
		
		return layer;
	}
	
    /**
     * Removes a layer from the grid configuration. A layer configuration determines how the layer will be drawn.
     * @param {object} layer - the layer configuration to remove
	 */
	remove_layer(layer) {
		var i = this.layers.indexOf(layer);
		
		this.layers.splice(i, 1);
		
		for (var i = 0; i < this.layers.length; i++) this.layers[i].position = i;
	}
	
    /**
     * Returns the canvas size considering the number of columns, spacing between them, width and height available.
	 * @param {Simulation} simulation - The simulation object
	 * @param {number} nGrids - the number of grids to draw (optional, all by default)
	 * @return the canvas size { width, height }
	 */
	canvas_size(simulation, nGrids) {
		nGrids = nGrids || simulation.dimensions.z;
		
		var aspect = this.aspect;
		var space = this.spacing;
		var cols = this.columns;
		var rows = Math.ceil(nGrids / cols);
		var width = this.width;
		var height = this.height;
		
		if (aspect) height = width / simulation.ratio;
		
		width = (cols * width + space * cols - space);
		height = (rows * height + rows * space - space);
		
		return { width : width, height : height }
	}
}
