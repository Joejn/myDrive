from flask_jwt_extended import jwt_required
from flask_restx import Namespace
from flask_restx.resource import Resource

api = Namespace("client_config", description="client configs related operations")

cpu_usage_history = []
cpu_freq_history = []
memory_usage_history = []

@api.route("/get_client_config")
class Usage(Resource):
    @api.doc("get the client config")
    @jwt_required()
    def get(self):
        print("Hallo")
