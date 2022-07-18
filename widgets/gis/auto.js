'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Net from '../../tools/net.js';
import GIS from '../gis/gis.js';
import Automator from '../../components/automator.js';
import Reader from '../../components/chunk-reader.js';
import AppConfig from '../../components/config.js';

export default Core.templatable("Api.Widget.GIS.Auto", class AutoGIS extends Automator { 

	get canvas() { return this.widget.canvas; }
	
	constructor(node, simulation, options, files) {
		if (!options) throw new Error("No options provided for the GIS widget");
		
		super(new GIS(node), simulation);
		
		this.config = options;		
		
		this.load(options, files).then(data => {
			this.widget.load(options, data, simulation).then(this.on_map_ready.bind(this), this.on_map_error.bind(this));
		});
		
		this.simulation.on("move", this.on_simulation_move.bind(this));
		this.simulation.on("jump", this.on_simulation_jump.bind(this));
	}
	
	load(config, files) {
		// Load all geojson data layers contained in visualization.json
		var defs = config.layers.map(l => {
			if (l.file) {
				var f = files.find((f) => f.name == l.file);
				
				if (f) return Reader.read_as_json(f);
				
				if (!AppConfig.URLs.models) { 
					throw new Error(`Required file for layer ${l.id} was not provided by the user. Unable to fall back on server-side load, Core root is not configured.`);
				}
				
				l.url = AppConfig.URLs.models + "/" + l.file;
			}
			
			return Net.json(l.url);	
		});
		
		return Promise.all(defs);
	}
	
	on_map_ready(ev) {		
		this.config.on("change", this.on_settings_change.bind(this));
		
		this.emit("ready", { view:this });
	}
	
	redraw() {
		this.widget.draw(this.simulation.state.data);
	}
	
	resize() {
		
	}
	
	on_simulation_jump(ev) {
		this.widget.draw(ev.state.data);
	}
	
	on_simulation_move(ev) {
		var data = {};
		
		ev.frame.state_messages.forEach(t => data[t.model.id] = t.value);
		
		this.widget.draw(data);
	}
	
	on_settings_change(ev) {			
		
	}
	
	on_map_error(error) {
		alert(error.toString());
	}
});