import json
import jsonpickle
import re
import os
import sys
import tweepy
import nltk
import sqlalchemy
import datetime
import urllib.parse
import psycopg2
from cs50 import SQL
from gettweet import get_tweet
from tweepy import OAuthHandler
from textblob import TextBlob
from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_jsglue import JSGlue

app = Flask(__name__)
JSGlue(app)

urllib.parse.uses_netloc.append("postgres")
url = urllib.parse.urlparse(os.environ["DATABASE_URL"])
conn = psycopg2.connect(
 dbname=url.path[1:],
 user=url.username,
 password=url.password,
 host=url.hostname,
 port=url.port
)



db = SQL(os.environ["DATABASE_URL"])

# Replace the API_KEY and API_SECRET with your application's key and secret.
auth = tweepy.AppAuthHandler("6cxqy2zGDG79IT0kzwl1VTZRt","B11tACBDKtcpQ4jh9gRqmueIMxVqmkpwCYnYMEVJerqSR6eAyH")

api = tweepy.API(auth, wait_on_rate_limit=True,
				   wait_on_rate_limit_notify=True)

if (not api):
    print ("Can't Authenticate")
    sys.exit(-1)

def clean_tweet(tweet):
    return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", tweet).split())
 
def get_tweet_sentiment(tweet):
        '''
        Utility function to classify sentiment of passed tweet
        using textblob's sentiment method
        '''
        # create TextBlob object of passed tweet text
        analysis = TextBlob(clean_tweet(tweet))
        # set sentiment
        if analysis.sentiment.polarity > 0:
            return ['positive',analysis.sentiment.polarity]
        elif analysis.sentiment.polarity == 0:
            return ['neutral',0]
        else:
            return ['negative',analysis.sentiment.polarity]
            
def get_tweets_country(searchQuery, maxTweets):
    # empty list to store parsed tweets
    tweets = []
    
    try:
        # call twitter api to fetch tweets
        fetched_tweets = get_tweet(searchQuery, maxTweets)
        if(len(fetched_tweets)==0):
            return fetched_tweets
        else:
            c=0
            # parsing tweets one by one
            for tweet in fetched_tweets:
                # empty dictionary to store required params of a tweet
                parsed_tweet = {}
                if(tweet['place']!=None):
                    parsed_tweet['country']=tweet['place']['country']
                    parsed_tweet['code']=tweet['place']['country_code']
                else:
                    if(tweet['user']['location']!=""):
                        tokenizer = nltk.tokenize.TweetTokenizer()
                        tokens = tokenizer.tokenize(clean_tweet(tweet['user']['location']))
                        words=[]
                        k=0
                        for i in range(len(tokens)):
                            j=i
                            word=""
                            while(j<len(tokens)):
                                if(j<(len(tokens)-1)):
                                    word=word+tokens[j]+" "
                                else:
                                    word=word+tokens[j]
                                j+=1
                            words.append(word)
                        for w in words:
                            rows=db.execute("SELECT country, admin1 FROM countrycount WHERE country=:c OR admin1=:c",c=w)
                            if(len(rows)>0):
                                if(w=="UK"):
                                    parsed_tweet['code']='GB'
                                elif(w=="USA"):
                                    parsed_tweet['code']='US'
                                elif(w=="UAE"):
                                    parsed_tweet['code']='AE'
                                else:
                                    parsed_tweet['code']=rows[0]['admin1']
                                parsed_tweet['country']=rows[0]['country'].strip()
                                k=1
                                break
                        
                        if(not k==1):
                            if(tweet['user']['time_zone']!=None):
                                rows=db.execute("SELECT country, code FROM tz WHERE time_Zone=:t",t=tweet['user']['time_zone'])
                                if(len(rows)>0):
                                    parsed_tweet['country']=rows[0]['country'].strip()
                                    parsed_tweet['code']=rows[0]['code']
                                else:
                                    continue
                            else:
                                continue
                    elif(tweet['user']['time_zone']!=None):
                        rows=db.execute("SELECT country, code FROM tz WHERE time_Zone=:t",t=tweet['user']['time_zone'])
                        if(len(rows)>0):
                            parsed_tweet['country']=rows[0]['country'].strip()
                            parsed_tweet['code']=rows[0]['code']
                        else:
                            continue
                    else:
                        continue
                    
                  # saving text of tweet
                parsed_tweet['text'] = tweet['text']
                # saving sentiment of tweet
                score=get_tweet_sentiment(tweet['text'])
                parsed_tweet['sentiment'] = score[0]
                parsed_tweet['score']=score[1]
                parsed_tweet['date']=tweet['created_at'][0:10]
                # appending parsed tweet to tweets list
                
                if tweet['retweet_count'] > 0:
                    # if tweet has retweets, ensure that it is appended only once
                    if parsed_tweet not in tweets:
                        tweets.append(parsed_tweet)
                else:
                    tweets.append(parsed_tweet)
                if(len(tweets)==maxTweets):
                    break
            # return parsed tweets
            return tweets

    except tweepy.TweepError as e:
        # print error (if any)
        print("Error : " + str(e))
        
def analyze(tweets):
    count={}
    features=[]
    obj={}
    pos=neg=n=0
    score=0
    dates={}
    today=datetime.datetime.now()
    for tweet in tweets:
        feature={}
        coordinates=[]
        score=score+tweet['score']
        if(datetime.datetime.strptime(tweet['date'],'%Y-%m-%d') <= today and datetime.datetime.strptime(tweet['date'],'%Y-%m-%d')>= today-datetime.timedelta(days=6)):
            if(not tweet['date'] in dates):
                if(tweet['sentiment']=='positive'):
                    dates[tweet['date']]=[1,1,0,0]
                elif(tweet['sentiment']=='neutral'):
                    dates[tweet['date']]=[1,0,1,0]
                else:
                    dates[tweet['date']]=[1,0,0,1]
            else:
                dates[tweet['date']][0]+=1
                if(tweet['sentiment']=='positive'):
                    dates[tweet['date']][1]+=1
                elif(tweet['sentiment']=='neutral'):
                    dates[tweet['date']][2]+=1
                else:
                    dates[tweet['date']][3]+=1
            
        if(tweet['sentiment']=='positive'):
            pos+=1
        elif(tweet['sentiment']=='negative'):
            neg+=1
        else:
            n+=1
        rows=db.execute("SELECT latitude, longitude FROM lalo WHERE code=:c",c=tweet['code'])
        if(len(rows)>0):
            coordinates.append(rows[0]['longitude'])
            coordinates.append(rows[0]['latitude'])
            feature['type']='Feature'
            feature['properties']={'name':tweet['country']}
            feature['geometry']={'type':'Point', 'coordinates':coordinates}
            features.append(feature)
            if(tweet['country'] == "United States"):
                tweet['country']="United States of America"
            if(not tweet['country'] in count):
                if(tweet['sentiment']=='positive'):
                    count[tweet['country']]=[1,1,0,0]
                elif(tweet['sentiment']=='neutral'):
                    count[tweet['country']]=[1,0,1,0]
                else:
                    count[tweet['country']]=[1,0,0,1]
            else:
                count[tweet['country']][0]+=1
                if(tweet['sentiment']=='positive'):
                    count[tweet['country']][1]+=1
                elif(tweet['sentiment']=='neutral'):
                    count[tweet['country']][2]+=1
                else:
                    count[tweet['country']][3]+=1
    obj['type']='FeatureCollection'
    obj['features']=features
    normalized_score=score/len(tweets)
    percentage=normalized_score*2 + 3
    percentage=round(percentage,1)
    u=round((100*pos)/len(tweets),1)
    v=round((100*neg)/len(tweets),1)
    w=100-u-v
    return {
        "positive":u,
        "negative":v,
        "neutral":round(w,1),
        "total_count":len(tweets),
        "count":[pos,n,neg],
        "percentage":percentage,
        "loc":obj,
        "cdata":count,
        "most_recent":[tweets[0]['text'],tweets[0]['country']],
        "dates":dates
    }

@app.route("/")
def index():
    return render_template("home.html")
    
@app.route("/analyze", methods=["GET"])
def get_analyze():
   if(request.method=="GET"):
        return render_template("analyze.html")
   
@app.route("/search")
def search():
    searchQuery=request.args.get("query")
    maxTweets=int(request.args.get("max"))
    tweets=get_tweets_country(searchQuery, maxTweets)
    if(len(tweets)==0):
        return jsonify({'ok':'not found'})
    else:
        result=analyze(tweets)
        return jsonify(result)
    
@app.route("/about")
def about():
    return render_template("about.html")
    
if __name__ == '__main__':
 app.debug = True
 port = int(os.environ.get("PORT", 5000))
 app.run(host='0.0.0.0', port=port)
