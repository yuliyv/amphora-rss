'use strict';

const _ = require('lodash'),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  { expect } = require('chai'),
  sinon = require('sinon');

describe(_.startCase(filename), function () {
  let sandbox, logSpy;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    logSpy = sandbox.spy();

    lib.setLog(logSpy);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('render', function () {
    const fn = lib[this.title];

    it('returns an object with `output` and `type` properties', function () {
      const result = fn({
        _data: {
          feed: [],
          meta: {
            title: 'foo',
            description: 'bar',
            link: 'foobar'
          }
        }
      });

      result.then(function (res) {
        expect(res.output).to.not.be.undefined;
        expect(res.type).to.not.be.undefined;
      });
    });

    it('works', function () {
      const result = fn({
        _data: {
          feed: [],
          meta: {}
        }
      });

      result.catch(function (err) {
        sinon.assert.match(err.message, /No data send to XML renderer, cannot respond/)
      });
    });
  });

  describe('wrapInItem', function () {
    const fn = lib[this.title];

    it('returns a passed in value as the value for an `item` property', function () {
      sinon.assert.match(fn('foo'), { item: 'foo' });
    });
  });

  describe('wrapInTopLevel', function () {
    const fn = lib[this.title],
      val = fn('foo');

    it('wraps the passed in value in an object with and rss array', function () {
      expect(Array.isArray(val.rss)).to.be.true;
    });

    it('has an object with an `_attr` property as the first object of the `rss` Array', function () {
      expect(val.rss[0]._attr).to.not.be.undefined;
    });

    it('has an object with a `channel` property as the second object of the `rss` Array', function () {
      expect(val.rss[1].channel).to.not.be.undefined;
    });

    it('the value passed into the function is assigned to the `channel` property', function () {
      expect(val.rss[1].channel).to.eql('foo');
    });
  });

  describe('feedMetaTags', function () {
    const fn = lib[this.title];

    // it('logs error if `title` property is not passed in', function () {
    //   fn({});
    //   sinon.assert.calledWith(logSpy, 'error');
    // });
    //
    // it('logs error if `description` property is not passed in', function () {
    //   fn({ title: 'foo' });
    //   sinon.assert.calledWith(logSpy, 'error');
    // });
    //
    // it('logs error if `link` property is not passed in', function () {
    //   fn({ title: 'foo', description: 'bar' });
    //   sinon.assert.calledWith(logSpy, 'error');
    // });

    it('returns a function', function () {
      const result = fn({title:'foo', description: 'bar', link: 'foobar'});

      expect(result).to.be.an('function');
    });

    it('its callback returns an array', function () {
      const result = fn({title:'foo', description: 'bar', link: 'foobar'});

      expect(result([])).to.be.an('array');
    });

    it('its callback assigns passed in values to the return array', function () {
      const [ one, two, three ] = fn({title:'foo', description: 'bar', link: 'foobar'})([]);

      expect(one.title).to.eql('foo');
      expect(two.description).to.eql('bar');
      expect(three.link).to.eql('foobar');
    });
  });

  describe('elevateCategory', function () {
    const fn = lib[this.title];

    it('returns strings of category tags from each item\'s categories', function () {
      var result = fn([{item: [{ category: 'foo'}, { category: 'bar'}]}]);

      expect(result).to.eql([ { category: 'foo,bar' } ]);
    });
  });
});
