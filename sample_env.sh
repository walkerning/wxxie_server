#!/bin/bash
## all
# export NODE_ENV=

# Dynamic served file path
# **FIXME**: TO BE DISCUSSED
export FS_PIC_BASENAME=/tmp/wxxie

# Miniprogram app id/secret
export WXXIE_APP_ID=
export WXXIE_APP_SECRET=

## dev/test: 

# wechat_code auth: 1
#     DISABLE wechat code auth method; unset/0: ENABLE wechat code auth method
export WXXIE_NOWECHAT=

## deploy
# database
export WXXIE_USER_NAME= # database username
export WXXIE_PASSWORD=  # database password
export WXXIE_DATABASE=  # database name

# jwt
export WXXIE_JWT_ISSUER=       # jwt issuer
export WXXIE_JWT_SECRET=       # jwt secret

# mq
export WXXIE_MQ_USER=          # MQ user
export WXXIE_MQ_PASSWORD=      # MQ password
