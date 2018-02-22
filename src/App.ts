import Snoowrap = require("snoowrap");
import Snoostorm = require("snoostorm");
import {Reddit} from "./services/Reddit";
import {ImageProcessor} from "./services/ImageProcessor";

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
    "subreddit": process.env.SUBREDDIT,
    "results": 2
});

submissionStream.on('submission', async (post: Snoowrap.Submission) => {
    const imageSource: string = Reddit.getImageUrlFromPost(post);
    if (imageSource) {
        console.log("Uploaded pic", imageSource);
        let result: string = await ImageProcessor.generateImageDescription( imageSource );
        console.log("Result:", result);
    }
});


