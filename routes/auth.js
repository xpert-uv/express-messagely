const express = require("express");
const router = new express.Router();

const ExpressError = require("../expressError")
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new ExpressError(" username/password required.", 400);
        } else {
            if (await user.authenticate(username, password)) {
                await user.updateLoginTimestamp(username);
                const token = jwt.sign(username, SECRET_KEY);
                return res.json({ token })
            }
            throw new ExpressError("Invalid username/password", 401);
        }
    } catch (e) {
        next(e);
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try {
        let { username } = await user.register(req.body);
        let token = jwt.sign({ username }, SECRET_KEY);
        user.updateLoginTimestamp(username);
        return res.json({ token });
    } catch (e) {

        if (e.code === '23505') {
            return next(new ExpressError("Username taken. Please pick another!", 400));
        }
        return next(e);
    }
}
);

module.exports = router;