# -*- coding: utf-8 -*-

from __future__ import print_function

import copy
import numpy as np

# TODO: this should be a shared meta information
log_name_dict = {
    "tag": "球鞋鞋标",
    "stitch": "中底走线",
    "pad": "球鞋鞋垫",
    "side_tag": "鞋盒侧标",
    "tongue": "球鞋鞋舌",
    "appear": "球鞋外观"
}

class Model(object):
    def __init__(self, cfg):
        self.cfg = copy.deepcopy(self.default_cfg)
        self.cfg.update(cfg)
        print("{} configuration:".format(getattr(self, "__name__", self.__class__.__name__)))
        print("\n".join(["{:16}: {:10}".format(k, v) for k, v in sorted(self.cfg.iteritems(), key=lambda x: x[0])]))
        self.init()
              
    def _get_log(self, tp_lst, res_lst, valid_res_lst):
        log_lst = []
        for n, r, vr in zip(tp_lst, res_lst, valid_res_lst):
            if isinstance(n, (tuple, list)):
                n = n[0]
            n = log_name_dict[n]
            if vr:
                log_lst.append("{:10}: {} {}".format(n, "might be valid", "true" if r else "fake"))
            else:
                log_lst.append("{:10}: {}".format(n, "not valid picture!"))
        return "\n".join(log_lst)

    def _get_answer_and_log(self, tp_lst, res_lst, valid_res_lst):
        ans = "true" if np.all(res_lst) else "fake"
        if not np.all(valid_res_lst):
            ans = "not_sure"
        log = self._get_log(tp_lst, res_lst, valid_res_lst)
        return ans, log
