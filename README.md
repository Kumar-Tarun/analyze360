analyze360 is a web app based on sentimental analysis. It searches for tweets containing the topic typed in by the user and performs the required analysis on it.
<br><br>
It has the following features- <br>
&nbsp;&nbsp;   1)Overall sentiment level <br>
&nbsp;&nbsp;   2)No.of tweets sentiment wise and day wise<br>
&nbsp;&nbsp;    3)Latest tweet<br>
&nbsp;&nbsp;    4)Geospatial plotting of the tweets(country wise).<br>
    <br>
It uses the module tweepy for the twitter API and the classifier used is Naive-Bayes Classifier.<br>
The required python modules are contained in requirememts.txt.
<br><br>
You need to install NLTK corpora using following command-<br>
&nbsp;&nbsp;&nbsp;   python -m textblob.download_corpora
   <br><br>
The app also uses analyze.dump which contains tables for different countries, timezones, latitudes and longitudes which is used for the plotting of tweets on the world map.
   
