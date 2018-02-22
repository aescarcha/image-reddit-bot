import * as fs from "fs";
import {rp} from "request-promise";
import fetch from "node-fetch";
import {exec} from "node-exec-promise";

export class ImageProcessor {

    public static async generateImageDescription( imageUrl: string ): Promise<string> {
        let result: string = "";
        let localImage: string = await ImageProcessor.downloadAndSaveImage(imageUrl);
        if (localImage) {
            result = await this.executeImageProcessor(localImage);
        }
        return result;
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


    private static async executeImageProcessor( src: string ): Promise<string> {
        return exec(`(cd .. && bash frostRun.sh ${src})`).then( (out: { stdout: string; stderr: string }) => {
            return out.stdout;
          });
    }

}