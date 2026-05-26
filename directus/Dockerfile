FROM directus/directus:11.17.0

USER root
RUN apk add --no-cache su-exec

COPY railway-entrypoint.sh /railway-entrypoint.sh
COPY data.db.seed /seed/data.db
COPY seed-uploads /seed/uploads
RUN chmod +x /railway-entrypoint.sh

ENTRYPOINT ["/railway-entrypoint.sh"]
CMD ["node", "/directus/cli.js", "start"]
