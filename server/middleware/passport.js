const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const CronLog = require('../models/CronLog');

passport.use(new GitHubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL:  process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email', 'repo'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findByGithubId(profile.id);

    if (user) {
      // Update token + profile on every login
      await User.updateByGithubId(profile.id, {
        accessToken: accessToken,
        displayName: profile.displayName || profile.username,
        avatarUrl: profile.photos?.[0]?.value,
        email: profile.emails?.[0]?.value,
        profileUrl: profile.profileUrl,
      });
      user = await User.findByGithubId(profile.id);
    } else {
      user = await User.create({
        githubId:    profile.id,
        username:    profile.username,
        displayName: profile.displayName || profile.username,
        avatarUrl:   profile.photos?.[0]?.value,
        email:       profile.emails?.[0]?.value,
        profileUrl:  profile.profileUrl,
        accessToken,
        repoConfig: {
          owner: profile.username,
        },
      });

      await CronLog.create({
        userId: user.id,
        level: 'info',
        message: `New user registered: @${profile.username}`,
        source: 'auth',
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
