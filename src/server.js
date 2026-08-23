const app = require('./app');
const config = require('./config/env');

app.listen(config.port, () => {
  console.log(`FantaMammt in ascolto su http://localhost:${config.port}`);
});
