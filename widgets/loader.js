'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Widget from '../base/widget.js';
import BoxInputFiles from '../ui/box-input-files.js';
import Parser from '../components/parser.js';
import ParserCDpp from '../components/parserCDpp.js';
import Configuration from '../data_structures/configuration/configuration.js';
import SimulationDEVS from '../data_structures/simulation/simulation_devs.js';
import SimulationCA from '../data_structures/simulation/simulation_ca.js';

export default Core.templatable("Api.Widget.Loader", class Loader extends Widget { 

	set files(value) {
		this._files = { 
			cd_ma: value.find(f => f.name.toLowerCase().endsWith('.ma')),
			cd_log: value.find(f => f.name.toLowerCase().includes('.log')),
			cd_pal: value.find(f => f.name.toLowerCase().endsWith('.pal')),
			cd_val: value.find(f => f.name.toLowerCase().endsWith('.val')),
			cd_map: value.find(f => f.name.toLowerCase().endsWith('.map')),
			structure: value.find(f => f.name == 'structure.json'),
			messages: value.find(f => f.name == 'messages.log'),
			diagram: value.find(f => f.name == 'diagram.svg'),
			visualization: value.find(f => f.name == 'visualization.json'),
			style: value.find(f => f.name == 'style.json'),
			geojson: value.filter(f => f.name.endsWith('.geojson'))
		}
	}
	
	get files() { return this._files; }
		
	constructor(node) {		
		super(node);
		
		this.elems.parse.addEventListener("click", this.on_parse_button_click.bind(this));
		this.elems.clear.addEventListener("click", this.on_clear_button_click.bind(this));
		this.elems.dropzone.on("change", this.on_dropzone_change.bind(this));
	}
	
	update_button() {
		this.elems.parse.disabled = this.elems.dropzone.files.length == 0;
	}

	restore_ui() {
		Dom.add_css(this.elems.wait, "hidden");
		
		this.elems.parse.style.backgroundImage = null;	
	}
	
	async load(files) {
		try {
			if (files.cd_ma && files.cd_log) await this.parse_cdpp(files);
			
			else if (!files.structure) throw new Error("Missing structure.json file, cannot parse.");
			
			else if (!files.messages) throw new Error("Missing messages.log file, cannot parse.");
			
			else await this.parse(files);
		}
		catch (error) {
			this.on_widget_error(error);
		}
	}
	
	async parse_cdpp(files) {		
		var parser = new Parser();
		var parserCDpp = new ParserCDpp();
		
		parserCDpp.on("progress", this.on_parser_progress.bind(this));
		
		var structure = await parserCDpp.parse_structure(files.cd_ma);
		var messages = await parserCDpp.parse_messages(structure, files.cd_log, files.cd_val, files.cd_map);
		var visualization = await parser.parse_visualization(files.visualization);
		var style = await parserCDpp.parse_palette(files.cd_pal);
		
		var simulation = new SimulationCA(structure, messages);
		var config = new Configuration(simulation, visualization, style);
		
		simulation.initialize(config.playback.cache);

		this.restore_ui();
		
		this.emit("ready", { files: files, simulation: simulation, configuration: config });			
	}
	
	async parse(files) {
		var parser = new Parser();
		
		parser.on("progress", this.on_parser_progress.bind(this));
		
		var structure = await parser.parse_structure(files.structure);
		var messages = await parser.parse_messages(structure, files.messages);
		var diagram = await parser.parse_diagram(files.diagram);
		var visualization = await parser.parse_visualization(files.visualization);
		var style = await parser.parse_style(files.style);

		if (structure.type != "Cell-DEVS") var simulation = new SimulationDEVS(structure, messages, diagram);
		
		else var simulation = new SimulationCA(structure, messages); 
			
		var config = new Configuration(simulation, visualization, style);
		
		simulation.initialize(config.playback.cache);
		
		this.restore_ui();

		this.emit("ready", { files: files, simulation: simulation, configuration: config });			
	}
	
	on_parser_progress(ev) {		
		var c1 = "#198CFF";
		var c2 = "#0051A3";
		
		var bg = `linear-gradient(to right, ${c1} 0%, ${c1} ${ev.progress}%, ${c2} ${ev.progress}%, ${c2} 100%)`;
		
		this.elems.parse.style.backgroundImage = bg;		
	}
	
	on_dropzone_change(ev) {		
		this.update_button();
	}
		
	on_parse_button_click(ev) {
		Dom.remove_css(this.elems.wait, "hidden");
		
		this.files = this.elems.dropzone.files;
		
		this.load(this.files);
	}
	
	on_clear_button_click(ev) {
		this.elems.dropzone.clear();
		
		this.update_button();
	}
	
	on_widget_error(error) {
		this.restore_ui();
		
		this.error(error);
	}

	html() {
		return "<div class='loader-widget'>" +
				  "<div handle='wait' class='wait hidden'><img src='./assets/loading.svg'></div>" + 
			      "<div handle='dropzone' widget='Api.Widget.BoxInputFiles'></div>" +
				  "<div class='box-input-files'>" +
					 "<button handle='clear' class='clear'>nls(Loader_Clear)</button>" +
					 "<button handle='parse' class='parse' disabled>nls(Loader_Parse)</button>" +
			      "</div>" +
			   "</div>";
	}
	
	localize(nls) {
		super.localize(nls);
		
		nls.add("Loader_Clear", "en", "Clear");
		nls.add("Loader_Parse", "en", "Load simulation");
		nls.add("Dialog_Linker", "en", "This visualization uses an SVG diagram. Do you want to review the associations between the diagram and the structure file?");
	}
});
