/* global expect */

const path = require('path');
const ofType = require(path.resolve('./index.js'));

describe("When the module is executed without any arguments",function(){
  beforeEach(function(){
    this.b = ofType.bind(this);
  });
  
  it('it should return false',function(){
    expect(this.b()).toBe(false);
  });
  it('it should not throw an error',function(){
    expect(this.b).not.toThrowError();
  });
});

describe("When the module is executed without the second [type] parameter",function(){
  beforeEach(function(){
    this.b = ofType.bind(this,'hello');
  });
  
  it('it should return false',function(){
    expect(this.b()).toBe(false);
  });
  it('it should not throw an error',function(){
    expect(this.b).not.toThrowError();
  });
});