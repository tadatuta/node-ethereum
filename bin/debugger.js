var List = require('term-list'),
  list = new List({
    marker: '\033[36m› \033[0m',
    markerLength: 2
  }),
  utilList = new List({
    marker: '\033[36m› \033[0m',
    markerLength: 2
  })
  exec = require('child_process').exec;
list.add('util', 'Utility Functions');
list.add('trie', 'Trie Functions');
list.add('network', 'Networking Functions');
list.add('chain', 'Chain Functions');

utilList.add('byteLength', 'Byte Length');
utilList.add('formatBufferArray', 'Format Buffer Array');

list.start();
list.on('keypress', function (key, id) {
  switch (key.name) {

  case 'j':
  case 'tab':
    list.down();
    break;

  case 'k':
    list.up();
    break;

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
        }
      })
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