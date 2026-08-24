const path = require('path');
const express = require('express');
const session = require('express-session');
const config = require('./config/env');
const { attachPhase, attachFlash } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const votingRoutes = require('./routes/voting');
const tallyRoutes = require('./routes/tally');
const confirmRoutes = require('./routes/confirm');
const adminRoutes = require('./routes/admin');
const accountRoutes = require('./routes/account');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
// Bootstrap is served locally (from node_modules) rather than a CDN, so the
// app renders correctly even without outbound internet access.
app.use(
  '/vendor/bootstrap',
  express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist'))
);
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(attachPhase);
app.use(attachFlash);

app.get('/', (req, res) => {
  if (req.session.teamId) return res.redirect('/voting');
  if (req.session.isAdmin) return res.redirect('/admin');
  res.redirect('/login');
});

// authRoutes is mounted first (unprefixed) so its exact /admin/login match
// is handled before it could ever reach adminRoutes' requireAdmin guard.
app.use(authRoutes);
app.use('/voting', votingRoutes);
app.use('/tally', tallyRoutes);
app.use('/confirm', confirmRoutes);
app.use('/admin', adminRoutes);
app.use('/account', accountRoutes);

app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Non trovata' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('errors/500', { title: 'Errore' });
});

module.exports = app;
