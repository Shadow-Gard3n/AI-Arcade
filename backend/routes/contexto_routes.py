# from fastapi import APIRouter
# from schemas.game_schemas import GuessRequest, GuessResponse
# from services.contexto.semantic_service import semantic_service # Make sure your import path matches your folder structure

# router = APIRouter()

# # --- NEW ROUTE ---
# @router.get("/new-game")
# async def new_game():
#     # Tell the brain to pick a new word and recalculate
#     new_word = semantic_service.start_new_game()
    
#     # We return a success message. 
#     # Notice we DO NOT return the actual word, otherwise users could cheat by looking at the network tab in their browser!
#     return {
#         "message": "New game started!",
#         "status": "success"
#     }

# # --- EXISTING ROUTE ---
# @router.post("/guess", response_model=GuessResponse)
# async def make_guess(request: GuessRequest):
#     rank, similarity, error = semantic_service.process_guess(request.word)
    
#     if error:
#         return GuessResponse(guess=request.word, rank=-1, similarity=0.0, error=error)
        
#     return GuessResponse(
#         guess=request.word, 
#         rank=rank, 
#         similarity=similarity
#     )


from fastapi import APIRouter
from schemas.game_schemas import GuessRequest, GuessResponse, HintRequest, GiveUpResponse, BaseGameRequest, TopWordsResponse
from services.contexto.semantic_service import semantic_service

router = APIRouter()

@router.post("/new-game")
async def new_game(request: BaseGameRequest):
    semantic_service.start_new_game(request.session_id)
    return {"message": "New game started!", "status": "success"}

@router.post("/guess", response_model=GuessResponse)
async def make_guess(request: GuessRequest):
    # FIX: Unpack the actual_word from the brain
    actual_word, rank, similarity, error = semantic_service.process_guess(request.session_id, request.word)
    
    if error:
        return GuessResponse(guess=request.word, rank=-1, similarity=0.0, error=error)
        
    # FIX: Send back the actual_word instead of the user's raw request.word
    return GuessResponse(guess=actual_word, rank=rank, similarity=similarity)

# @router.post("/guess", response_model=GuessResponse)
# async def make_guess(request: GuessRequest):
#     rank, similarity, error = semantic_service.process_guess(request.session_id, request.word)
    
#     if error:
#         return GuessResponse(guess=request.word, rank=-1, similarity=0.0, error=error)
        
#     return GuessResponse(guess=request.word, rank=rank, similarity=similarity)

@router.post("/hint", response_model=GuessResponse)
async def get_hint(request: HintRequest):
    # FIX: We unpack 4 variables here now, including the actual word
    word, rank, similarity, error = semantic_service.get_hint(request.session_id, request.best_rank)
    
    # Send the actual word to React instead of hardcoding "(HINT)"
    return GuessResponse(guess=word, rank=rank, similarity=similarity)

@router.post("/give-up", response_model=GiveUpResponse)
async def give_up(request: BaseGameRequest):
    secret = semantic_service.give_up(request.session_id)
    return GiveUpResponse(secret_word=secret)

@router.post("/top-words", response_model=TopWordsResponse)
async def get_top_words(request: BaseGameRequest):
    words = semantic_service.get_top_words(request.session_id, limit=50)
    return TopWordsResponse(words=words)