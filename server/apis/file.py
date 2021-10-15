import base64
from collections import namedtuple
import io
import os
from os.path import join

from core.utils import Database, Files, Path
from core.consts import DATA_PATH, HOME_DIR, TRASH_DIR, USER_HISTORY_FILE
from flask import json, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_jwt_extended.utils import get_jwt
from flask_restx import Namespace, Resource

from shutil import rmtree
import zipfile
import magic

api = Namespace("file", description="Files related operations")


@api.route("/myFiles")
class MyFiles(Resource):
    @api.doc("my files")
    @jwt_required()
    def get(self):
        args = request.args
        identity = get_jwt_identity()
        user_storage_path = join(DATA_PATH, identity, HOME_DIR)
        current_directory = args.get("directory")
        if len(current_directory) > 0:
            if current_directory[0] == "/" or current_directory[0] == "\\":
                current_directory = current_directory[1:]

        return Files().get_dir_content(user_storage_path, current_directory)


@api.route("/get_file")
class GetFile(Resource):
    @api.param("file")
    @api.doc("get specific file")
    @jwt_required()
    def get(self):
        file_path = Path().to_relative(str(request.args.get("file")))
        identity = get_jwt_identity()
        user_storage_path = join(DATA_PATH, identity, HOME_DIR)

        current_file = user_storage_path

        if not file_path == "/":
            current_file = join(user_storage_path, file_path)

        current_file = current_file.replace("\\", "/")

        with open(current_file, "rb") as file:
            file_content = base64.b64encode(file.read()).decode("utf-8")

        file_name = current_file.split("/").pop()
        user_history_path = os.path.join(
            DATA_PATH, identity, USER_HISTORY_FILE)
        user_history_content = {
            file_name: {
                "path": file_path,
                "deleted": "false"
            }
        }

        current_history_content = {}
        history_file_content = {}

        if os.path.isfile(user_history_path):
            with open(user_history_path, "r") as f:
                content = f.read()
                if content != "":
                    current_history_content = json.loads(content)

        if file_name in current_history_content:
            del current_history_content[file_name]

        if len(current_history_content) >= 100:
            counter = 0
            keys_to_delete = []
            for key in current_history_content:
                if counter >= 100:
                    keys_to_delete.append(key)
                counter += 1

            for key in keys_to_delete:
                del current_history_content[key]

        history_file_content = {
            **user_history_content, **current_history_content}
        my_namedtuple = namedtuple("content", "filename")
        file_content_namedtuple = my_namedtuple(history_file_content)

        with open(user_history_path, "w") as f:
            f.write(str(file_content_namedtuple.filename).replace("'", '"'))

        return file_content


@api.route("/set_file_content")
class SetFileContent(Resource):

    @api.param("content")
    @api.param("file_path")
    @api.doc("set the content of a file")
    @jwt_required()
    def post(self):
        response = json.loads(request.data)
        file_path = response["filePath"]
        content = response["content"]

        identity = get_jwt_identity()
        user_storage_path = join(DATA_PATH, identity, HOME_DIR)
        file = Path().to_relative(file_path)

        current_file = user_storage_path

        if not file == "/":
            current_file = join(user_storage_path, file)

        with open(current_file, "w") as file:
            for byte in content:
                file.write(byte)


@api.route("/get_recent_files")
class GetRecentFiles(Resource):
    @api.doc("get the latest used files")
    @jwt_required()
    def get(self):
        db = Database()
        id = get_jwt()["id"]
        identity = get_jwt_identity()

        user_history_path = os.path.join(
            DATA_PATH, identity, USER_HISTORY_FILE)
        recent_files = []
        with open(user_history_path, "r") as f:
            files = json.loads(f.read())
            for file in files.values():
                path = file["path"]
                if len(path) > 0:
                    if path[0] == "/" or path[0] == "\\":
                        path = path[1:]
                recent_files.append(path)

        body = {
            "directories": [],
            "files": []
        }

        for path in recent_files:
            absolute_path = os.path.join(DATA_PATH, identity, HOME_DIR, path)
            if os.path.isfile(absolute_path):
                body["files"].append({
                    "name": os.path.basename(absolute_path),
                    "path": absolute_path,
                    "last_modified": os.path.getmtime(absolute_path),
                    "file_size": os.path.getsize(absolute_path)
                })

        return json.jsonify(body)


@api.route("/upload_files")
class UploadFiles(Resource):
    @api.doc("upload files")
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()
        user_storage_path = join(DATA_PATH, identity, HOME_DIR)
        current_dir = request.headers.get("current_dir")
        if len(current_dir) > 0:
            current_dir = current_dir[1:]
        files = request.files
        for file in files:
            f = files.get(file)
            file_path = os.path.join(user_storage_path, current_dir, file)
            f.save(file_path)


@api.route("/create_folder")
class CreateFolder(Resource):
    @api.doc("Create a new folder")
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()
        user_storage_path = join(DATA_PATH, identity, HOME_DIR)
        request_data = json.loads(request.data)
        current_dir = Path().to_relative(request_data.get("current_dir"))
        folder_name = request_data.get("folder_name")

        absolute_folder_path = os.path.join(
            user_storage_path, current_dir, folder_name)
        if not os.path.exists(absolute_folder_path):
            os.makedirs(absolute_folder_path)


@api.route("/move_to_trash")
class MoveToTrash(Resource):
    @api.doc("move a element to trash directory")
    @jwt_required()
    def post(self):
        body = json.loads(request.data)
        identity = get_jwt_identity()
        relative_path = Path().to_relative(body.get("path"))
        path = os.path.join(DATA_PATH, identity, HOME_DIR, relative_path)
        object_name = relative_path.split("/").pop()
        trash_path = os.path.join(DATA_PATH, identity, TRASH_DIR, object_name)
        
        isToDeleteFromUserHistory = False
        if os.path.isfile(path):
            recent_files = {}
            user_history_path = os.path.join(
                DATA_PATH, identity, USER_HISTORY_FILE)
            with open(user_history_path, "r") as f:
                recent_files = json.loads(f.read())
                for file in recent_files:
                    if recent_files[file].get("path") == relative_path:
                        isToDeleteFromUserHistory = True
            
            if isToDeleteFromUserHistory:
                del recent_files[relative_path]

            my_namedtuple = namedtuple("content", "filename")
            file_content_namedtuple = my_namedtuple(recent_files)

            with open(user_history_path, "w") as f:
                f.write(str(file_content_namedtuple.filename).replace("'", '"'))
        
        os.rename(path, trash_path)
        return "ok", 200


@api.route("/get_objects_from_trash")
class GetObjectsFromTrash(Resource):
    @api.doc("delete a element from trash")
    @jwt_required()
    def get(self):
        identity = get_jwt_identity()
        path = os.path.join(DATA_PATH, identity, TRASH_DIR)
        return Files().get_dir_content(path)


@api.route("/delete_object_from_trash")
class DeleteObjectFromTrash(Resource):
    @api.doc("delete a element from trash")
    @jwt_required()
    def post(self):
        body = json.loads(request.data)
        identity = get_jwt_identity()
        relative_path = Path().to_relative(body.get("path"))
        path = os.path.join(DATA_PATH, identity, TRASH_DIR, relative_path)
        if os.path.isfile(path):
            os.remove(path)
        else:
            rmtree(path)

        return "ok", 200


@api.route("/download")
class Download(Resource):
    @api.doc("download one or mulitple elements")
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()
        request_data = json.loads(request.data)
        current_dir = Path().to_relative(request_data.get("currentDir"))
        elements = request_data.get("data")
        home_path = os.path.join(DATA_PATH, identity, HOME_DIR)
        isOneFile = False

        mime_type = "application/zip"
        data = {}
        if len(elements) == 1:
            if elements[0].get("type") == "file":
                isOneFile = True

        if (isOneFile):
            element = elements[0]
            relative_path = Path().to_relative(element.get("path"))
            if (relative_path == ".."):
                return ""
            absolute_path = os.path.join(
                DATA_PATH, identity, HOME_DIR, relative_path)

            with open(absolute_path, "rb") as f:
                bin_data = f.read()
                mime_type = magic.from_buffer(bin_data, mime=True)

            base64_data = (base64.b64encode(bin_data)).decode("utf-8")
            data = {
                "title": os.path.basename(absolute_path),
                "body": base64_data
            }
        else:
            empty_dirs = []
            buffer = io.BytesIO()
            with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for element in elements:
                    relative_path = Path().to_relative(element.get("path"))
                    if (relative_path == ".."):
                        continue
                    absolute_path = os.path.join(
                        DATA_PATH, identity, HOME_DIR, relative_path)
                    if element.get("type") == "file":
                        zip_file.write(
                            absolute_path, os.path.basename(absolute_path))
                    else:
                        pass
                        if len(os.listdir(absolute_path)) == 0:
                            empty_dirs.append(absolute_path)

                        for dirname, subdirs, files in os.walk(absolute_path):
                            empty_dirs.extend([os.path.join(
                                dirname, dir) for dir in subdirs if os.listdir(join(dirname, dir)) == []])

                            for filename in files:
                                absname = os.path.abspath(
                                    os.path.join(dirname, filename))
                                archname = absname[len(os.path.join(
                                    home_path, current_dir)) + 1:]
                                zip_file.write(absname, archname)

                            for dir in empty_dirs:
                                path = os.path.join(dir, "")[len(
                                    os.path.join(home_path, current_dir)) + 1:]
                                zif = zipfile.ZipInfo(path)
                                zip_file.writestr(zif, "")

            buffer.seek(0)

            bin_data = ""
            with buffer as f:
                bin_data = f.read()

            base64_data = (base64.b64encode(bin_data)).decode("utf-8")
            data = {
                "title": "myDrive.zip",
                "body": base64_data
            }

        body = {
            "mimeType": mime_type,
            "data": data
        }
        return body


@api.route("/rename")
class Rename(Resource):
    @api.doc("rename a object")
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()
        oldPath, newPath = json.loads(request.data).values()
        old_path_abs = os.path.join(
            DATA_PATH, identity, HOME_DIR, Path().to_relative(oldPath))
        new_path_abs = os.path.join(
            DATA_PATH, identity, HOME_DIR, Path().to_relative(newPath))
        os.rename(old_path_abs, new_path_abs)
        return True
