'use strict'

/* global describe, expect, it, jasmine */
const expect = require('chai').expect
const Connector = require('../src/connector.js')
const EventEmitter = require('events').EventEmitter
const settings = { bucket: process.env.COUCHBASE_BUCKET, host: process.env.COUCHBASE_HOST, password: process.env.COUCHBASE_PW }
const MESSAGE_TIME = 20

describe( 'the connector has the correct structure: it', () => {
  var connector

  it( 'throws an error if required connection parameters are missing', () => {
    expect( () => { new Connector( 'gibberish' ) } ).to.throw()
  })

  it( 'creates the connector', ( done ) => {
    connector = new Connector( settings )
    expect( connector.isReady ).to.equal( false )
    connector.on( 'ready', done )
  })

  it( 'implements the cache/storage connector interface', () =>  {
    expect( connector.name ).to.be.a( 'string' )
    expect( connector.version ).to.be.a( 'string' )
    expect( connector.get ).to.be.a( 'function' )
    expect( connector.set ).to.be.a( 'function' )
    expect( connector.delete ).to.be.a( 'function' )
    expect( connector instanceof EventEmitter ).to.equal( true )
  })

  it( 'retrieves a non existing value', ( done ) => {
    connector.get( 'someValue', ( error, value ) => {
      expect( error ).to.equal( null )
      expect( value ).to.equal( null )
      done()
    })
  })

  it( 'sets a value', ( done ) => {
    connector.set('someValue', { firstname: 'Wolfram' }, error => {
      expect( error ).to.equal( null )
      done()
    })
  })

  it( 'retrieves an existing value', ( done ) => {
    connector.get( 'someValue', ( error, value ) => {
      expect( error ).to.equal( null )
      expect(value).to.eql({ firstname: 'Wolfram' })      
      done()
    })
  })

  it( 'deletes a value', ( done ) => {
    connector.delete( 'someValue', ( error ) => {
      expect( error ).to.equal( null )
      done()
    })
  })

  it( 'Can\'t retrieve a deleted value', ( done ) => {
    connector.get( 'someValue', ( error, value ) => {
      expect( error ).to.equal( null )
      expect( value ).to.equal( null )
      done()
    })
  })

})

