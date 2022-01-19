import base64
from collections import namedtuple
from msilib.schema import File
import os
from os.path import join
from posixpath import basename
from traceback import print_tb

from core.utils import Database, Files, Path
from core.consts import DATA_PATH, HOME_DIR, TRASH_DIR, USER_HISTORY_FILE, ROOT, SHARES_DIR
from flask import json, request, send_file, send_from_directory
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_jwt_extended.utils import get_jwt
from flask_restx import Namespace, Resource

from shutil import rmtree

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

        file_path = join(user_storage_path, file_path)
        splitted_file_path = list(os.path.split(file_path))
        filename = splitted_file_path.pop()
        parent_dir = splitted_file_path[0]

        Files.add_entry_to_user_history(identity, filename, file_path)

        return send_from_directory(parent_dir, filename)


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
        current_dir = Path.to_relative(current_dir)

        files = request.files

        for file in files:
            f = files.get(file)
            file_path = os.path.join(user_storage_path, current_dir, file)
            f.save(file_path)

        return {
            "success": True
        }


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

        data = {}
        if len(elements) == 1:
            if elements[0].get("type") == "file":
                isOneFile = True

        if (isOneFile):
            data = Files.download_single_file(elements, home_path, elements[0].get("path"))
        else:
            data = Files.download_multiple_files(elements, home_path, current_dir)

        body = {
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

@api.route("/get_shared_folder")
class GetSharedFolder(Resource):
    @api.doc("get the shared folders")
    @jwt_required()
    def get(self):
        id = get_jwt()["id"]

        db = Database()
        statement = """
            SELECT
                shared_folder_id, name, id_owner
            FROM
                public.shared_folders
            WHERE
                id_owner = {id}
                OR shared_folders.shared_folder_id = ANY (SELECT id_shared_folder FROM public.shared_folder_users WHERE id_user = {id})""".format(id=id)
        query = db.select(statement)
        body = {"state": "success"}
        body_entries = []
        for row in query:
            shared_folder_id, name, id_owner = row

            is_owner = False
            if id_owner == id:
                is_owner = True

            body_entry = {
                "shared_folder_id": shared_folder_id,
                "name": name,
                "is_owner": is_owner
            }
            body_entries.append(body_entry)

        body["data"] = body_entries
        return body


@api.route("/create_shared_folder")
class CreateSharedFolder(Resource):
    @api.doc("create a shared folder")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]

        data = json.loads(request.data)
        dirname = data["name"]
        dir = os.path.join(ROOT, SHARES_DIR, dirname)
        if not os.path.exists(dir):
            os.makedirs(dir)

            db = Database()

            statement = "INSERT INTO public.shared_folders(name, id_owner) VALUES ('{name}', {id_owner});".format(name=dirname, id_owner=id)
            db.exec(statement)

            # statement = "SELECT shared_folder_id FROM public.shared_folders WHERE name = '{name}'".format(name=dirname)
            # query = db.select(statement)
            # shared_folder_id = query[0][0]

            # statement = "SELECT id FROM public.users WHERE username = ANY ('{username}')".format(username="{jonas, hallo}")
            # query = db.select(statement)
            # user_ids = list(map(lambda item: item[0], query))

            # statement_template = """    INSERT INTO public.shared_folder_users(
            #                                 id_user, id_shared_folder)
            #                             VALUES ({id_user}, {id_shared_folder});"""

            # for user_id in user_ids:
            #     statement = statement_template.format(id_user=user_id, id_shared_folder=shared_folder_id)
            #     db.exec(statement)

        answer = {"state": "success"}
        return json.jsonify(answer)

@api.route("/create_shared_sub_folder")
class RemoveUserToSharedFolder(Resource):
    @api.doc("create a sub folder in a share")
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()

        data = json.loads(request.data)
        dirname = data.get("shared_folder")
        sub_dir = Path.to_relative(data.get("sub_dir"))
        shared_path = os.path.join(ROOT, SHARES_DIR, dirname)

        absolute_folder_path = os.path.join(
            shared_path, sub_dir)

        if not os.path.exists(absolute_folder_path):
            os.makedirs(absolute_folder_path)

        return True

@api.route("/upload_files_to_shared_folder")
class UploadFilesToSharedFolder(Resource):
    @api.doc("upload files to a shared folder")
    @jwt_required()
    def post(self):

        identity = get_jwt_identity()
        headers = request.headers

        dirname = headers.get("shared_folder")
        sub_dir = Path.to_relative(headers.get("sub_dir"))
        shared_path = os.path.join(ROOT, SHARES_DIR, dirname)


        if len(sub_dir) > 0:
            current_dir = sub_dir[1:]
        files = request.files
        for file in files:
            f = files.get(file)
            file_path = os.path.join(shared_path, sub_dir, file)
            f.save(file_path)

@api.route("/get_shared_file")
class GetSharedFile(Resource):
    @api.doc("get a file from a shared folder")
    @jwt_required()
    def get(self):
        file_path = Path().to_relative(str(request.args.get("file")))
        identity = get_jwt_identity()

        args = request.args
        dirname = args.get("shared_folder")
        file = args.get("file")
        shared_path = os.path.join(ROOT, SHARES_DIR, dirname)

        current_file = shared_path

        if not file_path == "/":
            current_file = join(shared_path, file_path)

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

@api.route("/download_shared_files")
class RemoveUserToSharedFolder(Resource):
    @api.doc("download files from share")
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()
        request_data = json.loads(request.data)
        current_dir = Path().to_relative(request_data.get("currentDir"))
        elements = request_data.get("data")
        shared_folder = request_data.get("shared_folder")
        shared_path = os.path.join(ROOT, SHARES_DIR, shared_folder)
        isOneFile = False
        data = {}

        if len(elements) == 1:
            if elements[0].get("type") == "file":
                isOneFile = True

        if (isOneFile):
            data = Files.download_single_file(elements, shared_path, elements[0].get("path"))
        else:
            data = Files.download_multiple_files(elements, shared_path, current_dir)

        body = {
            "data": data
        }
        return body

@api.route("/get_shared_folder_content")
class GetSharedFolder(Resource):
    @api.doc("get the shared folder content")
    @jwt_required()
    def get(self):
        args = request.args

        identity = get_jwt_identity()
        dirname = args.get("shared_folder")
        current_directory = args.get("sub_dir")
        shared_path = os.path.join(ROOT, SHARES_DIR, dirname)

        if len(current_directory) > 0:
            if current_directory[0] == "/" or current_directory[0] == "\\":
                current_directory = current_directory[1:]

        return Files().get_dir_content(shared_path, current_directory)

@api.route("/rename_shared_folder")
class RenameSharedFolder(Resource):
    @api.doc("rename a shared folder")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]
        data = json.loads(request.data)
        old_folder_name, new_folder_name = data.values()

        db = Database()
        statement = "SELECT name FROM shared_folders WHERE id_owner = {id_owner}".format(id_owner=id)
        query = db.select(statement)
        result_check_user_is_owner = []
        if len(query) > 0:
            result_check_user_is_owner = query[0]

        if old_folder_name in result_check_user_is_owner:
            statement = "SELECT name FROM shared_folders WHERE name = '{name}'".format(name=new_folder_name)

            query = db.select(statement)

            result_check_if_folder_exists = []
            if len(query) > 0:
                return { "status": "faild", "description": "folder already exists"}

            statement = "UPDATE public.shared_folders SET name='{new_folder_name}' WHERE name='{old_folder_name}';".format(new_folder_name=new_folder_name, old_folder_name=old_folder_name)
            db.exec(statement)

            old_path_abs = os.path.join(ROOT, SHARES_DIR, old_folder_name)
            new_path_abs = os.path.join(ROOT, SHARES_DIR, new_folder_name)
            os.rename(old_path_abs, new_path_abs)

            return { "status": "success" }
        return { "status": "faild", "description": "user is not owner of the share"}
        
@api.route("/set_user_access")
class SetUserAccess(Resource):
    @api.doc("set the users, which have access to the shared folder")
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()
        folder_name, users = json.loads(request.data).values()

        db = Database()
        statement = "SELECT shared_folder_id FROM shared_folders WHERE name = '{folder_name}'".format(folder_name=folder_name)
        query = db.select(statement)
        shared_folder_id = ""
        if len(query) > 0:
            shared_folder_id = query[0][0]
        else: 
            return { "status": "faild", "description": "folder does not exist"}

        statement = "DELETE FROM public.shared_folder_users WHERE id_shared_folder = {shared_folder_id}".format(shared_folder_id = shared_folder_id)
        db.exec(statement)

        for user in users:
            id, name = user.values()
            statement = "INSERT INTO public.shared_folder_users( id_user, id_shared_folder ) VALUES ({id_user}, {shared_folder_id});".format(id_user = id, shared_folder_id = shared_folder_id)
            db.exec(statement)

        return { "status": "success" }

@api.route("/get_users_with_access_to_shared_folder")
class GetUsersWithAccessToSharedFolder(Resource):
    @api.doc("get the users with access to the shared folder")
    @jwt_required()
    def get(self):
        identity = get_jwt_identity()
        args = request.args
        shared_folder = args.get("shared_folder")
        db = Database()
        statement = "SELECT id_user, username FROM public.v_shared_folders_with_users WHERE name = '{shared_folder}'".format(shared_folder = shared_folder)
        query = db.select(statement)
        users = []
        if len(query) > 0:
            users = query

        data = []
        for user in users:
            id, name = user
            data.append({
                "id": id,
                "name": name
            })
        return { "status": "success", "data": data}

@api.route("/delete_shared_folder")
class RenameSharedFolder(Resource):
    @api.doc("rename a shared folder")
    @jwt_required()
    def post(self):
        data = json.loads(request.data)
        shared_folder = Path().to_relative(data.get("shared_folder"))

        sub_folder = Path().to_relative(data.get("sub_dir"))
        path = os.path.join(ROOT, SHARES_DIR, shared_folder, sub_folder)

        if os.path.isfile(path):
            os.remove(path)
        else:
            rmtree(path)

        return { "status": "success" }

@api.route("/rename_share_sub_folder")
class RenameShareSubFolder(Resource):
    @api.doc("rename a object from a shared folder")
    @jwt_required()
    def post(self):
        shared_folder, oldPath, newPath = json.loads(request.data).values()
        old_path_abs = os.path.join(
            ROOT, SHARES_DIR, shared_folder, Path().to_relative(oldPath))
        new_path_abs = os.path.join(
            ROOT, SHARES_DIR, shared_folder, Path().to_relative(newPath))
        os.rename(old_path_abs, new_path_abs)
        return True
