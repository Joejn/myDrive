from flask import Flask
from apis import api

from flask_jwt_extended import JWTManager

from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api.init_app(app)

jwt = JWTManager(app)

# Config app ################################################################################

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 8
app.config["JWT_SECRET_KEY"] = "passme" # Change the secret key before deployment

# start app #################################################################################

app.run(debug=True)
