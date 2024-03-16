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


@app.route('/')
def route_get_index():
    return 'ens manager'


@app.route('/name/<addr>')
def route_get_addr(addr):
    data = _data_load()
    data_inverted = {value: key for key, value in data.items()}
    try:
        name = data_inverted[addr]
        jdata = { 'name': name }
    except:
        name = ''
        jdata = {'name': name}
        app.logger.warning(f"could not resolve name for: {addr}")

    app.logger.info(f"served: {addr} => {name}")
    return jsonify(jdata)


@app.route('/addr/<domain>')
def route_get_name_addr(domain):
    data = _data_load()
    try:
        addr = data[domain]
        jdata = {
            'addresses': {60: addr},'text': {}
        }
    except:
        addr = '<not set>'
        jdata = {}
        app.logger.warning(f"could not resolve name for: {domain}")

    app.logger.info(f"served: {domain} => {addr}")
    return jsonify(jdata)


@app.route('/set/<domain>/<addr>', methods=['POST'])
def route_set_ens_entry(domain=None, addr=None):
    if domain is None or addr is None:
        return jsonify({'error': 'invalid_input'}), 400

    if not domain.endswith(".unsu.eth"):
        return jsonify({'error', 'invalid domain'}), 400

    if not re.match(r'0x[a-fA-F0-9]{40}', addr):
        return jsonify({'error', 'invalid address'}), 400

    data[domain] = addr
    _data_save()
    app.logger.info(f"updated: {domain} => {addr}")
    return jsonify({'updated': {'name': domain, 'addr': addr}}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3334, debug=True)