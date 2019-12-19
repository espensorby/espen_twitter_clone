import React from 'react';

class Logout extends React.Component {
  componentDidMount() {
    const { history } = this.props;
    localStorage.removeItem('twitter_clone_token');
    history.replace('/');
  }

  render() {
    return (
      <div>Loggin out...</div>
    );
  };
};

export default Logout;