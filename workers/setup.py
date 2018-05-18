# -*- coding: utf-8 -*-
import os
from setuptools import setup, find_packages

here = os.path.dirname(os.path.abspath((__file__)))

# meta infos
NAME = "wxxie_workers"
DESCRIPTION = "workers for wxxie"
VERSION = "0.1"

AUTHOR = "foxfi"
EMAIL = "foxdoraame@gmail.com"

# package contents
MODULES = []
PACKAGES = ["wxxie_workers"]

# dependencies
INSTALL_REQUIRES = [
    "puka==0.0.7",
    "pyyaml"
]
TESTS_REQUIRES = []

# entry points
ENTRY_POINTS = """
[console_scripts]
py_worker=wxxie_workers.py_worker:main
"""

def read_long_description(filename):
    path = os.path.join(here, filename)
    if os.path.exists(path):
        return open(path).read()
    return ""

setup(
    name=NAME,
    version=VERSION,
    description=DESCRIPTION,
    long_description=read_long_description("README.md"),
    author=AUTHOR,
    author_email=EMAIL,

    py_modules=MODULES,
    packages=PACKAGES,

    entry_points=ENTRY_POINTS,
    zip_safe=True,
    install_requires=INSTALL_REQUIRES,
    tests_require=TESTS_REQUIRES
)
