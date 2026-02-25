# Urban Ideas

## A cosa serve questa app

Urban Ideas e una web app che simula una piattaforma civica: permette alle persone di accedere con token, gestire utenti, pubblicare/modificare contenuti, leggere post e inserire commenti per raccogliere idee e segnalazioni utili alla vita urbana.

Applicazione Angular sviluppata per il progetto Start2Impact in partnership con NTT DATA.
L'app usa le API pubbliche GoREST per gestire utenti, post e commenti in un contesto urbano/community.

## Demo online e repository

Netlify: [https://urban-ideas.netlify.app/](https://urban-ideas.netlify.app/)

GitHub Repository: https://github.com/AlessandraTrapasso095/urban-ideas.git
## 1) Obiettivo del progetto

L'app permette di:

1. autenticarsi tramite token GoREST;
2. gestire utenti (lista, ricerca, creazione, modifica, eliminazione);
3. consultare il dettaglio utente con post e commenti;
4. consultare tutti i post, cercarli, creare nuovi post e modificarli;
5. inserire commenti ai post;
6. lavorare con route protette da autenticazione.

## 2) Stack tecnico

| Area | Tecnologie |
|---|---|
| Framework | Angular 21 (standalone components) |
| UI | Angular Material + SCSS custom |
| HTTP | HttpClient + interceptor Bearer token |
| Routing | Angular Router con route guard |
| Reactive | RxJS |
| Test | Vitest (builder Angular) + coverage v8 |

## 3) Librerie esterne utilizzate

Dipendenze principali:

1. `@angular/material`
2. `@angular/cdk`
3. `rxjs`
4. `zone.js`

Dipendenze di sviluppo:

1. `vitest`
2. `@vitest/coverage-v8`
3. `jsdom`
4. `@angular/cli`
5. `@angular/build`
6. `typescript`

## 4) Prerequisiti

Per eseguire il progetto in locale servono:

1. Node.js LTS (consigliato >= 20)
2. npm
3. Git

## 5) Setup locale passo passo

1. Clono il repository:

```bash
git clone https://github.com/AlessandraTrapasso095/urban-ideas.git
```

2. Entro nella cartella:

```bash
cd urban-ideas
```

3. Installo le dipendenze:

```bash
npm install
```

4. Avvio il server di sviluppo:

```bash
npm start
```

5. Apro il browser su:

```text
http://localhost:4200
```

## 6) Login e token GoREST

1. Genero il token personale da [GoREST Consumer Login](https://gorest.co.in/consumer/login).
2. Apro l'app alla route `/auth`.
3. Incollo il token nel campo di login.
4. L'app salva il token in `localStorage` e lo usa come Bearer token nelle chiamate API.

Note:

1. Il token è locale al browser.
2. Le route principali sono protette da guard (`/users`, `/users/:id`, `/posts`).

## 7) Funzionalita implementate

### 7.1 Utenti (`/users`)

1. Lista utenti paginata.
2. Ricerca per `name` o `email`.
3. Selezione risultati per pagina (`10`, `20`, `50`).
4. Creazione utente (dialog).
5. Modifica utente (dialog).
6. Eliminazione utente con conferma.
7. Stato utente con pallino e tooltip.
8. Vista responsive: tabella desktop + card mobile.

### 7.2 Dettaglio utente (`/users/:id`)

1. Blocco profilo con dati principali (id, email, gender, status).
2. Elenco post dell'utente.
3. Apertura/chiusura commenti per singolo post.
4. Inserimento commento su post.

### 7.3 Post (`/posts`)

1. Feed post con stile social.
2. Ricerca per titolo.
3. Paginazione e risultati per pagina.
4. Creazione post (dialog).
5. Modifica post (dialog).
6. Eliminazione post con conferma.
7. Pulsante like locale UI.
8. Apertura pannello commenti.
9. Inserimento commento.
10. Click sul nome autore con navigazione al dettaglio utente.

### 7.4 Layout e UX

1. Header con navigazione icon-based.
2. Footer semplice.
3. Spinner di caricamento.
4. Dialog uniformi (stile condiviso).
5. Responsive desktop/tablet/mobile.

## 8) Architettura e best practice Angular

Struttura principale:

1. `src/app/core`
2. `src/app/features/auth`
3. `src/app/features/users`
4. `src/app/features/posts`

Scelte architetturali:

1. Componenti standalone.
2. Lazy loading delle pagine con `loadComponent`.
3. Separazione chiara tra componenti, servizi, modelli e utility.
4. `authGuard` per proteggere le route.
5. `authTokenInterceptor` per aggiungere Bearer token a tutte le richieste.
6. Servizio centrale `GorestApiService` per base URL e paginazione da header HTTP.
7. Utility condivise DRY per errori HTTP, paginazione e stato utente.

## 9) Comandi utili

Avvio sviluppo:

```bash
npm start
```

Build:

```bash
npm run build
```

Build in watch mode:

```bash
npm run watch
```

Test:

```bash
npm test
```

Test CI-style (senza watch) con coverage:

```bash
npm test -- --watch=false --coverage --coverage-reporters=text-summary
```

## 10) Testing e coverage

La suite include test unitari su:

1. pagine principali;
2. servizi;
3. guard;
4. interceptor;
5. utility.

Ultima esecuzione locale coverage summary:

1. Statements: `69.49%`
2. Branches: `67.23%`
3. Functions: `63.49%`
4. Lines: `75.09%`

## 11) API GoREST utilizzate

Endpoint principali:

1. `GET /users`
2. `GET /users/:id`
3. `POST /users`
4. `PUT /users/:id`
5. `DELETE /users/:id`
6. `GET /posts`
7. `POST /posts`
8. `PUT /posts/:id`
9. `GET /users/:id/posts`
10. `GET /posts/:id/comments`
11. `POST /posts/:id/comments`

Base URL:

```text
https://gorest.co.in/public/v2
```

## 12) Note su DRY e manutenibilita

Nel progetto ho applicato DRY con:

1. utility condivise per paginazione;
2. utility condivisa per label stato utente;
3. utility condivisa per messaggi errore HTTP;
4. servizio centrale API (`GorestApiService`);
5. costanti condivise per dimensioni dialog;
6. riuso del dialog post per create/edit.

## 13) Possibili evoluzioni

1. Deploy pubblico (consigliato: Vercel/Netlify/Firebase Hosting).
2. Gestione stato avanzata con NgRx (opzionale ma apprezzata in traccia).
3. Test e2e (Playwright/Cypress).
