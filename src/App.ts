import Snoowrap = require("snoowrap");
import Snoostorm = require("snoostorm");
/**
 * Created by alvaroescarcha on 22/2/18.
 */

require('dotenv').config();

const r: Snoowrap = new Snoowrap({
    userAgent: 'reddit-bot-example-node',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

const client = new Snoostorm(r);


// Create a Snoostorm CommentStream with the specified options
const submissionStream = client.SubmissionStream({
    "subreddit": "SubredditSimulator",
    "results": 50
});

submissionStream.on('submission', (post: Snoowrap.Submission) => {
    const imageSource: string = Reddit.getImageUrlFromPost(post);
    if (imageSource) {
        console.log("uploaded pic", imageSource);
    }
});


