import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { forgotPwd, forgotPwdSuccess, forgotPwdFailure, resetUserFields } from '../actions/users';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { connect } from 'react-redux';
import renderField from './renderField';


//Front-end side validation
function validate(values) {
  var errors = {};
  var hasErrors = false;
  if (!values.email || values.email.trim() === '') {
    errors.email = 'Enter email';
    hasErrors = true;
  }
  return hasErrors && errors;
}


//For any field errors upon submission (i.e. not instant check)
const validateAndForgotPwd = (values, dispatch) => {
  return dispatch(forgotPwd(values))
    .then((result) => {
      //Note: Error's "data" is in result.payload.response.data
      // success's "data" is in result.payload.data
      if (!result.payload.response) { //1st onblur
        return;
      }

      let {data, status} = result.payload.response;

      if (response.payload.status != 200) {
        // broadcast component error state to other components via updating the redux
        dispatch(forgotPwdFailure(data));
        //throw error
        throw data;
      } else {
        //let other components know status 200 state via updating the redux` state
        dispatch(forgotPwdSuccess(data)); 
        //similar to dispatching RESET_USER_FIELDS
      }
    });

};

class ForgotPwdForm extends Component {
  static contextTypes = {
    router: PropTypes.object
  };

  componentWillMount() {
    // need to reset the global state back to null if navigating on global state e.g. componentWillReceiveProps) before remount
    this.props.resetMe();
  }


  render() {
    const { handleSubmit, submitting } = this.props;

    return (
      <div className="container">
        <form onSubmit={ handleSubmit(validateAndForgotPwd) }>
          <Field
                 name="email"
                 type="email"
                 component={ renderField }
                 label="Email*" />
          <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={ submitting }>
            Submit
          </button>
          <Link
                to="/"
                className="btn btn-error"> Cancel
          </Link>
        </form>
      </div>

      );
  }
}

export default reduxForm({
  form: 'ForgotPwdForm', 
  // a unique identifier for this form
  validate, // <--- validation function given to redux-form
})(ForgotPwdForm)