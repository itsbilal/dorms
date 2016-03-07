
var chai = require("chai"),
  expect = chai.expect,
  sinon = require("sinon");

var _ = require("underscore");

var dom = require("../dom");

describe("Fields", function(){
  var sandbox;
  var React, TestUtils, ReactDOM;
  var fields;

  before(function(){
    dom();

    React = require("react");
    ReactDOM = require("react-dom");
    TestUtils = require("react-addons-test-utils");

    fields = require("../../src/fields");
  })

  beforeEach(function(){
    sandbox = sinon.sandbox.create();
  })

  describe("parseFields", function(){
    it("sets initials for Backbone models", function(){
      var inputFields = {
        "test": {
          type: String,
          required: false,
        }
      };

      var model = {
        get: sinon.stub().returns("test value")
      };

      var result = fields.parseFields(inputFields, model);

      expect(result).to.have.length(1)
      expect(result[0].props.initial).to.equal("test value")
      expect(model.get.called).to.be.true
      expect(model.get.calledWith("test")).to.be.true
    })

    it("sets initials for dicts", function(){
      var inputFields = {
        "test": {
          type: String,
          required: false,
        }
      };

      var model = {
        "test": "test value"
      };

      var result = fields.parseFields(inputFields, model);

      expect(result).to.have.length(1)
      expect(result[0].props.initial).to.equal("test value")
    })

    it("returns ArrayField for arrays", function(){
      var inputFields = {
        "test": {
          type: Array,
          required: false,
        }
      };

      var result = fields.parseFields(inputFields);

      expect(result).to.have.length(1)
      expect(result[0].type).to.equal(fields.ArrayField)
    })

    it("returns InputField for strings", function(){
      var inputFields = {
        "test": {
          type: String,
          required: false,
        }
      };

      var result = fields.parseFields(inputFields);

      expect(result).to.have.length(1)
      expect(result[0].type).to.equal(fields.InputField)
    })

    it("returns NumberField for numbers", function(){
      var inputFields = {
        "test": {
          type: Number,
          required: false,
        }
      };

      var result = fields.parseFields(inputFields);

      expect(result).to.have.length(1)
      expect(result[0].type).to.equal(fields.NumberField)
    })
  })

  describe("BaseFormField", function(){
    var instance, container, domNode;

    beforeEach(function(){
      container = document.createElement("div");
      class StubbedFormField extends fields.BaseFormField {
        renderField() {
          return "testField"
        }
      }

      sandbox.spy(StubbedFormField.prototype, 'renderField');

      instance = ReactDOM.render(<StubbedFormField name="fieldName" label="fieldLabel" initial="fieldInitial" required={true} />, container);
      domNode = ReactDOM.findDOMNode(instance);
    })

    it("calls renderField to render function", function(){
      expect(instance.renderField.calledOnce).to.be.true
      expect(domNode.textContent).to.contain("testField")
    })

    it("throws error on validate if value is blank", function(){
      instance.setState({
        value: ""
      })

      expect(instance.validateField.bind(instance)).to.throw(/^.*fieldName.*required.*$/)

    })

    it("validates successfully if value isn't blank", function(){
      expect(instance.validateField.bind(instance)).to.not.throw(Error)
    })

    it("validates successfully if required is false", function(){
      ReactDOM.unmountComponentAtNode(container);
      class StubbedFormField extends fields.BaseFormField {
        renderField() {
          return "testField"
        }
      }
      instance = React.render(<StubbedFormField name="fieldName" label="fieldLabel" initial="fieldInitial" required={false} />, container);
      instance.setState({
        value: ""
      })

      expect(instance.validateField.bind(instance)).to.not.throw(Error)
    })

    it("returns initial prop on getValue if state value is null", function(){
      instance.setState({
        value: null
      })
      var returnedValue = instance.getValue()

      expect(returnedValue).to.equal("fieldInitial")
    })

    it("returns state value on getValue if it isn't null", function(){
      instance.setState({
        value: "testValue2"
      })
      var returnedValue = instance.getValue()

      expect(returnedValue).to.equal("testValue2")
    })

    afterEach(function(){
      ReactDOM.unmountComponentAtNode(container);
    })
  })

  describe("InputField", function(){
    var instance, container, domNode;
    var InputField;

    before(function(){
      InputField = fields.InputField;
    })

    beforeEach(function(){
      container = document.createElement("div");
    })

    it("shows up and responds to input", function(){
      instance = React.render(<InputField
        name="fieldName"
        label="fieldLabel"
        initial="fieldInitial"
        type={String}
        required={true} />, container);
      domNode = React.findDOMNode(instance).childNodes[1];

      expect(domNode.nodeName).to.equal("INPUT");
      expect(instance.getValue()).to.equal("fieldInitial");

      domNode.value = "fieldNewValue"
      TestUtils.Simulate.change(domNode);
      expect(instance.getValue()).to.equal("fieldNewValue");
      expect(instance.validateField.bind(instance)).to.not.throw(Error)
    })

    it("throws validation error when an invalid email is sent", function(){
      instance = React.render(<InputField
        name="fieldName"
        label="fieldLabel"
        initial="fieldInitial"
        type="email"
        required={true} />, container);
      domNode = React.findDOMNode(instance).childNodes[1];

      expect(domNode.nodeName).to.equal("INPUT");

      domNode.value = "fieldNewValue"
      TestUtils.Simulate.change(domNode);
      expect(instance.getValue()).to.equal("fieldNewValue");
      expect(instance.validateField.bind(instance)).to.throw(/^.*fieldName.*not a valid email.*$/)
    })

    it("validates successfully with valid email", function(){
      instance = React.render(<InputField
        name="fieldName"
        label="fieldLabel"
        initial="fieldInitial"
        type="email"
        required={true} />, container);
      domNode = React.findDOMNode(instance).childNodes[1];

      expect(domNode.nodeName).to.equal("INPUT");

      domNode.value = "bo@enactuswaterloo.com"
      TestUtils.Simulate.change(domNode);
      expect(instance.getValue()).to.equal("bo@enactuswaterloo.com");
      expect(instance.validateField.bind(instance)).to.not.throw(Error)
    })

    afterEach(function(){
      ReactDOM.unmountComponentAtNode(container);
    })
  })

  describe("NumberField", function(){
    var instance, container, domNode;
    var NumberField;

    before(function(){
      NumberField = fields.NumberField;
    })

    beforeEach(function(){
      container = document.createElement("div");
      instance = React.render(<NumberField
        name="fieldName"
        label="fieldLabel"
        initial="2"
        type={String}
        required={true} />, container);
      domNode = React.findDOMNode(instance).childNodes[1];
    })

    it("shows up and responds to input", function(){
      expect(domNode.nodeName).to.equal("INPUT");
      expect(domNode.getAttribute("type")).to.equal("number");
      expect(instance.getValue()).to.equal("2");

      domNode.value = 42;
      TestUtils.Simulate.change(domNode);
      expect(instance.getValue()).to.equal("42");
      expect(instance.validateField.bind(instance)).to.not.throw(Error)
    })

    afterEach(function(){
      ReactDOM.unmountComponentAtNode(container);
    })
  })

  describe("ArrayField", function(){
    var instance, container, domNode;
    var ArrayField;

    before(function(){
      ArrayField = fields.ArrayField;
    })

    beforeEach(function(){
      container = document.createElement("div");
      instance = React.render(<ArrayField
        name="fieldName"
        label="fieldLabel"
        fields={{
          "item": {
            type: String,
            required: true
          },
          "numberField": {
            type: Number,
            required: true
          }
        }}
        initial={[{
          "item": "test",
          "numberField": "3"
        }]}
        type={Array}
        required={true} />, container);
      domNode = React.findDOMNode(instance);
    })

    it("shows up and renders all constituent fields", function(){
      expect(TestUtils.scryRenderedComponentsWithType(instance, fields.InputField)).to.have.length(1)
      expect(TestUtils.scryRenderedComponentsWithType(instance, fields.NumberField)).to.have.length(1)
      expect(TestUtils.scryRenderedComponentsWithType(instance, fields.ArrayElementField)).to.have.length(1)

      expect(TestUtils.findRenderedComponentWithType(instance, fields.InputField).getValue()).to.equal("test")
      expect(TestUtils.findRenderedComponentWithType(instance, fields.NumberField).getValue()).to.equal("3")
    })

    it("adds a new array element upon clicking the add button", function(){
      expect(TestUtils.scryRenderedComponentsWithType(instance, fields.ArrayElementField)).to.have.length(1)
      var addButton = TestUtils.findRenderedDOMComponentWithClass(instance, "add-button");
      TestUtils.Simulate.click(addButton);

      expect(TestUtils.scryRenderedComponentsWithType(instance, fields.ArrayElementField)).to.have.length(2)
    })

    it("throws on validation if a constituent required field isn't filled", function(){
      var addButton = TestUtils.findRenderedDOMComponentWithClass(instance, "add-button");
      TestUtils.Simulate.click(addButton);

      expect(instance.validateField.bind(instance)).to.throw(/^(.*)required(.*)$/)
    })

    it("successfully validates when all internal fields validate", function(){
      var addButton = TestUtils.findRenderedDOMComponentWithClass(instance, "add-button");
      TestUtils.Simulate.click(addButton);

      // Fill all text fields
      var textFields = TestUtils.scryRenderedComponentsWithType(instance, fields.InputField);
      textFields.forEach(function(textField){
        var inputElement = TestUtils.findRenderedDOMComponentWithTag(textField, 'input')
        inputElement.value = "test"
        TestUtils.Simulate.change(inputElement);
      })

      // Fill all number fields
      var numberFields = TestUtils.scryRenderedComponentsWithType(instance, fields.NumberField);
      numberFields.forEach(function(numberField){
        var inputElement = TestUtils.findRenderedDOMComponentWithTag(numberField, 'input')
        inputElement.value = "3"
        TestUtils.Simulate.change(inputElement);
      })

      expect(instance.validateField.bind(instance)).to.not.throw(Error)

      var value = instance.getValue()
      expect(value).to.have.length(2)
      expect(value).to.deep.equal([
        {
          "item": "test",
          "numberField": "3",
        },
        {
          "item": "test",
          "numberField": "3",
        },
      ])
    })

    it("removes array element when clicking remove", function(){
      expect(TestUtils.scryRenderedComponentsWithType(instance, fields.ArrayElementField)).to.have.length(1)
      var addButton = TestUtils.findRenderedDOMComponentWithClass(instance, "add-button");
      TestUtils.Simulate.click(addButton);

      // Fill all text fields
      var textFields = TestUtils.scryRenderedComponentsWithType(instance, fields.InputField);
      textFields.forEach(function(textField){
        var inputElement = TestUtils.findRenderedDOMComponentWithTag(textField, 'input')
        inputElement.value = "test"
        TestUtils.Simulate.change(inputElement);
      })

      // Fill all number fields
      var numberFields = TestUtils.scryRenderedComponentsWithType(instance, fields.NumberField);
      numberFields.forEach(function(numberField, index){
        var inputElement = TestUtils.findRenderedDOMComponentWithTag(numberField, 'input')
        inputElement.value = index + 2;
        TestUtils.Simulate.change(inputElement);
      })

      expect(instance.validateField.bind(instance)).to.not.throw(Error)

      var value = instance.getValue()
      expect(value).to.have.length(2)
      expect(value).to.deep.equal([
        {
          "item": "test",
          "numberField": "2",
        },
        {
          "item": "test",
          "numberField": "3",
        },
      ])

      var arrayElements = TestUtils.scryRenderedComponentsWithType(instance, fields.ArrayElementField)
      var elementToRemove = arrayElements[1];
      elementToRemove.props.onRemoveElement();

      value = instance.getValue()
      expect(value).to.have.length(1)
      expect(value).to.deep.equal([
        {
          "item": "test",
          "numberField": "2",
        }
      ])
    })

    it("removes correct element when clicking remove twice", function(){
      expect(TestUtils.scryRenderedComponentsWithType(instance, fields.ArrayElementField)).to.have.length(1)
      var addButton = TestUtils.findRenderedDOMComponentWithClass(instance, "add-button");
      TestUtils.Simulate.click(addButton);
      TestUtils.Simulate.click(addButton);

      // Fill all text fields
      var textFields = TestUtils.scryRenderedComponentsWithType(instance, fields.InputField);
      textFields.forEach(function(textField, index){
        var inputElement = TestUtils.findRenderedDOMComponentWithTag(textField, 'input')
        inputElement.value = "test" + index;
        TestUtils.Simulate.change(inputElement);
      })

      // Fill all number fields
      var numberFields = TestUtils.scryRenderedComponentsWithType(instance, fields.NumberField);
      numberFields.forEach(function(numberField, index){
        var inputElement = TestUtils.findRenderedDOMComponentWithTag(numberField, 'input')
        inputElement.value = index + 2;
        TestUtils.Simulate.change(inputElement);
      })

      expect(instance.validateField.bind(instance)).to.not.throw(Error)

      var value = instance.getValue()
      expect(value).to.have.length(3)
      expect(value).to.deep.equal([
        {
          "item": "test0",
          "numberField": "2",
        },
        {
          "item": "test1",
          "numberField": "3",
        },
        {
          "item": "test2",
          "numberField": "4",
        },
      ])

      var arrayElements = TestUtils.scryRenderedComponentsWithType(instance, fields.ArrayElementField)
      var elementToRemove = arrayElements[0];
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(elementToRemove, "glyphicon-trash"));

      arrayElements = TestUtils.scryRenderedComponentsWithType(instance, fields.ArrayElementField)
      elementToRemove = arrayElements[0];
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(elementToRemove, "glyphicon-trash"));

      value = instance.getValue()
      expect(value).to.have.length(1)
      expect(value).to.deep.equal([
        {
          "item": "test2",
          "numberField": "4",
        }
      ])
    })

    afterEach(function(){
      ReactDOM.unmountComponentAtNode(container);
    })
  })

  afterEach(function(){
    sandbox.restore();
  })
})
