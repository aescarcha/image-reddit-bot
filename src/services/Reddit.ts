import Snoowrap = require("snoowrap");

export class Reddit {
    public static getImageUrlFromPost( post: Snoowrap.Submission ): string {
        if (post.url.indexOf('i.redd.it') > 0) {
            return post.url;
        }
        return "";
    }
}