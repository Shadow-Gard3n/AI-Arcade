import random
import os
from gensim.models import KeyedVectors
import gensim.downloader as api
import nltk
from nltk.stem import WordNetLemmatizer

nltk.download('wordnet', quiet=True) 
nltk.download('omw-1.4', quiet=True)

class SemanticService:
    def __init__(self):
        print("Initializing Semantic Service...")
        self.lemmatizer = WordNetLemmatizer()
        
        model_path = "glove_dev_20k.kv"
        if os.path.exists(model_path):
            self.model = KeyedVectors.load(model_path)
        else:
            print("Dev model not found. Downloading full model...")
            self.model = api.load("glove-wiki-gigaword-100")
            
        self.vocab = list(self.model.key_to_index.keys())
        
        self.target_words = [
            "apple", "ocean", "computer", "mountain", "guitar", "robot", "forest",
            "planet", "music", "castle", "dragon", "river", "desert", "book",
            "camera", "coffee", "island", "moon", "sun", "star", "galaxy"
        ]
        
        self.active_games = {} 
        self.precomputed_data = {} 
        
        print("Pre-computing clean ranks. Filtering out plurals and symbols...")
        for word in self.target_words:
            ranks, sims, rank_to_word = self._calculate_all_ranks(word)
            self.precomputed_data[word] = {
                "ranks": ranks, 
                "sims": sims,
                "rank_to_word": rank_to_word 
            }
        print("Ready!")

    def _calculate_all_ranks(self, target_word):
        # 1. Get raw similarities, skipping junk like numbers and punctuation
        raw_sims = []
        for word in self.vocab:
            if not word.isalpha(): 
                continue # Bye bye quotation marks and numbers!
                
            sim = 1.0 if word == target_word else float(self.model.similarity(target_word, word))
            raw_sims.append((word, sim))
        
        # 2. Sort them highest to lowest
        raw_sims.sort(key=lambda x: x[1], reverse=True)
        
        # 3. Build the CLEAN dictionary, keeping only unique root words
        ranks = {}
        similarities = {}
        rank_to_word = {}
        seen_lemmas = set()
        current_rank = 1
        
        for word, sim in raw_sims:
            # Find the root word
            lemma = self.lemmatizer.lemmatize(word, pos='n')
            if lemma == word:
                lemma = self.lemmatizer.lemmatize(word, pos='v')
            
            # If we haven't seen this root word yet, add it to our official game ranks!
            if lemma not in seen_lemmas:
                seen_lemmas.add(lemma)
                ranks[lemma] = current_rank
                similarities[lemma] = sim
                rank_to_word[current_rank] = lemma
                current_rank += 1
                
        return ranks, similarities, rank_to_word

    def start_new_game(self, session_id: str):
        new_word = random.choice(self.target_words)
        self.active_games[session_id] = new_word
        print(f"Game started for {session_id}. Secret: {new_word}")
        return new_word
    
    def process_guess(self, session_id: str, guess: str):
        if session_id not in self.active_games:
            self.start_new_game(session_id)
            
        target_word = self.active_games[session_id]
        
        # Lemmatize the user's guess so it matches our clean dictionary
        raw_guess = guess.lower().strip()
        lemma = self.lemmatizer.lemmatize(raw_guess, pos='n')
        if lemma == raw_guess: 
            lemma = self.lemmatizer.lemmatize(raw_guess, pos='v')
        
        ranks_dict = self.precomputed_data[target_word]["ranks"]
        sims_dict = self.precomputed_data[target_word]["sims"]
        
        if lemma not in ranks_dict:
            return None, None, None, "Word not found in dictionary."
        
        rank = ranks_dict[lemma]
        similarity = sims_dict[lemma]
        
        return lemma, rank, similarity, None
    
    def get_hint(self, session_id: str, best_rank: int):
        if session_id not in self.active_games:
            self.start_new_game(session_id)
            
        target_word = self.active_games[session_id]
        
        if best_rank == -1 or best_rank > 1000:
            hint_rank = random.randint(300, 800)
        else:
            # Safely halve the rank
            hint_rank = max(2, best_rank // 2)
            
        # Because our dictionary is now 100% clean, we can just grab the exact rank safely!
        hint_word = self.precomputed_data[target_word]["rank_to_word"].get(hint_rank)
        return self.process_guess(session_id, hint_word)

    def give_up(self, session_id: str):
        if session_id not in self.active_games:
            self.start_new_game(session_id)
        return self.active_games[session_id]
    
    def get_top_words(self, session_id: str, limit: int = 50):
        if session_id not in self.active_games:
            return []
            
        target_word = self.active_games[session_id]
        data = self.precomputed_data[target_word]
        
        top_words = []
        # Because the dictionary is totally clean, we just loop 1 to 50! No complex logic needed.
        for rank in range(1, limit + 1):
            word = data["rank_to_word"].get(rank)
            sim = data["sims"].get(word, 0.0)
            if word:
                top_words.append({"word": word, "rank": rank, "similarity": sim})
                
        return top_words

# Create the singleton instance
semantic_service = SemanticService()


# import random
# import os
# from gensim.models import KeyedVectors
# import gensim.downloader as api

# # --- NEW: Import NLTK ---
# import nltk
# from nltk.stem import WordNetLemmatizer

# # Download the dictionary rules for NLTK (it only does this once)
# nltk.download('wordnet', quiet=True) 
# nltk.download('omw-1.4', quiet=True)

# class SemanticService:
#     def __init__(self):
#         print("Initializing Semantic Service...")
        
#         # Initialize the Lemmatizer
#         self.lemmatizer = WordNetLemmatizer()
        
#         model_path = "glove_dev_20k.kv"
#         if os.path.exists(model_path):
#             self.model = KeyedVectors.load(model_path)
#         else:
#             print("Dev model not found. Downloading full model...")
#             self.model = api.load("glove-wiki-gigaword-100")
            
#         self.vocab = list(self.model.key_to_index.keys())
        
#         # Expanded target words
#         self.target_words = [
#             "apple", "ocean", "computer", "mountain", "guitar", "robot", "forest",
#             "planet", "music", "castle", "dragon", "river", "desert", "book",
#             "camera", "coffee", "island", "moon", "sun", "star", "galaxy"
#         ]
        
#         self.active_games = {} 
#         self.precomputed_data = {} 
        
#         print("Pre-computing ranks for all target words. This takes a few seconds...")
#         for word in self.target_words:
#             ranks, sims, rank_to_word = self._calculate_all_ranks(word)
#             self.precomputed_data[word] = {
#                 "ranks": ranks, 
#                 "sims": sims,
#                 "rank_to_word": rank_to_word 
#             }
#         print("Ready!")

#     def _calculate_all_ranks(self, target_word):
#         similarities = {}
#         for word in self.vocab:
#             if word == target_word:
#                 similarities[word] = 1.0 
#             else:
#                 similarities[word] = float(self.model.similarity(target_word, word))
        
#         sorted_words = sorted(similarities.items(), key=lambda item: item[1], reverse=True)
#         ranks = {word: rank + 1 for rank, (word, sim) in enumerate(sorted_words)}
#         rank_to_word = {rank + 1: word for rank, (word, sim) in enumerate(sorted_words)}
        
#         return ranks, similarities, rank_to_word

#     def start_new_game(self, session_id: str):
#         new_word = random.choice(self.target_words)
#         self.active_games[session_id] = new_word
#         print(f"Game started for {session_id}. Secret: {new_word}")
#         return new_word
    
#     def process_guess(self, session_id: str, guess: str):
#         if session_id not in self.active_games:
#             self.start_new_game(session_id)
            
#         target_word = self.active_games[session_id]
        
#         # Clean and Lemmatize
#         raw_guess = guess.lower().strip()
#         lemmatized_guess = self.lemmatizer.lemmatize(raw_guess, pos='n')
#         if lemmatized_guess == raw_guess: 
#             lemmatized_guess = self.lemmatizer.lemmatize(raw_guess, pos='v')

#         search_word = lemmatized_guess if lemmatized_guess in self.vocab else raw_guess
        
#         if search_word not in self.vocab:
#             # FIX: We now return 4 values (None for the word)
#             return None, None, None, "Word not found in dictionary."
        
#         rank = self.precomputed_data[target_word]["ranks"].get(search_word)
#         similarity = self.precomputed_data[target_word]["sims"].get(search_word)
        
#         # FIX: Return the actual search_word we used!
#         return search_word, rank, similarity, None
    
#     def get_hint(self, session_id: str, best_rank: int):
#         if session_id not in self.active_games:
#             self.start_new_game(session_id)
            
#         target_word = self.active_games[session_id]
        
#         # If they haven't guessed yet, give a random decent hint
#         if best_rank == -1 or best_rank > 1000:
#             hint_rank = random.randint(300, 800)
#         else:
#             hint_rank = max(2, best_rank // 2)
            
#         # FIX: The Lemmatization Loop
#         # Keep searching down the ranks until we find a word whose translated 
#         # rank is ACTUALLY better than the user's current best guess.
#         while hint_rank > 1:
#             hint_word = self.precomputed_data[target_word]["rank_to_word"].get(hint_rank)
#             actual_word, rank, similarity, error = self.process_guess(session_id, hint_word)
            
#             # If the rank is better, send it! Otherwise, try the next best word.
#             if rank < best_rank:
#                 return actual_word, rank, similarity, error
                
#             hint_rank -= 1 
            
#         # Fallback if they are literally at rank 2
#         return self.process_guess(session_id, target_word)

#     # def get_hint(self, session_id: str, best_rank: int):
#     #     if session_id not in self.active_games:
#     #         self.start_new_game(session_id)
            
#     #     target_word = self.active_games[session_id]
        
#     #     if best_rank == -1 or best_rank > 1000:
#     #         hint_rank = random.randint(300, 800)
#     #     else:
#     #         hint_rank = max(2, best_rank // 2)
            
#     #     hint_word = self.precomputed_data[target_word]["rank_to_word"].get(hint_rank)
        
#     #     # FIX: Unpack 4 variables here now
#     #     actual_word, rank, similarity, error = self.process_guess(session_id, hint_word)
        
#     #     return actual_word, rank, similarity, error

#     # def process_guess(self, session_id: str, guess: str):
#     #     if session_id not in self.active_games:
#     #         self.start_new_game(session_id)
            
#     #     target_word = self.active_games[session_id]
        
#     #     # 1. Clean the raw guess
#     #     raw_guess = guess.lower().strip()
        
#     #     # 2. LEMMATIZE: Convert words like "robots" -> "robot", "running" -> "run"
#     #     # We check both noun ('n') and verb ('v') forms to be safe
#     #     lemmatized_guess = self.lemmatizer.lemmatize(raw_guess, pos='n')
#     #     if lemmatized_guess == raw_guess: # If it didn't change as a noun, try as a verb
#     #         lemmatized_guess = self.lemmatizer.lemmatize(raw_guess, pos='v')

#     #     print(f"User typed: '{raw_guess}' -> AI translated to: '{lemmatized_guess}'")
        
#     #     # 3. Check if either the raw word OR the lemmatized word is in our dictionary
#     #     search_word = lemmatized_guess if lemmatized_guess in self.vocab else raw_guess
        
#     #     if search_word not in self.vocab:
#     #         return None, None, "Word not found in dictionary."
        
#     #     # Grab from pre-computed data
#     #     rank = self.precomputed_data[target_word]["ranks"].get(search_word)
#     #     similarity = self.precomputed_data[target_word]["sims"].get(search_word)
        
#     #     return rank, similarity, None

#     # def get_hint(self, session_id: str, best_rank: int):
#     #     if session_id not in self.active_games:
#     #         self.start_new_game(session_id)
            
#     #     target_word = self.active_games[session_id]
        
#     #     if best_rank == -1 or best_rank > 1000:
#     #         hint_rank = random.randint(300, 800)
#     #     else:
#     #         hint_rank = max(2, best_rank // 2)
            
#     #     hint_word = self.precomputed_data[target_word]["rank_to_word"].get(hint_rank)
#     #     rank, similarity, error = self.process_guess(session_id, hint_word)
        
#     #     return hint_word, rank, similarity, error
        
#     def give_up(self, session_id: str):
#         if session_id not in self.active_games:
#             self.start_new_game(session_id)
#         return self.active_games[session_id]
    
#     def get_top_words(self, session_id: str, limit: int = 50):
#         if session_id not in self.active_games:
#             return []
            
#         target_word = self.active_games[session_id]
#         data = self.precomputed_data[target_word]
        
#         top_words = []
#         seen_lemmas = set() # Keep track of root words we've already added
#         rank_to_check = 1
        
#         # Keep searching down the list until we find 50 UNIQUE root words
#         while len(top_words) < limit and rank_to_check <= len(data["rank_to_word"]):
#             word = data["rank_to_word"].get(rank_to_check)
            
#             if word:
#                 # 1. Find the root of this dictionary word
#                 lemmatized_word = self.lemmatizer.lemmatize(word, pos='n')
#                 if lemmatized_word == word:
#                     lemmatized_word = self.lemmatizer.lemmatize(word, pos='v')
                
#                 # 2. Only add it if we haven't seen this root word yet
#                 if lemmatized_word not in seen_lemmas:
#                     seen_lemmas.add(lemmatized_word)
#                     sim = data["sims"].get(word, 0.0)
#                     top_words.append({"word": word, "rank": rank_to_check, "similarity": sim})
            
#             rank_to_check += 1
                
#         return top_words

#     # def get_top_words(self, session_id: str, limit: int = 50):
#     #     if session_id not in self.active_games:
#     #         return []
            
#     #     target_word = self.active_games[session_id]
#     #     data = self.precomputed_data[target_word]
        
#     #     top_words = []
#     #     # Loop from Rank 1 to Rank 50
#     #     for rank in range(1, limit + 1):
#     #         word = data["rank_to_word"].get(rank)
#     #         sim = data["sims"].get(word, 0.0)
#     #         if word:
#     #             top_words.append({"word": word, "rank": rank, "similarity": sim})
                
#     #     return top_words

# # Create the singleton instance
# semantic_service = SemanticService()


# import random
# from gensim.models import KeyedVectors
# import gensim.downloader as api
# import os

# class SemanticService:
#     def __init__(self):
#         print("Initializing Semantic Service...")
        
#         model_path = "glove_dev_20k.kv"
#         if os.path.exists(model_path):
#             self.model = KeyedVectors.load(model_path)
#         else:
#             self.model = api.load("glove-wiki-gigaword-100")
            
#         self.vocab = list(self.model.key_to_index.keys())
#         self.target_words = [
#             "apple", "ocean", "computer", "mountain", "guitar", "robot", "forest",
#             "planet", "music", "castle", "dragon", "river", "desert", "book",
#             "camera", "coffee", "island", "moon", "sun", "star", "galaxy",
#             "train", "airplane", "bridge", "tower", "city", "village", "clock",
#             "diamond", "gold", "silver", "sword", "shield", "ghost", "alien",
#             "wizard", "magic", "science", "history", "winter", "summer", "spring",
#             "autumn", "storm", "thunder", "lightning", "rain", "snow", "ice",
#             "fire", "water", "earth", "wind", "animal", "bird", "fish", "insect",
#             "spider", "snake", "horse", "dog", "cat", "lion", "tiger", "bear",
#             "wolf", "eagle", "shark", "whale", "dolphin", "turtle", "frog",
#             "butterfly", "flower", "tree", "grass", "leaf", "root", "seed",
#             "fruit", "vegetable", "bread", "cheese", "meat", "soup", "salad",
#             "pizza", "cake", "cookie", "chocolate", "candy", "sugar", "salt",
#             "pepper", "spice", "doctor", "teacher", "farmer", "artist", "writer"
#         ]
#         # self.target_words = ["apple", "ocean", "computer", "mountain", "guitar", "robot", "forest"]
        
#         # SESSION MANAGEMENT
#         self.active_games = {} # Stores: {"user_123": "apple"}
#         self.precomputed_data = {} # Pre-calculate ranks for extreme speed
        
#         print("Pre-computing ranks for all target words. This takes a few seconds...")
#         for word in self.target_words:
#             ranks, sims, rank_to_word = self._calculate_all_ranks(word)
#             self.precomputed_data[word] = {
#                 "ranks": ranks, 
#                 "sims": sims,
#                 "rank_to_word": rank_to_word # Needed for the Hint feature
#             }
#         print("Ready!")

#     def _calculate_all_ranks(self, target_word):
#         similarities = {}
#         for word in self.vocab:
#             if word == target_word:
#                 similarities[word] = 1.0 
#             else:
#                 similarities[word] = float(self.model.similarity(target_word, word))
        
#         sorted_words = sorted(similarities.items(), key=lambda item: item[1], reverse=True)
#         ranks = {word: rank + 1 for rank, (word, sim) in enumerate(sorted_words)}
#         rank_to_word = {rank + 1: word for rank, (word, sim) in enumerate(sorted_words)}
        
#         return ranks, similarities, rank_to_word

#     def start_new_game(self, session_id: str):
#         new_word = random.choice(self.target_words)
#         self.active_games[session_id] = new_word
#         print(f"Game started for {session_id}. Secret: {new_word}")
#         return new_word

#     def process_guess(self, session_id: str, guess: str):
#         # If user doesn't have a game yet, start one silently
#         if session_id not in self.active_games:
#             self.start_new_game(session_id)
            
#         target_word = self.active_games[session_id]
#         guess = guess.lower().strip()
        
#         if guess not in self.vocab:
#             return None, None, "Word not found in dictionary."
        
#         # Grab from pre-computed data for instant results
#         rank = self.precomputed_data[target_word]["ranks"].get(guess)
#         similarity = self.precomputed_data[target_word]["sims"].get(guess)
        
#         return rank, similarity, None

#     def get_hint(self, session_id: str, best_rank: int):
#         if session_id not in self.active_games:
#             self.start_new_game(session_id)
            
#         target_word = self.active_games[session_id]
        
#         if best_rank == -1 or best_rank > 1000:
#             hint_rank = random.randint(300, 800)
#         else:
#             hint_rank = max(2, best_rank // 2)
            
#         hint_word = self.precomputed_data[target_word]["rank_to_word"].get(hint_rank)
#         rank, similarity, error = self.process_guess(session_id, hint_word)
        
#         # FIX: We are now returning the hint_word along with the rest of the data
#         return hint_word, rank, similarity, error
        
#     def give_up(self, session_id: str):
#         if session_id not in self.active_games:
#             self.start_new_game(session_id)
#         return self.active_games[session_id]

# semantic_service = SemanticService()