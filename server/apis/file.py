import os
from core.utils import Path
from flask import request, json
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_jwt_extended.utils import get_jwt
from flask_restx import Namespace, Resource, fields
from os import listdir
from os.path import isfile, join, getsize, getmtime
import base64

from werkzeug.utils import secure_filename
from core.utils import Database, Config, Files

api = Namespace("file", description="Files related operations")
PATH = Config().get_data_dir()

@api.route("/myFiles")
class MyFiles(Resource):
    @api.doc("my files")
    @jwt_required()
    def get(self):
        args = request.args
        identity = get_jwt_identity()
        user_storage_path = join(PATH, identity)
        current_directory = args.get("directory")
        if len(current_directory) > 0:
            if current_directory[0] == "/" or current_directory[0] == "\\":
                current_directory = current_directory[1:]

        print(current_directory)
        return Files().get_dir_content(user_storage_path, current_directory)
        
@api.route("/get_file")
class GetFile(Resource):
    @api.param("file")
    @api.doc("get specific file")
    @jwt_required()
    def get(self):
        user_id = get_jwt()["id"]

        file_path = str(request.args.get("file"))
        identity = get_jwt_identity()
        user_storage_path = join(PATH, identity)
        file = file_path.replace("\\", "/")
        if file[0] == "/":
            file = file[1:]
        
        current_file = user_storage_path

        if not file == "/":
            current_file = join(user_storage_path, file)

        current_file = current_file.replace("\\", "/")

        with open(current_file, "rb") as file:
            file_content = base64.b64encode(file.read()).decode("utf-8")

        basename = current_file.split("/").pop()
        statement = "INSERT INTO user_history (user_id, file_name, file_path) VALUES (" + str(user_id) + ", '" + str(basename) + "', '" + str(current_file) + "');"
        db = Database()
        db.exec(statement)

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
        user_storage_path = join(PATH, identity)
        file = file_path.replace("\\", "/")
        if file[0] == "/":
            file = file[1:]
        
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
        statement = """
            SELECT
                subselect.file_name, subselect.file_path
            FROM
                (SELECT distinct on (file_path) id, file_name, file_path FROM public.user_history WHERE user_id = """ + str(id) + """ LIMIT 4) as subselect
            ORDER BY subselect.id DESC
        """
        recent_files = db.select(statement)
        data = []
        for item in recent_files:
            data.append(
                {"name": item[0], "path": item[1]}
            )

        return data

@api.route("/upload_files")
class UploadFiles(Resource):
    @api.doc("upload files")
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()
        user_storage_path = join(PATH, identity)
        current_dir = request.headers.get("current_dir")
        if len(current_dir) > 0:
            current_dir = current_dir[1:]
        files = request.files
        for file in files:
            f = files.get(file)
            file_path =  os.path.join(user_storage_path, current_dir, file)
            f.save(file_path)

@api.route("/create_folder")
class CreateFolder(Resource):
    @api.doc("Create a new folder")
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()
        user_storage_path = join(PATH, identity)
        request_data =  json.loads(request.data)
        current_dir = Path().to_relative(request_data.get("current_dir"))
        folder_name = request_data.get("folder_name")

        absolute_folder_path = os.path.join(user_storage_path, current_dir, folder_name)
        print(absolute_folder_path)
        if not os.path.exists(absolute_folder_path):
            os.makedirs(absolute_folder_path)
