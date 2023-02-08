'use strict';

import Core from '../tools/core.js';
import Evented from "../base/evented.js";
import Reader from "../components/chunk-reader.js";
import List from "../base/list.js";
import Configuration from '../data_structures/configuration/configuration.js';
import SimulationCA from "../data_structures/simulation/simulation_ca.js";
import Frame from "../data_structures/simulation/frame.js";
import MessageStateCA from "../data_structures/simulation/message_state_ca.js"
import TypeModelCA from '../data_structures/metadata/type_model_ca.js';
import TypePort from '../data_structures/metadata/type_port.js';
import ModelCA from '../data_structures/metadata/model_ca.js';
import MessageType from '../data_structures/metadata/message_type.js';
import Structure from "../data_structures/metadata/structure.js";
import Info from "../data_structures/metadata/info.js";

/**
 * A parser component to process the raw Cell-DEVS results from CDpp or Lopez
 */
export default class ParserCDpp extends Evented { 
	
	constructor() {
		super();
		
		this.initialValue = null;
		this.initialRowValues = null;
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
		
		var msg_type = new MessageType(msg_type_id, `s_${name}`, ["out"], "No description available.");
		var port = new TypePort("out", "output", null);
		var model_type = new TypeModelCA(model_type_id, name, type, msg_type, [port], null, null, null)
		var model = new ModelCA(name, model_type, null);
		
		structure.message_types.push(msg_type);
		structure.model_types.push(model_type);
		
		structure.add_model(model);
				
		return model;
	}
	
	/**                              
	 * Parses the *.ma file into a Structure object
	 * @param {File} ma - the *.ma file
	 * @return {Structure} the structure object built from the file
	 */		
	async parse_structure(ma) {	
		var s = new Structure(new Info("top", "CDpp", "Cell-DEVS"));	
		
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
				
				if (kv[0] == "components") {				
					var model = this.make_component(s, kv[1].split(' ')[0].trim(), "atomic");
					
					curr.add_submodel(model); 
				}
				
				else if (kv[0] == "dim") {
					curr.dim = kv[1].substring(1, kv[1].length - 1).split(",").map(c => +c.trim());
				
					if (curr.dim.length == 2) curr.dim.push(1);
				}
				
				else if (kv[0] == "height") {
					if (!curr.dim) curr.dim = [0, +kv[1], 1];
					
					else curr.dim[1] = +kv[1];
				}
				
				else if (kv[0] == "width") {
					if (!curr.dim) curr.dim = [+kv[1], 0, 1];
					
					else curr.dim[0] = +kv[1];
				}
				
				else if (kv[0] == "neighborports") {
					var ports = kv[1].split(" ").map(c => c.trim());
				
					ports.forEach(p => {
						curr.add_port(new TypePort(`out_${p}`, "output", null));
						curr.template.push(`out_${p}`);
					});
				}
				
				else if (kv[0] == "initialvalue") this.initialValue = kv[1];

				else if (kv[0] == "initialrowvalue") {
					if (this.initialRowValues == null) this.initialRowValues = [];
					
					var lr = kv[1].replace(/\s\s+/g, ',').split(',');
					
					this.initialRowValues.push({
						row: +lr[0],
						values: lr[1].split('')
					});
				}

			}
		}
		
		return s;
	}
	
	/**                              
	 * Parses the *.pal file
	 * @param {File} pal - the *.pal file
	 * @return {object} the style object
	 */	
	async parse_palette(pal) {
		var content = await Reader.read_as_text(pal);		
		var lines = content.trim().split("\n").map(l => l.trim());
		var style = { buckets: [] };
		
		// VALIDSAVEDFILE
		// 169,169,169
		// ...
		// 4.0,4.9
		if (lines[0] == "VALIDSAVEDFILE") {
			var j = 0;
			
			for (var i = 1; i < lines.length; i++) {
				var split = lines[i].split(',').map(l => +l.trim());
				
				if (split.length == 3) {
					style.buckets.push({ start:null, end:null, color:split });
				}

				else {
					style.buckets[j].start = split[0];
					style.buckets[j++].end = split[1];
				}
			}
		}
		
        // [-0.1;0.9] 255 255 51
        // [-1.1;-0.9] 153 255 255
        // ...
		else {
			for (var i = 0; i < lines.length; i++) {
				split = lines[i].replace('[','')
								.replace(']','')
								.replace(';',' ')
								.replaceAll(',','')
								.split(' ').map(s => +s);

				style.buckets.push({ start:split[0], end:split[1], color:[split[2], split[3], split[4]] });
			}
		}
		
		return [style];
	}
	
	/**                              
	 * Parses the initialrowvalues token in the ma file. 
	 * Adds corresponding messages to the frame 0.
	 * @param {Frame[]} frames - the simulation frames
	 * @param {string} t0  - the time 0 (i.e. 00:00:000)
	 * @param {Model} model - the top model of the simulation 
	 */	
	read_initial_row_values(frames, t0, model) {
		if (this.initialRowValues == null) return;
		
		var f0 = frames.get(t0) || frames.add(new Frame(t0));
		
		this.initialRowValues.forEach(irv => {
			irv.values.forEach((v, y) => {
				var coord = [irv.row, +y, 0]
				var value = model.template.map(t => v);
				
				f0.add_state_message(new MessageStateCA(coord, value));
			});
		});
	}
	
	/**                              
	 * Parses the initialvalues token in the ma file. 
	 * Adds corresponding messages to the frame 0.
	 * @param {Frame[]} frames - the simulation frames
	 * @param {string} t0  - the time 0 (i.e. 00:00:000)
	 * @param {Model} model - the top model of the simulation 
	 * @param {number[]} dim - the dimensions of the cell-space
	 */	
	read_initial_value(frames, t0, model, dim) {
		if (this.initialValue == null) return;
		
		var f0 = frames.get(t0) || frames.add(new Frame(t0));
		
        for (var x = 0; x < model.dim[0]; x++) {
            for (var y = 0; y < model.dim[1]; y++) {
                for (var z = 0; z < model.dim[2]; z++) {
					var coord = [x, y, z];
					var value = model.template.map(t => this.initialValue);
					
					f0.add_state_message(new MessageStateCA(coord, value));
				}
			}
		}		
	}
	
	/**                              
	 * Parses the *.val file. Adds corresponding messages to the frame 0.
	 * @param {Frame[]} frames - the simulation frames
	 * @param {string} t0  - the time 0 (i.e. 00:00:000)
	 * @param {File} val - the *.val file
	 */	
	async read_val(frames, t0, val) {
		if (!val) return;
		
		var f0 = frames.get(t0) || frames.add(new Frame(t0));
		var content = await Reader.read_as_text(val);		
		var lines = content.trim().split("\n").map(l => l.trim());
		
        // (0,0,0)=100 2 1
        // (0,0,1)=0.567 0 1
        // ...
		for (var i = 0; i < lines.length; i++) {
			var split = lines[i].split('=').map(l => l.trim()); 
			
			if (split.length != 2) continue;
			
			var coord = split[0].substring(1, split[0].length - 1).split(",").map(s => s.trim());
			var value = split[1].split(" ").map(v => v.trim());
			
			if (coord.length  == 2) coord.push("0");
			
			f0.add_state_message(new MessageStateCA(coord, value));
		}
	}
	
	
	/**                              
	 * Parses the *.map file. Adds corresponding messages to the frame 0.
	 * @param {Frame[]} frames - the simulation frames
	 * @param {string} t0  - the time 0 (i.e. 00:00:000)
	 * @param {Model} model - the top model of the simulation 
	 * @param {File} map - the *.map file
	 */	
	async read_map(frames, t0, model, map) {
		if (!map) return;
		
		var f0 = frames.get(t0) || frames.add(new Frame(t0));
		var content = await Reader.read_as_text(map);
		var lines = content.trim().split("\n").map(l => l.trim());		
		var i = 0;
		
		for (var x = 0; x < model.dim[0]; x++) {
			for (var y = 0; y < model.dim[1]; y++) {
				for (var z = 0; z < model.dim[2]; z++) {
					if (i == lines.length) throw new Error("missing initial values in map file."); 
											
					f0.add_state_message(new MessageStateCA([x, y, z], lines[i++].trim()));
				}
			}
		}
	}
	
	/**                              
	 * Parses the *val, *map and *.log file
	 * @param {Structure} structure - the structure object for a simulation
	 * @param {File} log - the *.log file
	 * @param {File} val - the *.val file
	 * @param {File} map - the *.map file
	 * @return {Frame[]} an array of frames built from the messages.log
	 */	
	async parse_messages(structure, log, val, map) {
		var lopez_test = await log.slice(0, 5).text();
		var is_lopez = lopez_test == "0 / L";
		var t0 = is_lopez ? "00:00:00:000:0" : "00:00:00:000";
		
		var model = structure.model_types[1];
		var frames = new List(f => f.time);
		
		if (!is_lopez) this.read_initial_value(frames, t0, model);
		if (!is_lopez) this.read_initial_row_values(frames, t0, model);
		
		await this.read_val(frames, t0, val);
		await this.read_map(frames, t0, model, map);
		
		await Reader.read_by_chunk(log, "\n", (parsed, chunk, progress) => {			
			var lines = chunk.split("\n");
			
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i];
				
				// Mensaje Y / 00:00:00:100 / flu(18,12)(645) / out /      2.00000 para flu(02)
				// Mensaje Y / 00:00:20:000 / sender(02) / dataout /     11.00000 para top(01)
				if (line.startsWith("Mensaje Y")) this.parse_cdpp_line(frames, line);
				
				else if (line.startsWith("0 / L / Y")) this.parse_lopez_line(frames, model, line);
			}
			
			this.emit("progress", { progress: progress });
		});
		
		frames.forEach(f => {
			f.state_messages.forEach(m => {
				m.value = model.apply_template(m.value);
			});
		});
		
		return frames;
	}
	
	/**                              
	 * Parses a CDpp line from the *.log. Adds it to the frame provided.
	 * @param {Frame[]} frames - a time frame for the simulation
	 * @param {string} line - a line from the *.log
	 */	
	parse_cdpp_line(frames, line) {
		var split = line.split('/').map(l => l.trim());
		var model = split[2].replaceAll('(', ' ').replaceAll(')', '').split(' ')
		var coord = model.length == 3 ? model[1].split(',') : null;
		
		var time = split[1]
		var port = split[3]
		var value = split[4].split(' ')[0]
		
		var frame = frames.get(time) || frames.add(new Frame(time));

		if (coord) {
			if (coord.length == 2) coord.push("0");
						
			frame.add_state_message(new MessageStateCA(coord, [value]));
		}
	}
	
	/**                              
	 * Parses a Lopez line from the *.log. Adds it to the frame provided.
	 * @param {Frame[]} frames - a time frame for the simulation
	 * @param {TypeModel} model_type - the TypeModel of the top model
	 * @param {string} line - a line from the *.log
	 */	
	parse_lopez_line(frames, model_type, line) {
		var split = line.split('/').map(l => l.trim());
		var model = split[4].replaceAll('(', ' ').replaceAll(')', '').split(' ')
		var c = model.length == 3 ? model[1].split(',') : null;
		
		var time = split[3]
		var port = split[5]
		var value = split[6]
		
		var frame = frames.get(time) || frames.add(new Frame(time));

		if (c) {
			if (c.length == 2) c.push("0");
			
			var m = frame.state_messages.find(m => m.x == c[0] && m.y == c[1] && m.z == c[2])

			if (!m) {
				var values = model_type.template.map(t => "");
				
				m = frame.add_state_message(new MessageStateCA(c, values));
			}
			
			var idx = model_type.ports.findIndex(p => p.name == port);
			
			m.value[idx] = value;
		}
	}
}