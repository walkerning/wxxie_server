# -*- coding: utf-8 -*-
from __future__ import print_function

import os
import sys
import copy

import cv2
import numpy as np

here = os.path.dirname(os.path.abspath(__file__))

class SingleNet(object):
    default_cfg = {
        "caffe_path": None,
        "deploy": os.path.join(here, "resnet18_deploy.prototxt"),
        "model": os.path.join(here, "resnet18_finetune_xiebiao_duours_0502_iter_6000.caffemodel"),
        "gpu": None,

        "type": "tag",
        "thres": 0.5
    }
    def __init__(self, cfg):
        self.cfg = copy.deepcopy(self.default_cfg)
        self.cfg.update(cfg)
        self.init()
        
    def init(self):
        if self.cfg["caffe_path"]:
            sys.path.insert(0, self.cfg["caffe_path"])
        if self.cfg["gpu"]:
            os.environ["CUDA_VISIBLE_DEVICES"] = str(self.cfg["gpu"])
        import caffe
        if self.cfg["gpu"]:
            caffe.set_mode_gpu()
            caffe.set_device(0)
        else:
            caffe.set_model_cpu()
        self.net = caffe.Net(self.cfg["deploy"], self.cfg["model"], caffe.TEST)
        self.transformer = caffe.io.Transformer({"data": self.net.blobs["data"].data.shape})
        self.transformer.set_transpose("data", (2,0,1))
        self.transformer.set_mean("data", np.array([127.5, 127.5, 127.5]))
        print("init done!")

    def inference(self, img):
        input = []
        image = self.transformer.preprocess("data", img)
        input.append(image)
        self.net.blobs["data"].data[...] = input
        self.out = self.net.forward()
        return self.out

    def test(self, imgpath=None, img=None):
        if imgpath is not None:
            img = cv2.imread(imgpath)
        self.inference(img)
        prob = self.net.blobs["prob"].data[:]
        return prob

    def imresize(self, img, h, w):
        return cv2.resize(img, (h, w))

    def imcrop(self, img, j, i, h, w):
        assert(j+h <= img.shape[0])
        assert(i+w <= img.shape[1])
        return img[j:(j+h), i:(i+w), :]
    
    def light(self, img):
        hsv = cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
        hsv[:,:,0] = hsv[:,:,0]*(0.8+ np.random.random()*0.2)
        hsv[:,:,1] = hsv[:,:,1]*(0.5+ np.random.random()*0.5)
        hsv[:,:,2] = hsv[:,:,2]*(0.6+ np.random.random()*0.4)
        img = cv2.cvtColor(hsv,cv2.COLOR_HSV2BGR)
        return img  

    def run(self, body):
        imgpath = body["imgdir"]
        imgpath = os.path.join(imgpath, self.cfg["type"] + ".png")
        return self.test_xiebiao(imgpath)

    def test_xiebiao(self, imgpath):
        thres = self.cfg["thres"]
        img = cv2.imread(imgpath)
        assert img is not None, imgpath

        crops = [[0, 0, 0.9, 0.9], [0.1, 0.1, 0.9, 0.9], [0.1, 0.1, 0.8, 0.8], [0, 0, 1, 1], [0.1, 0, 0.9, 0.9], [0, 0.1, 0.9, 0.9]]
        imgs = list()
        h1, w1, _ = img.shape
        for index, crop in enumerate(crops):
            [i, j, m, n] = crop
            img_crop = self.imcrop(img, int(i*h1), int(i*w1), int(m*h1), int(n*w1))
            img_re = self.imresize(img_crop, 224, 224)
            imgs.append(img_re)
            for index2 in range(3):
                img_l = self.light(img_re)
                imgs.append(img_l)
        score = 0.
        for im in imgs:
            prob = self.test(img=im)[0]
            score += prob[1]
        score /= len(imgs)
        result = "fake"
        if score > thres:
            result = "true"
        print("result: {}\tscore: {}".format(result, score))
        return result

__WORKER__ = SingleNet
