import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation,
            viewedProfile,
            impressions
        } = req.body

        const salt = await bcrypt.genSalt()
        const passwordHash = await bcrypt.hash(password, salt)

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
            picturePath,
            friends,
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 10000),
            impressions: Math.floor(Math.random() * 10000)
        })

        const savedUser = newUser.save()

        res.status(201).json(savedUser)

    } catch (error) {
        res.status(500).json({ errorMessage: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Check if the account/email exists in the database
        const user = await User.findOne({ email })

        // If the account/email does no exists in the database
        if (!user) return res.status(400).json({ msg: 'Email does not exists.' })

        // Now, check the password
        const isPwdMatch = await bcrypt.compare(password, user.password)
        if (!isPwdMatch) return res.status(400).json({ msg: 'Invalid credentials.' })

        // do not send the password to the front end
        // delete user.password // don't know why this is not working
        user.password = undefined

        // token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        // send to frontend
        res.status(200).json({ user, token })

    } catch (error) {
        res.status(500).json({ errorMessage: error.message })
    }
}