'use strict';

import Reader from "../components/chunk-reader.js";
import Metadata from '../data_structures/metadata/metadata.js';
import MessageOutput from '../data_structures/simulation/message-output.js';
import MessageState from '../data_structures/simulation/message-state.js';
import Frame from '../data_structures/simulation/frame.js';
import ConfigurationDiagram from '../data_structures/visualization/configuration-diagram.js';
import Parser from './parser.js';
import MaUtil from './ma-util.js'

/**
 * A parser component to process the raw Cell-DEVS results from CDpp or Lopez
 */
export default class ParserCadmium extends Parser { 
	
	/**                              
	 * Detects the parser to use. 
	 * @return {String} A string identifying the parser to use ("CDpp-Cell-DEVS", "Cadmium-V1" or "OGSE")
	 */		
	static detect(files) {
		return files.cd_ma && (files.cadmium_output || files.cadmium_state) ? true : false;
	}
	
	/**
	 * Parses the metadata.json file
	 * @return {ModelCoupled} the coupled model metadata
	 */		
	async parse_metadata() {
		var title = this.files.cd_ma.name.slice(0,-3);
		var tokens = await MaUtil.tokenize(this.files.cd_ma);
		var metadata = new Metadata("top", "top", title);
		
		tokens.forEach(t => {
			var curr = metadata.models.get(t.id);
			
			if (t.components) t.components.forEach(c => {
				var type = metadata.types.get(c.type);
				
				if (!type) {
					var token = tokens.get(c.id);
					
					if (token?.components) type = MaUtil.add_coupled(metadata, c.type);
					
					else type = MaUtil.add_atomic(metadata, c.type, [`s_${c.type}`]);
				}
				
				MaUtil.add_subcomponent(metadata, curr, c.id, c.type);
			});
			
			if (t.links) t.links.forEach(l => {
				// Three possible cases:
				// 		- out@receiver1 in2@Network
				//		- controlIn controlIn@sender1
				//		- packetSentOut@sender1 packetSentOut
				var m_from = !l.from.model ? curr : curr.subcomponent.get(l.from.model);
				var p_from = m_from.port.get(l.from.port);

				if (!p_from) p_from = MaUtil.add_port(m_from, "output", l.from.port, [l.from.port]);
				
				var m_to = !l.to.model ? curr : curr.subcomponent.get(l.to.model);
				var p_to = m_to.port.get(l.to.port);
				
				if (!p_to) p_to = MaUtil.add_port(m_to, "input", l.to.port, [l.to.port]);
				
				MaUtil.add_coupling(curr, m_from, p_from, m_to, p_to);
			});
		});
		
		return metadata;
	}
	
	/**                              
	 * Parses the visualization.json file
	 * @return {Configuration} a visualization configuration file
	 */		
	async parse_visualization() {
		var json = await Reader.read_as_json(this.files.visualization);
		var viz = new ConfigurationDiagram(json);
		
		viz.diagram = await Reader.read_as_text(this.files.diagram);
		
		return viz;
	}
	
	/**                              
	 * Parses the messages.log file
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {File} file - the messages.log file
	 * @return {Frame[]} an array of frames built from the messages.log
	 */		
	async parse_messages(simulation) {
		// TODO: Haven't done state frames since this Cadmium parser is only for DEVS models for now.
		// TODO: Visualization of DEVS models does not currently use state messages.
		// var s_frames = await this.parse_file(structure, states, this.parse_state_line);
		// var index = new List(f => f.time, s_frames);
		
		var o_frames = await this.parse_file(simulation.models, this.files.cadmium_output, this.parse_output_line);
		
		return o_frames;
	}
	
	/**                              
	 * Parses the messages.log file
	 * @param {List[Subcomponent]} models - the list of Subcomponent models
	 * @param {File} file - the messages.log file
	 * @return {Frame[]} an array of frames built from the messages.log
	 */		
	async parse_file(models, file, fn) {
		var t = null;
		this.frame = null;
		
		return Reader.read_by_chunk(file, "\n", (parsed, chunk, progress) => {
			if (parsed == null) parsed = [];
			
			// If line has only one item, then it's a timestep. Otherwise, it's a simulation message, 
			// the format then depends on the whether it's a DEVS, Cell-DEVS or Irregular model
			var lines = chunk.split("\n");
			
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i].trim();
				
				if (line.split(" ").length == 1) {
					if (t == line) continue;
					
					this.frame = new Frame(line);
					t = line;
					
					parsed.push(this.frame);
				}
				
				else fn(this.frame, models, line);
			}
			
			this.emit("progress", { progress: progress });
			
			return parsed;
		});
	}
	
	/**                              
	 * Parses a line from the messages.log. Adds it to the frame provided.
	 * @param {Frame} frame - a time frame for the simulation
	 * @param {List[Subcomponent]} models - the list of Subcomponent models
	 * @param {string[]} data - the split message
	 */	
	parse_state_line(frame, models, line) {
		// examples
		// State for model input_reader is next time: 00:00:00:000
		// State for model sender1 is <0, 0>	
		var data = line.split(" ");
		var name = data[3];
		var value = data.slice(5).join(" ");
		
		if (model) frame.add_state_message(new MessageState(models.get(name), [value]));	
	}
	
	/**                              
	 * Parses a line from the messages.log. Adds it to the frame provided.
	 * @param {Frame} frame - a time frame for the simulation
	 * @param {List[Subcomponent]} models - the list of Subcomponent models
	 * @param {string[]} data - the split message
	 */	
	parse_output_line(frame, models, line) {
		// examples
		// [Sender_defs::packetSentOut: {1}, Sender_defs::ackReceivedOut: {}, Sender_defs::dataOut: {1 0}] generated by model sender1	
		// [Receiver_defs::out: {0 0}] generated by model receiver1
		var name = line.slice(line.indexOf("]") + 2).split(" ")[3];
		var model = models.get(name);
		
		if (!model) return;
		
		var values = line.slice(1, line.indexOf("]"));
		var outputs = values.replaceAll("::", ":").split(",");
		
		outputs.forEach(o => {
			var split = o.split(":").map(o => o.trim());
			var value = split.pop();
			var port = model.port.get(split.pop());

			frame.add_output_message(new MessageOutput(model, port, [value]));	
		});
	}
}