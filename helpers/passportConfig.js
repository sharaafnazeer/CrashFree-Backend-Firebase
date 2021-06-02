const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require('../models/user')
const Bcrypt = require('bcrypt');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
    'signup',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
      },
      (req, email, password, done) => {
        try {

            User.findOne({ email: req.body.email}, function (err, userDoc) {
                if(err) {
                    return done(err);
                }
                if (userDoc) {
                    return done(null, false, {message: 'It seems like you are already registered with our application!'}) 
                }

                const user = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: email,
                    password: password,
                    address: req.body.address,
                    phone: req.body.phone,
                    status: 0
                });

                user.save();
                // console.log(user)

                return done(null, user);
            });
         
        } catch (error) {
            // console.log(err)
          done(error);
        }
      }
    )
);


passport.use(
    'login',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
  
          if (!user) {
            return done(null, false, { message: 'It seems like you are not registered with our application!' });
          }
  
          const validate = await user.isValidPassword(password);
  
          if (!validate) {
            return done(null, false, {message: 'Invalid password', verified: true});
          }

          if (user.status !== 1) {
            return done(null, false, {verified: false, user})
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
);

passport.use(
    new JWTstrategy(
      {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );