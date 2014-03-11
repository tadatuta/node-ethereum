Networking
=========

- [`Network`](#network)
    - [`new Network([host], [post], [options])`](#new-network-host-port-options)
    - [`Network` methods](#network-methods)
    - [`Network` events](#network-events)
    - [`Network` event objects](#network-event-objects)

## `Network`
Implements Ethereum's [Wire Protocol](https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-Wire-Protocol) and provides networking functions.

### `new Network([host], [port], [options])`
Creates new Network object with the following arguments

- `host` - the hostname or IP address the server is bound to. Defaults to `0.0.0.0` which means any available network
- `port` - the TPC port the server is listening to. Defaults to port `30303` 

### `Network` methods
    `network.listen` - start the tcp server

### `Network` events
The Network object inherits from `Events.EventEmitter` and emits the following events:

- `'message'` - emitted when whenever the the network server gets a new message. It is provided with two objects `payload` - the RLP decoded buffer and `raw` the raw message.
- `'message.hello'` - emitted on receiving a hello message. It is provided with a hello [object](#hello)
- `'message.disconnect'`- emitted on receiving a disconnect [object](#disconnect). 
- `'message.ping'` - emitted on receiving a ping
- `'message.pong'` - emitted on receiving a pong
- `'message.sendPeers'` - emitted on receiving a send peers message
- `'message.peers'` - emitted on receiving a peers message
- `'message.transaction'` - emitted on receiving a transaction message
- `'message.blocks'` - emitted on receiving a blocks message
- `'message.getChain'` - emitted on receiving a get chain message
- `'message.getNotInChain'` - emitted on receiving a not in chain message
- `'message.getTransactions'` - emitted on receiving a get transactions message
    
###  `Network` event objects
#### `hello`
    - `protocolVersion` - `int` the protocal version of the peer
    - `networkId` - should be 0 
    - `clientId` - Specifies the client software identity, as a human-readable string (e.g. "Ethereum(++)/1.0.0"). 
    - `capabilities` - pecifies the capabilities of the client as a set of boolean flags
        - `blockchainQuerying`  
        - `peerDiscovery`
        - transactionRelaying
    - `port` -  specifies the port that the client is listening on 
    - `nodeId` - a 512-bit hash that identifies this node

### `disconnect`
    - `reason` - the reason for the disconnect
