const express = require("express");
const router = new express.Router();
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const msg = require("../models/message");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
    try {
        const { id } = req.prams;
        const msgDetail = await msg.get(id);
        return res.json({ message: msgDetail });
    } catch (e) {
        next(e);
    }

})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
    try {
        const { from_username, to_username, body } = req.body;
        const msgDetail = await msg.creeate(from_username, to_username, body);
        return res.json({ message: msgDetail });
    } catch (e) {
        next(e);
    }

})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
    try {
        const { id } = req.prams;
        const message_read = msg.markRead(id);
        return res.json({ message: message_read });
    } catch (e) {
        next(e);
    }
})

module.exports = router;