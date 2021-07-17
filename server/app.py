from flask import Flask
from apis import api

from flask_jwt_extended import JWTManager

app = Flask(__name__)
api.init_app(app)

jwt = JWTManager(app)

# Config app ################################################################################

app.config["JWT_SECRET_KEY"] = "passme" # Change the secret key before deployment

#############################################################################################

app.run(debug=True)
