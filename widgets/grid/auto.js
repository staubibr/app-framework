'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Tooltip from '../../ui/tooltip.js';
import Automator from '../../components/automator.js';
import Grid from '../grid/grid.js';

export default Core.templatable("Api.Widget.Grid.Auto", class AutoGrid extends Automator { 

	get canvas() { return this.widget.canvas; }

	constructor(node, simulation, options) {
		if (!options) throw new Error("No options provided for the Grid widget");
		
		super(new Grid(node), simulation);
		
		this.options = options;
		
		this.widget.dimensions = this.simulation.dimensions;
		this.widget.columns = options.columns;
		this.widget.spacing	= options.spacing;
		this.widget.layers	= options.layers;
		this.widget.styles	= options.styles;
		
		this.attach_handlers(options);
		
		this.tooltip = new Tooltip();
	}
	
	attach_handlers(options) {
		var h = [];
		
		if (options.hoverEnabled != false) h.push(this.widget.on("mousemove", this.on_mousemove.bind(this)));
		if (options.hoverEnabled != false) h.push(this.widget.on("mouseout", this.on_mouseout.bind(this)));
		if (options.clickEnabled != false) h.push(this.widget.on("click", this.on_click.bind(this)));
		
		h.push(this.simulation.on("move", this.on_simulation_move.bind(this)));
		h.push(this.simulation.on("jump", this.on_simulation_jump.bind(this)));
		
		options.on("change", this.on_settings_change.bind(this));
		options.on("change:styles", this.on_settings_styles_change.bind(this));
		options.on("change:layers", this.on_settings_layers_change.bind(this));
		
		this.handle(h);
	}
	
	resize() {
		var n = this.widget.layers.length;
		var size = this.options.canvas_size(this.simulation, n);
			
		this.widget.container.style.width = size.width + "px";
		this.widget.container.style.height = size.height + "px";	
	}
	
	redraw() {
		this.widget.resize();
		
		this.widget.draw_state(this.simulation.state, this.simulation);
	}
	
	on_settings_change(ev) {			
		var check = ["height", "width", "columns", "spacing", "aspect", "layers"];

		if (check.indexOf(ev.property) == -1) return;
		
		this.widget.columns = this.options.columns;
		this.widget.spacing = this.options.spacing;
		this.widget.layers = this.options.layers;
		
		this.resize();
		this.redraw();
	}
	
	on_settings_styles_change(ev) {			
		this.redraw();
	}
	
	on_settings_layers_change(ev) {			
		this.redraw();
	}
	
	on_simulation_move(ev) {		
		var s = this.simulation;
		
		this.widget.draw_changes(ev.frame, s);
	}
	
	on_simulation_jump(ev) {
		var s = this.simulation;
		
		this.widget.draw_state(s.state, s);
	}
	
	on_simulation_palette_change(ev) {
		var s = this.simulation;
		
		this.widget.draw_state(s.state, s);
	}
	
	on_mousemove(ev) {
		var labels = [];
		
		ev.data.layer.ports.forEach(port => {
			var state = this.simulation.state.get_value([ev.data.x, ev.data.y, ev.data.layer.z]);
			var subs = [ev.data.x, ev.data.y, ev.data.layer.z, state[port], port];
			
			labels.push(this.nls("Grid_Tooltip_Title", subs));
			
			this.tooltip.show(ev.x + 20, ev.y);
		});
		
		this.tooltip.content = labels.join("<br>");
	}
	
	on_mouseout(ev) {
		this.tooltip.hide();
	}
	
	on_click(ev) {
		var id = [ev.data.x, ev.data.y, ev.data.z];
		
		if (this.simulation.is_selected(id)) {
			this.simulation.deselect(id);
			
			// TODO: This is nasty. Maybe just store the original color along with the id.
			var port = ev.data.layer.ports[ev.data.layer.ports.length - 1];
			var value = this.simulation.state.get_value(id);
			var scale = this.widget.styler.get_scale(ev.data.layer.style);
			var color = this.widget.styler.get_color(scale, value[port]);
			
			this.widget.draw_cell_border(ev.data.x, ev.data.y, ev.data.k, color);
		} 
		
		else {
			this.simulation.select(id);
			
			this.widget.draw_cell_border(ev.data.x, ev.data.y, ev.data.k, 'rgb(255,0,0)');
		}
	}
	
	localize(nls) {
		super.localize(nls);
		
		nls.add("Grid_Tooltip_Title", "en", "The state of cell <b>({0}, {1}, {2})</b> on port <b>{4}</b> is <b>{3}</b>.");
	}
});