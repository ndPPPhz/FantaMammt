# FantaMammt

Piattaforma web per gestire il voto di gradimento e le riconferme
pre-asta della lega di Fantacalcio "Mammt Legapro".

## Come funziona

1. **Voto di gradimento** (pubblico): ogni squadra sceglie fino a 5
   giocatori per ciascuna delle altre 9 squadre (max 2 per ruolo, 1
   portiere). I voti sono visibili a tutti in tempo reale nella pagina
   "Voti ricevuti", insieme a chi ha già votato e chi manca ancora.
2. **Riconferme** (al buio): dopo che l'admin chiude il voto, ogni squadra
   sceglie fino a 5 giocatori della propria rosa da confermare, con un
   costo calcolato automaticamente in base ai voti ricevuti. Le riconferme
   di ogni squadra sono visibili solo alla squadra stessa e all'admin.

L'admin controlla l'avanzamento delle fasi da `/admin` e può resettare i
PIN di accesso delle squadre da `/admin/teams`.

## Setup

```bash
npm install
cp .env.example .env   # poi modifica SESSION_SECRET e ADMIN_PASSWORD
npm run seed            # crea il database e importa le 10 rose, stampa i PIN generati
npm start                # avvia il server su http://localhost:3000
```

Rilanciare `npm run seed` è sicuro: cancella e ricrea tutti i dati (utile
in sviluppo, da NON fare a stagione iniziata).

## Deploy in produzione (Arch Linux / systemd)

Setup iniziale sul server, una volta sola:

```bash
sudo pacman -Syu nodejs npm git base-devel python
git clone https://github.com/ndPPPhz/FantaMammt.git /opt/fantamammt/app
cd /opt/fantamammt/app
npm install --omit=dev
cp .env.example .env
nano .env               # SESSION_SECRET e ADMIN_PASSWORD veri, non quelli di test
npm run seed

sudo cp deploy/fantamammt.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fantamammt
```

Il unit file assume un utente dedicato `fantamammt` e il checkout in
`/opt/fantamammt/app`: se il tuo setup è diverso, modifica `User` e
`WorkingDirectory` in `deploy/fantamammt.service` prima di copiarlo.

Per i successivi aggiornamenti (dopo `git pull` di nuove modifiche), basta:

```bash
./deploy/deploy.sh
```

che fa `git pull`, `npm install` e riavvia il servizio — **non** tocca mai
il database né rilancia il seed.

Per esporlo con dominio e HTTPS, metti nginx (o un altro reverse proxy)
davanti alla porta 3000 e usa `certbot --nginx` per il certificato.

## Formula di riconferma

```
CostoConferma = round(CostoAnnoPrecedente * 1.25 + N)
```

dove `N` dipende dal numero di voti ricevuti dal giocatore (tabella dal
regolamento, in `src/lib/confirmCost.js`).
