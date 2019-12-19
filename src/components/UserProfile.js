import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { getUserdataByHandle } from '../services/tweets';


class UserProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: [],
      isLoading: false,
      error: null
    }
  }

  async componentDidMount() {
    const { handle } = this.props.match.params;

    try {
      this.setState({ isLoading: true});
      const userData = await getUserdataByHandle(handle);
      this.setState({ userData, isLoading: false});
    } catch(error) {
      this.setState({ error });
    }
  };

  render() {
    const { 
      userData,
      isLoading,
      error,
    } = this.state;

    if(error) {
      return (
        <div>Unable to fetch User Profile: {error.message}</div>
      );
    };

    if(isLoading) {
      return (
        <div>Loading User Profile...</div>
      );
    }

    const userTweetElements = userData.map(({ id, message, created_at }) => {
      const timeSince = formatDistance(new Date(created_at), new Date(), {addSuffix: true});
      
      return (
        <div key={id} className="tweet-card">
          <p className="card-name-date">{timeSince}</p>
          <p>{message}</p>
        </div>
      );
    });

    if (!userData.length) {
      return (
        <div>No tweets</div>
      )
    }

    return (
      <div>
      <h1>Profile for {userData[0].name}</h1>
      <div>
        <h2>Handle: (@{userData[0].handle})</h2>
        <h2>About me:</h2>
        <p>{userData[0].description}</p>
        {/* <button onClick={this.handleSubmitTweet.bind(this)} >Back to your feed</button> */}
      </div>
      <button>
        <Link to="/logout">Log out</Link>
      </button>
      <div>{userTweetElements}</div>
    </div>
    );
  };
};

export default UserProfile;