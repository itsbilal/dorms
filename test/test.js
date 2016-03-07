
var expect = require('chai').expect;

describe('test', function(){
  it('should test itself', function(){
    expect('Yo dawg, I heard you liked tests so we wrote a test to test tests').to.be.a('string');
    expect(0).to.not.be.ok;
  })
})