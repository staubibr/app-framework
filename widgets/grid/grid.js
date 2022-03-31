'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Widget from '../../base/widget.js';
import Styler from '../../components/styler.js';

const STROKE_WIDTH = 2;
const DEFAULT_COLOR = "#fff";

export default Core.templatable("Api.Widget.Grid", class Grid extends Widget { 

	get canvas() { return this.elems.canvas; }
	
	set dimensions(value) { this._dimensions = value; }
	get dimensions() { return this._dimensions; }
	
	set columns(value) { this._columns = value; }
	get columns() { return this._columns; }
	
	set spacing(value) { this._spacing = value; }
	get spacing() { return this._spacing; }
	
	set layers(value) { 
		this._layers = value; 
		this._index = {};
		
		this._layers.forEach((l, i) => {			
			if (!this._index.hasOwnProperty(l.z)) this._index[l.z] = {};
			
			l.ports.forEach(p => {
				if (!this._index[l.z].hasOwnProperty(p)) this._index[l.z][p] = [];
				
				this._index[l.z][p].push(l);
			});
		});
	}
	
	get layers() { return this._layers; }
	
	set styles(value) { 
		this._styles = value;
		this._styler = new Styler(value);
	}
	
	get styles() { return this._styles; }
	get styler() { return this._styler; }

	constructor(container) {
		super(container);

		this._cell = { w:null, h:null };
		this._dimensions = null;
		this._columns = null;
		this._spacing = null;
		this._size = null;
		this._styles = null;
		this._layers = [];
		this._grids = [];

		this._ctx = this.elems.canvas.getContext("2d");
		
		this.elems.canvas.addEventListener("mousemove", this.on_canvas_mousemove.bind(this));
		this.elems.canvas.addEventListener("mouseout", this.on_canvas_mouseout.bind(this));
		this.elems.canvas.addEventListener("click", this.on_canvas_click.bind(this));
	}
	
	html() {
		return "<div class='grid-widget'>" + 
				  "<div handle='canvas_container' class='grid-canvas-container'>" +
					"<canvas handle='canvas' class='grid-canvas'></canvas>" +
				  "</div>" + 
			   "</div>";
	}

	get_rows(columns, layers) {
		return Math.ceil(layers.length / columns) ;
	}
	
	resize() {
		this._size = Dom.geometry(this.elems.canvas_container);
		
		// Number of columns and rows
		this._layout = {
			columns : this.columns,
			rows : this.get_rows(this.columns, this.layers)
		}

		// Size of one layer drawn, only used to determine cell size, shouldn't be used after
		var layer = {
			w : (this._size.w - (this._layout.columns * this.spacing - this.spacing)) / this._layout.columns,
			h : (this._size.h - (this._layout.rows * this.spacing - this.spacing)) / this._layout.rows
		}
		
		// Size of a cell
		this._cell = {
			w : Math.floor(layer.w / this.dimensions.x),
			h : Math.floor(layer.h / this.dimensions.y)
		}
		
		// Total effective size of drawing space 
		this._total = {
			w : (this._cell.w * this.dimensions.x) * this._layout.columns + this._layout.columns * this.spacing - this.spacing,
			h : (this._cell.h * this.dimensions.y) * this._layout.rows + this._layout.rows * this.spacing - this.spacing
		}

		// Determine offset w, h to center grid as much as possible
		this._margin = {
			w : (this._size.w - this._total.w) / 2,
			h : (this._size.h - this._total.h) / 2
		}
		
		this._grids = this.layers.map((l, i) => {	
			var row = Math.floor(i / this._layout.columns);
			var col = i - (row * this._layout.columns);

			var x1 = col * (this.dimensions.x * this._cell.w + this.spacing);
			var y1 = row * (this.dimensions.y * this._cell.h + this.spacing);
			var x2 = x1 + this._cell.w * this.dimensions.x;
			var y2 = y1 + this._cell.h * this.dimensions.y;

			return { x1:x1, y1:y1, x2:x2, y2:y2, z:l.z } 
		}) 
		
		this.elems.canvas.style.margin = `${this._margin.h}px ${this._margin.w}px`;		
		
		// Redefine with and height to fit with number of cells and cell size
		this.elems.canvas.width = this._total.w;	
		this.elems.canvas.height = this._total.h;	
	}
	
	// TODO : grid shouldn't use simulation object maybe?
	draw(state, simulation) {
		if (this.dimensions) this.draw_state(state, simulation);
		
		else this.default(DEFAULT_COLOR);
	}
	
	clear() {
		this._ctx.clearRect(0, 0, this._size.w, this._size.h);
	}
	
	default(color) {
		this._ctx.fillStyle = color;
		this._ctx.fillRect(0, 0, this._size.w, this._size.h);
	}
	
	// TODO : grid shouldn't use simulation object maybe?
	draw_state(state, simulation) {
		for (var i = 0; i < this.layers.length; i++) {
			var l = this.layers[i];
			var scale = this.styler.get_scale(l.style);
			
			for (var x = 0; x < this.dimensions.x; x++) {
				for (var y = 0; y < this.dimensions.y; y++) {
					for (var p = 0; p < l.ports.length; p++) {
						var v = state.get_value([x, y, l.z]); // value of cell to draw
						var f = l.ports[p]; 
						
						var color = this.styler.get_color(scale, v[f]) || 'rgb(200, 200, 200)';
						
						this.draw_cell(x, y, i, color);
					}
					
					var id = x + "-" + y + "-" + l.z; // id of cell to draw
					
					if (simulation.is_selected(id)) this.draw_cell_border(x, y, i, 'rgb(255,0,0)');
				}
			}
		}
	}
	
	// TODO : grid shouldn't use simulation object maybe?
	draw_changes(frame, simulation) {
		for (var i = 0; i < frame.state_messages.length; i++) {
			var m = frame.state_messages[i];
			
			for (var f in m.value) {
				var layers = this._index[m.z] && this._index[m.z][f] || [];
				var v = m.value[f];
				
				for (var j = 0; j < layers.length; j++) {
					var l = layers[j];
					var scale = this.styler.get_scale(l.style);
			
					this.draw_cell(m.x, m.y, l.position, this.styler.get_color(scale, v));
					
					if (simulation.is_selected(m.coord)) this.draw_cell_border(m.x, m.y, l.position, 'rgb(255,0,0)');
				}
			}
		}
	}
	
	get_cell(clientX, clientY) {
		var rect = this.elems.canvas.getBoundingClientRect();
		
		var x = clientX - rect.left;
		var y = clientY - rect.top;
		
		var zero = null;
		
		for (var k = 0; k < this._grids.length; k++) {
			if (x < this._grids[k].x1 || x > this._grids[k].x2) continue;
			
			if (y < this._grids[k].y1 || y > this._grids[k].y2) continue;
			
			zero = this._grids[k];
			
			break;
		}
		
		if (!zero || zero.y2 == y) return null;
		
		x = x - zero.x1;
		y = y - zero.y1;
		
		// Find the new X, Y coordinates of the clicked cell
		var pX = x - x % this._cell.w;
		var pY = y - y % this._cell.h;
		
		return { x:pX / this._cell.w, y:pY / this._cell.h, z:zero.z, k:k, layer:this.layers[k] };
	}
	
	draw_cell(x, y, k, color) {			
		var zero = this._grids[k];
			
		var x = zero.x1 + x * this._cell.w;
		var y = zero.y1 + y * this._cell.h;
		
		this._ctx.fillStyle = color;
		this._ctx.fillRect(x, y, this._cell.w, this._cell.h);
	}
	
	draw_cell_border(x, y, k, color) {	
		var zero = this._grids[k];
		
		// Find the new X, Y coordinates of the clicked cell
		var pX = zero.x1 + x * this._cell.w;
		var pY = zero.y1 + y * this._cell.h;
		
		var dX = pX + (STROKE_WIDTH / 2);
		var dY = pY + (STROKE_WIDTH / 2);
		
		// Define a stroke style and width
		this._ctx.lineWidth = STROKE_WIDTH;
		this._ctx.strokeStyle = color;
		
		// Draw rectangle, add offset to fix anti-aliasing issue. Subtract from height and width 
		// to draw border internal to the cell
		this._ctx.strokeRect(dX, dY, this._cell.w - STROKE_WIDTH, this._cell.h - STROKE_WIDTH);
	}
	
	on_canvas_click(ev) {		
		var data = this.get_cell(ev.clientX, ev.clientY);
		
		if (!data) return;
		
		this.emit("click", { x:ev.pageX, y:ev.pageY, data:data });
	}
	
	on_canvas_mousemove(ev) {				
		var data = this.get_cell(ev.clientX, ev.clientY);
		
		if (!data) return;
		
		this.emit("mousemove", { x:ev.pageX, y:ev.pageY, data:data });
	}
		
	on_canvas_mouseout(ev) {		
		this.emit("mouseout", { x:ev.pageX, y:ev.pageY });
	}
});