# -*- coding: utf-8 -*-
from __future__ import print_function

import os
import sys
import copy

import cv2
import numpy as np

here = os.path.dirname(os.path.abspath(__file__))

log_name_dict = {
    "tag": "球鞋鞋标",
    "stitch": "中底走线",
    "pad": "球鞋鞋垫",
    "side_tag": "鞋盒侧标"
}

def get_crop_sizes(h, w, crop_cfg):
    assert crop_cfg["type"] in {"ratio_list", "num"}
    crop_sizes = []
    if crop_cfg["type"] == "ratio_list":
        for sz in crop_cfg["ratio_list"]:
            i, j, m, n = sz
            crop_sizes.append([int(i*h), int(i*w), int(m*h), int(n*w)])
    elif crop_cfg["type"] == "num": # preserve the short edge
        num = crop_cfg["num"]
        if w > h:
            short_edge = h
            long_edge = w
        else:
            short_edge = w
            long_edge = h
        every = (long_edge - short_edge) / (num - 1)
        for start in np.array(range(num)) * every:
            crop_size = ([0, start] if w > h else [start, 0]) + [short_edge, short_edge]
            crop_sizes.append(crop_size)
    return crop_sizes


class SingleNet(object):
    default_cfg = {
        "caffe_path": None,
        "deploy": os.path.join(here, "resnet18_deploy.prototxt"),
        "model": os.path.join(here, "resnet18_finetune_xiebiao_duours_0502_iter_6000.caffemodel"),
        "gpu": None,

        "type": ["tag"],
        "num_light": 3,
        "crop_cfg": {
            "type": "num",
            "num": 10
        }, # type can be one of `num`, `ratio_list`
        "thres": 0.5,
        "not_valid_thres": 0.5,
        "not_valid_all_thres": 0.5,
        "not_valid_num_thres": 2 # when there are number of crops above this threshold whose `max_ind` is not consistent with it type class, mark it as invalid
    }
    def __init__(self, cfg):
        self.cfg = copy.deepcopy(self.default_cfg)
        self.cfg.update(cfg)
        print("Worker configuration:")
        print("\n".join(["{:16}: {:10}".format(k, v) for k, v in sorted(self.cfg.iteritems(), key=lambda x: x[0])]))
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

    def _get_log(self, tp_lst, res, valid_res):
        log_lst = []
        for n, r, vr in zip(tp_lst, res, valid_res):
            if isinstance(n, (tuple, list)):
                n = n[0]
            if vr:
                log_lst.append("{:10}: {} {}".format(n, "might be valid", "true" if r else "fake"))
            else:
                log_lst.append("{:10}: {}".format(n, "not valid picture!"))
        return "\n".join(log_lst)

    def run(self, body):
        imgdir = body["imgdir"]
        res = []
        valid_res = []
        for tp in self.cfg["type"]:
            # TODO: need a second level model?
            if isinstance(tp, (tuple, list)):
                tp, ind = tp
            else:
                ind = 0
            imgpath = os.path.join(imgdir, tp + ".png")
            an, score, valid = self.test_multicrop(imgpath, ind)
            print(tp, "true" if an else "fake", "valid" if valid else "notvalid", score)
            res.append(an)
            valid_res.append(valid)
        ans = "true" if np.all(res) else "fake"
        if not np.all(valid_res):
            ans = "not_sure"
        log = self._get_log(self.cfg["type"], res, valid_res)
        return ans, log

    def test_multicrop(self, imgpath, ind=0):
        thres = self.cfg["thres"]
        img = cv2.imread(imgpath)
        assert img is not None, os.path.basename(imgpath) + " not exists"

        imgs = list()
        h1, w1, _ = img.shape
        crops = get_crop_sizes(h1, w1, self.cfg["crop_cfg"])
        for index, crop in enumerate(crops):
            img_crop = self.imcrop(img, *crop)
            img_re = self.imresize(img_crop, 224, 224)
            imgs.append(img_re)
            for index2 in range(self.cfg["num_light"]):
                img_l = self.light(img_re)
                imgs.append(img_l)
        score_true = 0.
        score_fake = 0.
        not_valid = 0
        for im in imgs:
            prob = self.test(img=im)[0]
            score_fake += prob[ind * 2]
            score_true += prob[ind * 2 + 1]
            max_ind = np.argmax(prob) / 2
            print(prob[ind*2:ind*2+2], ind, max_ind)
            if max_ind != ind or max(prob[ind * 2], prob[ind * 2 + 1]) < self.cfg["not_valid_thres"]:
                not_valid += 1
        score_fake /= len(imgs)
        score_true /= len(imgs)
        if max(score_fake, score_true) < self.cfg["not_valid_all_thres"]:
            valid = 0
        else:
            valid = int(not_valid < self.cfg["not_valid_num_thres"])
        print("unnorm: ", score_fake, score_true)
        _norm = score_fake + score_true
        score = score_true / _norm
        result = 0 # fake
        if score > thres:
            result = 1 # true
        # print("result: {}\tscore: {}".format("true" if result else "fake", score))
        return result, score, valid

__WORKER__ = SingleNet
