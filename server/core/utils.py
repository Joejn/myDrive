from os import listdir
from os.path import isfile, join, getsize, getmtime
import os
import psycopg2
import bcrypt
from core.consts import administrators_groups
from configparser import ConfigParser

DB_HOST = "127.0.0.1"
DB_NAME = "myDrive"
DB_USER = "admin"
DB_PASS = "passme"

conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST)
cur = conn.cursor()

class Files():
    def get_dir_content(self, user_storage_path, current_directory):
        current_directory_absolute = join(user_storage_path, current_directory)
        dirContent = listdir(current_directory_absolute)
        dirElements = {
            "directories": [],
            "files": []
        }

        for item in dirContent:
            fullName = join(current_directory_absolute, item)
            if (isfile(fullName)):
                dirElements["files"].append(
                    {"name": item, "path": fullName.replace(user_storage_path, ""), "last_modified": getmtime(fullName), "file_size": getsize(fullName)}
                )
            else:
                dirElements["directories"].append(
                    {"name": item, "path": fullName.replace(user_storage_path, ""), "last_modified": getmtime(fullName), "file_size": getsize(fullName)}
                )

        return dirElements

class Database():
    def select(statement):
        cur.execute(statement)
        return cur.fetchall()

    def exec(statement):
        cur.execute(statement)
        conn.commit()

    def __exit__():
        cur.close()
        conn.close

class Password():
    def hash( password ):
        return bcrypt.hashpw(str.encode(password) , bcrypt.gensalt())

class Admin():
    def checkIfAdmin( id ):
        db = Database
        groups = db.select("SELECT groups FROM public.users WHERE id=" + str(id))[0][0]
        return any(x in groups for x in administrators_groups)

class Config():
    def __init__(self):
        self.config_parser = ConfigParser()
        dirname = os.path.dirname(__file__)
        self.config_file = os.path.join(dirname, "..", "config.ini")
        self.config_parser.read(self.config_file)

    def get_data_dir(self):
        return self.config_parser.get("GENERAL", "HomeDir")
