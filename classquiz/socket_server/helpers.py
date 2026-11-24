# SPDX-FileCopyrightText: 2025 Marlon W (Mawoka)
#
# SPDX-License-Identifier: MPL-2.0
import ipaddress
import json
import aiohttp
from classquiz.config import redis, settings
from classquiz.db.models import (
    PlayGame,
    QuizQuestionType,
    TextQuizAnswer,
    ABCDQuizAnswer,
    VotingQuizAnswer,
    RangeQuizAnswer,
    AnswerDataList,
)
from classquiz.socket_server.models import SubmitAnswerData
from .models import SubmitAnswerDataOrderType


async def verify_builtin_captcha(captcha_id: str | None, captcha_answer: str | None) -> bool:
    if not captcha_id or captcha_answer is None:
        return False
    key = f"captcha:{captcha_id}"
    expected = await redis.get(key)
    await redis.delete(key)
    if expected is None:
        return False
    return str(expected).strip() == str(captcha_answer).strip()


def extract_client_ip(environ: dict) -> str:
    if not isinstance(environ, dict):
        return "unknown"

    def _clean(ip_val: str | None) -> str:
        if not ip_val:
            return ""
        ip_str = ip_val.split(",")[0].strip()
        if ip_str.startswith("::ffff:"):
            ip_str = ip_str[7:]
        return ip_str

    # 1. Check WSGI-style forwarded headers
    for key in ("HTTP_X_FORWARDED_FOR", "HTTP_X_REAL_IP", "HTTP_CF_CONNECTING_IP"):
        val = _clean(environ.get(key))
        if val:
            return val

    # 2. Check ASGI scope headers & client
    scope = environ.get("asgi.scope")
    if isinstance(scope, dict):
        headers = scope.get("headers") or []
        header_map = {}
        for k, v in headers:
            if isinstance(k, bytes):
                k = k.decode("latin-1").lower()
            else:
                k = str(k).lower()
            if isinstance(v, bytes):
                v = v.decode("latin-1")
            else:
                v = str(v)
            header_map[k] = v
        for hname in ("x-forwarded-for", "x-real-ip", "cf-connecting-ip"):
            val = _clean(header_map.get(hname))
            if val:
                return val
        client = scope.get("client")
        if isinstance(client, (list, tuple)) and len(client) > 0 and client[0]:
            val = _clean(str(client[0]))
            if val:
                return val

    # 3. Fallback to REMOTE_ADDR
    val = _clean(environ.get("REMOTE_ADDR"))
    return val or "unknown"


async def resolve_ip_location(ip: str) -> dict:
    default_res = {
        "location": "Neznáma",
        "lat": None,
        "lon": None,
        "isp": None,
        "source": "unknown",
    }
    if not ip or ip == "unknown":
        return default_res

    try:
        ip_obj = ipaddress.ip_address(ip)
        if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_reserved:
            return {
                "location": "Lokálna sieť",
                "lat": None,
                "lon": None,
                "isp": None,
                "source": "local",
            }
    except ValueError:
        return default_res

    cache_key = f"geo_ip:{ip}"
    cached = await redis.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    try:
        timeout = aiohttp.ClientTimeout(total=1.5)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(
                f"http://ip-api.com/json/{ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp"
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data.get("status") == "success":
                        parts = [p for p in (data.get("city"), data.get("regionName"), data.get("countryCode")) if p]
                        loc_str = ", ".join(parts) if parts else (data.get("country") or "Neznáma")
                        res = {
                            "location": loc_str,
                            "lat": data.get("lat"),
                            "lon": data.get("lon"),
                            "isp": data.get("isp"),
                            "source": "ip",
                        }
                        await redis.set(cache_key, json.dumps(res), ex=86400)
                        return res
    except Exception:
        pass

    return default_res


async def check_captcha(captcha_data: str) -> bool:
    async with aiohttp.ClientSession() as session:
        try:
            if settings.hcaptcha_key is not None:
                try:
                    async with session.post(
                        "https://hcaptcha.com/siteverify",
                        data={
                            "response": captcha_data,
                            "secret": settings.hcaptcha_key,
                        },
                    ) as resp:
                        resp_data = await resp.model_dump_json()
                        if not resp_data["success"]:
                            return
                except KeyError:
                    return False
            elif settings.recaptcha_key is not None:
                async with session.post(
                    "https://www.google.com/recaptcha/api/siteverify",
                    data={
                        "secret": settings.recaptcha_key,
                        "response": captcha_data,
                    },
                ) as resp:
                    try:
                        resp_data = await resp.model_dump_json()
                        if not resp_data["success"]:
                            return False
                    except KeyError:
                        return False
        except TypeError:
            pass
            return False
    return True


def check_answer(game_data: PlayGame, data: SubmitAnswerData) -> (bool, str):
    q_i = int(float(data.question_index))
    q_type = game_data.questions[q_i].type
    q_answers = game_data.questions[q_i].answers
    q_answer = data.answer
    if q_type == QuizQuestionType.ABCD:
        return (check_abcd_question(q_answer, q_answers), data.answer)
    elif q_type == QuizQuestionType.RANGE:
        return (
            check_range_question(q_answer, q_answers),
            q_answer,
        )
    elif q_type == QuizQuestionType.VOTING:
        return (False, q_answer)
    elif q_type == QuizQuestionType.ORDER:
        return check_order_question(data.complex_answer, q_answer, q_answers)
    elif q_type == QuizQuestionType.TEXT:
        return (
            check_text_question(q_answer, q_answers),
            q_answer,
        )

    elif q_type == QuizQuestionType.CHECK:
        return (
            check_check_question(q_answer, q_answers),
            q_answer,
        )
    else:
        return (False, q_answer)
    return (False, q_answer)


def check_abcd_question(answer: str, answers: ABCDQuizAnswer) -> bool:
    for a in answers:
        if a.answer == answer and a.right:
            return True
    return False


def check_range_question(answer: str, answers: RangeQuizAnswer) -> bool:
    if answers.min_correct <= int(float(answer)) <= answers.max_correct:
        return answers.min_correct <= int(float(answer)) <= answers.max_correct


def check_order_question(
    complex_answer: list[SubmitAnswerDataOrderType] | None,
    answer: str,
    answers: list[VotingQuizAnswer],
) -> (bool, str):
    if complex_answer is None:
        return (False, answer)
    correct_answers = [{"answer": a.answer} for a in answers]
    submitted_answers = [{"answer": a.answer} for a in complex_answer]
    answer_str = ", ".join(a["answer"] for a in submitted_answers)
    is_correct = submitted_answers == correct_answers
    return is_correct, answer_str


def check_text_question(answer: str, answers: list[TextQuizAnswer]) -> bool:
    for q in answers:
        if q.case_sensitive:
            if answer == q.answer:
                return True
        else:
            if answer.lower() == q.answer.lower():
                return True
    return False


def check_check_question(answer: str, answers: list[ABCDQuizAnswer]) -> bool:
    correct_string = ""
    for i, a in enumerate(answers):
        if a.right:
            correct_string += str(i)
    return bool(correct_string == answer)


async def has_already_answered(game_pin: str, q_index: int, username: str) -> bool:
    answers = await AnswerDataList.get_redis_or_empty(game_pin, q_index)
    if answers is None:
        return False
    else:
        answers = list(filter(lambda a: a.username == username, answers.root))
        return len(answers) > 0
