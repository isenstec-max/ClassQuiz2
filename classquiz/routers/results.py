# SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)
#
# SPDX-License-Identifier: MPL-2.0


import json
import urllib.parse
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from classquiz.auth import get_current_user
from classquiz.db.models import User, GameResults
from classquiz.helpers import generate_spreadsheet

router = APIRouter()


@router.get("/list")
async def list_game_results(
    user: User = Depends(get_current_user),
) -> list[GameResults]:
    results = (
        await GameResults.objects.select_related(GameResults.quiz)
        .order_by(GameResults.timestamp.desc())
        .all(user=user.id)
    )
    return results


@router.get("/list/{quiz_id}")
async def get_results_by_quiz(quiz_id: UUID, user: User = Depends(get_current_user)) -> list[GameResults]:
    res = await GameResults.objects.all(user=user.id, quiz=quiz_id)
    if res is None:
        raise HTTPException(status_code=404, detail="Game Result not found")
    else:
        return res


@router.get("/{game_id}")
async def get_game_result(game_id: UUID, user: User = Depends(get_current_user)) -> GameResults:
    res = await GameResults.objects.select_related(GameResults.quiz).get_or_none(user=user.id, id=game_id)
    if res is None:
        raise HTTPException(status_code=404, detail="Game Result not found")
    else:
        return res


class _SetNoteInput(BaseModel):
    note: str


@router.post("/set_note")
async def set_note(id: UUID, data: _SetNoteInput, user: User = Depends(get_current_user)) -> GameResults:
    res = await GameResults.objects.get_or_none(user=user.id, id=id)
    if res is None:
        raise HTTPException(status_code=404, detail="Game Result not found")
    res.note = data.note
    return await res.update()


@router.get("/export/{result_id}", response_class=StreamingResponse)
async def export_result(result_id: UUID, user: User = Depends(get_current_user)):
    res = await GameResults.objects.get_or_none(user=user.id, id=result_id)
    if res is None:
        raise HTTPException(status_code=404, detail="Game Result not found")

    questions_list = json.loads(res.questions) if isinstance(res.questions, str) else res.questions
    answers_data = json.loads(res.answers) if isinstance(res.answers, str) else res.answers

    if isinstance(answers_data, list):
        answers_dict = {str(i): ans for i, ans in enumerate(answers_data)}
    else:
        answers_dict = answers_data or {}

    player_scores = json.loads(res.player_scores) if isinstance(res.player_scores, str) else (res.player_scores or {})
    player_fields = (
        json.loads(res.custom_field_data)
        if isinstance(res.custom_field_data, str)
        else (res.custom_field_data or {})
    )

    class _QuizWrapper:
        def __init__(self, questions):
            self.questions = questions

    spreadsheet = await generate_spreadsheet(
        quiz=_QuizWrapper(questions_list),
        quiz_results=answers_dict,
        player_fields=player_fields,
        player_scores=player_scores,
    )

    def iter_file():
        yield from spreadsheet

    safe_title = urllib.parse.quote(res.title)
    filename = f"ClassQuiz-{safe_title}-{res.timestamp.strftime('%Y-%m-%d')}.xlsx"

    return StreamingResponse(
        iter_file(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment;filename={filename}"
        },
    )
