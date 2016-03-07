"use strict";

var React = require("react");

var fields = require("../fields");

// ModelForm Usage:
// fields: {
//   "fieldName": {
//     type: String, 
//     required: false,
//     label: "Name",
//     placeholder: "150 chars max",
//     maxLength: 150
//   },
//   "email": {
//     type: "email",
//     required: true,
//     label: "Email",
//     placeholder: "100 chars max",
//     maxLength: 100
//   }
// }

class ModelForm extends React.Component {
  constructor(props) {
    super(props);
  }
  save() {
    // Does an ajax submit on model
    for (var field in this.props.fields) {
      if (this.props.fields.hasOwnProperty(field)) {
        let formfield = this.refs[field],
          value = formfield.getValue();

        formfield.validateField();

        if (this.props.model) {
          this.props.model.set(field, value);
        }
      }
    }

    if (this.props.model) {
      this.props.model.save();

      if (this.props.onSave && typeof this.props.onSave == "function") {
        this.props.onSave();
      }
    }
  }
  renderFields() {
    return fields.parseFields(this.props.fields, this.props.model);
  }
  render() {
    return <div className="model-form">
      {this.renderFields()}
    </div>
  }
}

ModelForm.propTypes = {
  fields: React.PropTypes.object.isRequired,
  model: React.PropTypes.object, // Backbone model
};

module.exports = ModelForm;
