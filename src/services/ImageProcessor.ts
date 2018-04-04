import * as fs from "fs";
import {rp} from "request-promise";
import fetch from "node-fetch";
import {exec} from "node-exec-promise";
import {IResult} from "../entities/Result";
import {IProcessedImage, ProcessedImage} from "../entities/ProcessedImage";

export class ImageProcessor {
    public static async generateImageDescription( imageUrl: string ): Promise<ProcessedImage | undefined> {
        let localImage: string = await ImageProcessor.downloadAndSaveImage(imageUrl);
        if (localImage) {
            let bashResult: string = await this.executeImageProcessor(localImage);
            return ImageProcessor.filterResult(bashResult);
        }
        return;
    }

    private static async downloadAndSaveImage( imageUrl: string ): Promise<string> {
        let split: string[] = imageUrl.split("/");
        let dstSrc: string = "";
        let filename: string = "";
        if ( split.length > 0 ){
            filename = "" + split.pop();
            dstSrc = `/tmp/${filename}`;
            let result = await fetch(imageUrl)
                .then(res => {
                    const dest = fs.createWriteStream(dstSrc);
                    res.body.pipe(dest);
                });
        }
        return dstSrc;
    }

    private static filterResult( result: string ): ProcessedImage | undefined {
        if (result.indexOf("webpage") > 0 || result.indexOf("comic") > 0 || result.indexOf("website") > 0 || result.indexOf("envelope") > 0) {
            return; // Probably some kind meme or website screen capture
        }

        let im2TxtResults: IResult[] = ImageProcessor.getIm2txtResultsFromResult(result);
        let inceptionResults: IResult[] = ImageProcessor.getInceptionResultsFromResult(result);

        return new ProcessedImage({
            im2txtResults: im2TxtResults,
            inceptionResults: inceptionResults
        });
    }

    private static getIm2txtResultsFromResult(result: string): IResult[] {
        let datum: IResult[] = [];
        let lines: string[] = result.split('\n');
        lines.forEach((line: string) => {
            if (line.indexOf("(p=") > 0) {
                // Im2txt result
                let probabilityResult = line.match(/p=([0-9].[0-9]*)/);
                let textResult = line.match(/[0-9]\)\s([\w\s]*)/);

                if( textResult && probabilityResult) {
                    datum.push({
                        text: "" + textResult!.pop(),
                        probability: 100 * parseFloat( probabilityResult!.pop()!),
                    });
                }

            }
        });
        return datum;
    }

    private static getInceptionResultsFromResult(result: string): IResult[] {
        let datum: IResult[] = [];
        let lines: string[] = result.split('\n');
        lines.forEach((line: string) => {
            if (line.indexOf("(score =") > 0) {
                // inception result
                let probabilityResult = line.match(/score = ([0-9].[0-9]*)/);
                let textResult = line.match(/^([\w,\s]+)/);

                if( textResult && probabilityResult) {
                    datum.push({
                        text: "" + textResult!.pop(),
                        probability: 100 * parseFloat(probabilityResult!.pop()!),
                    });
                }
            }
        });
        return datum;
    }


    private static async executeImageProcessor( src: string ): Promise<string> {
        return exec(`(cd .. && bash frostRun.sh ${src})`).then( (out: { stdout: string; stderr: string }) => {
            return out.stdout;
          });
    }

}
