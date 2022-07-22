const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const sequalize = require('../sequalize');
const UserService = require("../service/UserService");
const {where} = require("sequelize");
const userService = new UserService(sequalize);

passport.use(
    'register',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                console.log(userService);
                await userService.create(email, password);
                return done(null, 200);
            } catch (error) {
                done(error);
            }
        }
    )
);

passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await userService.models.User.findOne({where:{email}});

                if (!user) {
                    return done(null, false);
                }

                const validate = await userService.comparePassword(user.dataValues.password, password);

                if (!validate) {
                    return done(null, false);
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    new JWTstrategy(
        {
            secretOrKey: 'TOP_SECRET',
            jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
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

const verifyToken = (req,res,next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        req.token = bearerHeader.split(' ')[1];
        next();
    } else {
        res.sendStatus(401);
    }
}

module.exports = {
    passport,
    verifyToken,
};