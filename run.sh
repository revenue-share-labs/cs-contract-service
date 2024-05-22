#!/bin/bash
export CORS_ENABLED=true
export CORS_METHODS=POST,GET,PUT
export CORS_ORIGINS=*
export SWAGGER_ENABLED=false
export HTTP_PORT=3032
export DATABASE_URL=mongodb://localhost:27017/xla-rsc
export INTERNAL_JWT_SECRET=testtesttest
./prisma/setup.sh
npm run start:prod