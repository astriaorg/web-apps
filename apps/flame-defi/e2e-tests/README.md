# Astria Exchange E2E Testing

## Setup

- generate an account and save your seed phrase and private key in
  `./wallet-setup/.env.e2e-tests`. must also set a Metamask password.

  ```dotenv
  SEED_PHRASE=''
  PASSWORD=
  PRIVATE_KEY=
  CI=
  ```

- setup wallet for Synpress and run tests

  ```shell
  # setup wallets for Synpress
  just setup-wallets

  # run e2e-tests
  just run-e2e-tests
  ```
