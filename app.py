from flask import Flask, request, jsonify, redirect
from pymongo import MongoClient
from bcrypt import hashpw, gensalt, checkpw
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
import base64
from werkzeug.utils import secure_filename
from flask_cors import CORS
import logging
from bson.objectid import ObjectId
from flask_swagger_ui import get_swaggerui_blueprint
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb+srv://zubairmailconf:pwd@cluster0.kzaapfa.mongodb.net/your_database_name?retryWrites=true&w=majority&appName=Cluster0"
app.config["JWT_SECRET_KEY"] = "secret"  # replace with your secret key
app.config['MAIL_SERVER'] = 'smtp.sendgrid.net'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'apikey'
app.config['MAIL_PASSWORD'] = 'SG.secret.something'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

# Enable CORS
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize pymongo client
try:
    client = MongoClient(app.config["MONGO_URI"])
    db = client.get_database("db")  # Use the default database specified in the URI
    logging.debug("Connected to MongoDB")

    # Print the list of collections
    collections = db.list_collection_names()
    logging.debug(f"Collections in the database: {collections}")

    # Initialize Flask JWT Manager
    jwt = JWTManager(app)

    # Initialize Flask-Mail
    mail = Mail(app)

    # Initialize URLSafeTimedSerializer for token generation
    s = URLSafeTimedSerializer(app.config['JWT_SECRET_KEY'])

    logging.info("Database, JWT, and Mail setup successful")
except Exception as e:
    logging.error(f"Error setting up database, JWT, or Mail: {e}")

# Swagger UI setup
SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Basura API"
    }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# Redirect base URL to Swagger UI
@app.route('/')
def index():
    return redirect(SWAGGER_URL)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/employee-id/suggest', methods=['GET'])
@jwt_required()
def suggest_employee_id():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        users = db.users
        existing_ids = [user['employee_id'] for user in users.find({}, {'employee_id': 1, '_id': 0})]
        suggested_id = max([int(eid.replace('EMP', '')) for eid in existing_ids if eid.startswith('EMP')]) + 1
        return jsonify({'suggested_employee_id': f'EMP{suggested_id:05d}'}), 200
    except Exception as e:
        logging.error(f"Error in suggest_employee_id: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/add-employee', methods=['POST'])
@jwt_required()
def add_employee():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403
        
        users = db.users

        employee_id = request.form['employee_id']

        # Check if the employee_id already exists
        existing_employee = users.find_one({'employee_id': employee_id})
        if existing_employee:
            return jsonify({'error': 'Employee ID already exists'}), 400

        name = {
            'firstname': request.form['firstname'],
            'middlename': request.form.get('middlename', ''),
            'lastname': request.form['lastname']
        }
        contact = request.form.get('contact', '')
        email = request.form['email']
        username = request.form['username']
        bank_account_no = request.form['bank_account_no']
        password = hashpw(request.form['password'].encode('utf-8'), gensalt()).decode('utf-8')
        role = request.form['role']

        # Handle ID proof attachment (optional)
        id_proof_data = None
        id_proof = request.files.get('id_proof')
        if id_proof and allowed_file(id_proof.filename):
            id_proof_filename = secure_filename(id_proof.filename)
            id_proof_data = base64.b64encode(id_proof.read()).decode('utf-8')
        elif id_proof:
            return jsonify({'error': 'Invalid ID proof file type'}), 400

        # Handle profile photo (optional)
        profile_photo_data = None
        profile_photo = request.files.get('profile_photo')
        if profile_photo and allowed_file(profile_photo.filename):
            profile_photo_filename = secure_filename(profile_photo.filename)
            profile_photo_data = base64.b64encode(profile_photo.read()).decode('utf-8')
        elif profile_photo:
            return jsonify({'error': 'Invalid profile photo file type'}), 400

        # Insert new employee data into the database
        users.insert_one({
            'employee_id': employee_id,
            'name': name,
            'contact': contact,
            'email': email,
            'username': username,
            'bank_account_no': bank_account_no,
            'password': password,
            'id_proof': id_proof_data,
            'profile_photo': profile_photo_data,
            'role': role
        })
        return jsonify({'message': 'Employee created successfully'}), 201
    except Exception as e:
        logging.error(f"Error in add_employee: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        users = db.users
        username = request.json['username']
        password = request.json['password']
        result = users.find_one({'username': username})

        if result and checkpw(password.encode('utf-8'), result['password'].encode('utf-8')):
            access_token = create_access_token(identity={'username': result['username'], 'role': result['role']})
            refresh_token = create_refresh_token(identity={'username': result['username'], 'role': result['role']})
            return jsonify({'access_token': access_token, 'refresh_token': refresh_token}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        logging.error(f"Error in login: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/token/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        return jsonify(access_token=new_access_token), 200
    except Exception as e:
        logging.error(f"Error in token refresh: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/user/details', methods=['GET'])
@jwt_required()
def user_details():
    try:
        current_user = get_jwt_identity()
        users = db.users
        user = users.find_one({'username': current_user['username']}, {'_id': 0, 'password': 0})
        if user:
            return jsonify(user), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logging.error(f"Error in user_details: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        users = db.users
        email = request.json['email']
        user = users.find_one({'email': email})
        if user:
            token = s.dumps(email, salt='email-confirm')
            link = url_for('reset_password', token=token, _external=True)
            msg = Message('Password Reset', sender='ai.zubair.khan.us@gmail.com', recipients=[email])
            msg.body = f'Your link to reset your password is {link}'
            mail.send(msg)
            return jsonify({'message': 'Password reset link sent to email'}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logging.error(f"Error in forgot_password: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        email = s.loads(token, salt='email-confirm', max_age=3600)
        new_password = request.json['new_password']
        hashed_password = hashpw(new_password.encode('utf-8'), gensalt()).decode('utf-8')
        users = db.users
        result = users.update_one({'email': email}, {'$set': {'password': hashed_password}})
        if result.matched_count:
            return jsonify({'message': 'Password updated successfully'}), 200
        else:
            return jsonify({"error": "Invalid or expired token"}), 400
    except Exception as e:
        logging.error(f"Error in reset_password: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    try:
        # Only admins should have access to this endpoint
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        # Pagination parameters
        page = int(request.args.get('page', 1))
        per_page = 100

        # Sorting options
        sort_by = request.args.get('sort_by', 'employee_id')
        sort_order = request.args.get('sort_order', 'asc')

        if sort_by not in ['employee_id', 'name.firstname', 'email']:
            return jsonify({'error': 'Invalid sort field'}), 400

        sort_order = 1 if sort_order == 'asc' else -1

        # Get employees from the database
        users = db.users
        employees = users.find({}, {'_id': 0, 'employee_id': 1, 'name': 1, 'email': 1, 'contact': 1, 'role': 1}) \
                         .sort(sort_by, sort_order) \
                         .skip((page - 1) * per_page) \
                         .limit(per_page)

        # Convert cursor to list and format names
        employee_list = []
        for employee in employees:
            employee_list.append({
                'employee_id': employee.get('employee_id'),
                'name': f"{employee['name'].get('firstname', '')} {employee['name'].get('middlename', '')} {employee['name'].get('lastname', '')}".strip(),
                'email': employee.get('email'),
                'contact': employee.get('contact'),
                'role': employee.get('role')
            })

        return jsonify(employee_list), 200
    except Exception as e:
        logging.error(f"Error in get_employees: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/employee/<employee_id>', methods=['GET'])
@jwt_required()
def view_employee(employee_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        users = db.users
        employee = users.find_one({'employee_id': employee_id}, {'_id': 0})

        if employee:
            return jsonify(employee), 200
        else:
            return jsonify({"error": "Employee not found"}), 404
    except Exception as e:
        logging.error(f"Error in view_employee: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/employee/<employee_id>', methods=['PUT'])
@jwt_required()
def edit_employee(employee_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        users = db.users
        updated_data = request.json

        # Optional: Hash the password if it's being updated
        if 'password' in updated_data:
            updated_data['password'] = hashpw(updated_data['password'].encode('utf-8'), gensalt()).decode('utf-8')

        result = users.update_one({'employee_id': employee_id}, {'$set': updated_data})

        if result.matched_count:
            return jsonify({'message': 'Employee updated successfully'}), 200
        else:
            return jsonify({"error": "Employee not found"}), 404
    except Exception as e:
        logging.error(f"Error in edit_employee: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/employee/<employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        users = db.users
        result = users.delete_one({'employee_id': employee_id})

        if result.deleted_count:
            return jsonify({'message': 'Employee deleted successfully'}), 200
        else:
            return jsonify({"error": "Employee not found"}), 404
    except Exception as e:
        logging.error(f"Error in delete_employee: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/property-id/suggest', methods=['GET'])
@jwt_required()
def suggest_property_id():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        properties = db.properties
        existing_ids = [property['property_id'] for property in properties.find({}, {'property_id': 1, '_id': 0})]
        suggested_id = max([int(pid.replace('PROP', '')) for pid in existing_ids if pid.startswith('PROP')]) + 1
        return jsonify({'suggested_property_id': f'PROP{suggested_id:05d}'}), 200
    except Exception as e:
        logging.error(f"Error in suggest_property_id: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/add-property', methods=['POST'])
@jwt_required()
def add_property():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        properties = db.properties

        property_id = request.form['property_id']

        # Check if the property_id already exists
        existing_property = properties.find_one({'property_id': property_id})
        if existing_property:
            return jsonify({'error': 'Property ID already exists'}), 400

        property_type = request.form['property_type']

        property_data = {
            'property_id': property_id,
            'property_manager_name': request.form['property_manager_name'],
            'property_manager_phone_no': request.form['property_manager_phone_no'],
            'email': request.form['email'],
            'property_type': property_type,
        }

        # Handle different property types similarly to client types
        if property_type == 'Resident Buildings':
            property_data.update({
                'owner_name': request.form.get('owner_name'),
                'owner_number': request.form.get('owner_number'),
                'property_manager_name': request.form.get('property_manager_name'),
                'property_manager_number': request.form.get('property_manager_number'),
                'email_id': request.form.get('email_id'),
                'apartment_type': request.form.get('apartment_type'),
                'housing_type': request.form.get('housing_type'),
                'borough_name': request.form.get('borough_name'),
                'street_name': request.form.get('street_name'),
                'building_number': request.form.get('building_number'),
                'chute_present': request.form.get('chute_present'),
                'number_of_floors': request.form.get('number_of_floors'),
                'number_of_basement_floors': request.form.get('number_of_basement_floors'),
                'number_of_units_per_floor': request.form.get('number_of_units_per_floor'),
                'number_of_units_total': request.form.get('number_of_units_total'),
            })
        elif property_type == 'Commercial Properties':
            property_data.update({
                'franchise_name': request.form.get('franchise_name'),
                'manager_name': request.form.get('manager_name'),
                'manager_number': request.form.get('manager_number'),
                'borough_name': request.form.get('borough_name'),
                'street_name': request.form.get('street_name'),
                'building_number': request.form.get('building_number'),
                'inside_a_mall': request.form.get('inside_a_mall'),
                'mall_name': request.form.get('mall_name'),
                'is_event': request.form.get('is_event'),
                'event_name': request.form.get('event_name'),
                'retail_or_office': request.form.get('retail_or_office'),
                'industry_type': request.form.get('industry_type'),
                'chute_present': request.form.get('chute_present'),
                'number_of_floors': request.form.get('number_of_floors'),
                'number_of_basement_floors': request.form.get('number_of_basement_floors'),
                'number_of_units_per_floor': request.form.get('number_of_units_per_floor'),
                'number_of_units_total': request.form.get('number_of_units_total'),
            })
        elif property_type == 'Municipals':
            property_data.update({
                'handling': request.form.get('handling'),
                'department': request.form.get('department'),
                'is_bid': request.form.get('is_bid'),
                'area_covered': request.form.get('area_covered'),
                'building_type': request.form.get('building_type'),
                'address': request.form.get('address'),
                'school': request.form.get('school'),
                'borough_name': request.form.get('borough_name'),
                'street_name': request.form.get('street_name'),
                'building_number': request.form.get('building_number'),
                'chute_present': request.form.get('chute_present'),
                'number_of_floors': request.form.get('number_of_floors'),
                'number_of_basement_floors': request.form.get('number_of_basement_floors'),
            })

        # Insert new property data into the database
        properties.insert_one(property_data)
        return jsonify({'message': 'Property created successfully'}), 201
    except Exception as e:
        logging.error(f"Error in add_property: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/properties', methods=['GET'])
@jwt_required()
def get_properties():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        # Pagination parameters
        page = int(request.args.get('page', 1))
        per_page = 100

        # Sorting options
        sort_by = request.args.get('sort_by', 'property_id')
        sort_order = request.args.get('sort_order', 'asc')

        if sort_by not in ['property_id', 'property_manager_name', 'email']:
            return jsonify({'error': 'Invalid sort field'}), 400

        sort_order = 1 if sort_order == 'asc' else -1

        # Get properties from the database
        properties = db.properties
        property_list = properties.find({}, {'_id': 0, 'property_id': 1, 'property_manager_name': 1, 'property_manager_phone_no': 1, 'email': 1, 'property_type': 1}) \
                                  .sort(sort_by, sort_order) \
                                  .skip((page - 1) * per_page) \
                                  .limit(per_page)

        return jsonify(list(property_list)), 200
    except Exception as e:
        logging.error(f"Error in get_properties: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/property/<property_id>', methods=['GET'])
@jwt_required()
def view_property(property_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        properties = db.properties
        property = properties.find_one({'property_id': property_id}, {'_id': 0})

        if property:
            return jsonify(property), 200
        else:
            return jsonify({"error": "Property not found"}), 404
    except Exception as e:
        logging.error(f"Error in view_property: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/property/<property_id>', methods=['PUT'])
@jwt_required()
def edit_property(property_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        properties = db.properties
        updated_data = request.json

        result = properties.update_one({'property_id': property_id}, {'$set': updated_data})

        if result.matched_count:
            return jsonify({'message': 'Property updated successfully'}), 200
        else:
            return jsonify({"error": "Property not found"}), 404
    except Exception as e:
        logging.error(f"Error in edit_property: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/property/<property_id>', methods=['DELETE'])
@jwt_required()
def delete_property(property_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        properties = db.properties
        result = properties.delete_one({'property_id': property_id})

        if result.deleted_count:
            return jsonify({'message': 'Property deleted successfully'}), 200
        else:
            return jsonify({"error": "Property not found"}), 404
    except Exception as e:
        logging.error(f"Error in delete_property: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/client-id/suggest', methods=['GET'])
@jwt_required()
def suggest_client_id():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        clients = db.clients
        existing_ids = [client['client_id'] for client in clients.find({}, {'client_id': 1, '_id': 0})]
        suggested_id = max([int(cid.replace('CLI', '')) for cid in existing_ids if cid.startswith('CLI')]) + 1
        return jsonify({'suggested_client_id': f'CLI{suggested_id:05d}'}), 200
    except Exception as e:
        logging.error(f"Error in suggest_client_id: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/add-client', methods=['POST'])
@jwt_required()
def add_client():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        clients = db.clients

        client_id = request.form['client_id']

        # Check if the client_id already exists
        existing_client = clients.find_one({'client_id': client_id})
        if existing_client:
            return jsonify({'error': 'Client ID already exists'}), 400

        client_name = request.form['client_name']
        phone = request.form['phone']
        email = request.form['email']
        properties = request.form.getlist('properties')
        username = request.form['username']
        password = hashpw(request.form['password'].encode('utf-8'), gensalt()).decode('utf-8')

        client_data = {
            'client_id': client_id,
            'client_name': client_name,
            'phone': phone,
            'email': email,
            'properties': properties,
            'username': username,
            'password': password
        }

        clients.insert_one(client_data)

        # Update properties to assign them to this client
        properties_collection = db.properties
        for property_id in properties:
            properties_collection.update_one({'property_id': property_id}, {'$set': {'assigned_to': client_id}})

        return jsonify({'message': 'Client created successfully'}), 201
    except Exception as e:
        logging.error(f"Error in add_client: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/clients', methods=['GET'])
@jwt_required()
def get_clients():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        # Pagination parameters
        page = int(request.args.get('page', 1))
        per_page = 100

        # Sorting options
        sort_by = request.args.get('sort_by', 'client_id')
        sort_order = request.args.get('sort_order', 'asc')

        if sort_by not in ['client_id', 'client_name', 'email']:
            return jsonify({'error': 'Invalid sort field'}), 400

        sort_order = 1 if sort_order == 'asc' else -1

        # Get clients from the database
        clients = db.clients
        client_list = clients.find({}, {'_id': 0, 'client_id': 1, 'client_name': 1, 'phone': 1, 'email': 1}) \
                             .sort(sort_by, sort_order) \
                             .skip((page - 1) * per_page) \
                             .limit(per_page)

        return jsonify(list(client_list)), 200
    except Exception as e:
        logging.error(f"Error in get_clients: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/client/<client_id>', methods=['GET'])
@jwt_required()
def view_client(client_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        clients = db.clients
        client = clients.find_one({'client_id': client_id}, {'_id': 0})

        if client:
            return jsonify(client), 200
        else:
            return jsonify({"error": "Client not found"}), 404
    except Exception as e:
        logging.error(f"Error in view_client: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/client/<client_id>', methods=['PUT'])
@jwt_required()
def edit_client(client_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        clients = db.clients
        updated_data = request.json

        # Optional: Hash the password if it's being updated
        if 'password' in updated_data:
            updated_data['password'] = hashpw(updated_data['password'].encode('utf-8'), gensalt()).decode('utf-8')

        result = clients.update_one({'client_id': client_id}, {'$set': updated_data})

        if result.matched_count:
            return jsonify({'message': 'Client updated successfully'}), 200
        else:
            return jsonify({"error": "Client not found"}), 404
    except Exception as e:
        logging.error(f"Error in edit_client: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/client/<client_id>', methods=['DELETE'])
@jwt_required()
def delete_client(client_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        clients = db.clients
        result = clients.delete_one({'client_id': client_id})

        if result.deleted_count:
            return jsonify({'message': 'Client deleted successfully'}), 200
        else:
            return jsonify({"error": "Client not found"}), 404
    except Exception as e:
        logging.error(f"Error in delete_client: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/unassigned-properties', methods=['GET'])
@jwt_required()
def get_unassigned_properties():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        # Get all properties from the database
        properties = db.properties
        all_property_ids = [property['property_id'] for property in properties.find({}, {'property_id': 1, '_id': 0})]

        # Get all properties assigned to any client
        clients = db.clients
        assigned_property_ids = []
        for client in clients.find({}, {'properties': 1, '_id': 0}):
            assigned_property_ids.extend(client.get('properties', []))

        # Find property IDs that are not assigned to any client
        unassigned_property_ids = [pid for pid in all_property_ids if pid not in assigned_property_ids]

        return jsonify(unassigned_property_ids), 200
    except Exception as e:
        logging.error(f"Error in get_unassigned_properties: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/garbage-attributes', methods=['GET'])
@jwt_required()
def get_garbage_attributes():
    try:
        garbage_attributes = db.garbage_attributes.find({}, {'_id': 0, 'attribute_name': 1, 'color': 1})
        return jsonify(list(garbage_attributes)), 200
    except Exception as e:
        logging.error(f"Error in get_garbage_attributes: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/garbage-attributes', methods=['POST'])
@jwt_required()
def add_garbage_attribute():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        attribute_name = request.json['attribute_name']
        color = request.json['color']

        # Check if the attribute already exists
        existing_attribute = db.garbage_attributes.find_one({'attribute_name': attribute_name})
        if existing_attribute:
            return jsonify({'error': 'Attribute already exists'}), 400

        db.garbage_attributes.insert_one({
            'attribute_name': attribute_name,
            'color': color
        })

        return jsonify({'message': 'Attribute added successfully'}), 201
    except Exception as e:
        logging.error(f"Error in add_garbage_attribute: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/garbage-attributes/<attribute_name>', methods=['PUT'])
@jwt_required()
def edit_garbage_attribute(attribute_name):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        updated_data = request.json

        result = db.garbage_attributes.update_one(
            {'attribute_name': attribute_name},
            {'$set': updated_data}
        )

        if result.matched_count:
            return jsonify({'message': 'Attribute updated successfully'}), 200
        else:
            return jsonify({"error": "Attribute not found"}), 404
    except Exception as e:
        logging.error(f"Error in edit_garbage_attribute: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/garbage-attributes/<attribute_name>', methods=['DELETE'])
@jwt_required()
def delete_garbage_attribute(attribute_name):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return jsonify({"error": "Access denied"}), 403

        result = db.garbage_attributes.delete_one({'attribute_name': attribute_name})

        if result.deleted_count:
            return jsonify({'message': 'Attribute deleted successfully'}), 200
        else:
            return jsonify({"error": "Attribute not found"}), 404
    except Exception as e:
        logging.error(f"Error in delete_garbage_attribute: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/add-entry', methods=['POST'])
@jwt_required()
def add_entry():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] not in ['admin', 'employee']:
            return jsonify({"error": "Access denied"}), 403

        property_id = request.json['property_id']
        client_id = request.json['client_id']
        client_type = request.json['client_type']
        client_name = request.json['client_name']
        borough_name = request.json['borough_name']
        street_name = request.json['street_name']
        chute_present = request.json['chute_present']
        timestamp = request.json['timestamp']
        garbage_attributes = request.json['garbage_attributes']  # Expecting a dictionary of attribute_name: weight

        # Validate that all necessary fields are provided
        if not all([property_id, client_id, client_type, client_name, borough_name, street_name, chute_present, timestamp]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Prepare entry data
        entry_data = {
            'property_id': property_id,
            'client_id': client_id,
            'client_type': client_type,
            'client_name': client_name,
            'borough_name': borough_name,
            'street_name': street_name,
            'chute_present': chute_present,
            'timestamp': timestamp,
            'garbage_attributes': garbage_attributes,
            'created_by': current_user['username']
        }

        # Insert entry into the database
        db.entries.insert_one(entry_data)

        return jsonify({'message': 'Entry added successfully'}), 201
    except Exception as e:
        logging.error(f"Error in add_entry: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/property-details/<property_id>', methods=['GET'])
@jwt_required()
def fetch_property_details(property_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] not in ['admin', 'employee']:
            return jsonify({"error": "Access denied"}), 403

        # Fetch the property details
        properties = db.properties
        property_data = properties.find_one({'property_id': property_id}, {'_id': 0})

        if not property_data:
            return jsonify({"error": "Property not found"}), 404

        # Fetch the associated client details
        clients = db.clients
        client_data = clients.find_one({'properties': property_id}, {'_id': 0, 'client_id': 1 , 'client_type': 1, 'client_name': 1})

        if not client_data:
            return jsonify({"error": "Client associated with the property not found"}), 404

        # Prepare the response
        response_data = {
            'client_id': client_data['client_id'],
            'client_type': client_data['client_type'],
            'client_name': client_data['client_name'],
            'borough_name': property_data.get('borough_name'),
            'street_name': property_data.get('street_name'),
            'chute_present': property_data.get('chute_present')
        }

        return jsonify(response_data), 200
    except Exception as e:
        logging.error(f"Error in fetch_property_details: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/profile/photo', methods=['PUT'])
@jwt_required()
def update_profile_photo():
    try:
        current_user = get_jwt_identity()
        profile_photo = request.files.get('profile_photo')
        if profile_photo and allowed_file(profile_photo.filename):
            profile_photo_filename = secure_filename(profile_photo.filename)
            profile_photo_data = base64.b64encode(profile_photo.read()).decode('utf-8')
            users = db.users
            result = users.update_one(
                {'username': current_user['username']},
                {'$set': {'profile_photo': profile_photo_data}}
            )
            if result.matched_count:
                return jsonify({'message': 'Profile photo updated successfully'}), 200
            else:
                return jsonify({"error": "User not found"}), 404
        else:
            return jsonify({'error': 'Invalid profile photo file type'}), 400
    except Exception as e:
        logging.error(f"Error in update_profile_photo: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/submissions', methods=['GET'])
@jwt_required()
def get_submissions():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] not in ['admin', 'employee']:
            return jsonify({"error": "Access denied"}), 403

        # Pagination parameters
        page = int(request.args.get('page', 1))
        per_page = 100

        # Fetch the entries made by the current employee
        entries = db.entries
        employee_entries = entries.find({'created_by': current_user['username']}) \
                                  .skip((page - 1) * per_page) \
                                  .limit(per_page)

        # Convert cursor to list
        submission_list = list(employee_entries)

        return jsonify(submission_list), 200
    except Exception as e:
        logging.error(f"Error in get_submissions: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] not in ['admin', 'employee']:
            return jsonify({"error": "Access denied"}), 403

        # Date range parameters (expected format: YYYY-MM-DD)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not start_date or not end_date:
            return jsonify({'error': 'Both start_date and end_date are required'}), 400

        # Convert dates to proper datetime format
        from datetime import datetime
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')

        # Fetch the entries within the date range for the current employee
        entries = db.entries
        employee_entries = entries.find({
            'created_by': current_user['username'],
            'timestamp': {
                '$gte': start_date_obj.isoformat(),
                '$lte': end_date_obj.isoformat()
            }
        })

        # Convert cursor to list
        analytics_data = list(employee_entries)

        return jsonify(analytics_data), 200
    except Exception as e:
        logging.error(f"Error in get_analytics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/client/<client_id>/properties', methods=['GET'])
@jwt_required()
def get_client_properties(client_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] not in ['admin', 'client']:
            return jsonify({"error": "Access denied"}), 403

        # Fetch the client details
        clients = db.clients
        client = clients.find_one({'client_id': client_id}, {'_id': 0, 'properties': 1})

        if not client:
            return jsonify({"error": "Client not found"}), 404

        # Fetch details for each property associated with the client
        properties = db.properties
        property_details = properties.find({'property_id': {'$in': client['properties']}}, {'_id': 0})

        return jsonify(list(property_details)), 200
    except Exception as e:
        logging.error(f"Error in get_client_properties: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/client/<client_id>/entries', methods=['GET'])
@jwt_required()
def get_client_entries(client_id):
    try:
        current_user = get_jwt_identity()
        if current_user['role'] not in ['admin', 'client']:
            return jsonify({"error": "Access denied"}), 403

        # Date range parameters (expected format: YYYY-MM-DD)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Property list filter
        property_list = request.args.getlist('property_ids')

        # Base query to filter by client_id
        query = {'client_id': client_id}  

        # Date range filtering
        if start_date and end_date:
            from datetime import datetime
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
            query['timestamp'] = {
                '$gte': start_date_obj.isoformat(),
                '$lte': end_date_obj.isoformat()
            }

        # Property list filtering
        if property_list:
            query['property_id'] = {'$in': property_list}

        # Fetch the entries matching the query
        entries = db.entries.find(query)

        return jsonify(list(entries)), 200
    except Exception as e:
        logging.error(f"Error in get_client_entries: {e}")
        return jsonify({'error': str(e)}), 500


def create_super_admin():
    try:
        users = db.users
        username = "superadmin"
        # Check if a superadmin already exists
        existing_superadmin = users.find_one({'username': username})
        if existing_superadmin:
            logging.info('Super Admin already exists')
            return
        
        password = hashpw("somepassword".encode('utf-8'), gensalt()).decode('utf-8')
        users.insert_one({
            'username': username,
            'password': password,
            'role': 'admin'
        })
        logging.info('Super Admin created successfully')
    except Exception as e:
        logging.error(f"Error creating super admin: {e}")

# Call this function once to create the super admin
create_super_admin()

if __name__ == '__main__':
    try:
        app.run(debug=True)
    except Exception as e:
        logging.error(f"Error running the Flask app: {e}")
