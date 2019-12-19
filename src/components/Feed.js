import React from 'react';
import jwtDecode from 'jwt-decode';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { getTweets, postTweet } from '../services/tweets';

class Feed extends React.Component {
  constructor(props) {
    super(props);

    const token = localStorage.getItem('twitter_clone_token');
    const payload = jwtDecode(token);

    this.state = {
      tweets: [],
      isLoading: false,
      error: null,
      message: '',
      session: payload
    };
  };

  async componentDidMount() {
    await this.populateTweets();
  };

  async populateTweets() {
    try {
      this.setState({ isLoading: true});
      const tweets = await getTweets();
      this.setState({ tweets, isLoading: false});
    } catch (error) {
      this.setState({ error });
    }
  };

  async handleSubmitTweet() {
    const { message } = this.state;

    if(!message) {
      return;
    }
    const newTweet = await postTweet(message);
    await this.populateTweets();
    this.setState({ message: '' });
  }

  handleInputChange(field, event) {
    this.setState({
      [field]: event.target.value
    });
  };

  render() {
    const { 
      session: {
        name,
        handle
      } = {},
      tweets,
      isLoading,
      error,
      message
    } = this.state;

    if(error) {
      return (
        <div>Unable to fetch tweets: {error.message}</div>
      );
    };

    if(isLoading) {
      return (
        <div>Loading tweets...</div>
      );
    }

    const tweetElements = tweets.map(({ id, message, name, handle, created_at }) => {
      const timeSince = formatDistance(new Date(created_at), new Date(), {addSuffix: true});
      
      return (
        <div key={id} className="tweet-card">
          <p className="card-name-date">{name} (@{handle}) {timeSince}</p>
          <p>{message}</p>
        </div>
      );
    });

    return (
      <div>
        <h1>Feed for {name} (@{handle})</h1>
        <div>
          <textarea 
          rows="5" cols="60"
          value={message}
          onChange={this.handleInputChange.bind(this, 'message')}
          />
          <button onClick={this.handleSubmitTweet.bind(this)} >Tweet</button>
        </div>
        <button>
          <Link to="/logout">Log out</Link>
        </button>
        <div>{tweetElements}</div>
      </div>
    );
  };
};

export default Feed;