#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
This is a simple sample. Not flexible enough for deployment now.

**TODO**: 
* Should run in a virtualenv to enable env/dependency management... Maybe using docker?
* Worker auto start/scale. Need an zoo-keeper like daemon.
"""

from __future__ import print_function

import os
import sys
import time
import puka
import time
import json
import yaml
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("cfg", help="worker config file")
parser.add_argument("--debug", default=True, help="debug mode")
args = parser.parse_args()

with open(args.cfg, "r") as f:
    cfg = yaml.load(f)

worker_name = cfg["name"]

worker_cfg = cfg.get("worker", None)
if worker_cfg is not None:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    modname = worker_cfg["module"]
    try:
        mod = __import__("wxxie_workers." + modname, fromlist=["*"])
    except ImportError as e:
        print("ERROR: Load worker module {} failed: {}".format(modname, e))
        sys.exit(1)
    assert hasattr(mod, "__WORKER__"), "ERROR: The worker class should be stored in `__WORKER__` variable"
    worker_cls = getattr(mod, "__WORKER__")
    _cfg = worker_cfg.get("cfg", {})
    _cfg_file = worker_cfg.get("cfg_file", None)
    _worker_cfg = {}
    if _cfg_file:
        with open(_cfg_file, "r") as f:
            _worker_cfg = yaml.load(f)
    _worker_cfg.update(_cfg)
    worker = worker_cls(_worker_cfg)
else:
    worker = object()
    def _stub_run(self, body):
        time.sleep(5) # fake to be working for 5 seconds
        return "true"
    object.run = _stub_run

if args.debug:
    uri_spec = {
        "user": "guest",
        "pass": "guest",
        "host": "localhost",
        "port": 5672,
        # "vhost": "%2f"
    }
else:
    pass # TODO
# https://pubs.vmware.com/vfabric51/topic/com.vmware.vfabric.rabbitmq.2.8/rabbit-web-docs/uri-spec.html
# uri = "amqp://{user}:{pass}@{host}:{port}/{vhost}".format(**uri_spec)
uri = "amqp://{user}:{pass}@{host}:{port}/".format(**uri_spec)
client = puka.Client(uri)

promise = client.connect()
client.wait(promise)

client.wait(client.exchange_declare(**cfg["exchange"]))
queue_name = client.wait(client.queue_declare(**cfg["queue"]))["queue"]
client.wait(client.queue_bind(queue=queue_name,
                              exchange=cfg["exchange"]["exchange"],
                              routing_key=cfg.get("routing_key", "")))

ans_ex_name = cfg["answer_exchange"]["exchange"]
ans_rkey = cfg.get("answer_routing_key", "")
client.wait(client.exchange_declare(**cfg["answer_exchange"]))
answer_queue_name = client.wait(client.queue_declare(**cfg["answer_queue"]))["queue"]
client.wait(client.queue_bind(queue=answer_queue_name,
                              exchange=ans_ex_name,
                              routing_key=ans_rkey))

print("consume on queue: {}; provided results to queue: {}".format(queue_name, answer_queue_name))

receive_promise = client.basic_consume(queue=queue_name, prefetch_count=cfg["queue_limit"])
while 1:
    print("waiting...")
    receive_message = client.wait(receive_promise)
    body = json.loads(receive_message['body'])
    print("receiver {} [x] receive:".format(worker_name), receive_message)
    print("\tbody: ", body)
    start_time = round(time.time() * 1000)
    res = {
        "user_id": body["user_id"],
        "task_id": body["task_id"],
        "start_time": start_time,
    }
    try:
        answer, log = worker.run(body)
    except Exception as e:
        res["state"] = "failed"
        res["log"] = e.message
    else:
        res["state"] = "finished"
        res["answer"] = answer
        res["log"] = log
    finish_time = round(time.time() * 1000)
    res["finish_time"] = finish_time
    client.wait(client.basic_publish(exchange=ans_ex_name,
                                     routing_key=ans_rkey,
                                     body=json.dumps(res)))
    client.basic_ack(receive_message)

client.wait(client.close())
