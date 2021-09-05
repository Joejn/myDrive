from os import listdir
from os.path import isfile, join, getsize, getmtime
import os
import psycopg2
import bcrypt
from core.consts import administrators_groups
from configparser import ConfigParser


class Files():
    def get_dir_content(self, path, current_directory = ""):
        current_directory_absolute = join(path, current_directory)
        dirContent = listdir(current_directory_absolute)
        dirElements = {
            "directories": [],
            "files": []
        }

        for item in dirContent:
            fullName = join(current_directory_absolute, item)
            if (isfile(fullName)):
                dirElements["files"].append(
                    {"name": item, "path": fullName.replace(path, ""), "last_modified": getmtime(
                        fullName), "file_size": getsize(fullName)}
                )
            else:
                dirElements["directories"].append(
                    {"name": item, "path": fullName.replace(path, ""), "last_modified": getmtime(
                        fullName), "file_size": getsize(fullName)}
                )

        return dirElements


class Database():
    def __init__(self):
        conf = Config()
        self.conn = psycopg2.connect(dbname=conf.get_db_name(), user=conf.get_db_user(
        ), password=conf.get_db_pass(), host=conf.get_db_host())
        self.cur = self.conn.cursor()

    def select(self, statement):
        self.cur.execute(statement)
        return self.cur.fetchall()

    def exec(self, statement):
        self.cur.execute(statement)
        self.conn.commit()

    def __exit__(self):
        self.cur.close()
        self.conn.close


class Password():
    def hash(password):
        return bcrypt.hashpw(str.encode(password), bcrypt.gensalt())


class Admin():
    def checkIfAdmin(id):
        db = Database()
        groups = db.select(
            "SELECT groups FROM public.users WHERE id=" + str(id))[0][0]
        return any(x in groups for x in administrators_groups)


class Config():
    def __init__(self):
        self.config_parser = ConfigParser()
        dirname = os.path.dirname(__file__)
        self.config_file = os.path.join(dirname, "..", "configs", "server.ini")
        self.config_parser.read(self.config_file)

    def get_data_dir(self):
        return self.config_parser.get("GENERAL", "HomeDir")

    def get_db_name(self):
        return self.config_parser.get("DATABASE", "Name")

    def get_db_user(self):
        return self.config_parser.get("DATABASE", "User")

    def get_db_pass(self):
        return self.config_parser.get("DATABASE", "Pass")

    def get_db_host(self):
        return self.config_parser.get("DATABASE", "Host")


class Path():
    def to_relative(self, path):
        if len(path) > 0:
            path = "/".join(path.split("\\"))
            if path[0] == "/":
                path = path[1:]

        return path
