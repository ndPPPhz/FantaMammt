# FantaMammt

Piattaforma web per gestire il voto di gradimento e le riconferme
pre-asta della lega di Fantacalcio "Mammt Legapro".

## Come funziona

1. **Voto di gradimento**: ogni squadra sceglie fino a 5 giocatori per
   ciascuna delle altre 9 squadre (max 2 per ruolo, 1 portiere). La
   pagina "Vota" mostra solo chi ha già completato il voto e chi manca
   ancora (senza rivelare le scelte); i conteggi veri e propri in "Voti
   ricevuti" restano nascosti a tutti (admin escluso) finché l'admin non
   chiude la fase di voto per l'intera lega.
2. **Riconferme** (al buio): dopo che l'admin chiude il voto, ogni squadra
   sceglie fino a 5 giocatori della propria rosa da confermare, con un
   costo calcolato automaticamente in base ai voti ricevuti. Le riconferme
   di ogni squadra sono visibili solo alla squadra stessa e all'admin.

L'admin controlla l'avanzamento delle fasi da `/admin`. I PIN sono
salvati solo come hash (nessuno, admin incluso, può vederli in chiaro):
ogni squadra può impostare il proprio da "Cambia PIN" una volta loggata;
l'admin può solo forzarne il reset da `/admin/teams`, che genera un PIN
temporaneo da comunicare.

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

# /opt è di root: crea l'utente dedicato e assegnagli la sua directory
# PRIMA di clonarci dentro, altrimenti git/npm falliscono per permessi.
sudo useradd -r -m -d /opt/fantamammt -s /usr/bin/nologin fantamammt
sudo mkdir -p /opt/fantamammt/app
sudo chown fantamammt:fantamammt /opt/fantamammt/app

sudo -u fantamammt git clone https://github.com/ndPPPhz/FantaMammt.git /opt/fantamammt/app
cd /opt/fantamammt/app
sudo -u fantamammt npm install --omit=dev
sudo -u fantamammt cp .env.example .env
sudo -u fantamammt nano .env   # SESSION_SECRET e ADMIN_PASSWORD veri, non quelli di test
sudo -u fantamammt npm run seed

sudo cp deploy/fantamammt.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fantamammt
```

Il unit file assume un utente dedicato `fantamammt` e il checkout in
`/opt/fantamammt/app`: se il tuo setup è diverso, modifica `User` e
`WorkingDirectory` in `deploy/fantamammt.service` prima di copiarlo.

Per i successivi aggiornamenti (dopo modifiche pushate su `main`), lancia
lo script **da un tuo utente normale con sudo** (non da `fantamammt`, che
non ha una shell utilizzabile né privilegi sudo):

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
