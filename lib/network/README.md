Networking
=========

- [`Network`](#network)
    - [`new Network([host], [post], [options])`](#new-networkhost-port-options)
    - [`Network` options](#network-options)
    - [`Network` methods](#network-methods)
        - [`network.listen([port], [host])`](#networklistenport-host)
        - [`network.connect(port, host, [callback])`](#networkconnectport-host-callback)
        - [`network.stop([callback])`](#networkstopcallback)
        - [`network.getPeers()`](#networkgetpeers)
        - [`network.getPeerList()`](#networkgetpeerlist)
    - [`Network` events](#network-events)
    - [`Network` event objects](#network-event-objects)
- [`Peer`](#peer)
    - [`Peer` methods](#peer-methods)
        - [`peer.sendMessage(message, [callback])`](#peersendmessagemessage-callback)
        - [`peer.sendHello([callback])`](#peersendhellocallback)
        - [`peer.sendDisconnect(reason, [callback])`](#peersenddisconnectreason-callback)
        - [`peer.sendPing([callback])`](#peersendpingcallback)
        - [`peer.sendPong([callback])`](#peersendpongcallback)
        - [`peer.sendGetPeers([callback])`](#peersendgetpeerscallback)
        - [`peer.sendPeers(peers, [callback])`](#peersendpeerspeers-callback)
        - [`peer.sendTransactions(transactions, [callback])`](#peersendtransactionstransactions-callback)
        - [`peer.sendBlocks(blocks, [callback])`](#peersendblocksblocks-callback)
        - [`peer.sendGetChain(parents, count,[callback])`](#peersendgetchainparents-count-callback)
        - [`peer.sendNotInChain([callback])`](#peersendnotinchaincallback)
        - [`peer.sendGetTransactions([callback])`](#peersendgettransactionscallback)

## `Network`
Implements Ethereum's [Wire Protocol](https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-Wire-Protocol) and provides networking functions.

### `new Network([options])`
Creates new Network object with the following arguments
- `options` - An object with the Network configuration. See [`Network` options](#network-options)

### `Network` options
When creating a Network the following options can be used to configure its behavoir.
- `blockchainQuerying` - TODO
- `peerDiscovery` - TODO
- `transactionRelaying` - TODO
- `timeout` - TODO
- `maxPeers` - The max number of peer the network will try to connect to.

### `Network` methods
#### `network.listen([port], [host])` - start the tcp server
- `host` - The hostname or IP address the server is bound to. Defaults to `0.0.0.0` which means any available network
- `port` - The TPC port the server is listening to. Defaults to port `30303` 

#### `network.stop([callback])`
stops the tcp server and disconnects any peers
#### `network.getPeers()`
returns an array of connected peers a instances of the [peer object](#peer)
#### `network.getPeerList()`
returns an array of peers the server knows about but is not connected to. The server uses this list to replace peers that disconnect. 

### `network.broadcastTxs(Txs, [callback])` 
broadcasts an array of transactions to the connected peers
- `Txs` - an array of valid transactions

### `network.broadcastBlocks(blocks, [callback])` - broadcast an array of blocks to the connected peers
- `blocks` - an array of blocks to broadcast

#### `network.connect(port, host, [callback])` - connect to a peer
- `host` - the hostname or IP of the peer
- `port` - the port of the peer
- `callback` - a callback function

### `Network` events
The Network object inherits from `Events.EventEmitter` and emits the following events.

- `'message'` - emitted when whenever the the network server gets a new message. It is provided with two objects `payload` - the RLP decoded buffer and `raw` the raw message.
- `'message.hello'` - emitted on receiving a hello message. 
- `'message.disconnect'` - emitted on receiving a disconnect message.
- `'message.ping'` - emitted on receiving a ping
- `'message.pong'` - emitted on receiving a pong
- `'message.sendPeers'` - emitted on receiving a send a peers message
- `'message.peers'` - emitted on receiving a peers message
- `'message.transaction'` - emitted on receiving a transaction message
- `'message.blocks'` - emitted on receiving a blocks message
- `'message.getChain'` - emitted on receiving a get chain message
- `'message.getNotInChain'` - emitted on receiving a not in chain message
- `'message.getTransactions'` - emitted on receiving a get transactions message
 
Each of the events are provided with the following arguments

- `peer` - The [peer](#peer) that emitted the event
- `message` - The decoded message parsed to an Object. [See event Message Objects](#event-message-objects)
- `payload` - The RPL decoded payload
- `raw` - The raw data from TCP
    
###  event message objects
After the payload is parsed it passed along to the events in form of these objects
#### `hello`
- `protocolVersion` - the protocol version of the peer
- `networkId` - should be 0 
- `clientId` - Specifies the client software identity, as a human-readable string (e.g. "Ethereum(++)/1.0.0"). 
- `capabilities` - pecifies the capabilities of the client as a set of boolean flags
    - `blockchainQuerying`  
    - `peerDiscovery`
    - `transactionRelaying`
- `port` -  specifies the port that the client is listening on 
- `nodeId` - a 512-bit hash that identifies this node

### `peers`
The peers message is an array of object with the following fields
- `ip` - The IP of the peer 
- `port` - The port of the peer
- `id` - The Id of the peer

### `getChain`
- `parents` - An array of parent block hashs
- `count` - The number of request blocks

### `disconnect`
- `reason` - the reason for the disconnect

## `Peer`
The peer represents a peer on the ethereum network. Peer objects cannot be created directly.

### `Peer` methods
#### `peer.sendMessage(message, [callback])`
Encodes and sends a message
- `message` - the message that is being sent  

#### `peer.sendHello([callback])`
Sends the hello message
#### `peer.sendDisconnect(reason, [callback])`
Sends the disconnect message, where reason is one of the following integers
- `0x00` - Disconnect requested
- `0x01` - TCP sub-system error
- `0x02` - Bad protocol
- `0x03` - Useless peer
- `0x04` - Too many peers
- `0x05` - Already connected
- `0x06` - Wrong genesis block
- `0x07` - Incompatible network protocols
- `0x08` - Client quitting

#### `peer.sendPing([callback])`
Send Ping
#### `peer.sendPong([callback])`
Send Pong
#### `peer.sendGetPeers([callback])`
Send a get peers reqeust
#### `peer.sendPeers(peers, [callback])`
Send peer list TODO
- `peers` - an array of peers

#### `peer.sendTransactions(transactions, [callback])`
Sends a transaction list TODO
- `transactions` - an array of transactions to send

#### `peer.sendBlocks(blocks, [callback])`
Sends blocks TODO
- `blocks` - an array of blocks to send

#### `peer.sendGetChain(parents, count, [callback])`
Sends a request for part of a block chain TODO
- `parents` - an array of parent block hashes
- `count` - the number of requested blocks

#### `peer.sendNotInChain([callback])`
Sends not in chain message
#### `peer.sendGetTransactions([callback])`
Sends a request for transactions
