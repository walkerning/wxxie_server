# -*- coding: utf-8 -*-

from __future__ import print_function

import sys
import yaml

def get_model(model_cfg):
    modname = model_cfg["module"]
    try:
        mod = __import__("wxxie_workers.wxxie_models." + modname, fromlist=["*"])
    except ImportError as e:
        print("ERROR: Load model module {} failed: {}".format(modname, e))
        sys.exit(1)
    assert hasattr(mod, "__MODEL__"), "ERROR: The model class should be stored in `__MODEL__` variable"
    model_cls = getattr(mod, "__MODEL__")
    _cfg = model_cfg.get("cfg", {})
    _cfg_file = model_cfg.get("cfg_file", None)
    _model_cfg = {}
    if _cfg_file:
        with open(_cfg_file, "r") as f:
            _model_cfg = yaml.load(f)
    _model_cfg.update(_cfg)
    model = model_cls(_model_cfg)
    return model
