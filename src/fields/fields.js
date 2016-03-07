"use strict";

var React = require("react");

// Abstract class: do not use directly
class BaseFormField extends React.Component { 
  constructor(props) {
    super(props);
    this.htmlId = `form-field-${this.props.name}`;
    this.state = {
      value: props.initial
    };
  }
  validateField() {
    let value = this.state.value || "";
    if (this.props.required && value.length <= 0) {
      throw `${this.props.name} is required to complete this form.`;
    }
  }
  getValue() {
    if (this.state.value !== null && this.state.value !== undefined) {
      return this.state.value;
    } else {
      return this.props.initial;
    }
  }
  render() {
    let label = null;

    if (this.props.label) {
      label = <label htmlFor={this.htmlId}>
        {this.props.label}
      </label>
    }

    return <div className="form-group">
      {label}
      {this.renderField()}
    </div>
  }
}

class InputField extends BaseFormField {
  validateField() {
    super.validateField();
    let value = this.state.value || "";
    if (this.props.type === "email") {
      let re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      if (!re.test(value)) {
        throw `${this.props.name} is not a valid email`;
      }
    }
  }
  onChange() {
    this.setState({
      value: React.findDOMNode(this.refs.element).value
    });
  }
  renderField() {
    let type = "input";

    if (this.props.type === "password" ||
      this.props.type === "email") {
      type = this.props.type;
    }

    return <input
      type={type}
      className="form-control"
      required={this.props.required || false}
      placeholder={this.props.placeholder || ""}
      maxLength={this.props.maxLength || 150}
      value={this.getValue()}
      onChange={this.onChange.bind(this)}
      ref="element" />
  }
}

class NumberField extends BaseFormField {
  onChange() {
    this.setState({
      value: React.findDOMNode(this.refs.element).value
    });
  }
  renderField() {
    return <input
      type="number"
      className="form-control"
      required={this.props.required || false}
      placeholder={this.props.placeholder || ""}
      value={this.getValue()}
      onChange={this.onChange.bind(this)}
      ref="element" />
  }
}

class ChoiceField extends BaseFormField {
  constructor(props) {
    super(props);
  }
  onChange() {
    this.setState({
      value: React.findDOMNode(this.refs.element).value
    });
  }
  validateField() {
    if (this.props.required) {
      if (this.state.value == "_blank") {
        throw "Please select a non-blank choice"
      }
    }
  }
  renderField() {
    var options = this.props.choices.map((choice) => {
      return <option key={choice} value={choice}>{choice}</option>
      
    });
    options.unshift(<option key="_blank" value="_blank"></option>);

    return <select
      required={this.props.required || false}
      onChange={this.onChange.bind(this)}
      value={this.state.value}
      ref="element"
      className="form-control">
      {options}
    </select>
  }
}

class TimeField extends BaseFormField {
  constructor(props) {
    super(props);
    this.state = {
      value: props.initial || (new Date()).toISOString()
    };
  }
  onChange() {
    var hours = React.findDOMNode(this.refs.hours).value;
    var minutes = React.findDOMNode(this.refs.minutes).value;

    var dateObj = new Date(this.state.value);
    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);
    this.setState({
      value: dateObj.toISOString()
    });
  }
  renderField() {
    var date = new Date(this.getValue()) || new Date();

    return <div className="form-inline time-field">
      <input
        type="number"
        value={date.getHours()}
        onChange={this.onChange.bind(this)}
        min="0"
        max="23"
        required="true"
        ref="hours"
        className="form-control" />
      &nbsp;:&nbsp;
      <input
        type="number"
        value={date.getMinutes()}
        onChange={this.onChange.bind(this)}
        min="0"
        max="59"
        required="true"
        ref="minutes"
        className="form-control" />
    </div>
  }
}

class ArrayElementField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.initial
    };
  }
  validateField() {
    for (var field in this.props.fields) {
      if (this.props.fields.hasOwnProperty(field)) {
        // Validate all children
        this.refs[field].validateField(); 
      }
    }
  }
  getValue() {
    let result = {};
    for (var field in this.props.fields) {
      if (this.props.fields.hasOwnProperty(field)) {
        result[field] = this.refs[field].getValue();
      }
    }
    return result;
  }
  render() {
    // let childFields = [];
    // for (field in this.props.fields) {
    //   if (this.props.fields.hasOwnProperty(field)) {
    //     childFields.push(<li>
    //       {parseFields(this.props.fields[field])}
    //     );
    //   }
    // }
    // childFields.push(<li>
    //   <button class="add-new" key="add-new-button" onClick={this.addNew.bind(this)}>
    //     {`Add New ${this.props.label}`}
    //   </button>
    // </li>);

    return <div className="array-element-field">
      <div className="pull-right">
        <span onClick={() => {this.props.onRemoveElement(this.props.index)}}><span className="glyphicon glyphicon-trash"></span></span>
      </div>
      {parseFields(this.props.fields, this.state.value)}
    </div>
  }
}

class ObjectField extends ArrayElementField {
  render() {
    return <div className="object-field">
      {parseFields(this.props.fields, this.state.value)}
    </div>
  }
}

class ArrayField extends BaseFormField {
  constructor(props) {
    super(props);
    this.state.numElements = (this.state.value || []).length;
  }
  getValue() {
    let result = [];
    for (var i=0; i<this.state.numElements; i++) {
      let field = this.refs[`element-${i}`]; // ArrayElementField
      result.push(field.getValue());
    }
    return result;
  }
  validateField() {
    for (var i=0; i<this.state.numElements; i++) {
      let field = this.refs[`element-${i}`]; // ArrayElementField
      field.validateField();
    }
  }
  addNew() {
    this.setState({
      numElements: this.state.numElements + 1
    });
  }
  onRemoveElement() {
    return (i) => {
      let newValue = this.getValue();
      newValue.splice(i, 1);
      this.setState({
        numElements: this.state.numElements - 1,
        value: newValue
      });
    }
  }
  renderField() {
    let fields = []
    for (var i=0; i<this.state.numElements; i++) {
      let getKey = (i) => {
        if (this.state.value &&
          this.state.value[i] &&
          this.state.value[i]._id) {
          return `element-${this.state.value[i]._id}`;
        } else if (this.state.value && this.state.value[i] && this.state.value[i].item) {
          // Item name is a safe enough uniquekey for now, in the absence of a mongo _id
          return `element-${i}-${this.state.value[i].item}`;
        } else {
          return `element-${i}`;
        }
      };

      let getFieldValue = (i) => {
        if (this.state.value && this.state.value[i]) {
          return this.state.value[i]
        } else {
          return {};
        }
      };

      let field = <ArrayElementField
        fields={this.props.fields}
        initial={getFieldValue(i)}
        ref={"element-"+i}
        key={getKey(i)}
        index={i}
        onRemoveElement={this.onRemoveElement()} />
      fields.push(field);
    }
    fields.push(
      <div className="add-button-container" ref="add-button-div" key="add-button-div">
        <button className="add-button" onClick={this.addNew.bind(this)}>
          Add new {this.props.label}
        </button>
      </div>
    );
    return <div className="array-field" id={this.props.htmlId}>
      {fields}
    </div>
  }
}

function parseFields(fields, model) {
  var result = [];
  for (var field in fields) {
    if (fields.hasOwnProperty(field)) {
      let attrs = fields[field];
      attrs.name = field;

      // initial
      if (model) {
        if (typeof model.get === 'function' && model.get(field) !== null && model.get(field) !== undefined) {
          attrs.initial = model.get(field);
        } else if (model[field] !== null && model[field] !== undefined) {
          attrs.initial = model[field];
        } else {
          attrs.initial = null;
        }
      } else {
        attrs.initial = null;
      }

      attrs.key = field;
      attrs.ref = field;
      let formField;
      if (attrs.type === "email" ||
        attrs.type === "password" ||
        attrs.type === String) {
        formField = <InputField {...attrs} />
      } else if (attrs.type === Array) {
        formField = <ArrayField {...attrs} />
      } else if (attrs.type === Number) {
        formField = <NumberField {...attrs} />
      } else if (attrs.type === Object) {
        formField = <ObjectField {...attrs} />

      } else if (attrs.type === "choice") {
        formField = <ChoiceField {...attrs} />
      } else if (attrs.type === "Time") {
        formField = <TimeField {...attrs} />
      } else {
        console.debug("This is NOT supposed to happen");
      }
      result.push(formField);
    }
  }
  return result;
};

module.exports = {
  BaseFormField,
  InputField,
  ArrayField,
  ArrayElementField,
  NumberField,
  parseFields,
};
