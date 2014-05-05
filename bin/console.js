var List = require('term-list'),
  list = new List({
    marker: '\033[36m› \033[0m',
    markerLength: 2
  }),
  utilList = new List({
    marker: '\033[36m› \033[0m',
    markerLength: 2
  }),
  trieList = new List({
    marker: '\033[36m› \033[0m',
    markerLength: 2
  }),
  netList = new List({
    marker: '\033[36m› \033[0m',
    markerLength: 2
  }),
  chainList = new List({
    marker: '\033[36m› \033[0m',
    markerLength: 2
  }),
  exec = require('child_process').exec;

//list menu
list.add('util', 'Utility Functions');
list.add('trie', 'Trie Functions');
list.add('network', 'Networking Functions');
list.add('chain', 'Chain Functions');
//util menu
utilList.add('byteLength', 'Byte Length');
utilList.add('sha3', "SHA3");
utilList.add('compactEncode', "Compact Encode");
utilList.add('compactDecode', "Compact Decode");
utilList.add('compactHexDecode', "Compact Hex Decode");
//trie menu
trieList.add('get', 'Get Value From Trie');
trieList.add('root', 'Root of Trie');
//networking menu
netList.add('getPeers', 'Get Peer List');
//chain menu
chainList.add('txTo', 'Transact xxx Amount to');

list.start();
list.on('keypress', function (key, id) {
  switch (key.name) {
    //switches for list menu
  case 'return':
    list.stop();
    switch (id) {
    case 'util':
      utilList.start();
      utilList.on('keypress', function (key, id) {
        switch (key.name) {
        case 'backspace':
          utilList.stop();
          list.start();
          break;
        case 'q':
        case 'c':
        case 'escape':
          utilList.stop();
          process.exit();
        }
      });
      break;
    case 'trie':
      trieList.start();
      trieList.on('keypress', function (key, id) {
        switch (key.name) {
        case 'backspace':
          trieList.stop();
          list.start();
          break;
        case 'q':
        case 'c':
        case 'escape':
          trieList.stop();
          process.exit();
        }
      });
      break;
    case 'network':
      netList.start();
      netList.on('keypress', function (key, id) {
        switch (key.name) {
        case 'backspace':
          netList.stop();
          list.start();
          break;
        case 'q':
        case 'c':
        case 'escape':
          netList.stop();
          process.exit();
        }
      });
      break;
    case 'chain':
      chainList.start();
      chainList.on('keypress', function (key, id) {
        switch (key.name) {
        case 'backspace':
          chainList.stop();
          list.start();
          break;
        case 'q':
        case 'c':
        case 'escape':
          chainList.stop();
          process.exit();
        }
      });
      break;
    }
    break;

  case 'q':
  case 'c':
  case 'escape':
    list.stop();
    process.exit();
  }
});