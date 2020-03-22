from node:13.10-alpine
label maintainer="ikbenmarcelakkerman@hotmail.com"

workdir /usr/src/dir

copy --chown=node:node package* .
run npm install --production

copy --chown=node:node *mjs .
cmd ["node", "index.mjs"]
