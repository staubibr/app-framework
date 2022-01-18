'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';
import Templated from '../components/templated.js';
import BoxInputFiles from '../ui/box-input-files.js';
import Parser from '../components/parser.js';
import ParserCDpp from '../components/parserCDpp.js';
import ChunkReader from '../components/chunkReader.js';
import Grid from '../data_structures/configuration/grid.js';
import SimulationDEVS from '../data_structures/simulation/simulationDEVS.js';
import SimulationCA from '../data_structures/simulation/simulationCA.js';

export default Core.Templatable("Widget.Loader", class Loader extends Templated { 

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
		
		this.Node("parse").On("click", this.onParseButton_Click.bind(this));
		this.Node("clear").On("click", this.onClearButton_Click.bind(this));
		this.Widget("dropzone").On("change", this.onDropzone_Change.bind(this));
	}
	
	UpdateButton() {
		this.Elem("parse").disabled = this.Widget("dropzone").files.length == 0;
	}

	RestoreUI() {
		Dom.AddCss(this.Elem("wait"), "hidden");
		
		this.Elem("parse").style.backgroundImage = null;	
	}
	
	async Load(files) {
		try {
			if (files.cd_ma && files.cd_log) await this.ParseCDpp(files);
			
			else if (!files.structure) throw new Error("Missing structure.json file, cannot parse.");
			
			else if (!files.messages) throw new Error("Missing messages.log file, cannot parse.");
			
			else await this.Parse(files);
		}
		catch (error) {
			this.onWidget_Error(error);
		}
	}
	
	async ParseCDpp(files) {		
		var parser = new Parser();
		var parserCDpp = new ParserCDpp();
		
		parserCDpp.On("Progress", this.OnParser_Progress.bind(this));
		
		var structure = await parserCDpp.ParseStructure(files.cd_ma);
		var messages = await parserCDpp.ParseMessages(structure, files.cd_log, files.cd_val, files.cd_map);
		var config = await parser.ParseVisualization(structure.type, files.visualization);
		
		var simulation = new SimulationCA(structure, messages, config.playback.cache);
			
		if (config.grid.layers.length == 0) config.grid = Grid.FromSimulation(simulation);
		
		if (files.style) config.grid.styles = await parser.ParseStyle(files.style);
		
		else config.grid.styles = await parserCDpp.ParsePalette(files.cd_pal);

		this.RestoreUI();
		
		this.Emit("ready", { files: files, simulation: simulation, configuration: config });			
	}
	
	async Parse(files) {
		var parser = new Parser();
		
		parser.On("Progress", this.OnParser_Progress.bind(this));
		
		var structure = await parser.ParseStructure(files.structure);
		var messages = await parser.ParseMessages(structure, files.messages);
		var diagram = await parser.ParseDiagram(files.diagram);
		var config = await parser.ParseVisualization(structure.type, files.visualization);
				
		if (config.grid) {
			var simulation = new SimulationCA(structure, messages, config.playback.cache);
			
			if (config.grid.layers.length == 0) config.grid = Grid.FromSimulation(simulation);
			
			if (files.style) config.grid.styles = await parser.ParseStyle(files.style);
		}
	
		else var simulation = new SimulationDEVS(structure, messages, config.playback.cache, diagram);
		
		this.RestoreUI();

		if (config.diagram && !simulation.diagram) {
			this.onWidget_Error(new Error("Diagram not found for DEVS simulation. Please provide a diagram.svg file and reload the simulation."));
		}

		else this.Emit("ready", { files: files, simulation: simulation, configuration: config });			
	}
	
	OnParser_Progress(ev) {		
		var c1 = "#198CFF";
		var c2 = "#0051A3";
		
		var bg = `linear-gradient(to right, ${c1} 0%, ${c1} ${ev.progress}%, ${c2} ${ev.progress}%, ${c2} 100%)`;
		
		this.Elem("parse").style.backgroundImage = bg;		
	}
	
	onDropzone_Change(ev) {		
		this.UpdateButton();
	}
		
	onParseButton_Click(ev) {
		Dom.RemoveCss(this.Elem("wait"), "hidden");
		
		this.files = this.Widget("dropzone").files;
		
		this.Load(this.files);
	}
	
	onClearButton_Click(ev) {
		this.Widget("dropzone").Clear();
		
		this.UpdateButton();
	}
	
	onWidget_Error(error) {
		console.error(error);
		this.Emit("error", { error:error });
		this.RestoreUI();
	}

	Template() {
		return "<div class='loader'>" +
				  "<div handle='wait' class='wait hidden'><img src='./assets/loading.svg'></div>" + 
			      "<div handle='dropzone' widget='Widget.Box-Input-Files'></div>" +
				  "<div class='box-input-files'>" +
					 "<button handle='clear' class='clear'>nls(Loader_Clear)</button>" +
					 "<button handle='parse' class='parse' disabled>nls(Loader_Parse)</button>" +
			      "</div>" +
			   "</div>";
	}
	
	static Nls() {
		return {
			"Loader_Clear" : {
				"en" : "Clear"
			},
			"Loader_Parse" : {
				"en" : "Load simulation"
			},
			"Dialog_Linker": {
				"en": "This visualization uses an SVG diagram. Do you want to review the associations between the diagram and the structure file?"
			}
		}
	}
});
