#!/usr/bin/env python3

import os
import re
import json
import tempfile
import logging
from logging.handlers import RotatingFileHandler

DIR_THIS = os.path.dirname(os.path.abspath(__file__))
DIR_ROOT = os.path.dirname(DIR_THIS)

# Load environment variables from .env file in project root
try:
    from dotenv import load_dotenv
    dotenv_path = os.path.join(DIR_ROOT, '.env')
    load_dotenv(dotenv_path)
except ImportError:
    # python-dotenv not installed, environment variables should be set externally
    pass

from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_compress import Compress
from api_ens import ENSAPIClient, ENSAPIError


def setup_logging():
    """Configure logging to both console and rotating log files"""
    log_dir = f"{DIR_THIS}/logs"
    os.makedirs(log_dir, exist_ok=True)

    # Determine log level from environment
    log_level_str = os.environ.get('LOG_LEVEL', 'INFO').upper()
    log_level = getattr(logging, log_level_str, logging.INFO)

    # Create formatters
    detailed_formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # File handler with rotation (max 10MB, keep 5 backups)
    file_handler = RotatingFileHandler(
        f"{log_dir}/unsu.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(detailed_formatter)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(detailed_formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # Reduce noise from werkzeug (Flask's server)
    logging.getLogger('werkzeug').setLevel(logging.WARNING)

    return file_handler


# Setup logging before creating Flask app
setup_logging()

app = Flask(__name__,
            static_folder=f"{DIR_THIS}/static",
            template_folder=f"{DIR_THIS}/templates")
app.config['COMPRESS_MIMETYPES'] = [
    'text/html', 'text/css', 'text/xml', 'application/json',
    'application/javascript', 'text/javascript', 'image/svg+xml'
]
app.config['COMPRESS_LEVEL'] = 6
app.config['COMPRESS_MIN_SIZE'] = 500

cors = CORS(app)
compress = Compress(app)

# Initialize ENS API Client
ens_api_client = ENSAPIClient(
    base_url=os.getenv('ENS_API_URL', 'https://unsu.com/ens'),
    api_key=os.getenv('ENS_API_KEY', '')
)
logging.info(f"ENS API Client initialized with base URL: {ens_api_client.base_url}")


# Request logging middleware
@app.before_request
def log_request_info():
    """Log details about incoming requests"""
    # Skip logging for static assets to reduce noise
    if not request.path.startswith(('/static/', '/css/', '/js/', '/imgs/')):
        logging.info(f"{request.method} {request.path} from {request.remote_addr}")


@app.after_request
def log_response_info(response):
    """Log response status for non-static requests"""
    if not request.path.startswith(('/static/', '/css/', '/js/', '/imgs/')):
        logging.info(f"{request.method} {request.path} -> {response.status_code}")
    return response


# ENS Data Management
FNF_DATA = f"{DIR_THIS}/data/data.json"
ens_data = {}
_cache = {}
_cache_enabled = True


def _data_save(fnf=FNF_DATA):
    """Atomically save ENS data to JSON file and invalidate cache"""
    global _cache
    tfile = tempfile.NamedTemporaryFile(mode="w+", delete=False)
    json.dump(ens_data, tfile, indent=2)
    tfile.flush()
    os.fsync(tfile.fileno())  # Ensure data is written to disk
    os.rename(tfile.name, fnf)
    _cache.clear()  # Invalidate cache on data change


def _data_load(fnf=FNF_DATA):
    """Load ENS data from JSON file, create if doesn't exist"""
    if not os.path.exists(fnf):
        return {}
    try:
        with open(fnf, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        app.logger.error(f"Error loading ENS data file: {e}")
        return {}


def address_2_name(addr):
    """Get ENS name for address with caching"""
    cache_key = f"addr_{addr}"
    if _cache_enabled and cache_key in _cache:
        return _cache[cache_key]

    loaded_data = _data_load()
    data_inverted = {value: key for key, value in loaded_data.items()}
    result = data_inverted.get(addr, '')

    if _cache_enabled:
        _cache[cache_key] = result

    return result


def name_2_address(name):
    """Get address for ENS name with caching"""
    cache_key = f"name_{name}"
    if _cache_enabled and cache_key in _cache:
        return _cache[cache_key]

    loaded_data = _data_load()
    result = loaded_data.get(name, '')

    if _cache_enabled:
        _cache[cache_key] = result

    return result


@app.route('/')
def route_index():
    response = send_from_directory(app.template_folder, 'index.html')
    if not app.debug:
        response.cache_control.max_age = 3600
    return response


# ENS API Routes
@app.route('/api/resolver/name/<addr>')
def route_get_addr(addr):
    """Get ENS name for given address (reverse lookup)"""
    try:
        # Use the dedicated reverse lookup endpoint
        name = ens_api_client.reverse_lookup(addr, coin_type=60)
        if name:
            app.logger.info(f"ENS API: reverse lookup {addr} => {name}")
            return jsonify({'name': name})

        # Fallback to local data if not found in API
        name = address_2_name(addr)
        if name:
            app.logger.info(f"Local fallback: resolved {addr} => {name}")
            return jsonify({'name': name})

        app.logger.warning(f"could not resolve name for: {addr}")
        return jsonify({'name': ''})

    except ENSAPIError as e:
        app.logger.error(f"ENS API error for address {addr}: {e}")
        # Fallback to local data on error
        name = address_2_name(addr)
        if name:
            app.logger.info(f"Local fallback (after error): resolved {addr} => {name}")
        return jsonify({'name': name})


@app.route('/api/resolver/addr/<name>')
def route_get_name_addr(name):
    """Get address for given ENS name (forward lookup)"""
    try:
        # Try to get record from ENS API
        record = ens_api_client.get_record(name)
        if record and record.get('addresses'):
            app.logger.info(f"ENS API: resolved {name} => {record['addresses']}")
            return jsonify({
                'addresses': record.get('addresses', {}),
                'text': record.get('text', {})
            })

        # Fallback to local data if not found in API
        addr = name_2_address(name)
        if addr:
            app.logger.info(f"Local fallback: resolved {name} => {addr}")
            return jsonify({'addresses': {60: addr}, 'text': {}})

        app.logger.warning(f"could not resolve name: {name}")
        return jsonify({})

    except ENSAPIError as e:
        app.logger.error(f"ENS API error for name {name}: {e}")
        # Fallback to local data on error
        addr = name_2_address(name)
        if addr:
            app.logger.info(f"Local fallback (after error): resolved {name} => {addr}")
            return jsonify({'addresses': {60: addr}, 'text': {}})
        return jsonify({})


@app.route('/api/resolver/set/<name>/<addr>', methods=['POST'])
def route_set_ens_entry(name=None, addr=None):
    """Set ENS name to address mapping"""
    if name is None or addr is None:
        return jsonify({'error': 'invalid_input'}), 400

    if not name.endswith(".unsu.eth"):
        return jsonify({'error': 'invalid domain'}), 400

    if not re.match(r'0x[a-fA-F0-9]{40}', addr):
        return jsonify({'error': 'invalid address'}), 400

    try:
        # Check if record already exists in ENS API
        try:
            existing_record = ens_api_client.get_record(name)
            if existing_record and existing_record.get('addresses'):
                existing_addr = existing_record['addresses'].get('60', '')
                app.logger.info(f"ENS API: exists: {name} => {existing_addr} | ({addr})")
                return jsonify({'exists': {'name': name, 'addr': existing_addr}}), 400
        except ENSAPIError:
            # Record doesn't exist, which is fine for creating
            pass

        # Create new record in ENS API
        ens_api_client.create_record(
            name=name,
            addresses={'60': addr},
            text={},
            contenthash=''
        )
        app.logger.info(f"ENS API: created: {name} => {addr}")

        # Also save to local data for fallback
        ens_data[name] = addr
        _data_save()

        return jsonify({'updated': {'name': name, 'addr': addr}}), 201

    except ENSAPIError as e:
        app.logger.error(f"ENS API error setting {name} => {addr}: {e}")

        # Fallback to local data only
        addr_set = name_2_address(name)
        if addr_set:
            app.logger.info(f"Local fallback: exists: {name} => {addr_set} | ({addr})")
            return jsonify({'exists': {'name': name, 'addr': addr_set}}), 400

        ens_data[name] = addr
        _data_save()
        app.logger.info(f"Local fallback: updated: {name} => {addr}")
        return jsonify({'updated': {'name': name, 'addr': addr}}), 201


@app.route('/<path:path>')
def route_all(path):
    # Set appropriate cache times based on file type
    if path.endswith(('.js', '.css')):
        max_age = 31536000  # 1 year for versioned assets
    elif path.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.webmanifest')):
        max_age = 2592000  # 30 days for images
    elif path.endswith('.html'):
        max_age = 3600  # 1 hour for HTML
    else:
        max_age = 86400  # 1 day for other files

    # Try serving from templates first (for HTML files)
    if path.endswith('.html'):
        try:
            response = send_from_directory(app.template_folder, path)
            if not app.debug:
                response.cache_control.max_age = max_age
            return response
        except:
            pass

    # Otherwise serve from static folder
    response = send_from_directory(app.static_folder, path)
    if not app.debug:
        response.cache_control.max_age = max_age
    return response


if __name__ == '__main__':
    # Load ENS data on startup
    ens_data = _data_load()
    logging.info(f"Loaded {len(ens_data)} ENS entries from {FNF_DATA}")

    # Check for debug mode from environment variable
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

    # Log startup information
    logging.info("=" * 60)
    logging.info("unsu.com Server Starting")
    logging.info("=" * 60)
    logging.info(f"Project Root: {DIR_ROOT}")
    logging.info(f"App Directory: {DIR_THIS}")
    logging.info(f"Host: 0.0.0.0:3333")
    logging.info(f"Debug Mode: {debug_mode}")
    logging.info(f"Static Folder: {app.static_folder}")
    logging.info(f"Template Folder: {app.template_folder}")
    logging.info(f"ENS Data File: {FNF_DATA}")
    logging.info(f"ENS API URL: {ens_api_client.base_url}")
    logging.info(f"ENS API Key: {'***configured***' if ens_api_client.api_key else 'not configured'}")
    logging.info(f"Log Level: {logging.getLogger().level}")
    logging.info("=" * 60)

    app.run(host="0.0.0.0", port=3333, debug=debug_mode)

