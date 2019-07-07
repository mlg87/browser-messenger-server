# browser-messenger server
move over slack. there's a new messenging service in town. find the live version at [messenger.masoncod.es](https://messenger.masoncod.es)

this is backend support for [browser-messenger client](https://github.com/mlg87/browser-messenger-client)

## running locally
the most important piece to running the server locally is correctly setting up the `.env` file (that needs to be placed at the root). after creating the `.env` file, paste the folling and assign the appropriate values for each:
```env
JWT_SECRET=[YOUR SECRET]

DB_HOST=[YOUR PG DB HOST]
DB_USERNAME=[YOUR PG DB USERNAME]
DB_PASSWORD=[YOUR PG DB PASSWORD]
DB_DATABASE=[YOUR PG DB DATABASE]

SENTRY_DSN_URL=[YOUR SENTRY DSN FOR LOGS]
```
after you have the `.env` file set up and the dependices installed, you will need to compile the `.ts` files. if you are going to actively be making changes to the code, open two terminal windows and run `yarn watch` in one and `yarn develop` in the other. if you would just like to compile and run what you have cloned, run `yarn build && yarn start`

the databse will set up tables upon the initial connection, so you don't need to do anything there. if you would like to turn on logs for db transactions, comment in `logging: true` in the `ormConfig` in `src/index.ts`.

## general project notes
* i chose pg (specifically [elephantsql](https://www.elephantsql.com/)) and [typorm](https://github.com/typeorm/typeorm) for the database bc its easy and free to setup (elephantsql) and typeorm is something ive been interested in using more
* i initially tried to set this project up using [serverless](https://serverless.com/), however i hit an empasse when trying to establish socket connections for the chat rooms and decided to make a standard express server instead
* a different auth strategy, or just keeping a collection of logged out JWTs, is something i'd like to do next, but JWTs are relatively fast to setup so i chose that
* the project is hosted on heroku for free, so there's a good chance it's asleep
* tests definitely need to be added
