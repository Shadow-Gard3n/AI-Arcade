from pydantic import BaseModel
from typing import Optional

class BaseGameRequest(BaseModel):
    session_id: str

class GuessRequest(BaseGameRequest):
    word: str

class HintRequest(BaseGameRequest):
    best_rank: int # The frontend will tell us their current closest guess

class GiveUpResponse(BaseModel):
    secret_word: str

class GuessResponse(BaseModel):
    guess: str
    rank: int
    similarity: float
    error: Optional[str] = None

class WordRank(BaseModel):
    word: str
    rank: int
    similarity: float

class TopWordsResponse(BaseModel):
    words: list[WordRank]


# from pydantic import BaseModel
# from typing import Optional

# # What the React frontend sends us
# class GuessRequest(BaseModel):
#     word: str

# # What we send back to the React frontend
# class GuessResponse(BaseModel):
#     guess: str
#     rank: int
#     similarity: float
#     error: Optional[str] = None