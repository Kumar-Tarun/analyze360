import tweepy
import sys
import jsonpickle
import os

auth = tweepy.AppAuthHandler("6cxqy2zGDG79IT0kzwl1VTZRt","B11tACBDKtcpQ4jh9gRqmueIMxVqmkpwCYnYMEVJerqSR6eAyH")

api = tweepy.API(auth, wait_on_rate_limit=True,
				   wait_on_rate_limit_notify=True)

if (not api):
    print ("Can't Authenticate")
    sys.exit(-1)
def get_tweet(searchQuery, maxTweets=200):
    
    tweetsPerQry=100
     # Some arbitrary large number
    # If results from a specific ID onwards are reqd, set since_id to that ID.
    # else default to no lower limit, go as far back as API allows
    sinceId = None
    
    # If results only below a specific ID are, set max_id to that ID.
    # else default to no upper limit, start from the most recent tweet matching the search query.
    max_id = -1
    c=0
    tweetCount = 0
    tweets=[]
    tts=[]
    while tweetCount < maxTweets:
        try:
            if (max_id <= 0):
                if (not sinceId):
                    new_tweets = api.search(q=searchQuery, count=tweetsPerQry)
                else:
                    new_tweets = api.search(q=searchQuery, count=tweetsPerQry,
                                            since_id=sinceId)
            else:
                if (not sinceId):
                    new_tweets = api.search(q=searchQuery, count=tweetsPerQry,
                                            max_id=str(max_id - 1))
                else:
                    new_tweets = api.search(q=searchQuery, count=tweetsPerQry,
                                            max_id=str(max_id - 1),
                                            since_id=sinceId)
            if not new_tweets:
                print("No more tweets found")
                break
            tweetCount += len(new_tweets)
            x=jsonpickle.encode(new_tweets, unpicklable=False)
            y=jsonpickle.decode(x)
            tweets.extend(y)
            for tweet in y:
                if(tweet['retweet_count']>0 and 'retweeted_status' in tweet):
                    if(not tweet['retweeted_status'] in tweets):
                        tweets.append(tweet['retweeted_status'])
            max_id = new_tweets[-1].id
        except tweepy.TweepError as e:
            # Just exit if any error
            print("some error : " + str(e))
            break
    return tweets
    
