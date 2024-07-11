import sharp from "sharp";

export const createThumbs = async (originalImage: Buffer) => {
    return await sharp(originalImage).resize({width: 128, height: 128})
        .toBuffer();
}
