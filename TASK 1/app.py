import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# 1. Initialize the Flask Application
app = Flask(__name__)

# 2. Configuration
# Secret key is required for secure sessions
app.config['SECRET_KEY'] = 'task1_secure_key_789'
# This line tells Python to use your existing database.db file
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 3. Initialize Extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# --- 4. DATABASE MODEL (The Schema) ---
# This defines the table structure inside your database.db
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False) # Stores hashed password

# --- 5. ROUTES (The Logic) ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Hash the password for security before saving
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Create and save the new user
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        return redirect(url_for('login'))
    
    # Note: Using your filename 'sinup.html' as seen in your screenshot
    return render_template('sinup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Find user in the database
        user = User.query.filter_by(email=email).first()
        
        # Verify if user exists and password is correct
        if user and bcrypt.check_password_hash(user.password, password):
            # Send to dashboard.html on success
            return render_template('dashbord.html', email=email)
        else:
            return "<h1>Invalid Credentials. Please go back and try again.</h1>"

    return render_template('login.html')

@app.route('/f_pass')
def f_pass():
    return render_template('f_pass.html')

@app.route('/r_pass')
def r_pass():
    return render_template('r_pass.html')

# --- 6. DATABASE INITIALIZATION & START ---
if __name__ == '__main__':
    with app.app_context():
        # This line automatically creates the tables inside database.db
        db.create_all() 
    app.run(debug=True)