from configparser import ConfigParser
import os

# inti configParser ##########################################################

config_parser = ConfigParser()
dirname = os.path.dirname(__file__)
config_file = os.path.join(dirname, "..", "configs", "server.ini")
config_parser.read(config_file)

# user groups ################################################################

administrators_groups = ["administrators"]

# consts #####################################################################

DATA_PATH = config_parser.get("GENERAL", "HomeDir")
ROOT = config_parser.get("GENERAL", "Root")
HOME_DIR = "home"
SHARES_DIR = "shares"
TRASH_DIR = "trash"
USER_HISTORY_FILE = "user_history.json"
