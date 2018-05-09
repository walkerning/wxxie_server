# -*- coding: utf-8 -*-
from __future__ import print_function

import os
import sys

import cv2
import numpy as np

from wxxie_workers import model_utils
from wxxie_workers.wxxie_models.model import Model

class MultiNet(Model):
    __name__ = "multi"

    default_cfg = {
        "models": []
    }

    def init(self):
        self.models = []
        for model_cfg in self.cfg["models"]:
            self.models.append(model_utils.get_model(model_cfg))

    def run(self, body, **kwargs):
        reses = []
        valid_reses = []
        types = []
        for model in self.models:
            _type, res, valid_res = model.run(body, return_raw=True)
            types.append(_type)
            reses.append(res)
            valid_reses.append(valid_res)
        types = sum(types, [])
        reses = sum(reses, [])
        valid_reses = sum(valid_reses, [])
        return self._get_answer_and_log(types, reses, valid_reses)
            
__MODEL__ = MultiNet
