'use strict';

import Type from "./type.js";

/** 
 * A model type is associated to a model instance. Many model instances can use
 * the same model type. A model type holds ports, submodels, state message type, etc.
 * @see Model
 **/
export default class TypeModel extends Type { 

	/** 
	* Gets the unique id for the model type
	* @type {string} 
	*/
	get id() {  return this._json.id; }
	
	/** 
	* Sets the unique id for the model type
	* @type {string} 
	*/
	set id(value) { this._json.id = value; }
	
	/** 
	* Gets the array of ports associated to this model type
	* @type {TypePort[]} 
	*/
	get ports() {  return this._json.ports; }
	
	/** 
	* Sets the array of ports associated to this model type
	* @type {TypePort[]} 
	*/
	set ports(value) { 
		this._json.ports = []; 
		this._port_index = {};
		
		value.forEach(p => this.add_port(p));
	}
	
	/** 
	* Gets the array of submodels associated to this model type, only for coupled models
	* @type {Model[]} 
	*/
	get submodels() {  return this._json.submodels; }
	
	/** 
	* Sets the array of submodels associated to this model type, only for coupled models
	* @type {Model[]} 
	*/
	set submodels(value) { 
		this._json.submodels = []; 
		this._submodel_index = {};
		
		value.forEach(m => this.add_submodel(m));
	}
	
	/** 
	* Gets model's contextual metadata
	* @type {Metadata} 
	*/
	get metadata() {  return this._json.metadata; }
	
	/** 
	* Sets model's contextual metadata
	* @type {Metadata} 
	*/
	set metadata(value) { this._json.metadata = value; }
	
    /**
     * @param {string} id - the unique id for the model type
     * @param {string} name - name of the model type
     * @param {string} type - indicates whether this model type is atomic or coupled
     * @param {MessageType} message_type - the state message_type associated to this model type
     * @param {TypePort[]} ports - the array of ports associated to this model type
     * @param {Model[]} submodels - the array of submodels associated to this model type
     * @param {Metadata} metadata - the model's contextual metadata
     */
	constructor(id, name, type, message_type, ports, submodels, metadata) {
		super(name, type, message_type);
		
		this.id = id || null;
		this.ports = ports || [];
		this.submodels = submodels || [];
		this.metadata = metadata || null;
	}
	
    /**
     * Adds a submodel to this model type
     * @param {Model} submodel - the submodel to add
     */
	add_submodel(submodel) {
		this.submodels.push(submodel);
		
		this._submodel_index[submodel.id] = submodel;
	}
	
    /**
     * Adds a port type to this model type
     * @param {TypePort} port - the port type to add
     */
	add_port(port) {
		this._json.ports.push(port);
		
		this._port_index[port.name] = port;
		
		return port;
	}
	
    /**
     * Get a submodel of this model type by id
     * @param {string} id - the submodel id to retrieve
	 * @return {Model} the submodel corresponding to the id provided
     */
	get_submodel(id) {
		return this._submodel_index[id] || null;
	}
	
    /**
     * Get a port of this model type by port name
     * @param {string} name - the name of the port to retrieve
	 * @return {TypePort} the port type corresponding to the port name provided
     */
	get_port(name) {
		return this._port_index[name] || null;
	}
}