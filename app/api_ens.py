#!/usr/bin/env python3
"""
ENS API Client Library

A Python library for interfacing with the ENS Offchain Resolver Gateway API.
Provides a simple interface for CRUD operations on ENS records.

This library can be used both as an imported module and as a command-line tool.

Usage as a library:
    from api_ens import ENSAPIClient

    client = ENSAPIClient(
        base_url="http://localhost:5555",
        api_key="your-api-key"
    )

    # List all records
    records = client.list_records()

    # Get a specific record
    record = client.get_record("example.eth")

    # Create a new record
    client.create_record(
        name="example.eth",
        addresses={"60": "0x1234..."},
        text={"email": "user@example.com"},
        contenthash=""
    )

    # Update a record
    client.update_record(
        name="example.eth",
        addresses={"60": "0x5678..."}
    )

    # Delete a record
    client.delete_record("example.eth")

    # Reverse lookup
    name = client.reverse_lookup("0x1234567890abcdef")

Usage as a CLI tool:
    # List all records
    python api_ens.py list

    # Get a specific record
    python api_ens.py get example.eth

    # Create a record
    python api_ens.py create example.eth --address-60 0x1234... --text-email user@example.com

    # Update a record
    python api_ens.py update example.eth --address-60 0x5678...

    # Delete a record
    python api_ens.py delete example.eth

    # Reverse lookup
    python api_ens.py reverse 0x1234567890abcdef

Environment Variables:
    ENS_API_URL: Base URL for the ENS API (default: http://localhost:5555)
    ENS_API_KEY: API key for write operations
"""

import os
import sys
import json
import argparse
from typing import Dict, List, Optional, Any
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


class ENSAPIError(Exception):
    """Base exception for ENS API errors."""
    pass


class ENSAPIClient:
    """
    Client for interacting with the ENS Offchain Resolver Gateway API.

    This client provides methods for all CRUD operations on ENS records.
    Read operations (list, get) don't require authentication, while write
    operations (create, update, delete) require an API key.

    Attributes:
        base_url (str): The base URL of the ENS API
        api_key (str): The API key for authenticated operations (optional)
    """

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        """
        Initialize the ENS API client.

        Args:
            base_url: Base URL for the API. If not provided, reads from
                     ENS_API_URL environment variable or defaults to
                     http://localhost:5555
            api_key: API key for write operations. If not provided, reads
                    from ENS_API_KEY environment variable. Required for
                    create, update, and delete operations.
        """
        self.base_url = (
            base_url or
            os.getenv('ENS_API_URL', 'http://localhost:5555')
        ).rstrip('/')

        self.api_key = api_key or os.getenv('ENS_API_KEY', '')

    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        require_auth: bool = False
    ) -> Dict[str, Any]:
        """
        Make an HTTP request to the API.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint (e.g., '/records')
            data: Optional JSON data to send in request body
            require_auth: Whether this endpoint requires authentication

        Returns:
            Parsed JSON response as a dictionary

        Raises:
            ENSAPIError: If the request fails or returns an error
        """
        url = f"{self.base_url}{endpoint}"

        # Prepare request headers
        headers = {
            'Content-Type': 'application/json',
        }

        # Add authentication if required
        if require_auth:
            if not self.api_key:
                raise ENSAPIError(
                    "API key is required for this operation. "
                    "Set ENS_API_KEY environment variable or pass api_key to constructor."
                )
            headers['Authorization'] = f"Bearer {self.api_key}"

        # Prepare request body
        body = None
        if data is not None:
            body = json.dumps(data).encode('utf-8')

        # Create request
        request = Request(url, data=body, headers=headers, method=method)

        try:
            # Make request
            with urlopen(request) as response:
                response_data = response.read().decode('utf-8')
                return json.loads(response_data) if response_data else {}

        except HTTPError as e:
            # Parse error response
            try:
                error_data = json.loads(e.read().decode('utf-8'))
                error_msg = error_data.get('error', str(e))
                description = error_data.get('description', '')
                if description:
                    error_msg = f"{error_msg}: {description}"
            except (json.JSONDecodeError, AttributeError):
                error_msg = str(e)

            raise ENSAPIError(f"HTTP {e.code}: {error_msg}")

        except URLError as e:
            raise ENSAPIError(f"Connection error: {e.reason}")

        except Exception as e:
            raise ENSAPIError(f"Unexpected error: {str(e)}")

    def list_records(self) -> List[Dict[str, Any]]:
        """
        List all ENS records.

        This is a read-only operation and doesn't require authentication.

        Returns:
            List of all records with their names and data

        Raises:
            ENSAPIError: If the request fails

        Example:
            >>> client = ENSAPIClient()
            >>> records = client.list_records()
            >>> print(f"Found {len(records)} records")
        """
        response = self._make_request('GET', '/records')
        return response.get('records', [])

    def get_record(self, name: str) -> Dict[str, Any]:
        """
        Get a specific ENS record by name.

        This is a read-only operation and doesn't require authentication.

        Args:
            name: The ENS name to retrieve (e.g., 'example.eth')

        Returns:
            Dictionary containing the record data with addresses, text, and contenthash

        Raises:
            ENSAPIError: If the record is not found or request fails

        Example:
            >>> client = ENSAPIClient()
            >>> record = client.get_record('example.eth')
            >>> print(record['addresses'])
        """
        response = self._make_request('GET', f'/records/{name}')
        return response.get('record', {})

    def create_record(
        self,
        name: str,
        addresses: Optional[Dict[str, str]] = None,
        text: Optional[Dict[str, str]] = None,
        contenthash: str = ""
    ) -> Dict[str, Any]:
        """
        Create a new ENS record.

        This operation requires authentication via API key.

        Args:
            name: The ENS name to create (e.g., 'example.eth')
            addresses: Dictionary of coin types to addresses (e.g., {"60": "0x1234..."})
                      Coin type 60 is Ethereum
            text: Dictionary of text records (e.g., {"email": "user@example.com"})
            contenthash: Content hash for decentralized content (IPFS, etc.)

        Returns:
            Response dictionary with success message

        Raises:
            ENSAPIError: If the record already exists, authentication fails,
                        or request fails

        Example:
            >>> client = ENSAPIClient(api_key='your-key')
            >>> client.create_record(
            ...     name='example.eth',
            ...     addresses={'60': '0x1234567890abcdef'},
            ...     text={'email': 'user@example.com', 'url': 'https://example.com'}
            ... )
        """
        data = {
            'name': name,
            'addresses': addresses or {},
            'text': text or {},
            'contenthash': contenthash
        }

        return self._make_request('POST', '/records', data=data, require_auth=True)

    def update_record(
        self,
        name: str,
        addresses: Optional[Dict[str, str]] = None,
        text: Optional[Dict[str, str]] = None,
        contenthash: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update an existing ENS record.

        This operation requires authentication via API key.
        Note: This performs a full replacement of the record. To preserve
        existing fields, fetch the record first and merge your changes.

        Args:
            name: The ENS name to update (e.g., 'example.eth')
            addresses: Dictionary of coin types to addresses (replaces existing)
            text: Dictionary of text records (replaces existing)
            contenthash: Content hash (replaces existing if provided)

        Returns:
            Response dictionary with success message

        Raises:
            ENSAPIError: If the record doesn't exist, authentication fails,
                        or request fails

        Example:
            >>> client = ENSAPIClient(api_key='your-key')
            >>> # Get existing record first
            >>> existing = client.get_record('example.eth')
            >>> # Merge with updates
            >>> existing['addresses']['60'] = '0xnewaddress'
            >>> client.update_record(
            ...     name='example.eth',
            ...     addresses=existing['addresses'],
            ...     text=existing['text'],
            ...     contenthash=existing['contenthash']
            ... )
        """
        data = {
            'addresses': addresses or {},
            'text': text or {},
            'contenthash': contenthash if contenthash is not None else ""
        }

        return self._make_request('PUT', f'/records/{name}', data=data, require_auth=True)

    def delete_record(self, name: str) -> Dict[str, Any]:
        """
        Delete an ENS record.

        This operation requires authentication via API key.

        Args:
            name: The ENS name to delete (e.g., 'example.eth')

        Returns:
            Response dictionary with success message

        Raises:
            ENSAPIError: If the record doesn't exist, authentication fails,
                        or request fails

        Example:
            >>> client = ENSAPIClient(api_key='your-key')
            >>> client.delete_record('example.eth')
        """
        return self._make_request('DELETE', f'/records/{name}', require_auth=True)

    def reverse_lookup(self, address: str, coin_type: int = 60) -> str:
        """
        Reverse lookup: find ENS name for an address.

        This is a read-only operation and doesn't require authentication.

        Args:
            address: Ethereum address to lookup (e.g., '0x1234...')
            coin_type: Coin type to search (default: 60 for Ethereum)

        Returns:
            ENS name associated with the address

        Raises:
            ENSAPIError: If no name is found for the address or request fails

        Example:
            >>> client = ENSAPIClient()
            >>> name = client.reverse_lookup('0x1234567890abcdef')
            >>> print(f"Address belongs to: {name}")
        """
        # Build URL with query parameter for coin_type if not default
        endpoint = f'/reverse/{address}'
        if coin_type != 60:
            endpoint += f'?coin_type={coin_type}'

        response = self._make_request('GET', endpoint)
        return response.get('name', '')


def main():
    """
    Command-line interface for the ENS API client.

    Provides a CLI for all CRUD operations on ENS records.
    """
    parser = argparse.ArgumentParser(
        description='ENS API Client - Manage ENS records via the Offchain Resolver API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List all records
  %(prog)s list

  # Get a specific record
  %(prog)s get example.eth

  # Create a record with Ethereum address and email
  %(prog)s create example.eth --address-60 0x1234567890abcdef --text-email user@example.com

  # Update a record's Ethereum address
  %(prog)s update example.eth --address-60 0xnewaddress

  # Delete a record
  %(prog)s delete example.eth

  # Reverse lookup: find ENS name for an address
  %(prog)s reverse 0x1234567890abcdef

Environment Variables:
  ENS_API_URL     Base URL for the ENS API (default: http://localhost:5555)
  ENS_API_KEY     API key for write operations (required for create/update/delete)
        """
    )

    # Global options
    parser.add_argument(
        '--url',
        help='Base URL for the ENS API (default: $ENS_API_URL or http://localhost:5555)'
    )
    parser.add_argument(
        '--api-key',
        help='API key for write operations (default: $ENS_API_KEY)'
    )
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output raw JSON response'
    )

    # Subcommands
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    subparsers.required = True

    # List command
    list_parser = subparsers.add_parser('list', help='List all ENS records')

    # Get command
    get_parser = subparsers.add_parser('get', help='Get a specific ENS record')
    get_parser.add_argument('name', help='ENS name to retrieve')

    # Create command
    create_parser = subparsers.add_parser('create', help='Create a new ENS record')
    create_parser.add_argument('name', help='ENS name to create')
    create_parser.add_argument(
        '--address-60',
        help='Ethereum address (coin type 60)'
    )
    create_parser.add_argument(
        '--address',
        action='append',
        nargs=2,
        metavar=('COIN_TYPE', 'ADDRESS'),
        help='Additional address (can be used multiple times)'
    )
    create_parser.add_argument(
        '--text',
        action='append',
        nargs=2,
        metavar=('KEY', 'VALUE'),
        help='Text record key-value pair (can be used multiple times)'
    )
    create_parser.add_argument(
        '--text-email',
        help='Email text record (shortcut for --text email VALUE)'
    )
    create_parser.add_argument(
        '--text-url',
        help='URL text record (shortcut for --text url VALUE)'
    )
    create_parser.add_argument(
        '--contenthash',
        default='',
        help='Content hash (IPFS, etc.)'
    )

    # Update command
    update_parser = subparsers.add_parser('update', help='Update an existing ENS record')
    update_parser.add_argument('name', help='ENS name to update')
    update_parser.add_argument(
        '--address-60',
        help='Ethereum address (coin type 60)'
    )
    update_parser.add_argument(
        '--address',
        action='append',
        nargs=2,
        metavar=('COIN_TYPE', 'ADDRESS'),
        help='Additional address (can be used multiple times)'
    )
    update_parser.add_argument(
        '--text',
        action='append',
        nargs=2,
        metavar=('KEY', 'VALUE'),
        help='Text record key-value pair (can be used multiple times)'
    )
    update_parser.add_argument(
        '--text-email',
        help='Email text record (shortcut for --text email VALUE)'
    )
    update_parser.add_argument(
        '--text-url',
        help='URL text record (shortcut for --text url VALUE)'
    )
    update_parser.add_argument(
        '--contenthash',
        help='Content hash (IPFS, etc.)'
    )
    update_parser.add_argument(
        '--merge',
        action='store_true',
        help='Merge with existing record instead of replacing'
    )

    # Delete command
    delete_parser = subparsers.add_parser('delete', help='Delete an ENS record')
    delete_parser.add_argument('name', help='ENS name to delete')

    # Reverse lookup command
    reverse_parser = subparsers.add_parser('reverse', help='Reverse lookup: find ENS name for an address')
    reverse_parser.add_argument('address', help='Ethereum address to lookup')
    reverse_parser.add_argument(
        '--coin-type',
        type=int,
        default=60,
        help='Coin type to search (default: 60 for Ethereum)'
    )

    args = parser.parse_args()

    # Create client
    client = ENSAPIClient(base_url=args.url, api_key=args.api_key)

    try:
        # Execute command
        if args.command == 'list':
            records = client.list_records()
            if args.json:
                print(json.dumps(records, indent=2))
            else:
                print(f"Found {len(records)} record(s):")
                for record in records:
                    print(f"  - {record['name']}")

        elif args.command == 'get':
            record = client.get_record(args.name)
            if args.json:
                print(json.dumps(record, indent=2))
            else:
                print(f"Record: {args.name}")
                print(f"  Addresses: {json.dumps(record.get('addresses', {}), indent=4)}")
                print(f"  Text: {json.dumps(record.get('text', {}), indent=4)}")
                print(f"  Content Hash: {record.get('contenthash', '')}")

        elif args.command == 'create':
            # Build addresses dict
            addresses = {}
            if args.address_60:
                addresses['60'] = args.address_60
            if args.address:
                for coin_type, addr in args.address:
                    addresses[coin_type] = addr

            # Build text dict
            text = {}
            if args.text_email:
                text['email'] = args.text_email
            if args.text_url:
                text['url'] = args.text_url
            if args.text:
                for key, value in args.text:
                    text[key] = value

            response = client.create_record(
                name=args.name,
                addresses=addresses,
                text=text,
                contenthash=args.contenthash
            )

            if args.json:
                print(json.dumps(response, indent=2))
            else:
                print(f"✓ {response.get('message', 'Record created successfully')}")

        elif args.command == 'update':
            # Build addresses dict
            addresses = {}
            if args.address_60:
                addresses['60'] = args.address_60
            if args.address:
                for coin_type, addr in args.address:
                    addresses[coin_type] = addr

            # Build text dict
            text = {}
            if args.text_email:
                text['email'] = args.text_email
            if args.text_url:
                text['url'] = args.text_url
            if args.text:
                for key, value in args.text:
                    text[key] = value

            # If merge flag is set, fetch existing record first
            if args.merge:
                existing = client.get_record(args.name)
                # Merge addresses
                if 'addresses' in existing:
                    existing['addresses'].update(addresses)
                    addresses = existing['addresses']
                # Merge text
                if 'text' in existing:
                    existing['text'].update(text)
                    text = existing['text']
                # Use existing contenthash if not provided
                if args.contenthash is None and 'contenthash' in existing:
                    contenthash = existing['contenthash']
                else:
                    contenthash = args.contenthash
            else:
                contenthash = args.contenthash

            response = client.update_record(
                name=args.name,
                addresses=addresses if addresses else None,
                text=text if text else None,
                contenthash=contenthash
            )

            if args.json:
                print(json.dumps(response, indent=2))
            else:
                print(f"✓ {response.get('message', 'Record updated successfully')}")

        elif args.command == 'delete':
            response = client.delete_record(args.name)
            if args.json:
                print(json.dumps(response, indent=2))
            else:
                print(f"✓ {response.get('message', 'Record deleted successfully')}")

        elif args.command == 'reverse':
            name = client.reverse_lookup(args.address, args.coin_type)
            if args.json:
                print(json.dumps({
                    'address': args.address,
                    'coin_type': args.coin_type,
                    'name': name
                }, indent=2))
            else:
                print(f"Address: {args.address}")
                print(f"ENS Name: {name}")
                if args.coin_type != 60:
                    print(f"Coin Type: {args.coin_type}")

    except ENSAPIError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nOperation cancelled", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
