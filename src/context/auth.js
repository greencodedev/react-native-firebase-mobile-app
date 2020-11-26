import React from "react";
import firebase from "firebase";
import { emailValidator, passwordValidator } from "@utils";
import { fetchUser } from "@logics/auth";

const AuthContext = React.createContext("authentication");
const { Consumer, Provider } = AuthContext;

export class AuthConsumer extends React.PureComponent {
  render() {
    return <Consumer>{this.props.children}</Consumer>;
  }
}

const initialState = {
  email: {
    value: "",
    error: false,
    errorMessage: ""
  },
  password: {
    value: "",
    error: false,
    errorMessage: ""
  },
  loading: false,
  error: false,
  errorMessage: ""
};

export class AuthProvider extends React.Component {
  state = initialState;

  onChangeField = field => validator => value => {
    const { error, errorMessage } = validator ? validator(value) : {};
    this.setState({
      [field]: {
        value,
        error,
        errorMessage
      },
      loading: false,
      error: false,
      errorMessage: ""
    });
  };
  handleSubmit = async authFunction => {
    const fields = ["email", "password"];
    const user = {};
    let valid = true;
    fields.map(f => {
      const { value, error } = this.state[f];
      valid = valid && value && !error;
      user[f] = value;
    });
    if (valid) {
      this.setState({ loading: true });
      const email = this.state.email.value;
      const password = this.state.password.value;
      return firebase
        .auth()
        [authFunction](email, password)
        .then(() => fetchUser())
        .then(({ fetched }) => {
          return fetched;
        })
        .catch(({ message }) => {
          this.setState({
            loading: false,
            error: true,
            errorMessage: message
          });
          throw Error(message);
        });
    } else {
      this.setState({ error: true, errorMessage: "Enter the fields" });
      throw Error();
    }
  };
  reset = () => {
    this.setState(initialState);
  };
  resetPassword = async () => {
    const { value, error } = this.state.email;
    const valid = value && !error;
    if (valid) {
      this.setState({ loading: true });
      const email = value;
      return firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(() => this.setState({ loading: false }))
        .catch(({ message }) => {
          this.setState({
            loading: false,
            error: true,
            errorMessage: message
          });
          throw Error();
        });
    } else {
      this.setState({ error: true, errorMessage: "Enter the fields" });
      throw Error();
    }
  };
  render() {
    const { children, ...otherProps } = this.props;
    const { email, password } = this.state;
    const value = {
      email,
      password,
      loading: this.state.loading,
      error: this.state.error,
      errorMessage: this.state.errorMessage,
      changeEmail: this.onChangeField("email")(emailValidator),
      changePassword: this.onChangeField("password")(passwordValidator),
      resetPassword: this.resetPassword,
      submit: this.handleSubmit,
      reset: this.reset
    };
    return (
      <Provider value={value} {...otherProps}>
        {children}
      </Provider>
    );
  }
}

export default AuthContext;
