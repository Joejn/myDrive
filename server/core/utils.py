import base64
import io
from os import listdir
from os.path import isfile, join, getsize, getmtime
import os
import zipfile
import psycopg2
import bcrypt
from core.consts import administrators_groups
from configparser import ConfigParser
from flask_jwt_extended import create_access_token, create_refresh_token

from core.consts import DATA_PATH, HOME_DIR
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


class Database():
    def __init__(self):
        conf = Config()
        self.conn = psycopg2.connect(dbname=conf.get_db_name(), user=conf.get_db_user(
        ), password=conf.get_db_pass(), host=conf.get_db_host())
        self.cur = self.conn.cursor()

    # @staticmethod
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
