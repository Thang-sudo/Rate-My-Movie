import firebase_admin
import json
from firebase_admin import credentials, db

cred = credentials.Certificate("./test-28a4f-firebase-adminsdk-1lh6q-418cc97235.json")
firebase_admin.initialize_app(cred,{
    'databaseURL' : 'https://test-28a4f.firebaseio.com'
})

root = db.reference()
users_ref = root.child('users')

def CheckCredentials(username, password):
    if (userExist(username)):
        val = users_ref.child(username).get()['password'];
        if (password == val):
            return True
        else:
            return False
    return False


def AddUser(username, password):
    if (not userExist(username)):
        users_ref.child(username).set({'password': password})
        return True
    else:
        return False

# temporary
def userExist(username):
    users = users_ref.get()
    if users == None:
        return False;
    for key, val in users.items():
        if (key == username):
            return True
    return False

def AddToDb(username, title, year, id, poster):
    #if(not movieExist(username, movie)):
    movie_ref = users_ref.child(username).child('movieLists:')
    movie_ref.child(title).update({
        'title': title,
        'year': year,
        'imdbID': id,
        'poster': poster
    })
    return True



def AddRatedMovieToDb(username, title, year, id, poster, rating):
    rated_ref = users_ref.child(username).child('ratedMovies')
    rated_ref.child(title).update({
        'title': title,
        'year': year,
        'imdbID': id,
        'poster': poster,
        'rating': rating
    })
    return True

def removeMoviefromDb(username, movie):
    movie_ref = users_ref.child(username).child('movieLists:')
    movie_ref.child(movie).delete()
    return True

def getMoviefromDb(username):
    res = []
    ListMovies = users_ref.child(username).child('movieLists:').get()
    for movie, val in ListMovies.items():
        title = val.get('title')
        id = val.get('imdbID')
        poster = val.get('poster')
        year = val.get('year')
        res.append({
            'title': title,
            'id': id,
            'poster': poster,
            'year': year
        })
    return json.dumps(res)

def getRatedMoviefromDB(username):
    rated = []
    rated_ref = users_ref.child(username).child('ratedMovies')
    ratedMovies = rated_ref.get()
    for key, val in ratedMovies.items():
        title = val.get('title')
        year = val.get('year')
        poster = val.get('poster')
        rating = val.get('rating')
        id = val.get('imdbID')
        rated.append({
            'title': title,
            'year': year,
            'poster': poster,
            'rating': rating,
            'id': id
        })
    return json.dumps(rated)
