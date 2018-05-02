from __future__ import print_function

import argparse
import sys
import time
import puka
import time
import json
import yaml

parser = argparse.ArgumentParser()
parser.add_argument("cfg", help="worker config file")
parser.add_argument("--debug", default=True, help="debug mode")
args = parser.parse_args()

with open(args.cfg, "r") as f:
    cfg = yaml.load(f)

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
    print("receiver {} [x] receive:".format(sys.argv[1]), receive_message)
    print("\tbody: ", body)
    start_time = int(time.time())
    time.sleep(5) # fake to be working now
    finish_time = int(time.time())
    client.wait(client.basic_publish(exchange=ans_ex_name,
                                     routing_key=ans_rkey,
                                     body=json.dumps({
                                         "user_id": body["user_id"],
                                         "task_id": body["task_id"],
                                         "answer": "true",
                                         "state": "finished", # can be failed/finished
                                         "start_time": start_time,
                                         "finish_time": finish_time,
                                         "log": ""
                                     })))
    client.basic_ack(receive_message)

client.wait(client.close())
