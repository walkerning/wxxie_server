FROM wxxie/node_mysql:ubuntu

ENV HOME /app

RUN mkdir -p /app
COPY workers/rabbitcookie_entry.sh /rabbitcookie_entry.sh

RUN npm install -g grunt

WORKDIR /app

ENTRYPOINT ["/rabbitcookie_entry.sh"]
CMD ["grunt", "dev"]
