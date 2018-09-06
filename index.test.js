'use strict';

const _ = require('lodash'),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  fakeLog = () => false;

describe(_.startCase(filename), () => {
  beforeEach(() => {
    lib.setLog(fakeLog);
  });

  function makeFakeRes() {
    return {
      type: () => false,
      send: () => false,
      status: () => false,
      json: () => false
    };
  }

  describe('render', () => {
    const fn = lib['render'];

    test('returns an object with `output` and `type` properties', () => {
      const res = makeFakeRes(),
        result = fn({
          feed: [],
          meta: {
            title: 'foo',
            description: 'bar',
            link: 'foobar'
          }
        }, {}, res);

      jest.spyOn(res, 'type');
      jest.spyOn(res, 'send');

      return result.then(function () {
        expect(res.type.mock.calls[0][0]).toBe('text/rss+xml');
        expect(res.send.mock.calls.length).toBe(1);
      });
    });

    test('works', () => {
      const res = makeFakeRes(),
        result = fn({
          feed: [],
          meta: {}
        }, {}, res);

      jest.spyOn(res, 'json');

      return result.then(function () {
        expect(res.json.mock.calls[0][0]).toEqual({status: 500, message: 'No data send to XML renderer, cannot respond'});
      });
    });
  });

  describe('wrapInItem', () => {
    const fn = lib['wrapInItem'];

    test(
      'returns a passed in value as the value for an `item` property',
      () => {
        expect(fn('foo')).toEqual({ item: 'foo' });
      }
    );
  });

  describe('wrapInTopLevel', () => {
    const fn = lib['wrapInTopLevel'],
      val = fn('foo'),
      customAttr = {bar: 'http://bar.com'},
      valWithAttr = fn('foo', customAttr);

    test('wraps the passed in value in an object with and rss array', () => {
      expect(Array.isArray(val.rss)).toBe(true);
    });

    test(
      'has an object with an `_attr` property as the first object of the `rss` Array',
      () => {
        expect(val.rss[0]._attr).toBeDefined();
      }
    );

    test(
      'merges attr instance data into the default _attr properties',
      () => {
        expect(valWithAttr.rss[0]._attr).toHaveProperty('bar', 'http://bar.com');
      }
    );

    test(
      'has an object with a `channel` property as the second object of the `rss` Array',
      () => {
        expect(val.rss[1].channel).toBeDefined();
      }
    );

    test(
      'the value passed into the function is assigned to the `channel` property',
      () => {
        expect(val.rss[1].channel).toEqual('foo');
      }
    );
  });

  describe('feedMetaTags', () => {
    const fn = lib['feedMetaTags'];

    test('returns a function', () => {
      const result = fn({title:'foo', description: 'bar', link: 'foobar'});

      expect(typeof result).toBe('function');
    });

    test('its callback returns an array', () => {
      const result = fn({title:'foo', description: 'bar', link: 'foobar'});

      expect(Array.isArray(result([]))).toBe(true);
    });

    test('its callback assigns passed in values to the return array', () => {
      const [ one, two, three ] = fn({title:'foo', description: 'bar', link: 'foobar'})([]);

      expect(one.title).toEqual('foo');
      expect(two.description).toEqual('bar');
      expect(three.link).toEqual('foobar');
    });

    test('accepts an `opt` object with additional meta tags', () => {
      const language = {language: 'en-US'},
        result = fn({title:'foo', description: 'bar', link: 'foobar', opt: language})([]);

      expect(result).toContain(language);
    });
  });

  describe('elevateCategory', () => {
    const fn = lib['elevateCategory'];

    test(
      'returns strings of category tags from each item\'s categories',
      () => {
        const result = fn([{item: [{ category: 'foo'}, { category: 'bar'}]}]);

        expect(result).toEqual([ { category: 'foo,bar' } ]);
      }
    );

    test(
      'returns an empty array if none of the items have categories',
      () => {
        const result = fn([{item: [{ notCategory: 'foo'}, { notCategory: 'bar'}]}]);

        expect(result).toEqual([]);
      }
    );
  });
});
