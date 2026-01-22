# This file makes the config directory a Python package
# It allows us to import from config folder

from .database import db


__all__ = ['db']

