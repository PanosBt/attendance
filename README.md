# University attendance app

Build:

1. `$ cp .template_env db/.env`

In `./.env`: Replace `<POSTGRES_USER>` and `<POSTGRES_PASSWORD>` with a selected username and password for the db.
Replace `<YOUR LDAP USERNAME>` and `<YOUR LDAP PASSWORD>` with your hua ldap credentials.

2. `$ docker compose build`

Run:
1. `$ docker compose up -p`

For the first time run: `docker exec -it attendance sh -c "npm run init_db"` to initialize the db with a user with the following data:
```
username: admin
password: admin
role: admin
```
