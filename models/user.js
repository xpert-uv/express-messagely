/** User class for message.ly */

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");


/** User of the site. */

class User {


  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashpassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const date = new Date();
    const result = await db.query(`Insert into users (username,password, first_name, last_name, phone, join_at, last_login_at)
      values ($1,$2,$3,$4,$5,$6,$7) returning username,password, first_name, last_name, phone`, [username, hashpassword, first_name, last_name, phone, date, date]);
    let r = result.rows[0];
    console.log(r);
    return { username: r.username, password: r.hashpassword, first_name: r.first_name, last_name: r.last_name, phone: r.phone }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(`select username, password from users where username =$1`, [username]);
    if (result.rows[0].length === 0) {
      return false;
    } else if (await bcrypt.compare(password, result.rows[0].password) === true) {
      return true;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const date = new Date;
    const result = await db.query(`Update users set last_login_at=$1 where username = $2`, [date, username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query("Select username,first_name, last_name, phone from users");
    let r = result.rows;

    return r;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`Select username,first_name,last_name,phone,join_at, last_login_at from users where username = $1`, [username]);
    return result.rows[0];
    return new User(username = user.username, password = "", user.first_name, user.last_name, user.phone, user.join_at, user.last_login_at)
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id,
                m.to_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
            JOIN users AS u ON m.to_username = u.username
          WHERE from_username = $1`,
      [username]);

    return result.rows.map(m => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id,
                m.from_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
           JOIN users AS u ON m.from_username = u.username
          WHERE to_username = $1`,
      [username]);

    return result.rows.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }
}



module.exports = User;