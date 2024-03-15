#!/usr/bin/env python3

import os
import json
import tempfile
from flask import Flask, jsonify

DIR_THIS = os.path.dirname(os.path.abspath(__file__))
FNF_DATA = f"{DIR_THIS}/data.json"

data = {}
app  = Flask(__name__)

# In-memory data store.
# In a real application, this would be replaced with database calls.


def _data_save(fnf=FNF_DATA):
    tfile = tempfile.NamedTemporaryFile(mode="w+")
    json.dump(data, tfile)
    tfile.flush()
    os.rename(tfile.name, fnf)


def _data_load(fnf=FNF_DATA):
    global data
    data = json.load(open(fnf))

_data_load()


@app.route('/')
def route_get_index():
    return 'ens manager'


@app.route('/<name>')
def route_get_name(name):
    return jsonify(data[name])


@app.route('/<name>/<addr>', methods=['POST'])
def create_item(name=None, addr=None):
    # entry = request.json
    # try:
    #     addr = entry['addr']
    # except:
    #     return jsonify({'error': 'invalid_input'}), 400

    if name is None or addr is None:
        return jsonify({'error': 'invalid_input'}), 400

    data[name] = addr
    _data_save()
    return jsonify({'updated': {'name': name, 'addr': addr}}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3334, debug=True)