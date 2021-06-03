'use strict';
const db = require('../db');

const User = require('../models/user');
const UserToken = require('../models/userToken');
const passport = require("passport");
const moment = require('moment');
const Bcrypt = require('bcrypt');
const SendMail = require('../helpers/sendMail');
const Jade = require('jade');
const jwt = require('jsonwebtoken');

const signIn = (req, res, next) => {

  passport.authenticate(
    'login',
    async (err, user, info) => {
      try {
        if (info) {

          if (info.verified) {
            const error = new Error(info.message);
            return next(error);
          }
          else {

            const userToken = new UserToken(info.user.id,
              Math.floor((Math.random() * 999999) + 100000),
              1,
              moment(new Date()).add(10, 'minutes'));
            const object = userToken.getObject();

            db.collection('usertokens').doc().set(object);

            const html = Jade.renderFile('views/registeremail.jade', {
              user: info.user.firstName,
              code: userToken.getToken()
            });
            SendMail.sendMail(info.user.email, "Complete your registration", html);

            return jsonResponse(res, 200, successRes({ 'verified': false }))
          }
        }

        else if (err) {
          const error = new Error("Ooopss. Something went wrong. Please try again later");
          return next(error);
        }

        else if (!user && info) {
          const error = new Error("Ooopss. Something went wrong. Please try again later");
          return next(error);
        }

        req.login(
          user,
          { session: false },
          async (error) => {
            if (error) return next(error);

            const body = { id: user.id, email: user.email };
            const token = jwt.sign({ user: body }, process.env.JWT_SECRET);

            return jsonResponse(res, 200, successRes({ 'verified': true, token }))
          }
        );
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
}

const signUp = (req, res, next) => {
  passport.authenticate('signup', (err, user, info) => {
    if (err)
      return jsonResponse(res, 500, errorRes(err))
    else if (info) {
      return jsonResponse(res, 500, badRes(info.message))
    }
    else if (user) {
      const userToken = new UserToken(user.id,
        Math.floor((Math.random() * 999999) + 100000),
        1,
        moment(new Date()).add(10, 'minutes'));
      const object = userToken.getObject();

      db.collection('usertokens').doc().set(object);

      const html = Jade.renderFile('views/registeremail.jade', {
        user: user.firstName,
        code: userToken.getToken()
      });
      SendMail.sendMail(user.email, "Complete your registration", html);
      return jsonResponse(res, 200, successRes("Registered Successfully. Please check your email to verify your account"));
    }

  })(req, res, next)
}

const checkAuth = (req, res, next) => {
  return jsonResponse(res, 200, successRes('Authentication success'));
}

const activateAccount = async (req, res, next) => {
  const code = req.body.code;
  const email = req.body.email;
  if (email && code) {

    const user = db.collection('users').where("email", '==', email);
    const availableUser = await user.get();
    if (availableUser.empty) {
      return jsonResponse(res, 400, badRes("Account not available"));
    }

    const actualUser = availableUser.docs[0].data();

    const userToken = db.collection('usertokens').where("userId", '==', availableUser.docs[0].id)
      .where("expireAt", '>', moment()).where("type", '==', 1).orderBy('expireAt', 'desc');

    const availableTokens = await userToken.get();
    if (availableTokens.empty) {
      return jsonResponse(res, 400, badRes("Invalid activation code"));
    }

    const actualToken = availableTokens.docs[0].data();

    if (actualToken.token == code) {

      const update = {...actualUser, status : 1}

      db.collection('users').doc(availableUser.docs[0].id).update(update);

      db.collection('usertokens').doc(availableTokens.docs[0].id).delete();
      return jsonResponse(res, 200, successRes("Account activated successfully."));
    } else {
      return jsonResponse(res, 400, badRes("Invalid activation code"));
    }
  } else {
      return jsonResponse(res, 400, badRes("Activation code is required!"))                
  }

}

// Verify User to Reset Password
const resetUserVerify = async (req, res, next) => {
  const email = req.body.email;
  try {
    if (email) {

      const user = db.collection('users').where("email", '==', email);
      const availableUser = await user.get();
      if (availableUser.empty) {
        return jsonResponse(res, 400, badRes("Account not available"));
      } 
  
      const userToken = new UserToken(availableUser.docs[0].id,
        Math.floor((Math.random() * 999999) + 100000),
        2,
        moment(new Date()).add(10, 'minutes'));
      const object = userToken.getObject();
  
      db.collection('usertokens').doc().set(object);
  
      const html = Jade.renderFile('views/resetpassword.jade', {
        user: user.firstName,
        code: userToken.token
      });
      SendMail.sendMail(user.email, "Reset your account password", html);
      return jsonResponse(res, 200, successRes("Please check your email to verify your account"));
  
    } else {
      return jsonResponse(res, 400, badRes("Email is required!"))
    }
  } catch (error) {
    return jsonResponse(res, 500, errorRes(error))
  }
}

const verifyResetCode = async (req, res, next) => {
  const code = req.body.code;
  const email = req.body.email;

  if (email && code) {

    const user = db.collection('users').where("email", '==', email);
    const availableUser = await user.get();
    if (availableUser.empty) {
      return jsonResponse(res, 400, badRes("Account not available"));
    }

    const userToken = db.collection('usertokens').where("userId", '==', availableUser.docs[0].id)
      .where("expireAt", '>', moment()).where("type", '==', 2).orderBy('expireAt', 'desc');

    const availableTokens = await userToken.get();
    if (availableTokens.empty) {
      return jsonResponse(res, 400, badRes("Invalid activation code"));
    }

    const actualToken = availableTokens.docs[0].data();

    if (actualToken.token == code) {
      db.collection('usertokens').doc(availableTokens.docs[0].id).delete();
      return jsonResponse(res, 200, successRes(""));
    } else {
      return jsonResponse(res, 400, badRes("Invalid activation code"));
    }

  } else {
    return jsonResponse(res, 400, badRes("Activation code is required!"))
  }

}

const resetPassword = async (req, res, next) => {

  const password = req.body.password;
  const email = req.body.email;
  if (email && password) {

    const user = db.collection('users').where("email", '==', email);
    const availableUser = await user.get();
    if (availableUser.empty) {
      return jsonResponse(res, 400, badRes("Account not available"));
    }

    const actualUser = availableUser.docs[0].data();

    const object = { ...actualUser, password: Bcrypt.hashSync(password, 10) }
    db.collection('users').doc(availableUser.docs[0].id).update(object);

    return jsonResponse(res, 200, successRes("Your password reset is completed successfully!"))

  } else {
    return jsonResponse(res, 400, badRes("Email or code is required!"))
  }
}

const verify = (req, res, next) => {
  let token;

  if ('authorization' in req.headers) {
    token = req.headers['authorization'].split(' ')[1];
  }

  if (!token) {
    jsonResponse(res, 400, badRes('No token provided'));
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        jsonResponse(res, 400, badRes('Token authentication failed'));
      } else {
        req.userId = decoded.user.id;
        next();
      }
    })
  }

}

module.exports = {
  signIn,
  signUp,
  checkAuth,
  verify,
  resetPassword,
  verifyResetCode,
  resetUserVerify,
  activateAccount,
}