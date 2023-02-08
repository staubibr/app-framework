'use strict';

import Core from '../tools/core.js';
import Evented from "../base/evented.js";
import Reader from "../components/chunk-reader.js";
import List from "../base/list.js";
import Frame from "../data_structures/simulation/frame.js";
import MessageState from "../data_structures/simulation/message_state.js"
import MessageOutput from "../data_structures/simulation/message_output.js"

import TypeModel from '../data_structures/metadata/type_model.js';
import TypePort from '../data_structures/metadata/type_port.js';
import Model from '../data_structures/metadata/model.js';
import MessageType from '../data_structures/metadata/message_type.js';
import Structure from "../data_structures/metadata/structure.js";
import Info from "../data_structures/metadata/info.js";
import Link from "../data_structures/metadata/link.js";

/**
 * A parser component to process the raw Cell-DEVS results from CDpp or Lopez
 */
export default class ParserCadmium extends Evented { 
	
	
	/**                              
	 * Parses the visualization.json file
	 * @param {File} fViz - the visualization.json file
	 * @return {object} the json content
	 */		
	async parse_visualization(fViz) {
		return await Reader.read_as_json(fViz);
	}
	
	/**                              
	 * Parses a component token from the ma file into a structure model. 
	 * @param {Structure} structure - the simulation structure
	 * @param {string} name  - the name of the model
	 * @param {string} type - the type of the model
	 * @return {Model} the model created
	 */	
	make_component(structure, name, type) {
		var msg_type_id = structure.message_types.length;
		var model_type_id = structure.model_types.length;
		
		var message_type = structure.message_types[0];
		var model_type = new TypeModel(model_type_id, name, type, message_type, null, null, null)
		var model = new Model(name, model_type, null);
		
		structure.model_types.push(model_type);
		structure.add_model(model);
		
		return model;
	}
	
	make_port(structure, model, name, type) {
		var id = structure.message_types.length;
		var msg_type = new MessageType(id, `s_${name}`, [name], "");
		var p_from = new TypePort(name, type, msg_type);
		
		structure.message_types.push(msg_type);
		
		return model.model_type.add_port(p_from);		
	}
	
	/**                              
	 * Parses the *.ma file into a Structure object
	 * @param {File} ma - the *.ma file
	 * @return {Structure} the structure object built from the file
	 */		
	async parse_structure(ma) {	
		var s = new Structure(new Info("top", "Cadmium", "DEVS"));	
		var mt = new MessageType(0, "all", ["out"], "Generic message type for everything.");
		
		s.message_types.push(mt);
		
		var id = 0;
		var content = await Reader.read_as_text(ma); 
		var lines = content.split("\n");
		var curr = null;

		for (var i = 0; i < lines.length; i++) {
			var l = lines[i].trim();
			
			if (l.startsWith("[")) {		
				var name = l.substring(1, l.length - 1);
				
				if (name.toLowerCase() == "top") this.make_component(s, name, "coupled");
				
				curr = s.model_types.find(m => m.name == name);
			}
			
			else if (curr == null || l.startsWith('%') || !l.includes(":")) continue;
			
			else {
				var kv = l.split(':').map(l => l.trim());
				
				kv[0] = kv[0].toLowerCase();
				
				if (kv[0].toLowerCase() == "components") {				
					var model = this.make_component(s, kv[1].trim().split('@')[0], "atomic");
					curr.type = "coupled";
					curr.add_submodel(model); 
				}
				
				if (kv[0].toLowerCase() == "link") {
					// Link : out@receiver in2@Network 
					var od = kv[1].trim().split(" ").map(p => p.split("@"));
					
					if (od[0].length == 1) od[0].push(curr.name);
					if (od[1].length == 1) od[1].push(curr.name);
					
					var m_from = s.get_model(od[0][1]);
					var p_from = m_from.get_port(od[0][0]);
					
					if (!p_from) p_from = this.make_port(s, m_from, od[0][0], "output");
					
					var m_to = s.get_model(od[1][1]);
					var p_to = m_to.get_port(od[1][0]);
					
					if (!p_to) p_to = this.make_port(s, m_to, od[1][0], "input");
					
					m_from.add_link(new Link(m_from, p_from, m_to, p_to));
				}
			}
		}
		
		return s;
	}
	
	/**                              
	 * Parses the messages.log file
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {File} file - the messages.log file
	 * @return {Frame[]} an array of frames built from the messages.log
	 */		
	async parse_messages(structure, states, outputs) {
		// TODO: Haven't done state frames since this Cadmium parser is only for DEVS models for now.
		// TODO: Visualization of DEVS models does not currently use state messages.
		// var s_frames = await this.parse_file(structure, states, this.parse_state_line);
		// var index = new List(f => f.time, s_frames);
		
		var o_frames = await this.parse_file(structure, outputs, this.parse_output_line);
		
		return o_frames;
	}
	
	/**                              
	 * Parses the messages.log file
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {File} file - the messages.log file
	 * @return {Frame[]} an array of frames built from the messages.log
	 */		
	async parse_file(structure, file, fn) {
		this.frame = null;
		
		return Reader.read_by_chunk(file, "\n", (parsed, chunk, progress) => {
			if (parsed == null) parsed = [];
			
			// If line has only one item, then it's a timestep. Otherwise, it's a simulation message, 
			// the format then depends on the whether it's a DEVS, Cell-DEVS or Irregular model
			var lines = chunk.split("\n");
			
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i].trim();
				
				if (line.split(" ").length == 1) {
					this.frame = new Frame(line);
					
					parsed.push(this.frame);
				}
				
				else fn(this.frame, structure, line);
			}
			
			this.emit("progress", { progress: progress });
			
			return parsed;
		});
	}
	
	/**                              
	 * Parses a line from the messages.log. Adds it to the frame provided.
	 * @param {Frame} frame - a time frame for the simulation
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {string[]} data - the split message
	 */	
	parse_state_line(frame, structure, line) {
		// examples
		// State for model input_reader is next time: 00:00:00:000
		// State for model sender1 is <0, 0>	
		var data = line.split(" ");
		var name = data[3];
		var value = data.slice(5).join(" ");
		var model = structure.get_model(name);
		
		if (model) frame.add_state_message(new MessageState(model, model.apply_template([value])));	
	}
	
	/**                              
	 * Parses a line from the messages.log. Adds it to the frame provided.
	 * @param {Frame} frame - a time frame for the simulation
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {string[]} data - the split message
	 */	
	parse_output_line(frame, structure, line) {
		// examples
		// [Sender_defs::packetSentOut: {1}, Sender_defs::ackReceivedOut: {}, Sender_defs::dataOut: {1 0}] generated by model sender1	
		// [Receiver_defs::out: {0 0}] generated by model receiver1
		
		var name = line.slice(line.indexOf("]") + 2).split(" ")[3];
		var model = structure.get_model(name);
		
		if (!model) return;
		
		var values = line.slice(1, line.indexOf("]"));
		var outputs = values.replaceAll("::", ":").split(",");
		
		outputs.forEach(o => {
			var split = o.split(":").map(o => o.trim());
			var value = split.pop();
			var port = model.get_port(split.pop());

			frame.add_output_message(new MessageOutput(model, port, port.apply_template([value])));	
		});
	}
}