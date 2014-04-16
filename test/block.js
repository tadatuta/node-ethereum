var Block = require('../lib/schema/block.js'),
    //v1
    rawBlock = [
        //block header
        [
            //parent hash
            new Buffer('e3c3dabf59466a0ec0b3639d2852bd862f01bfaf9c9b4a02df21fc1e3299882b', 'hex'),
            //uncles hash
            new Buffer('1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347', 'hex'),
            //coinbase
            new Buffer('cfce3c27db2ecfa1f6df06bc57a21b6aa7d8fb62', 'hex'),
            //state root
            new Buffer('5a5b63ad25429f75052020e2d9ed05efea278b846a208aa253f8867b408b8ffa', 'hex'),
            //transactions Hash
            new Buffer('0f2c139db7d713de29e494888ffd9930a07a3ad5c14680111d2f3e77981cb65c', 'hex'),
            //difficulty
            new Buffer('471d03', 'hex'),
            //timestamp
            new Buffer('534d6639', 'hex'),
            //extradata
            new Buffer(0),
            //nonce
            new Buffer('0000000000000000000000000000000000000000000000000ba791ecfe30b8bb', 'hex'),
        ],
        //tx list
        [
            [
                //nonce
                new Buffer('06', 'hex'),
                //value
                new Buffer('1bc16d674ec80000', 'hex'),
                //gasprice
                new Buffer('0000000000000000000000000000000000000000', 'hex'),
                //gas
                new Buffer('09184e72a000', 'hex'),
                //0
                new Buffer('2710', 'hex'),
                //code
                new Buffer('6000', 'hex'),
                //init
                new Buffer(0),
                //v
                new Buffer('1c', 'hex'),
                //r
                new Buffer('ff688454dca40dcaf0a4b0cab273e456d5dbffc262ca8dad329acd271ee30d4b', 'hex'),
                //s
                new Buffer('768780ea98a9269e95cf0aa3e29e1f72b61378865e52468807f13049597bd4b7', 'hex'),
            ],
            [
                new Buffer('07', 'hex'),
                new Buffer('1bc16d674ec80000', 'hex'),
                new Buffer('0000000000000000000000000000000000000000', 'hex'),
                new Buffer('09184e72a000', 'hex'),
                new Buffer('2710', 'hex'),
                new Buffer('6000', 'hex'),
                new Buffer(0),
                new Buffer('1b', 'hex'),
                new Buffer('bd3178649d9dc471b1e23f3fa8f44cecde89be23b5006c512181e13b461406e6', 'hex'),
                new Buffer('0203e009686d36ceb05c27955ecb7808d93a6521b595d3c3e878fdfe1a782b42', 'hex'),
            ],
        ],
        //uncle list
        [],
    ]

    describe.skip('Block Functions', function() {

        it('should parse a block', function() {
            var block = new Block(rawBlock);
            assert(block.header.parentHash === "e3c3dabf59466a0ec0b3639d2852bd862f01bfaf9c9b4a02df21fc1e3299882b");
        });

        it('should serialize data', function() {
            var raw = block.encode();
            assert.deepEqual(raw, rawBlock);
        });

        it('should create a hash', function() {
            var hash = block.hash();
        });

        it('should generate a genisis block', function() {
            var block = new Block();
            block.genesis();
        });

        it('shouldn\'t accept a badly formed block', function() {

        });

    });
