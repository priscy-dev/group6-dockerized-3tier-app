import passport from "passport";

const isAuth = passport.authenticate("jwt", { session: false });

export { isAuth };
