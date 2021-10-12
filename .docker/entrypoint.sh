#!/bin/bash

# if [ ! -f ".env" ]; then
#   cp .env.example .env
# fi

npm init -y
npm install standard nodemon jest -D
npm install express mongoose 
# npm install lint-staged husky@next -D
# npm install
npm run start
