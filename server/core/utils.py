import base64
from collections import namedtuple
import io
import json
from os import listdir
from os.path import isfile, join, getsize, getmtime
import os
from traceback import print_tb
from xmlrpc.client import boolean
import zipfile
import psycopg2
import bcrypt
from core.consts import administrators_groups
from configparser import ConfigParser
from flask_jwt_extended import create_access_token, create_refresh_token
import psycopg2

from core.consts import DATA_PATH, USER_HISTORY_FILE
import magic
import base64


class Files():
    def get_dir_content(self, path, current_directory=""):
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

    @staticmethod
    def download_single_file(elements, basepath, file_path):
        element = elements[0]
        relative_path = Path().to_relative(file_path)
        if (relative_path == ".."):
            return ""
        absolute_path = os.path.join(
            basepath, relative_path)

        with open(absolute_path, "rb") as f:
            bin_data = f.read()
            mime_type = magic.from_buffer(bin_data, mime=True)

        base64_data = (base64.b64encode(bin_data)).decode("utf-8")
        data = {
            "mimeType": mime_type,
            "title": os.path.basename(absolute_path),
            "body": base64_data
        }

        return data

    @staticmethod
    def download_multiple_files(elements, basepath, current_dir):
        empty_dirs = []
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for element in elements:
                relative_path = Path().to_relative(element.get("path"))
                if (relative_path == ".."):
                    continue
                absolute_path = os.path.join(
                    basepath, relative_path)

                if element.get("type") == "file":
                    zip_file.write(
                        absolute_path, os.path.basename(absolute_path))
                else:
                    if len(os.listdir(absolute_path)) == 0:
                        empty_dirs.append(absolute_path)

                    for dirname, subdirs, files in os.walk(absolute_path):
                        empty_dirs.extend([os.path.join(
                            dirname, dir) for dir in subdirs if os.listdir(join(dirname, dir)) == []])

                        for filename in files:
                            absname = os.path.abspath(
                                os.path.join(dirname, filename))
                            archname = absname[len(os.path.join(
                                basepath, current_dir)) + 0:]
                            zip_file.write(absname, archname)

                        for dir in empty_dirs:
                            path = os.path.join(dir, "")[len(
                                os.path.join(basepath, current_dir)) + 0:]
                            zif = zipfile.ZipInfo(path)
                            zip_file.writestr(zif, "")

        buffer.seek(0)

        bin_data = ""
        with buffer as f:
            bin_data = f.read()

        base64_data = (base64.b64encode(bin_data)).decode("utf-8")
        data = {
            "mimeType": "application/zip",
            "title": "myDrive.zip",
            "body": base64_data
        }

        return data

    @staticmethod
    def get_user_history(username: str) -> dict:
        history = {}
        user_history_path = os.path.join(
            DATA_PATH, username, USER_HISTORY_FILE)

        if os.path.isfile(user_history_path):
            with open(user_history_path, "r") as f:
                content = f.read()
                if content != "":
                    history = json.loads(content)

        return history

    @staticmethod
    def delete_enties_from_user_history(file_name: str, user_history: dict):
        current_user_history = user_history.copy()

        if file_name in current_user_history:
            del current_user_history[file_name]

        if len(current_user_history) >= 100:
            counter = 0
            keys_to_delete = []
            for key in current_user_history:
                if counter >= 100:
                    keys_to_delete.append(key)
                counter += 1

            for key in keys_to_delete:
                del current_user_history[key]

        return current_user_history

    @staticmethod
    def add_entry_to_user_history(username: str, filename: str, path: str):
        current_history_content = Files.get_user_history(username)

        current_history_content = Files.delete_enties_from_user_history(
            filename, current_history_content)

        user_history_path = os.path.join(
            DATA_PATH, username, USER_HISTORY_FILE)

        user_history_content = {
            filename: {
                "path": path,
                "deleted": "false"
            }
        }

        history_file_content = {
            **user_history_content, **current_history_content}
        my_namedtuple = namedtuple("content", "filename")
        file_content_namedtuple = my_namedtuple(history_file_content)

        with open(user_history_path, "w") as f:
            f.write(str(file_content_namedtuple.filename).replace("'", '"'))


class Database():
    def __init__(self):
        conf = Config()
        self.conn = psycopg2.connect(dbname=conf.get_db_name(), user=conf.get_db_user(
        ), password=conf.get_db_pass(), host=conf.get_db_host())

        self.conn.set_session(autocommit=True)
        self.cur = self.conn.cursor()

    # @staticmethod

    def select(self, statement, vars={}):
        self.cur.execute(statement, vars)
        return self.cur.fetchall()

    def exec(self, statement, vars={}):
        self.cur.execute(statement, vars)
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
        statement = "SELECT groups FROM public.users WHERE id=%(id)s;"
        groups = db.select(statement, {"id": id})[0][0]
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

    def get_user_history_max_entries_count(self):
        return self.config_parser.get("GENERAL", "MaxUserHistoryEntriesCount")


class Path():
    @staticmethod
    def to_relative(path):
        if len(path) > 0:
            path = "/".join(path.split("\\"))
            if path[0] == "/":
                path = path[1:]

        return path


class Auth():
    @staticmethod
    def generate_login_success_response(
            username: str, additional_claims: dict) -> dict:
        access_token = create_access_token(
            identity=username, additional_claims=additional_claims)
        refresh_token = create_refresh_token(
            identity=username, additional_claims=additional_claims)

        return {
            "login": True,
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    @staticmethod
    def generate_login_faild_response() -> dict:
        return {
            "login": False,
            "access_token": "",
            "refresh_token": ""
        }
