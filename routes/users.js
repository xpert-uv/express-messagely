const express = require("express");
const router = new express.Router();
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const user = require("../models/user");




/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const user_list = await user.all();
        return res.json({ users: user_list });
    } catch (e) {
        next(e);
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
    try {
        const { username } = req.prams;
        const userDetail = await user.get(username);
        return res.json({ user: userDetail });
    } catch (e) {
        next(e);
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
    try {
        const { username } = req.prams;
        const msg_frm = await user.messagesFrom(username);
        return res.json({ messages: msg_frm });
    } catch (e) {
        next(e);
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
    try {
        const { username } = req.prams;
        const msg_to = await user.messagesTo(username);
        return res.json({ messages: msg_to });
    } catch (e) {
        next(e);
    }
})


module.exports = router;