from flask_restplus import Namespace, Resource

from CTFd.cache import cache, make_cache_key
from CTFd.models import Awards, Solves, Teams
from CTFd.utils import get_config
from CTFd.utils.dates import isoformat, unix_time_to_utc
from CTFd.utils.decorators.visibility import (
    check_account_visibility,
    check_score_visibility,
)
from CTFd.models import (
    Admins,
    Files,
    Notifications,
    Pages,
    Teams,
    Users,
    UserTokens,
    db,
    Challenges,
    Solves,
)
from sqlalchemy.sql import and_
from CTFd.utils.modes import TEAMS_MODE, generate_account_url, get_mode_as_word
from CTFd.utils.scores import get_standings
from flask import Blueprint
from CTFd.utils.msgsocket import socketio
from flask_socketio import emit

sock = Blueprint('sock',__name__)

@socketio.on('rank_socket')
def rank_socket(data):
    print('ssss')
    emit('updateMsg',
         {'name': 'a'},
         broadcast=True)
