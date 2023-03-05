'use strict';

import Parser from './parser.js';
import Reader from "../components/chunk-reader.js";
import Metadata from '../data_structures/metadata/metadata.js';
import Subcomponent from '../data_structures/metadata/subcomponent.js';
import Scenario from '../data_structures/scenario/scenario.js';
import ModelAtomic from '../data_structures/metadata/model-atomic.js';
import ModelCoupled from '../data_structures/metadata/model-coupled.js';
import Coupling from '../data_structures/metadata/coupling.js';
import MessageOutput from '../data_structures/simulation/message-output.js';
import MessageState from '../data_structures/simulation/message-state.js';
import Frame from '../data_structures/simulation/frame.js';
import ConfigurationGis from '../data_structures/visualization/configuration-gis.js';

/**
 * A parser component to process the common results format
 */
export default class ParserOGSE extends Parser { 
	
	/**                              
	 * Detects the parser to use. 
	 * @return {String} A string identifying the parser to use ("CDpp-Cell-DEVS", "Cadmium-V1" or "OGSE")
	 */		
	static detect(files) {
		if (!files.find(f => f.name.toLowerCase() == "scenario.json")) return false;
		
		if (!files.find(f => f.name.toLowerCase() == "metadata.json")) return false;
		
		if (!files.find(f => f.name.toLowerCase() == "log.csv")) return false;
		
		return true;
	}
	
	constructor(files) {
		super(files);
		
		this.files.scenario = files.find(f => f.name.toLowerCase() == "scenario.json");
		this.files.metadata = files.find(f => f.name.toLowerCase() == "metadata.json");
		this.files.log = files.find(f => f.name.toLowerCase() == "log.csv");
		this.files.geojson = files.filter(f => f.name.toLowerCase().endsWith(".geojson"));
	}
	
	/**                              
	 * Parses the visualization.json file
	 * @return {Configuration} a visualization configuration file
	 */		
	async default_visualization() {
		throw new Error("No default visualization configuration available for GIS visualizations");
	}
	
	/**                              
	 * Parses the metadata.json file
	 * @return {ModelCoupled} the coupled model metadata
	 */		
	async parse_metadata() {
		var j_meta = await Reader.read_as_json(this.files.metadata);
		var j_scenario = await Reader.read_as_json(this.files.scenario);
		
		var scenario = new Scenario(j_scenario);
		var metadata = new Metadata();
		
		// TODO: Find better way to identify atomics and coupled ? 
		// should look at components but top has none (they are in scenario)
		j_meta.forEach(j => metadata.types.add(j.state ? new ModelAtomic(j): new ModelCoupled(j)));
		
		var top = new Subcomponent(Subcomponent.make("top", metadata.types.first.id));
		
		metadata.add_subcomponent(null, top);
		
		// TODO: This is a bit nasty, maybe it should all be on metadata.
		// Another option is to just do all this in scenario
		scenario.instances.forEach(i => {
			i.models.forEach(m => {
				var sc = new Subcomponent(Subcomponent.make(m[0], i.type));
				metadata.add_subcomponent(top.type, sc);
			});
		});
		
		scenario.couplings.forEach(c => {
			c.couplings.forEach(l => {
				var coupling = new Coupling(Coupling.make(l[0], c.from_port, l[1], c.to_port));
				metadata.add_coupling(top.type, coupling);
			})
		});
		
		return metadata;	
	}

	/**                              
	 * Parses the messages file (name changes according to parser)
	 * @return {Frame[]} an array of Frame objects
	 */		
	async parse_messages(simulation) {
		var t = null;
		this.frame = null;
		
		return Reader.read_by_chunk(this.files.log, "\n", (parsed, chunk, progress) => {
			if (parsed == null) parsed = [];
			
			// If line has only one item, then it's a timestep. Otherwise, it's a simulation message, 
			// the format then depends on the whether it's a DEVS, Cell-DEVS or Irregular model
			var lines = chunk.split("\n");
		
			for (var i = 0; i < lines.length; i++) {
				var data = lines[i].split(";");
				
				if (data[0] == "time") continue;
				
				if (t != data[0]) {
					t = data[0];
					this.frame = new Frame(t);
					parsed.push(this.frame);
				}
			
				else this.parse_line(this.frame, simulation, data);
			}
			
			this.emit("progress", { progress: progress });
			
			return parsed;
		});
	}
	
	/**                              
	 * Parses a line from the messages.log. Adds it to the frame provided.
	 * @param {Frame} frame - a time frame for the simulation
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {string} emitter - the emitter of the message
	 * @param {string} values - the value contained in the message
	 */	
	parse_line(frame, simulation, data) {
		// model_id is some kind of internal id generated by the simulator
		// model_name has the id assigned by OGSE
		// time;model_id;model_name;port_name;data		
		var model = simulation.models.get(data[2]);		
		var port = model.port.get(data[3]);
		
		// +v === +v is true when v is a number. It's supposedly faster and safer than isNaN
		var values = data[4].split(",").map(v => +v === +v ? +v : v);

		if (port) frame.add_output_message(new MessageOutput(model, port, values));
		
		else frame.add_state_message(new MessageState(model, values));	
	}
}