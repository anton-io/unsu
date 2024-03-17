#!/usr/bin/env python3

import os
import re
import json
import tempfile
from flask import Flask, jsonify
from flask_cors import CORS

DIR_THIS = os.path.dirname(os.path.abspath(__file__))
FNF_DATA = f"{DIR_THIS}/data.json"

data = {}
app  = Flask(__name__)
cors = CORS(app)


def _data_save(fnf=FNF_DATA):
    tfile = tempfile.NamedTemporaryFile(mode="w+", delete=False)
    json.dump(data, tfile)
    tfile.flush()
    os.rename(tfile.name, fnf)


def _data_load(fnf=FNF_DATA):
    return json.load(open(fnf))


def address_2_name(addr):
    data = _data_load()
    data_inverted = {value: key for key, value in data.items()}
    try:
        return data_inverted[addr]
    except:
        return  ''


def name_2_address(name):
    data = _data_load()
    try:
        return data[name]
    except:
        return ''


@app.route('/')
def route_get_index():
    return 'ens manager'


@app.route('/name/<addr>')
def route_get_addr(addr):
    # Get name for given address.
    name  = address_2_name(addr)
    jdata = {'name': name}
    if not name:
        app.logger.warning(f"could not resolve name for: {addr}")
    else:
        app.logger.info(f"served: {addr} => {name}")
    return jsonify(jdata)


@app.route('/addr/<name>')
def route_get_name_addr(name):
    # Get address for given name.
    addr = name_2_address(name)
    if not addr:
        jdata = {}
        app.logger.warning(f"could not resolve name: {name}")
    else:
        jdata = { 'addresses': {60: addr}, 'text': {} }
        app.logger.info(f"served: {name} => {addr}")
    return jsonify(jdata)


@app.route('/set/<name>/<addr>', methods=['POST'])
def route_set_ens_entry(name=None, addr=None):
    if name is None or addr is None:
        return jsonify({'error': 'invalid_input'}), 400

    if not name.endswith(".unsu.eth"):
        return jsonify({'error', 'invalid domain'}), 400

    if not re.match(r'0x[a-fA-F0-9]{40}', addr):
        return jsonify({'error', 'invalid address'}), 400

    addr_set = name_2_address(name)
    if addr_set:
        app.logger.info(f"exists: {name} => {addr_set} | ({addr})")
        return jsonify({'exists': {'name': name, 'addr': addr_set}}), 400

    data[name] = addr
    _data_save()
    app.logger.info(f"updated: {name} => {addr}")
    return jsonify({'updated': {'name': name, 'addr': addr}}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3334, debug=True)