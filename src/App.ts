import Snoowrap = require("snoowrap");
import Snoostorm = require("snoostorm");
import {Reddit} from "./services/Reddit";
import {ImageProcessor} from "./services/ImageProcessor";
import {IProcessedImage, ProcessedImage} from "./entities/ProcessedImage";
import Submission from "snoowrap/dist/objects/Submission";
import Comment from "snoowrap/dist/objects/Comment";
import Listing from "snoowrap/dist/objects/Listing";

require('dotenv').config();
const excludedSubreddits: string[] = ['MetalEarth'];

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
    "results": 5
});

submissionStream.on('submission', async (post: Snoowrap.Submission) => {
    try {
	if (excludedSubreddits.indexOf(post.subreddit.display_name) < 0) {
   	 const imageSource: string = Reddit.getImageUrlFromPost(post);
   	 if (imageSource) {
        	let result: ProcessedImage | undefined = await ImageProcessor.generateImageDescription( imageSource );
        	console.log(result);
        	if (result && result.isAcceptable()) {
          	  console.log("!!!!---------Acceptable Result!! for " + imageSource, result.generateText());
        	    post.reply(result.generateText());
        	}
	    }
	}
    } catch(e) {
	console.log("exception in process", e);
    }
});

setInterval(async () => {
    let breakLoop: boolean = false;
    let ids: string[] = [];
    let lastId: string = "";
    while (breakLoop === false) {
        let result: Comment[] = await getControversial(lastId);
        result.forEach((comment: Comment) => {
            if ( ids.indexOf(comment.id) > -1) {
                breakLoop = true;
            }
            ids.push(comment.id);
            lastId = comment.name;
            if (comment.score <= -4) {
                console.log("removing comment", comment.id);
                comment.delete();
            }
        });
        if (result.length === 0) {
            breakLoop = true;
        }
    }
}, 60000 );


async function getControversial(after: string) {
    return r.oauthRequest({
        uri: "/user/" + process.env.REDDIT_USER + "/comments/",
        qs: {
            limit: 100,
            after: after,
            t: "week",
        }
    } as any);
}

