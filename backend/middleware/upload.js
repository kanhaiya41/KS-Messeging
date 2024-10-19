import multer from 'multer';
import { GridFSBucket, MongoClient } from 'mongodb'
import mongoose, { mongo } from 'mongoose';
import dotenv from 'dotenv';
import grid from 'gridfs-stream';

dotenv.config();

const mongoURL = process.env.MONGO_URL;

const client = new MongoClient(mongoURL);

let gridFsBucket, gfs;

mongoose.connection.once('open', () => {
    gridFsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'ProfilePicture',
    });
    gfs = grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('ProfilePicture');
});

export const upload = multer({
    storage: multer.memoryStorage(),

});

export const uploadToGridFs = (req, res, next) => {
    try {
        const { file } = req;
        if (!file) {
            next();
        }
        else {
            let filename = `${Date.now()}-file-${file.originalname}`;
            file.originalname = filename;

            const writstream = gridFsBucket.openUploadStream(file.originalname, {
                contentType: file.mimetype
            });

            writstream.end(file.buffer);
            writstream.on('finish', () => {
                req.file.id = writstream.id;
                next();
            });

            writstream.on('error', (err) => {
                return res.status(500).json({ error: err.message });
            });

        }
    } catch (error) {
        console.error("Caught an error during file upload:", error);
        return res.status(500).json({ error: error.message });
    }


};

export const getProfilePic = async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        const readstream = gridFsBucket.openDownloadStream(file._id);
        readstream.pipe(res);
    } catch (error) {
        console.log("error while getting image", error)
    }
}