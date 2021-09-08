from configparser import ConfigParser
import os

# inti configParser ##########################################################

config_parser = ConfigParser()
dirname = os.path.dirname(__file__)
config_file = os.path.join(dirname, "..", "configs", "server.ini")
config_parser.read(config_file)

##############################################################################

administrators_groups = ["administrators"]

DATA_PATH = config_parser.get("GENERAL", "HomeDir")
HOME_DIR = "home"
TRASH_DIR = "trash"
