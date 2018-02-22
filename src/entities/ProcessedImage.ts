import {IResult} from "./Result";
/**
 * Created by alvaroescarcha on 22/2/18.
 */

export interface IProcessedImage {
    im2txtResults: IResult[];
    inceptionResults: IResult[];
}

export class ProcessedImage implements IProcessedImage {
    public im2txtResults: IResult[];
    public inceptionResults: IResult[];

    constructor( data: IProcessedImage ) {
        this.im2txtResults = data.im2txtResults;
        this.inceptionResults = data.inceptionResults;
    }

    public isAcceptable(): boolean {
        let im2txtOk: boolean = false;
        let inceptionOk: boolean = false;

        this.im2txtResults.forEach( (res: IResult) => {
            if (res.probability > 0.5) {
                im2txtOk = true;
            }
        });

        this.inceptionResults.forEach( (res: IResult) => {
            if (res.probability > 40) {
                im2txtOk = true;
            }
        });

        // Additionally check if inception has several high results
        let sum: number = this.inceptionResults
            .map((result: IResult) => {
                return result.probability;
            }).reduce( (a, b) => {
                return a + b;
            });

        if (sum > 60) {
            im2txtOk = true;
        }

        if (im2txtOk == !inceptionOk) {
            // Last try, check the phrases with the keywords
            let inceptionWords: string[] = this.getInceptionKeywords();
            let im2TxtPhrases: string[] = this.getIm2TxtPhrases();
            im2TxtPhrases.forEach( (phrase: string) => {
                inceptionWords.forEach((keywords: string) => {
                    let keywordArray: string[] = [];
                    if (keywords.indexOf(',') > 0) {
                        // Multi keyword
                        keywordArray = keywords.split(',');
                    } else {
                        keywordArray.push(keywords);
                    }
                    let splitKeywords: string[] = [];
                    keywordArray.forEach((keyword: string) => {
                       keyword.split(" ").forEach((splitWord: string) => {
                           splitWord = splitWord.trim();
                           if (splitWord.length > 0) {
                               splitKeywords.push(splitWord);
                           }
                       });
                    });

                    splitKeywords.forEach( (singleKeyword: string) => {
                        if (phrase.indexOf(singleKeyword.trim()) > 0) {
                            console.log(`Acceptable result because ${singleKeyword} matches ${phrase}`);
                            im2txtOk = true;
                        }
                    });
                });
            });
        }

        return im2txtOk && inceptionOk;
    }

    public generateText(): string {

        let text: string = "Bip bop bip, I'm an image processing bot. ";
        let inceptionWords: string[] = this.getInceptionKeywords();

        text += "I've found some keywords in this image " + inceptionWords.join(',');

        let im2TxtPhrases: string[] = this.getIm2TxtPhrases();

        text += ". With those keywords, I think the image can be " + im2TxtPhrases.join(" or ");
        return text;
    }

    private getIm2TxtPhrases() {
        return this.im2txtResults.map((res: IResult) => {
            return res.text.trim();
        });
    }

    private getInceptionKeywords() {
        return this.inceptionResults.map((res: IResult) => {
            return res.text.trim();
        });
    }
}