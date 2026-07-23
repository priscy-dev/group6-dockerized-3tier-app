import passportJwt from "passport-jwt";
import Users from "../modules/users.js";
import environment from "./environment.js";

const PUB_KEY = environment.PUBLIC_KEY;
const JwtStrategy = passportJwt.Strategy;

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.jwt;
  }
  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: PUB_KEY,
  algorithms: ["RS512"],
};

const verify = async (payload, done) => {
  try {
    const user = await Users.findById(payload.sub);

    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

export default (passport) => {
  passport.use(new JwtStrategy(options, verify));
};
