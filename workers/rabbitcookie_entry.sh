#!/bin/bash

if [ "${RABBITMQ_ERLANG_COOKIE:-}" ]; then
    cookieFile="${HOME}/.erlang.cookie"
    if [ -e "$cookieFile" ]; then
        if [ "$(cat "$cookieFile" 2>/dev/null)" != "$RABBITMQ_ERLANG_COOKIE" ]; then
            echo >&2
            echo >&2 "warning: $cookieFile contents do not match RABBITMQ_ERLANG_COOKIE"
            echo >&2
            fi
        else
        echo "$RABBITMQ_ERLANG_COOKIE" > "$cookieFile"
        fi
    chmod 600 "$cookieFile"
fi

exec "$@"
