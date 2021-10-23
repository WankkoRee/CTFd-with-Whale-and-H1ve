from flask import Blueprint, render_template

from CTFd.cache import cache, make_cache_key
from CTFd.utils import config
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
from CTFd.utils.decorators.visibility import check_score_visibility
from CTFd.utils.scores import get_standings

scoreboard = Blueprint("scoreboard", __name__)


@scoreboard.route("/scoreboard")
@check_score_visibility
def listing():
    challenges = (Challenges.query.filter(
        and_(Challenges.state != "hidden", Challenges.state != "locked")
    ).all())
    numChallenge = len(challenges)
    notifications = Notifications.query.order_by(Notifications.id.desc()).all()
    return render_template(
        "scoreboard.html",
        notifications=notifications,
        data=numChallenge,
    )
