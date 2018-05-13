#!/usr/bin/env python2
# -*- coding: utf-8 -*-
# now, this script only use userpass and jwt for test

from __future__ import print_function

import os
import re
import sys
import json
import yaml
import argparse
import subprocess

sys.tracebacklimit = 0    

def must_cfg_term(name, args, cfg):
    term = getattr(args, name, None) or cfg.get(name, None)
    assert term is not None, "{name} must be set with `--{name} <{uname}>` or `config set {name}=<{uname}>`".format(name=name, uname=name.upper())
    return term

def try_read_cfg(fname):
    try:
        with open(fname, "r") as f:
            return yaml.load(f)
    except:
        return {}

def write_cfg(cfg, fname):
    with open(fname, "w") as f:
        return yaml.dump(cfg, f)

ctrl_seqs_rexp = re.compile(r"\x1b\[[\d;]+m")
def depretty(string):
    return ctrl_seqs_rexp.sub("", string)

parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers(dest="op")

subparser_cfg = subparsers.add_parser("config", help="config management")
sp_cfg_ss = subparser_cfg.add_subparsers(dest="config_op")
sp_cfg_ss_get = sp_cfg_ss.add_parser("get", help="get config items")
sp_cfg_ss_list = sp_cfg_ss.add_parser("list", help="list config items")
sp_cfg_ss_set = sp_cfg_ss.add_parser("set", help="set config items")

subparser_login = subparsers.add_parser("login", help="login")
subparser_login.add_argument("--host", default=None, help="default to the setting in config")
subparser_login.add_argument("--username", default=None, help="default to the setting in config")
subparser_login.add_argument("--password", default=None, help="default to the setting in config")

subparser_do = subparsers.add_parser("do", help="do requests to API")

args, other = parser.parse_known_args()

additional_header = "X-WX-WXXIE-AUTHTYPE:jwt X-WX-WXXIE-LOGINTYPE:userpass"

cfg_file = os.path.expanduser("~/.wxxie_test_uphttp.yaml")
cfg = try_read_cfg(cfg_file)

if args.op == "config":
    if args.config_op == "list":
        for k, v in sorted(cfg.items(), key=lambda i: i[0]):
            print("{:15} : {:15}".format(k, v))
    elif args.config_op == "get":
        for k in other:
            v = cfg.get(k, None)
            print("{:15} : {:15}".format(k, v))
    elif args.config_op == "set":
        for setting in other:
            k, v = setting.split("=", 1)
            cfg[k] = v
            print("Setting {:15} = {:15}".format(k, v))
        write_cfg(cfg, cfg_file)
elif args.op == "login":
    host = must_cfg_term("host", args, cfg)
    username = must_cfg_term("username", args, cfg)
    password = must_cfg_term("password", args, cfg)
    login_point = host + "/login"
    http_args = " ".join(other) # additional args that will be passd to httpie
    result = subprocess.check_output("http --pretty all -b POST {login_point} userName={username} password={password} {http_args} {add_header}".format(login_point=login_point, username=username, password=password,
                                                                                                                                          add_header=additional_header, http_args=http_args), shell=True)
    print(result)
    result = json.loads(depretty(result))
    assert result.get("token", None), "Do not success get the token"
    cfg["token"] = result["token"]
    write_cfg(cfg, cfg_file)
    print("\x1b[32;1mThe token is saved.\x1b[0m")
elif args.op == "do":
    assert cfg.get("token", None), "run login subcommand first"
    assert len(other), "do subcommand: url should be provided"
    maybe_verb = other[0].lower()
    if maybe_verb not in {"get", "post", "put", "delete"}:
        maybe_url = other[0]
        verb =  "get"
        s_other = 1
    else:
        assert len(other) >= 2, "do subcommand: url should be provided"
        maybe_url = other[1]
        verb = maybe_verb
        s_other = 2
    if maybe_url.startswith("http"):
        furl = maybe_url
    elif maybe_url.startswith("/"): # guess it's a relative path to /api/v1
        host = cfg.get("host", None)
        if not host:
            print("ERROR: do subcommand: bad url: {}; did you forget to `config set host=<host>` first?".format(maybe_url))
            sys.exit(1)
        else:
            furl = host + "/api/v1" + maybe_url
    else:
        print("bad url: {}".format(maybe_url))
        sys.exit(1)
    http_args = " ".join(other[s_other:])
    result = subprocess.check_output("http --print hb --auth-type jwt --pretty all --auth={token} {verb} {furl} {http_args} {add_header}".format(token=cfg["token"], furl=furl, verb=verb, add_header=additional_header, http_args=http_args), shell=True)
    print(result)
