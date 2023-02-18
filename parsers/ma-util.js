'use strict';

import List from "../base/list.js";
import Reader from "../components/chunk-reader.js";
import ModelAtomic from '../data_structures/metadata/model-atomic.js';
import ModelCoupled from '../data_structures/metadata/model-coupled.js';
import ModelGrid from '../data_structures/metadata/model-grid.js';
import Subcomponent from '../data_structures/metadata/subcomponent.js';
import MessageType from '../data_structures/metadata/message-type.js';
import Coupling from '../data_structures/metadata/coupling.js';
import Port from '../data_structures/metadata/port.js';
import State from '../data_structures/metadata/state.js';
import Field from '../data_structures/metadata/field.js';
import Dimensions from '../data_structures/metadata/dimensions.js';
/**
 * Metadata field element
 * @module metadata/metadata
 * @extends List
 */
export default class MaUtil { 
	
	static async tokenize(file) {
		var components = ["top"];
		var content = await Reader.read_as_text(file); 
		var tokens = new List(c => c.id);
		var coupled = null;
		
		content.split("\n").map(l => l.trim()).forEach(l => {	
			if (l.startsWith("[")) {
				var name = l.substring(1, l.length - 1);
				
				if (components.indexOf(name.toLowerCase()) > -1) {
					coupled = tokens.add({ id: name });
				}
			}
			
			else if (coupled == null || l.startsWith('%') || !l.includes(":")) return;
			
			var kv = l.split(':').map(l => l.trim());
			
			if (kv[0].toLowerCase() == "components") {
				// 3 possible cases:	- sender1@Sender
				//						- Network
				//						- sandpile particleGenerator@Generator
				var d = kv[1].split(" ").map(c => c.trim().split('@'));
				
				if (!coupled.components) coupled.components = [];
				
				d.forEach(c => coupled.components.push({ 
					id:c[0], 
					type:c[1] ?? c[0]
				}));
				
				d.forEach(c => components.push(c[0].toLowerCase()));
			}
			
			else if (kv[0].toLowerCase() == "link") { 
				// 4 possible cases:	- out@receiver1 in2@Network
				//						- controlIn controlIn@sender1
				//						- packetSentOut@sender1 packetSentOut
				//						- in in@sandpile(5,5) --> Not handled				
				
				// workaround, ignore cases like in in@sandpile(5,5)
				if (kv[1].indexOf("(") > -1) return;
				
				var od = kv[1].trim().split(" ").map(p => p.split("@"));
				
				if (!coupled.links) coupled.links = [];
				
				coupled.links.push({
					from: { model:od[0][1], port:od[0][0] },
					to: { model:od[1][1], port:od[1][0] }
				});
			}
			
			else if (kv[0].toLowerCase() == "dim") {
				coupled.dim = kv[1].substring(1, kv[1].length - 1).split(",").map(c => +c.trim());
			
				if (coupled.dim.length == 2) coupled.dim.push(1);
			}
			
			else if (kv[0].toLowerCase() == "height") {
				if (!coupled.dim) coupled.dim = [0, +kv[1], 1];
				
				else coupled.dim[1] = +kv[1];
			}
			
			else if (kv[0].toLowerCase() == "width") {
				if (!coupled.dim) coupled.dim = [+kv[1], 0, 1];
				
				else coupled.dim[0] = +kv[1];
			}
		
			else if (kv[0].toLowerCase() == "neighborports") {			
				coupled.ports = kv[1].split(" ").map(c => c.trim());
			}
			
			else if (kv[0].toLowerCase() == "initialvalue") coupled.initial_value = +kv[1];

			else if (kv[0].toLowerCase() == "initialrowvalue") {
				if (coupled.initial_row_values == null) coupled.initial_row_values = new List(i => i.row);
				
				var lr = kv[1].replace(/\s\s+/g, ',').split(',');
				
				coupled.initial_row_values.add({
					row: +lr[0],
					values: lr[1].split('').map(v => +v)
				});
			}
		});
		
		return tokens;
	}
	
	static add_coupled(metadata, type) {
		var _coupled = ModelCoupled.make(type, type);
		
		return metadata.types.add(_coupled);
	}
	
	static add_coupled_grid(metadata, type, fields, dimensions) {
		var _dimensions = Dimensions.make(dimensions);
		var _fields = fields.map(f => Field.make(f))
		var _msg = MessageType.make(0, _fields);
		var _state = State.make(_msg);
		var _grid = ModelGrid.make(type, type, _state, _dimensions);
		
		return metadata.types.add(_grid);
	} 
	
	static add_atomic(metadata, type, fields) {
		var _fields = fields.map(f => Field.make(f))
		var _msg = MessageType.make(0, _fields);
		var _state = State.make(_msg);
		
		var _atomic = ModelAtomic.make(type, type, _state);
		
		return metadata.types.add(_atomic);
	}
	
	static add_subcomponent(metadata, coupled, id, type) {
		var _type = metadata.types.get(type);
		var _subcomponent = Subcomponent.make(id, _type);
		
		coupled.subcomponent.add(_subcomponent);
		
		return metadata.models.add(_subcomponent);
	}
	
	static add_port(model, port_type, port_name, fields) {
		var _id = model.message_type.length;
		var _fields = fields.map(f => Field.make(f));
		var _msg = MessageType.make(_id, _fields);
		var _port = Port.make(port_type, port_name, _msg);
		
		model.message_type.add(_msg);
		
		return model.port.add(_port);
	}
	
	static add_coupling(model, m_from, p_from, m_to, p_to) {
		var _coupling = Coupling.make(m_from, p_from, m_to, p_to);
		
		model.coupling.push(_coupling);
		
		return _coupling;
	}
}