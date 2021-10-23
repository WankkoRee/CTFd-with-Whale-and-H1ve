from flask_restplus import Namespace, Resource

from CTFd.cache import cache, make_cache_key
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
        print("getgetget=======")
        UserInfoDic = {}
        # 获得排名
        uu = get_standings()
        print(uu)
        print("getgetget=======")
        numUser = len(uu)
        for i in uu:
            UserInfoDic[i[0]] = {"name": i[2], "score": str(i[6]), "solves": [],"solveNum":0,"qqNUm":i[5]}
        print(UserInfoDic)
        print("======拿到解出的题目========")
        # 拿到解出的题目
        challengeDic={}
        # SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
        challenges = (Challenges.query.filter(
            and_(Challenges.state != "hidden", Challenges.state != "locked")
        ).all())
        for cha in challenges:
            challengeDic[cha.category] = {"num": 0, "name": [], "id": [], "value": []}
        print("====")
        ChallengeIdList = []
        ChallengeTypeList = []
        for cha in challenges:
            challengeDic[cha.category]['num'] += 1
            challengeDic[cha.category]['name'].append(cha.name)
            challengeDic[cha.category]['id'].append(cha.id)
            challengeDic[cha.category]['value'].append(cha.value)

        ChallengeTypeList = list(challengeDic.keys())
        print(ChallengeTypeList)
        print("==challengeDic===")
        print(challengeDic)
        for i in ChallengeTypeList:
            for k in challengeDic[i]['id']:
                ChallengeIdList.append(k)
        print("==ChallengeIdList===")
        print(ChallengeIdList)

        SolveInfo = {}
        solves = (Solves.query.filter().all())
        for i in solves:
            SolveInfo[i.challenge_id] = []
        for i in solves:
            SolveInfo[i.challenge_id].append(i.user_id)
        print("==SolveInfo===")
        print(SolveInfo)
        for i in ChallengeIdList:
            # print(SolveInfo[i])
            for k in UserInfoDic:
                if i in list(SolveInfo.keys()):
                    if k in SolveInfo[i]:
                        UserInfoDic[k]['solves'].append(SolveInfo[i].index(k) + 1)
                        UserInfoDic[k]['solveNum']+=1
                    else:
                        UserInfoDic[k]['solves'].append(0)
                else:
                    UserInfoDic[k]['solves'].append(0)

        print("==UserInfoDic===")
        print(UserInfoDic)
        UserIdList=list(UserInfoDic.keys())

        # 题目分类头
        chalTypelListMsg='''<th colspan="5" rowspan="1">
                            <div class="cell"></div>
                        </th>
                       '''
        chaListMsg='''<th colspan="5" rowspan="1">
                            <div class="cell"></div>
                        </th>'''
        chaValueMsg='''<th colspan="1" rowspan="1">
                            <div class="cell">
                                Rank
                            </div></th>
                        <th colspan="1" rowspan="1">
                            <div class="cell">
                                Face
                            </div></th>
                        <th colspan="1" rowspan="1">
                            <div class="cell">
                                Name
                            </div></th>
                        <th colspan="1" rowspan="1">
                            <div class="cell">
                                Score
                            </div></th>
                        <th colspan="1" rowspan="1">
                            <div class="cell">
                                Solved
                            </div></th>
                        '''
        for i in ChallengeTypeList:
            chalTypelListMsg+=f'''<th colspan="{challengeDic[i]['num']}" rowspan="1">
                            <div class="cell">
                                <span> {i} </span>
                            </div></th>'''
            # 题目列表
            for k in challengeDic[i]['name']:
                chaListMsg+=f'''<th colspan="1" rowspan="1">
                                           <div class="cell">
                                               <span> {k} </span>
                                           </div></th>'''
            # 题目分值
            for j in challengeDic[i]['value']:
                chaValueMsg+=f'''<th colspan="1" rowspan="1">
                            <div class="cell score">
                                {j}
                            </div></th>'''
            # 用户排行
            userMsg=''''''
            flag=0
            for i in UserIdList:
                flag+=1
                userMsg+=f'''<tr><td rowspan="1" colspan="1"><div class="cell">{str(flag)}</div></td>'''
                userMsg+=f'''<td rowspan="1" colspan="1"><div class="cell rank_headicon"><img src="https://q2.qlogo.cn/headimg_dl?dst_uin={UserInfoDic[i]['qqNUm']}&spec=2"></div></td>'''
                userMsg+=f'''<td rowspan="1" colspan="1"><div class="cell">{UserInfoDic[i]['name']}</div></td>'''
                userMsg+=f'''<td rowspan="1" colspan="1"><div class="cell">{UserInfoDic[i]['score']}</div></td>'''
                userMsg+=f'''<td rowspan="1" colspan="1"><div class="cell">{UserInfoDic[i]['solveNum']}</div></td>'''
                for j in UserInfoDic[i]['solves']:
                    if j==3:
                        userMsg+='''<td rowspan="1" colspan="1">
                            <div class="cell">
                                <div class="rank_logo">
                                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAZCAMAAAAGyf7hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABTVBMVEX+oX3////+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3+oX3MfmCGTjiQVT7EeVyzblP3nHm8c1eraE7biWnpk3GZW0PwmHUAAABLn8MWAAAAYXRSTlMAAA0bcN27PhAJ8vz07VWCGRae61uvOLxE3Gx37MA5MPuyw0fLSWXRHSHWe5D1jEZogCxpdsamXyX4ILOOS0Iki6D+q98T201M0P3uA7dKfTqhSEFD5wvNVD1Fkm+EGOLICpxWQgAAAAFiS0dEbiIPURcAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQfhCAoMAhkRRvoEAAABI0lEQVQoz02R11YCQQxAZwHXgtiwYAUsCGJvoLKKHbuCvWdnQbD8/6tJZgbNS+7eTXImJ0Jw+PyBBruxqVkIC0M5uyUIGK2htj/ZDiaCHVp2duGXK6V0MYe7leyhEg+lLBP1suwjrHxAVVaIIiz79byaqhwgOcjmE7urTEN+lMN16X0xjqCMxnR7WX5TivPMUSp06VUeyTGW47pbD51gmUD6qeFIejxMJtWaqan6mpDWa0amUzPGzc7NKxmHhcWl5RWA1UAmuwYs17FgI5d2Eptb+VwYIENyWzXu7Ppshj2U+2bcwaGGgiXyRjq6BY4scazx5PTM/D4Xhi7EpcErUSiWrm8AYrdC3KG4f3h0sny4KMATpiLA878Tv4ReKb29q7v/AhnveSS6NVNpAAAAAElFTkSuQmCC" alt=""></div></div></td>'''
                    if j==2:
                        userMsg+='''<td rowspan="1" colspan="1">
                        <div class="cell">
                            <div class="rank_logo">
                                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAZCAMAAAAGyf7hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABUFBMVEXP3+b////P3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+bP3+aksbd5gohpcHaQmqHJ2eC9zNOXoqhxeX+ruL6BipCeqbCxv8WJkpkAAACC4qKDAAAAYXRSTlMAAA0bcN27PhAJ8vz07VWCGRae61uvOLxE3Gx37MA5MPuyw0fLSWXRHSHWe5D1jEZogCxpdsamXyX4ILOOS0Iki6D+q98T201M0P3uA7dKfTqhSEFD5wvNVD1Fkm+EGOLICpxWQgAAAAFiS0dEb1UIYYEAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQfhCAoMAhkRRvoEAAABI0lEQVQoz03R11oCMRAF4CzgWhAbFqyABUXsDVRWsGNX7N0DWYqi73/ppKFzk5N/k9nkC2OyPF5fg93Y1MyYRaXMbvGDqjXQ9oftMOXv0NjZRbNCkXO3BAS7FfaQlbkoVyzuldgnsAJUeFVgSGK/7vepcEDgoLbSF6+JcchLOKzsu8h/VBohDEdEKnC1DojKnqPy79WybjMmcZxSTR6J00ExITFGya3j5JS6Zny6fk0k9DVDM/FZY3PzCwqjWFxaXlkF1nzJ1DokbtCCzXTCiW1lsukgkBS4rTbu7HpsGfYI9027g0MdchbLGnT0FhxZ7FjHk9Mz8/mcmXTBLk28Yrn89c0tELlj7J7g4fHJScmHCwPPNOSBl39P/Bp4E8P7h3r3X20PeVwQpGqRAAAAAElFTkSuQmCC" alt=""></div></div></td>'''
                    if j==1:
                        userMsg+='''<td rowspan="1" colspan="1"><div class="cell"><div class="rank_logo"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAhCAMAAAAf6yCsAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABblBMVEX/xgD/////xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgD/xgDlsQC7jwCTbwC0iQDRoQCkfQDKmwDyvAAAAABHZ3G3AAAAcHRSTlMAAGLYwj+DnqLWvVt5KCnXZPTLOp9hCsMG+qsd/tKgUC/iLt9LG8+qC5xgM+61FRFJE28mNa3l8EF2uKdqVhY3LE1cU0cysRRSda7T8WYlGTmVwc38D1Q4hf0DlniPGtXmiYeAfHDcbXFMMOdpvPLpT4MXZgAAAAFiS0dEeaHc1NAAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQfhCAoMAhkRRvoEAAABWUlEQVQoz23TZ1vCMBAA4FSBqohStzhwg+LGDRZFRNwDJyqKuHGc1vXzbdNrmkLvS+/ufZpe05QQLsrKHU7BDNZ3iRWVoEaVKLqLrBq48Fishieo5c0r0d7Hp/JFk7p6Zg208f2jKGgAjWhNeqkonDWjtbTq9vtnmg+trd0YwrQOtE4oNfBT6wI766bWY2u9+pqinfXp1m8zy4D1HSwWQAvarOkw9myw1IbYXoeGrTYyyvZ6bDzIxqHfV5hgNgnhKd6EaYnZDMySOff8gtaPRBflGMAS2rK2RfGVhLyajITWUql1td5A28SltrZ3ZIJTwS61EPek+J6R7VM74IykjezwSLAeseMTMz9VzWeWZ3iqaEgZEuZuOycJrrogl1yVJeTKrK6JJ3eTv72714qkOpifth8e867cE575rNZ51rKCmkSt/4oXIE2TF4DX4n8s8Oak18x7IYj2D13n8ccXTM/LAAAAAElFTkSuQmCC" alt="">
                            </div>
                        </div>
                        </td>'''
                    if j==0:
                        userMsg+='''<td rowspan="1" colspan="1"><div class="cell"><!----></div></td>'''
                    if j!=0 and j!=1 and j!=2 and j!=3:
                        userMsg+='''<td rowspan="1" colspan="1"><div class="cell"><div class="rank_logo"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAMAAAAiV0Z6AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAq1BMVEXGrGL////GrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGLGrGIAAADiRbx9AAAAN3RSTlMAAGdqKVx9gkcM/UPA734R3sjch15VWHSp3cX+xvj6wgPtk1k+O0xyt851P/e2SeAfPD01EpiXEAgYbAAAAAFiS0dEOKAHpdYAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQfhBQUKARTgpH0vAAAAhElEQVQoz2NgYmZgYGBhZWNn5uAEshgYQYDBnIuBm8ccDHj5oKL8DAKCDOZwICQsIiomLsHLICnFIG2ODhgkZRhk0QXlhpgo0BfyCuaKSsoqqmrqGkiimpxa4MACAm0ZkJCOrh6DpD4DEjAwNDI2AYakpCQDCoCEL31FgU7GImpqhkUUAFFcNRWazLlNAAAAAElFTkSuQmCC" alt=""></div></div></td>'''
                userMsg+='''</tr>'''
        return { 'chalTypelListMsg':chalTypelListMsg,'chaListMsg':chaListMsg,'chaValueMsg':chaValueMsg,'userMsg':userMsg}
