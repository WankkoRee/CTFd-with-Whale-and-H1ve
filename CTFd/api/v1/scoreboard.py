from flask_restplus import Namespace, Resource

from CTFd.models import Challenges, Solves
from CTFd.utils.decorators.visibility import (
    check_account_visibility,
    check_score_visibility,
)
from sqlalchemy.sql import and_
from CTFd.utils.scores import get_standings

scoreboard_namespace = Namespace(
    "scoreboard", description="Endpoint to retrieve scores"
)


@scoreboard_namespace.route("")
class ScoreboardList(Resource):
    @check_account_visibility
    @check_score_visibility
    def get(self):
        # 获得排名
        uu = get_standings()
        r_users = {}
        for x, i in enumerate(uu, 1):
            r_users[i.account_id] = {
                'user': i.name,
                'score': float(i.score),
                'name': i.affiliation,
                'idc': i.website,
                'qq': i.country,
                'rank': x,
                'solved': {},
            }
        # 拿到解出的题目
        # SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
        challenges = (Challenges.query.filter(
            and_(Challenges.state != "hidden", Challenges.state != "locked")
        ).all())
        r_challenges = {}
        for i in challenges:
            if i.category not in r_challenges.keys():
                r_challenges[i.category] = {}
            r_challenges[i.category][i.id] = {
                'name': i.name,
                'score': i.value,
            }
        solves = (Solves.query.filter().all())
        tmp_blood = {}
        for i in solves:
            if i.account_id not in r_users:
                continue
            if i.challenge_id not in tmp_blood.keys():
                tmp_blood[i.challenge_id] = 0
            tmp_blood[i.challenge_id] += 1
            r_users[i.account_id]['solved'][i.challenge_id] = {'order': tmp_blood[i.challenge_id]}
        return {
            'challenges': r_challenges,
            'users': r_users,
        }
