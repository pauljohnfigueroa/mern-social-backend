import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'

import corsOptions from './config/corsOptions.js'

import User from './models/User.js'
import Post from './models/Post.js'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'

import { register } from './controllers/auth.js'
import { createPost } from './controllers/posts.js'
import { verifyToken } from './middleware/auth.js'

import { users, posts } from './data/fakedata.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()

/* Middleware */
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan("common"))
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))

// Cross Origin Resource Sharing
// you must have a whitelist of allowed domains, see config/corsOptions
app.use(cors(corsOptions))

app.use("/assets", express.static(path.join(__dirname, 'public/assets')))

/* File upload */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage })

/* Routes with File Uploads */

// This is not placed in the authRoutes because we need the multer upload here. 
app.post('/auth/register', upload.single('picture'), register)
app.post('/posts', verifyToken, upload.single('picture'), createPost)

/* Routes */
app.use('/auth', authRoutes)
app.use('/users', userRoutes)

/* Database */
const PORT = process.env.PORT || 4001

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to the Database.')
    app.listen(PORT, () => { console.log(`Server Listening on PORT ${PORT}`) })

    // fake data
    // run only once
    // User.insertMany(users)
    // Post.insertMany(posts)

}).catch((error) => { console.log(`${error}. Can not connect.`) })
