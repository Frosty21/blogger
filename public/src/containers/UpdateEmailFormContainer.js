import UpdateEmailForm from '../components/UpdateEmailForm.js';
import { resetUpdateEmailState } from '../actions/updateEmail';
import { resetValidateUserFields } from '../actions/validateUserFields';
import { connect } from 'react-redux';


const mapDispatchToProps = (dispatch) => {
  return {
   resetMe: () =>{
     dispatch(resetUpdateEmailState());
     dispatch(resetValidateUserFields());
    }
  }
}


function mapStateToProps(state, ownProps) {
  return { 
    updateEmail: state.updateEmail,
    initialValues: {email: state.user.user && state.user.user.email}
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(UpdateEmailForm);
