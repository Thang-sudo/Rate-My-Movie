from flask import Flask, render_template, request, redirect, session, url_for, g
from glob import glob
import os.path
import hashlib
import json
import requests
from database import CheckCredentials, AddUser, AddToDb, getMoviefromDb, AddRatedMovieToDb, removeMoviefromDb, getRatedMoviefromDB

app = Flask(__name__)

#all the data on session are encrypted, need a secret_key to decrypt it
app.secret_key = os.urandom(24)
@app.before_request
def before_request():
    g.user = None
    if 'user' in session:
        g.user = session['user']

@app.route('/', methods=['GET', 'POST'])
def main():
    if not g.user:
        return render_template('login.html')
    else:
        return redirect(url_for('searchMovie'))

@app.route('/login', methods=['GET','POST'])
def login():
    if g.user:
        return main()

    if request.method == 'POST':
        s = request.form.to_dict()['login_info']
        json_acceptable_string = s.replace("'", "\"")
        d = json.loads(json_acceptable_string)

        h = hashlib.md5(d['password'].encode())
        hashed_password = h.hexdigest()

        CheckResult = CheckCredentials(d['username'], hashed_password)

        if(CheckResult == False):
            return "False"

        session['user'] = d['username']

        if(CheckResult == True):
            return "True"
    return render_template('login.html')


@app.route('/createUser', methods = ['GET', 'POST'])
def createUser():
    if request.method == 'POST':
        s = request.form.to_dict()['json_string']
        json_acceptable_string = s.replace("'", "\"")
        d = json.loads(json_acceptable_string)

        h = hashlib.md5(d['password'].encode())
        hashed_password = h.hexdigest()

        if(AddUser(d['username'], hashed_password) == True):
            session['user'] = d['username']
            return ("True")
        else:
            return ("False")

    return render_template('login.html')

@app.route('/searchMovie', methods = ['GET', 'POST'])
def searchMovie():
    if request.method == 'POST':
        s = request.form.to_dict()['json_string']
        json_acceptable_string = s.replace("'", "\"")
        d = json.loads(s)

        url = 'http://www.omdbapi.com/?s='
        apiKey = '&apikey=46a3b46a'
        results = requests.get(url + d['search'] + apiKey)

        return results.text

    return render_template('searchMovie.html')

@app.route('/movieInfo', methods =['GET', 'POST'])
def movieInfo():
    if request.method == 'POST':
        s = request.form.to_dict()['json_string']
        json_acceptable_string = s.replace("'", "\"")
        d = json.loads(s)

        url = 'http://www.omdbapi.com/?i='
        apiKey = '&apikey=46a3b46a'
        result = requests.get(url + d['id'] + apiKey)

        return result.text
    return render_template('movie.html')


@app.route('/AddMovie', methods = ['GET', 'POST'])
def AddMovie():
    if request.method == 'POST':
        s = request.form.to_dict()['json_string']
        json_acceptable_string = s.replace("'", "\"")
        d = json.loads(s)

        if(AddToDb(g.user, d['movieName'], d['year'], d['id'], d['poster'])):
            return "True"
        return "False"
    return render_template('searchMovie.html')

@app.route('/AddedMovie', methods = ['GET','POST'])
def AddedMovie():
    if request.method == 'POST':
        return getMoviefromDb(g.user)
    return render_template('searchMovie.html')

@app.route('/rateMovie', methods = ['GET', 'POST'])
def rateMovie():
    if request.method == 'POST':
        s = request.form.to_dict()['json_string']
        json_acceptable_string = s.replace("'", "\"")
        d = json.loads(s)

        if(AddRatedMovieToDb(g.user, d['title'], d['year'], d['id'], d['poster'], d['rating'])):
            return "True"
        return "False"
    return render_template('searchMovie.html')

@app.route('/removeMovie', methods = ['GET', 'POST'])
def removeMovie():
    if request.method == 'POST':
        s = request.form.to_dict()['json_string']
        json_acceptable_string = s.replace("'", "\"")
        d = json.loads(s)
        if(removeMoviefromDb(g.user, d['movie']) == True):
            return "True"
        return "False"
    return render_template("searchMovie.html")

@app.route('/ratedMovie', methods = ['GET', 'POST'])
def ratedMovie():
    if request.method == 'POST':
        return getRatedMoviefromDB(g.user)
    return render_template('searchMovie.html')


@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
